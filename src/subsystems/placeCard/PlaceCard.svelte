<script lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { Card, CardBody, Spinner } from "@sveltestrap/sveltestrap";
  import type { Place } from "../../Place";
  import { resolvedTheme } from "../../theme";
  import { getContext } from "svelte";
  import type { Subsystems } from "src/subsystems/Subsystem";
  import { AppState } from "../../AppState";
  import ComponentInstance from "../../components/ComponentInstance.svelte";
  import { faFile } from "@fortawesome/free-solid-svg-icons";

  const subsystems: Subsystems = getContext("subsystems");
  const components = subsystems.components("placeCard");

  const appState = AppState.fromContext();
  const selectedFeature = appState.selectedFeature;
  const placeCardClosed = appState.placeCardClosed;

  let closed = false;

  let place: Place;
  let lastPlace: Place;

  let population: number;

  $: population = parseInt(place?.tags["osm:population"]);

  $: {
    place = $selectedFeature;
    if (place !== lastPlace) {
      lastPlace = place;
      closed = false;
    }
  }

  const geometryName = (type: GeoJSON.GeoJsonGeometryTypes) =>
    ({
      Point: "Marker",
      LineString: "Path",
      Polygon: "Area",
      MultiPoint: "Points",
      MultiLineString: "Paths",
      MultiPolygon: "Areas",
      GeometryCollection: "Feature",
    })[type] ?? "Feature";
</script>

{#if place && !$placeCardClosed}
  <Card class="scroll">
    <CardBody>
      <span class="d-flex flex-row">
        <h3 class="mb-0">
          {#if place.name}
            {place.name}
          {:else if place.origin.type === "custom-map"}
            <span class="opacity-50"
              >Untitled {geometryName(place.geometryType)}</span
            >
          {/if}
        </h3>
        <span class="flex-grow-1" />
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          class:btn-close-white={$resolvedTheme === "dark"}
          on:click={() => ($placeCardClosed = true)}
        />
      </span>
      {#if place.origin?.name}
        <div class="opacity-50 mt-1">
          <FontAwesomeIcon icon={faFile} class="me-1" />
          {place.origin.name}
        </div>
      {/if}
    </CardBody>

    {#if population}
      <CardBody>
        <FontAwesomeIcon icon={"users"} class="me-1" />
        Population {population.toLocaleString()}
      </CardBody>
    {/if}

    {#if place.tags?.description}
      <CardBody>
        {place.tags.description}
      </CardBody>
    {/if}

    {#each components as component}
      <ComponentInstance {component} args={{ place }} />
    {/each}
  </Card>
{/if}
