<script lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { Card, CardBody } from "@sveltestrap/sveltestrap";
  import type { Place } from "../Place";
  import { resolvedTheme } from "../theme";
  import { getLangCode } from "../utils";
  import { getContext } from "svelte";
  import type { Subsystems } from "src/subsystems/Subsystem";

  export let place: Place;

  const subsystems: Subsystems = getContext("subsystems");
  const components = subsystems.placeCardComponents();

  let lastPlace: Place;

  let population: number;

  $: {
    if (place !== lastPlace) {
      lastPlace = place;
      population = parseInt(place?.tags["osm:population"]);
    }
  }
</script>

{#if place}
  <Card class="scroll">
    <CardBody>
      <span class="d-flex flex-row">
        <h3 class="mb-0">
          {place.name ??
            place.tags["name:" + getLangCode()] ??
            place.tags["name"] ??
            place.tags["ref"]}
        </h3>
        <span class="flex-grow-1" />
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          class:btn-close-white={$resolvedTheme === "dark"}
          on:click={() => (place = undefined)}
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
      <svelte:component this={component.component} {place} />
    {/each}
  </Card>
{/if}
