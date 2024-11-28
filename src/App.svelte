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
  import { CustomMapsSubsystem } from "./subsystems/customMaps/CustomMapsSubsystem";
  import { SearchSubsystem } from "./subsystems/search/SearchSubsystem";

  const appState = new AppState();
  setContext("appState", appState);

  const subsystems = new Subsystems([
    new PlaceCardSubsystem(),
    new Isochrone(),
    new WikipediaSubsystem(),
    new RoutingSubsystem(),
    new AppMenuSubsystem(),
    new AttributionSubsystem(),
    new DevToolsSubsystem(),
    new CustomMapsSubsystem(),
    new SearchSubsystem(),
  ]);
  setContext("subsystems", subsystems);

  const rootComponents = subsystems.components("appRoot");

  onMount(() => {
    subsystems.onMount();
    return () => subsystems.onDestroy();
  });

  (window as any).showAttributionDialog = () => {
    appState.attributionOpen.set(true);
  };
</script>

<div>
  <MapView />

  <Sidebar />

  {#each rootComponents as component}
    <ComponentInstance {component} />
  {/each}
</div>
