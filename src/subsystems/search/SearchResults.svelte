<script lang="ts">
  import { Spinner } from "@sveltestrap/sveltestrap";
  import { Subsystems } from "../Subsystem";
  import { SearchSubsystem } from "./SearchSubsystem";
  import { AppState } from "../../AppState";
  import type { Place } from "../../Place";

  const appState = AppState.fromContext();
  const search = Subsystems.fromContext().get(SearchSubsystem);
  const inputFocused = search.inputFocused;
  const query = search.query;
  const results = search.results;

  const clickResult = (result: Place) => {
    appState.selectedFeature.set(result);
    search.map.flyTo({
      center: result.location,
      zoom: 14
    });
  };
</script>

{#if $results !== null || $inputFocused}
  <div class="card mt-3">
    {#if $results}
      {#await $results}
        <div class="card-body d-flex justify-content-center">
          <Spinner />
        </div>
      {:then results}
        {#if results.length === 0}
          {#if $query}
            <div class="card-body">No results found.</div>
          {/if}
        {:else}
          <ul class="list-group list-group-flush">
            {#each results as result}
              <li class="list-group-item">
                <button
                  class="btn stretched-link p-0"
                  type="button"
                  on:click={() => clickResult(result)}
                >
                  {result.name}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      {:catch}
        <div class="card-body">Failed to load search results.</div>
      {/await}
    {:else}
      <div class="card-body">Press Enter to search.</div>
    {/if}

    <div class="card-footer">
      <small class="text-muted">
        Search powered by <a href="https://nominatim.org/" target="_blank"
          >Nominatim</a
        >.
      </small>
    </div>
  </div>
{/if}

<style>
  .card-footer:first-child {
    border-top: 0;
  }
</style>
