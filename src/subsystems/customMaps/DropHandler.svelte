<script lang="ts">
  /**
   * An invisible component that listens for file drops on the <body>
   * and forwards them to the CustomMapsSubsystem.
   */

  import { Subsystems } from "../Subsystem";
  import { CustomMapsSubsystem, dropActive } from "./CustomMapsSubsystem";

  const customLayers = Subsystems.fromContext().get(CustomMapsSubsystem);

  const onDropFile = async (event: DragEvent) => {
    event.preventDefault();
    dropActive.set(false);
    customLayers.dropFiles(event.dataTransfer.files);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    dropActive.set(true);
  };

  const onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    dropActive.set(false);
  };
</script>

<svelte:body
  on:dragover={onDragOver}
  on:drop={onDropFile}
  on:dragleave={onDragLeave}
/>
