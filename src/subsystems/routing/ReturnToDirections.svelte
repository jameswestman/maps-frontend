<script lang="ts">
  import { Button } from "@sveltestrap/sveltestrap";
  import { AppState } from "../../AppState";
  import { Subsystems } from "../Subsystem";
  import { RoutingSubsystem } from "./RoutingSubsystem";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
  import { derived } from "svelte/store";

  const appState = AppState.fromContext();
  const routing = Subsystems.fromContext().get(RoutingSubsystem);
  const stops = routing.stops;

  const lastStop = derived(stops, (stops) => {
    return stops[stops.length - 1];
  });
</script>

{#if $stops.length}
  <Button
    color="primary"
    block
    class="d-flex justify-content-between align-items-center"
    on:click={() => {
      appState.update((s) => {
        s.activeSidebarTab = import("./RoutingCard.svelte").then((x) => x.default);
        return s;
      });
    }}
  >
    <span class="text-start">
      Directions to {$lastStop.name}
    </span>
    <span class="ms-3">
      <FontAwesomeIcon icon={faArrowRight} />
    </span>
  </Button>
{/if}
