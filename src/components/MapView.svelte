<script lang="ts">
  import "maplibre-gl/dist/maplibre-gl.css";
  import { Map, type Feature, MapMouseEvent } from "maplibre-gl";
  import * as shieldlib from "@americana/maplibre-shield-generator";
  import { loadShields } from "../thirdparty/openstreetmap-americana/src/js/shield_defs";
  import { onDestroy, onMount } from "svelte";
  import { resolvedTheme } from "../theme";
  import * as shield_format from "../thirdparty/openstreetmap-americana/src/js/shield_format";
  import * as highway_shield from "../thirdparty/openstreetmap-americana/src/layer/highway_shield";

  export let zoom = 0;
  export let lat = 0;
  export let lng = 0;
  export let selectedFeature: Feature;

  let map: Map;
  let mapContainer: HTMLElement;

  {
    const unsubscribe = resolvedTheme.subscribe((newTheme) => {
      if (map)
        map.setStyle(
          `https://tiles.maps.jwestman.net/styles/${newTheme}/style.json`
        );
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
    zoom = map.getZoom();
    [lng, lat] = map.getCenter().toArray();

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

      if (!map.getLayer("highway-shield")) {
        map.setSprite(new URL("/sprites/sprite", location.href).href);
        const shield_layer = JSON.parse(JSON.stringify(highway_shield.shield));
        shield_layer.source = "vector-tiles";
        shield_layer.minzoom = 7;
        map.addLayer(shield_layer);
      }
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
