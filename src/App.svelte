<script lang="ts">
  import type { Feature } from "maplibre-gl";
  import MapView from "./components/MapView.svelte";
  import OpenInCard from "./components/OpenInCard.svelte";
  import PlaceCard from "./components/PlaceCard.svelte";
  import ThemeSwitcher from "./components/ThemeSwitcher.svelte";
  import InspectorCard from "./components/InspectorCard.svelte";

  let zoom = 0;
  let lat = 0;
  let lng = 0;

  let selectedFeature: Feature;
</script>

<div>
  <MapView bind:zoom bind:lat bind:lng bind:selectedFeature />

  <div
    class="container position-absolute top-0 left-0 right-0 bottom-0 overflow-hidden"
    style="pointer-events: none"
  >
    <div class="row h-100" style="pointer-events: none">
      <div
        class="col-12 col-md-6 col-lg-4 p-3 overflow-scroll h-100"
        style="pointer-events: none"
      >
        <div style="pointer-events: auto">
          <ThemeSwitcher />

          <div class="mt-3">
            <OpenInCard {zoom} {lat} {lng} />
          </div>

          <div class="mt-3">
            <PlaceCard feature={selectedFeature} />
          </div>

          <div class="mt-3">
            <InspectorCard />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
