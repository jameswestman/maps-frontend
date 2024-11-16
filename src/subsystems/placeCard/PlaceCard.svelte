<script lang="ts">
  import { faFile } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { CardBody } from "@sveltestrap/sveltestrap";
  import type { Subsystems } from "src/subsystems/Subsystem";
  import { getContext } from "svelte";
  import { AppState } from "../../AppState";
  import ComponentInstance from "../../components/ComponentInstance.svelte";
  import type { Place } from "../../Place";
  import { resolvedTheme, theme } from "../../theme";

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

{#if place && !$placeCardClosed && !$theme.inspector}
  <div class="pt-3 overflow-hidden">
    <div class="card h-100 overflow-auto">
      <CardBody>
        <span class="d-flex flex-row">
          <h3 class="mb-0">
            {#if place.name}
              {place.name}
            {:else if place.origin?.type === "custom-map"}
              <span class="opacity-50">
                Untitled {geometryName(place.geometryType)}
              </span>
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
    </div>
  </div>
{/if}
