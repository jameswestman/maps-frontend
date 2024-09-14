<script lang="ts">
  import { onMount, setContext } from "svelte";
  import MapView from "./components/MapView.svelte";
  import { Isochrone } from "./subsystems/isochrone/IsochroneSubsystem";
  import { Subsystems } from "./subsystems/Subsystem";
  import { WikipediaSubsystem } from "./subsystems/wikipedia/WikipediaSubsystem";
  import { RoutingSubsystem } from "./subsystems/routing/RoutingSubsystem";
  import Sidebar from "./components/Sidebar.svelte";
  import { AppState } from "./AppState";
  import { writable } from "svelte/store";
  import { PlaceCardSubsystem } from "./subsystems/placeCard/PlaceCardSubsystem";
  import ComponentInstance from "./components/ComponentInstance.svelte";
  import { AppMenuSubsystem } from "./subsystems/appMenu/AppMenuSubsystem";
  import { AttributionSubsystem } from "./subsystems/attribution/AttributionSubsystem";
  import { DevToolsSubsystem } from "./subsystems/devTools/DevToolsSubsystem";

  let subsystems = new Subsystems([
    new PlaceCardSubsystem(),
    new Isochrone(),
    new WikipediaSubsystem(),
    new RoutingSubsystem(),
    new AppMenuSubsystem(),
    new AttributionSubsystem(),
    new DevToolsSubsystem(),
  ]);

  const rootComponents = subsystems.appRootComponents();

  let appState = writable(new AppState());

  setContext("subsystems", subsystems);
  setContext("appState", appState);

  onMount(() => {
    subsystems.onMount();
    return () => subsystems.onDestroy();
  });

  (window as any).showAttributionDialog = () => {
    appState.update((a) => {
      a.attributionOpen = true;
      return a;
    });
  };
</script>

<div>
  <MapView
    bind:zoom={$appState.zoom}
    bind:lat={$appState.center.lat}
    bind:lng={$appState.center.lng}
    bind:selectedPlace={$appState.selectedFeature}
  />

  <Sidebar />

  {#each rootComponents as component}
    <ComponentInstance {component} />
  {/each}
</div>
