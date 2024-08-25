<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { Place } from "./Place";
  import Attribution from "./components/Attribution.svelte";
  import MapView from "./components/MapView.svelte";
  import { Isochrone } from "./subsystems/isochrone/IsochroneSubsystem";
  import { resolvedTheme } from "./theme";
  import { Subsystems } from "./subsystems/Subsystem";
  import { WikipediaSubsystem } from "./subsystems/wikipedia/WikipediaSubsystem";
  import { RoutingSubsystem } from "./subsystems/routing/RoutingSubsystem";
  import Sidebar from "./components/Sidebar.svelte";
  import { AppState } from "./AppState";
  import { writable } from "svelte/store";
  import { PlaceCardSubsystem } from "./subsystems/placeCard/PlaceCardSubsystem";

  let subsystems = new Subsystems([
    new PlaceCardSubsystem(),
    new Isochrone(),
    new WikipediaSubsystem(),
    new RoutingSubsystem(),
  ]);

  let appState = writable(new AppState());

  setContext("subsystems", subsystems);
  setContext("appState", appState);

  onMount(() => {
    subsystems.onMount();
    return () => subsystems.onDestroy();
  });
</script>

<div data-bs-theme={$resolvedTheme}>
  <MapView
    bind:zoom={$appState.zoom}
    bind:lat={$appState.center.lat}
    bind:lng={$appState.center.lng}
    bind:selectedPlace={$appState.selectedFeature}
  />

  <Sidebar />

  <Attribution />
</div>
