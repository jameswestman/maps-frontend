<script lang="ts">
  import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Icon,
    ListGroup,
    ListGroupItem,
    Table,
  } from "sveltestrap";
  import { inspectedFeatures } from "../inspector";

  const sortEntries = (a: [string, unknown], b: [string, unknown]) =>
    a[0].localeCompare(b[0]);
</script>

{#if $inspectedFeatures.features.length > 0}
  <Card>
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
  </Card>
{/if}
