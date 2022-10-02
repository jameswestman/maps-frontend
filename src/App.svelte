<script lang="ts">
  import { Map } from "maplibre-gl";
  import { onDestroy, onMount } from "svelte";
  import 'maplibre-gl/dist/maplibre-gl.css';

  let map: Map;
  let mapContainer: HTMLElement;

  onMount(() => {
    map = new Map({
      container: mapContainer,
      style: "https://tiles.maps.jwestman.net/styles/basic-preview/style.json",
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
