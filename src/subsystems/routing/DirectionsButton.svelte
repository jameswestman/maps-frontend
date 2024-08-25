<script lang="ts">
  import { Button, CardBody } from "@sveltestrap/sveltestrap";
  import type { Place } from "../../Place";
  import { RoutingSubsystem } from "./RoutingSubsystem";
  import { Subsystems } from "../Subsystem";
  import { AppState } from "../../AppState";
  import RoutingCard from "./RoutingCard.svelte";

  export let place: Place;

  const routing = Subsystems.fromContext().get(RoutingSubsystem);

  const appState = AppState.fromContext();

  const stops = routing.stops;

  const getDirections = () => {
    routing.getDirections(place);
    appState.update((s) => {
      s.activeSidebarTab = RoutingCard;
      return s;
    });
  };

  let alreadyAdded = false;
  $: {
    alreadyAdded = $stops.some((stop) => stop === place);
  }
</script>

<CardBody>
  <Button color="primary" on:click={getDirections}>
    {alreadyAdded
      ? "Add to Route Again"
      : $stops.length
        ? "Add to Route"
        : "Directions"}
  </Button>
</CardBody>
