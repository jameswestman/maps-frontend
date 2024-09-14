<script lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { Card, CardBody, Spinner } from "@sveltestrap/sveltestrap";
  import type { Place } from "../../Place";
  import { resolvedTheme } from "../../theme";
  import { getContext } from "svelte";
  import type { Subsystems } from "src/subsystems/Subsystem";
  import { AppState } from "../../AppState";
  import ComponentInstance from "../../components/ComponentInstance.svelte";

  const subsystems: Subsystems = getContext("subsystems");
  const components = subsystems.placeCardComponents();

  const appState = AppState.fromContext();

  let closed = false;

  let place: Place;
  let lastPlace: Place;

  let population: number;

  $: {
    place = $appState.selectedFeature;
    if (place !== lastPlace) {
      lastPlace = place;
      closed = false;
      population = parseInt(place?.tags["osm:population"]);
    }
  }
</script>

{#if place && !$appState.placeCardClosed}
  <Card class="scroll">
    <CardBody>
      <span class="d-flex flex-row">
        <h3 class="mb-0">
          {place.name}
        </h3>
        <span class="flex-grow-1" />
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          class:btn-close-white={$resolvedTheme === "dark"}
          on:click={() => ($appState.placeCardClosed = true)}
        />
      </span>
    </CardBody>

    {#if population}
      <CardBody>
        <FontAwesomeIcon icon={"users"} class="me-1" />
        Population {population.toLocaleString()}
      </CardBody>
    {/if}

    {#each components as component}
      <ComponentInstance {component} args={{ place }} />
    {/each}
  </Card>
{:else if $appState.placeCardLoading}
  <Card class="mt-3">
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
{/if}
