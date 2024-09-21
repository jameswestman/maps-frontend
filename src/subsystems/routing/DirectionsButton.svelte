<script lang="ts">
  import { Button, CardBody } from "@sveltestrap/sveltestrap";
  import type { Place } from "../../Place";
  import { RoutingSubsystem } from "./RoutingSubsystem";
  import { Subsystems } from "../Subsystem";
  import { AppState } from "../../AppState";
  import { reverseGeocode } from "../../utils/geocode";

  export let place: Place;

  let routingAvailable = false;

  const routing = Subsystems.fromContext().get(RoutingSubsystem);

  const appState = AppState.fromContext();

  const stops = routing.stops;

  const getDirections = () => {
    routing.getDirections(place);
    appState.activeSidebarTab.set(
      import("./RoutingCard.svelte").then((x) => x.default)
    );
  };

  let alreadyAdded = false;
  $: {
    alreadyAdded = $stops.some((stop) => stop === place);
  }
  $: {
    routingAvailable = false;
    reverseGeocode(place.location)
      .then((result) => {
        routingAvailable = result.some((r) => r.name === "United States");
      })
      .catch((e) => {
        console.error(e);
      });
  }
</script>

{#if routingAvailable}
  <CardBody>
    <Button color="primary" on:click={getDirections}>
      {alreadyAdded
        ? "Add to Route Again"
        : $stops.length
          ? "Add to Route"
          : "Directions"}
    </Button>
  </CardBody>
{/if}
