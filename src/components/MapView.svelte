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
  import { getContext, onDestroy, onMount } from "svelte";
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
  import type { Subsystems } from "../subsystems/Subsystem";
  import { generateMapStyle } from "../thirdparty/map-style/src/mapStyle";
  import { Place } from "../Place";

  export let zoom = 0;
  export let lat = 0;
  export let lng = 0;
  export let selectedPlace: Place;

  let selectedMarker: Marker;

  let map: Map;
  let mapContainer: HTMLElement;
  let geolocate: GeolocateControl;

  const subsystems: Subsystems = getContext("subsystems");

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

  let placeAbort: AbortController;

  const selectPlace = async (place: Place | Promise<Place>) => {
    if (placeAbort) {
      placeAbort.abort();
      placeAbort = null;
    }

    if (selectedMarker) {
      selectedMarker.remove();
    }

    if (selectedPlace) {
      subsystems.placeDeselected(selectedPlace);
      if (selectedPlace.featureId) {
        map.setFeatureState(selectedPlace.featureId, { selected: false });
      }
    }

    if (place instanceof Promise) {
      selectPlace(null);

      const abort = (placeAbort = new AbortController());
      place = await place;
      if (abort.signal.aborted) return;
    }

    selectedPlace = place;

    if (place) {
      selectedMarker = new Marker().setLngLat(place.location).addTo(map);
      selectedMarker.getElement().addEventListener("click", (ev) => {
        ev.stopPropagation();
      });

      if (place.featureId) {
        map.setFeatureState(selectedPlace.featureId, { selected: true });
      }
      subsystems.placeSelected(place);
    }
  };

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

    zoom = map.getZoom();
    [lng, lat] = map.getCenter().toArray();

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
      }
    });

    new shieldlib.ShieldRenderer(loadShields(), shield_format.routeParser)
      .filterImageID(shield_format.shieldPredicate)
      .filterNetwork(shield_format.networkPredicate)
      .renderOnMaplibreGL(map);

    map.on("zoomend", () => {
      zoom = map.getZoom();
    });
    map.on("moveend", () => {
      [lng, lat] = map.getCenter().toArray();
    });

    const unregisterListeners: (() => void)[] = [];

    map.on("styledata", (event) => {
      const style = map.getStyle();
      const isInspector = style.metadata?.["inspector"];

      for (const unregister of unregisterListeners) {
        unregister();
      }

      for (const layer of style.layers) {
        if (!layer.metadata) continue;
        const cursor = layer.metadata["libshumate:cursor"];

        if (cursor) {
          const mouseenter = (event: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(event.point);
            if (features.length > 0) {
              const canvas = mapContainer.querySelector(
                ".maplibregl-canvas"
              ) as HTMLElement;
              canvas.style.cursor = cursor;
            }
          };
          map.on("mouseenter", layer.id, mouseenter);
          unregisterListeners.push(() =>
            map.off("mouseenter", layer.id, mouseenter)
          );

          const mouseleave = () => {
            const canvas = mapContainer.querySelector(
              ".maplibregl-canvas"
            ) as HTMLElement;
            canvas.style.cursor = "grab";
          };
          map.on("mouseleave", layer.id, mouseleave);
          unregisterListeners.push(() =>
            map.off("mouseleave", layer.id, mouseleave)
          );
        }
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
          if (event.originalEvent.target instanceof HTMLElement) {
            const target = event.originalEvent.target as HTMLElement;
            const marker = target.closest(".maplibregl-user-location-dot");
            if (marker) {
              selectPlace(
                new Promise((resolve, reject) => {
                  navigator.geolocation.getCurrentPosition((position) => {
                    resolve(
                      new Place({
                        name: "Current Location",
                        location: [
                          position.coords.longitude,
                          position.coords.latitude,
                        ],
                      })
                    );
                  });
                })
              );
              return;
            }
          }

          const features: MapGeoJSONFeature[] = map
            .queryRenderedFeatures(event.point)
            .filter((f) => f.layer.metadata?.["libshumate:cursor"]);

          if (features.length === 0) {
            selectPlace(
              new Place({
                name: "Dropped Pin",
                location: event.lngLat.toArray(),
              })
            );
          } else {
            const feature = features[0];
            selectPlace(
              new Place({
                featureId: {
                  id: feature.id,
                  source: feature.source,
                  sourceLayer: feature.sourceLayer,
                },
                location:
                  feature.geometry.type === "Point"
                    ? (feature.geometry.coordinates as [number, number])
                    : event.lngLat.toArray(),
                tags: feature.properties,
              })
            );
          }
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
  }
</style>
