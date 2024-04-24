<script lang="ts">
  import TinySDF from "../thirdparty/tiny-sdf";
  import * as shieldlib from "@americana/maplibre-shield-generator";
  import {
    Map,
    MapMouseEvent,
    type Feature,
    GeolocateControl,
    NavigationControl,
  } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import { onDestroy, onMount } from "svelte";
  import { resolvedTheme, theme, updateMapStyle } from "../theme";
  import { loadShields } from "../thirdparty/openstreetmap-americana/src/js/shield_defs";
  import * as shield_format from "../thirdparty/openstreetmap-americana/src/js/shield_format";
  import * as highway_shield from "../thirdparty/openstreetmap-americana/src/layer/highway_shield";
  import { inspectedFeatures } from "../inspector";

  export let zoom = 0;
  export let lat = 0;
  export let lng = 0;
  export let selectedFeature: Feature;

  let map: Map;
  let mapContainer: HTMLElement;
  let geolocate: GeolocateControl;

  {
    const unsubscribe = theme.subscribe((newTheme) => {
      updateMapStyle(map, newTheme);
    });
    onDestroy(unsubscribe);
  }

  onMount(() => {
    map = new Map({
      container: mapContainer,
      style: `https://tiles.maps.jwestman.net/styles/${$resolvedTheme}/style.json`,
      hash: true,
      customAttribution:
        "<a href='https://openmaptiles.org/' target='_blank'>&copy; OpenMapTiles</a> <a href='https://www.openstreetmap.org/copyright' target='_blank'>&copy; OpenStreetMap contributors</a>",
    });

    window['map'] = map;

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

          const click = (event) => {
            selectedFeature = event.features[0];
          };
          map.on("click", layer.id, click);
          unregisterListeners.push(() => map.off("click", layer.id, click));
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
