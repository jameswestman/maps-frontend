<script>
  import { dropActive } from "./CustomMapsSubsystem";
</script>

{#if $dropActive}
  <div class="drop-zone">
    <div class="card prompt">
      <div class="card-body">
        <h3>Drag and drop to open files</h3>
        Supported formats:
        <ul>
          <li>GeoJSON</li>
        </ul>
      </div>
    </div>
  </div>
{/if}

<style>
  .drop-zone {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    box-shadow: inset 0 0 10em 10em rgba(0, 0, 0, 0.8);
    pointer-events: none;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .drop-zone .prompt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    max-width: 80vw;
  }
</style>
