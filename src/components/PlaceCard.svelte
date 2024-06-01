<script lang="ts">
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import type { Feature, MapGeoJSONFeature } from "maplibre-gl";
  import { Card, CardBody } from "sveltestrap";
  import { resolvedTheme } from "../theme";
  import { fetchBlurb, fetchWikidata } from "../wikidata";
  import type { Place } from "../Place";

  export let place: Place;

  let lastPlace: Place;

  let wikipediaBlurb: string;
  let wikipediaUrl: string;
  let image: string;
  let imageUrl: string;
  let population: number;

  $: {
    if (place !== lastPlace) {
      lastPlace = place;

      population = parseInt(place?.tags["osm:population"]);
      image = undefined;
      wikipediaBlurb = undefined;
      wikipediaUrl = undefined;

      const qid = place?.tags["osm:wikidata"];
      if (qid) {
        (async () => {
          const entity = await fetchWikidata(qid);
          [wikipediaBlurb, wikipediaUrl] = await fetchBlurb(entity);

          if ("P18" in entity.claims) {
            const fileName = entity.claims["P18"][0].mainsnak.datavalue.value;
            image = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${fileName}&width=400`;
            imageUrl = `https://commons.wikimedia.org/wiki/File:${fileName}`;
          }
        })();
      }
    }
  }
</script>

{#if place}
  <Card class="scroll">
    <CardBody>
      <span class="d-flex flex-row">
        <h3 class="mb-0">
          {place.tags["name"] ?? place.tags["ref"]}
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

    {#if wikipediaBlurb}
      <CardBody>
        {wikipediaBlurb}
        <a href={wikipediaUrl} target="_blank">Wikipedia</a>
      </CardBody>
    {/if}

    {#if image}
      <img src={image} class="rounded-bottom" alt="" />
    {/if}
  </Card>
{/if}
