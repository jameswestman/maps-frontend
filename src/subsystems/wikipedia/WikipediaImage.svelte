<script lang="ts">
  import type { Place } from "src/Place";
  import { fetchWikidata } from "./wikidata";
  import { taskQueue } from "../../utils";

  export let place: Place;

  let lastPlace: Place;

  const [image, setImage] = taskQueue<string>();

  $: {
    if (place !== lastPlace) {
      lastPlace = place;
      setImage(undefined);

      const qid = place?.tags["osm:wikidata"];
      if (qid) {
        setImage(async () => {
          const entity = await fetchWikidata(qid);

          if ("P18" in entity.claims) {
            const fileName = entity.claims["P18"][0].mainsnak.datavalue.value;
            return `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${fileName}&width=400`;
          } else {
            return undefined;
          }
        });
      }
    }
  }
</script>

{#if $image.status === "success"}
  <img src={$image.value} class="rounded-bottom" alt="" />
{/if}
