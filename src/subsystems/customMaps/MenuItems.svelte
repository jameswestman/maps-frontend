<script lang="ts">
  import { ListGroup, ListGroupItem } from "@sveltestrap/sveltestrap";
  import { Subsystems } from "../Subsystem";
  import { CustomMapsSubsystem } from "./CustomMapsSubsystem";
  import { AppState } from "../../AppState";

  const customLayers = Subsystems.fromContext().get(CustomMapsSubsystem);
  const appState = AppState.fromContext();

  const openFile = (event: Event) => {
    customLayers.dropFiles((event.target as HTMLInputElement).files);
    appState.appMenuOpen.set(false);
  };

  let fileInput: HTMLInputElement;
</script>

<ListGroup flush>
  <ListGroupItem>
    <h2 class="h6 mt-3 mb-0" style="font-weight: bold;">Custom Maps</h2>
  </ListGroupItem>
  <input
    bind:this={fileInput}
    type="file"
    class="d-none"
    on:change={openFile}
  />
  <button class="list-group-item text-start" on:click={() => fileInput.click()}>
    Open File&hellip;
  </button>
</ListGroup>
