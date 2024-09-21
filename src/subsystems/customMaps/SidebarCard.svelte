<script lang="ts">
  import { Card, ListGroup, ListGroupItem } from "@sveltestrap/sveltestrap";
  import { Subsystems } from "../Subsystem";
  import { CustomMapsSubsystem } from "./CustomMapsSubsystem";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import {
    faEdit,
    faXmark,
    faDownload,
  } from "@fortawesome/free-solid-svg-icons";
  import type { MapFile } from "./MapFile";

  const subsystem = Subsystems.fromContext().get(CustomMapsSubsystem);
  const fileLoader = subsystem.$fileLoader;

  $: mapFiles = $fileLoader.$files;
  $: editSession = $fileLoader.$editSession;

  const editFile = (file: MapFile) => {
    $fileLoader.toggleEdit(file);
  };
</script>

{#if $mapFiles.length > 0}
  <Card>
    <ListGroup flush>
      {#each $mapFiles as mapFile}
        <ListGroupItem>
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-break">{mapFile.name}</span>

            <span class="d-flex">
              {#if $editSession?.mapFile !== mapFile}
                <button
                  class="btn btn-flat"
                  title="Edit file"
                  on:click={() => editFile(mapFile)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              {:else}
                <button
                  class="btn btn-primary"
                  title="Download edited file"
                  on:click={() => $editSession.downloadFile()}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
              {/if}

              <div class="vr mx-2"></div>

              <button
                class="btn btn-flat pe-0 ps-2"
                style="color: var(--bs-body-color);"
                title="Remove file"
                on:click={() => {
                  $fileLoader.removeFile(mapFile);
                }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </span>
          </div>
        </ListGroupItem>
      {/each}
    </ListGroup>
  </Card>
{/if}
