<script lang="ts">
  import TinySDF from "../thirdparty/tiny-sdf";
  import * as shieldlib from "@americana/maplibre-shield-generator";
  import {
    Map,
    MapMouseEvent,
    GeolocateControl,
    NavigationControl,
    type MapGeoJSONFeature,
    Marker,
  } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import { onDestroy, onMount } from "svelte";
  import {
    ThemeVariant,
    resolveThemeVariant,
    theme,
    type Theme,
  } from "../theme";
  import { loadShields } from "../thirdparty/openstreetmap-americana/src/js/shield_defs";
  import * as shield_format from "../thirdparty/openstreetmap-americana/src/js/shield_format";
  import * as highway_shield from "../thirdparty/openstreetmap-americana/src/layer/highway_shield";
  import { createInspector, inspectedFeatures } from "../inspector";
  import { Subsystems } from "../subsystems/Subsystem";
  import { generateMapStyle } from "../thirdparty/map-style/src/mapStyle";
  import { Place } from "../Place";
  import { AppState } from "../AppState";
  import { get } from "svelte/store";
  import type { MapTool } from "src/MapTool";

  const subsystems = Subsystems.fromContext();
  const appState = AppState.fromContext();

  let zoom = appState.zoom;
  let center = appState.center;

  let map: Map;
  let mapContainer: HTMLElement;
  let geolocate: GeolocateControl;

  const updateMapStyle = async (map: Map, theme: Theme) => {
    if (!map) return;

    if (theme.inspector) {
      const style = await createInspector(
        resolveThemeVariant(theme) === "dark"
      );
      map.setStyle(style, { diff: false });
    } else {
      const style = generateMapStyle({
        colorScheme: theme.variant === ThemeVariant.DARK ? "dark" : "light",
        renderer: "maplibre-gl-js",
        textScale: 1,
      });

      map.setStyle(style);
    }

    map.once("styledata", () => {
      subsystems.setupMapStyle(map, theme);
    });
  };

  {
    const unsubscribe = theme.subscribe((newTheme) => {
      updateMapStyle(map, newTheme);
    });
    onDestroy(unsubscribe);
  }

  let selectedMarker: Marker;
  let lastSelectedPlace: Place;

  let oldMapTool: MapTool = null;
  appState.mapTool.subscribe((newMapTool) => {
    if (oldMapTool) {
      oldMapTool.stop?.();
    }
    if (newMapTool) {
      newMapTool.start?.(map);
    }
    oldMapTool = newMapTool;
  });

  const selectPlace = (place: Place) => {
    if (selectedMarker) {
      selectedMarker.remove();
    }

    if (lastSelectedPlace) {
      subsystems.placeDeselected(lastSelectedPlace);
      if (lastSelectedPlace.featureId) {
        map.setFeatureState(lastSelectedPlace.featureId, {
          selected: false,
        });
      }
    }

    if (place) {
      if (place.showMarker) {
        selectedMarker = new Marker().setLngLat(place.location).addTo(map);
        selectedMarker.getElement().addEventListener("click", (ev) => {
          ev.stopPropagation();
          appState.placeCardClosed.set(false);
          appState.activeSidebarTab.set(null);
        });
      }

      if (place.featureId?.id) {
        map.setFeatureState(place.featureId, { selected: true });
      }
      subsystems.placeSelected(place);
      appState.activeSidebarTab.set(null);
      appState.placeCardClosed.set(false);
    }

    lastSelectedPlace = place;
  };

  const defaultMapTool: MapTool = {
    getCursor(features) {
      if (features.length === 0) return "grab";
      const feature = features[0];
      const cursor =
        feature.layer.metadata?.["cursor"] ??
        feature.layer.metadata?.["libshumate:cursor"];
      return cursor ?? "grab";
    },

    onClick(event, place) {
      if (place === null) {
        place = new Place({
          name: "Dropped Pin",
          location: {
            lat: event.lngLat.lat,
            lon: event.lngLat.lng,
          },
          geometryType: "Point",
        });
      }
      appState.selectedFeature.set(place);
    },
  };

  const mapTool = () => get(appState.mapTool) ?? defaultMapTool;

  onMount(() => {
    map = new Map({
      container: mapContainer,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      hash: true,
      attributionControl: {
        customAttribution:
          "<a href='https://openmaptiles.org/' target='_blank'>&copy; OpenMapTiles</a> <a href='https://www.openstreetmap.org/copyright' target='_blank'>&copy; OpenStreetMap contributors</a>, <a href='javascript:void(showAttributionDialog());'>other sources</a>",
      },
    });

    window["map"] = map;

    map.addControl(new NavigationControl());
    geolocate = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.addControl(geolocate);

    let geolocation: GeolocationCoordinates;
    geolocate.on("geolocate", (event) => {
      console.log(event);
      geolocation = event.coords;
    });

    zoom.set(map.getZoom());
    const [lon, lat] = map.getCenter().toArray();
    center.set({ lon, lat });

    const selectedFeatureUnsub = appState.selectedFeature.subscribe((place) => {
      selectPlace(place);
    });

    updateMapStyle(map, $theme);

    const iconsPromise = fetch("/sprites/icons.json").then((r) => r.json());
    map.on("styleimagemissing", async (event) => {
      if (event.id.endsWith("-symbolic")) {
        const icons = await iconsPromise;
        const i = await new TinySDF().draw(
          (ctx, buf) =>
            new Promise((resolve) => {
              const image = new Image();
              image.onload = () => {
                ctx.drawImage(image, buf, buf);
                resolve(image);
              };
              image.src = `data:image/svg+xml;base64,${btoa(icons[event.id])}`;
            })
        );

        if (!map.hasImage(event.id)) map.addImage(event.id, i, { sdf: true });
      } else {
        subsystems.handleStyleImageMissing(event.id, map);
      }
    });

    new shieldlib.ShieldRenderer(loadShields(), shield_format.routeParser)
      .filterImageID(shield_format.shieldPredicate)
      .filterNetwork(shield_format.networkPredicate)
      .renderOnMaplibreGL(map);

    map.on("zoomend", () => {
      zoom.set(map.getZoom());
    });
    map.on("moveend", () => {
      const [lon, lat] = map.getCenter().toArray();
      center.set({ lon, lat });
    });

    map.on("mousemove", (event) => {
      const canvas = mapContainer.querySelector(
        ".maplibregl-canvas"
      ) as HTMLElement;

      const getCursor = mapTool().getCursor;
      /* If there is no cursor function, use the default "grab". If there is
         a cursor function and it returns falsy, don't change the cursor. */
      if (getCursor) {
        const features = map.queryRenderedFeatures(event.point);
        const cursor = getCursor(features);
        if (cursor) {
          canvas.style.cursor = cursor;
        }
      } else {
        canvas.style.cursor = "grab";
      }
    });

    const unregisterListeners: (() => void)[] = [];

    const placeFromEvent = (event: MapMouseEvent) => {
      if (event.originalEvent.target instanceof HTMLElement) {
        const target = event.originalEvent.target as HTMLElement;
        const marker = target.closest(".maplibregl-user-location-dot");
        if (marker) {
          return new Place({
            name: "Current Location",
            location: {
              lat: geolocation.latitude,
              lon: geolocation.longitude,
            },
            geometryType: "Point",
            showMarker: false,
          });
        }
      }

      const features: MapGeoJSONFeature[] = map
        .queryRenderedFeatures(event.point)
        .filter(
          (f) =>
            f.layer.metadata?.["cursor"] ??
            f.layer.metadata?.["libshumate:cursor"]
        );

      if (features.length === 0) {
        return null;
      } else {
        const feature = features[0];
        const origin = feature.layer.metadata?.["place-origin"];

        return new Place({
          featureId: {
            id: feature.id,
            source: feature.source,
            sourceLayer: feature.sourceLayer,
          },
          location:
            feature.geometry.type === "Point"
              ? {
                  lat: feature.geometry.coordinates[1],
                  lon: feature.geometry.coordinates[0],
                }
              : {
                  lat: event.lngLat.lat,
                  lon: event.lngLat.lng,
                },
          tags: feature.properties,
          origin,
          geometryType: feature.geometry.type,
        });
      }
    };

    map.on("styledata", (event) => {
      const style = map.getStyle();
      const isInspector = style.metadata?.["inspector"];

      for (const unregister of unregisterListeners) {
        unregister();
      }

      if (isInspector) {
        const mousemove = (event) => {
          if (!$inspectedFeatures.clicked) {
            const features = map.queryRenderedFeatures(event.point);
            inspectedFeatures.set({
              features,
              clicked: false,
              coords: event.lngLat.toArray(),
            });
          }
        };
        map.on("mousemove", mousemove);
        const mouseclick = (event) => {
          const features = map.queryRenderedFeatures(event.point);
          inspectedFeatures.set({
            features,
            clicked: true,
            coords: event.lngLat.toArray(),
          });
        };
        map.on("click", mouseclick);
        unregisterListeners.push(() => {
          map.off("mousemove", mousemove);
          map.off("click", mouseclick);
          inspectedFeatures.set({ features: [], clicked: false });
        });
      } else {
        const click = (event: MapMouseEvent) => {
          const place = placeFromEvent(event);
          mapTool().onClick?.(event, place);
        };
        map.on("click", click);
        unregisterListeners.push(() => map.off("click", click));
      }

      if (!map.getLayer("highway-shield") && !isInspector) {
        map.setSprite(new URL("/sprites/sprite", location.href).href);
        const shield_layer = JSON.parse(JSON.stringify(highway_shield.shield));
        shield_layer.source = "vector-tiles";
        shield_layer.minzoom = 7;
        map.addLayer(shield_layer);
      }

      map.showTileBoundaries = isInspector;
    });

    return () => {
      selectedFeatureUnsub();
    };
  });

  onDestroy(() => {
    map.remove();
  });
</script>

<div class="map" id="map" bind:this={mapContainer} />

<style>
  .map {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
</style>
