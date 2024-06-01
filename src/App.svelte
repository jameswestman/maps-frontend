<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { Place } from "./Place";
  import Attribution from "./components/Attribution.svelte";
  import InspectorCard from "./components/InspectorCard.svelte";
  import MapView from "./components/MapView.svelte";
  import OpenInCard from "./components/OpenInCard.svelte";
  import PlaceCard from "./components/PlaceCard.svelte";
  import ThemeSwitcher from "./components/ThemeSwitcher.svelte";
  import { Isochrone } from "./subsystems/isochrone/Isochrone";
  import { resolvedTheme } from "./theme";
  import { Subsystems } from "./subsystems/Subsystem";

  let zoom = 0;
  let lat = 0;
  let lng = 0;

  let selectedFeature: Place;

  let subsystems = new Subsystems([
    new Isochrone(),
  ]);

  setContext("subsystems", subsystems);

  onMount(() => {
    subsystems.onMount();
    return () => subsystems.onDestroy();
  });
</script>

<div data-bs-theme={$resolvedTheme}>
  <MapView bind:zoom bind:lat bind:lng bind:selectedPlace={selectedFeature} />

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
            <PlaceCard place={selectedFeature} />
          </div>

          <div class="mt-3">
            <InspectorCard />
          </div>
        </div>
      </div>
    </div>
  </div>

  <Attribution />
</div>
