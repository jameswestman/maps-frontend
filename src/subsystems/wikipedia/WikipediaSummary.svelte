<script lang="ts">
  import type { Place } from "../../Place";
  import { fetchBlurb, fetchWikidata } from "./wikidata";
  import { CardBody } from "@sveltestrap/sveltestrap";
  import { taskQueue } from "../../utils";

  export let place: Place;

  let lastPlace: Place;

  interface Result {
    summary: string;
    url: string;
  }

  const [wikipedia, setWikipedia] = taskQueue<Result>();

  $: {
    if (place !== lastPlace) {
      lastPlace = place;
      setWikipedia(undefined);
      const qid = place?.tags["osm:wikidata"];
      if (qid) {
        setWikipedia(async () => {
          const entity = await fetchWikidata(qid);
          const [summary, url] = await fetchBlurb(entity);
          return { summary, url };
        });
      }
    }
  }
</script>

{#if $wikipedia.status === "success" && $wikipedia.value}
  <CardBody>
    {$wikipedia.value.summary}
    <a href={$wikipedia.value.url} target="_blank">Wikipedia</a>
  </CardBody>
{/if}
