<script lang="ts">
  import { Button, ListGroup, ListGroupItem } from "@sveltestrap/sveltestrap";
  import { inspectedFeatures } from "../../inspector";
</script>

{#if $inspectedFeatures.coords}
  <div class="pt-3 overflow-hidden">
    <div class="card overflow-auto h-100">
      <div class="card-header d-flex justify-content-between">
        <span class="tnum">
          {$inspectedFeatures.coords[0].toFixed(5)},
          {$inspectedFeatures.coords[1].toFixed(5)}
        </span>

        {#if $inspectedFeatures.clicked}
          <Button
            close
            class="align-middle"
            on:click={() =>
              ($inspectedFeatures = { features: [], clicked: false })}
          />
        {/if}
      </div>
      {#if $inspectedFeatures.features.length > 0}
        <ListGroup flush>
          {#each $inspectedFeatures.features as feature}
            <ListGroupItem>
              <strong>#{feature.sourceLayer}</strong>
              <small class="text-muted">{feature.id}</small>

              <table class="table table-sm">
                <tbody>
                  {#each Object.entries(feature.properties).sort() as [key, value]}
                    <tr>
                      <th>{key}</th>
                      <td>{value}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </ListGroupItem>
          {/each}
        </ListGroup>
      {/if}
    </div>
  </div>
{/if}

<style>
  .card-header:last-child {
    border-bottom: none;
  }
</style>
