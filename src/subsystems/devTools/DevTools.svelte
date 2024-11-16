<script lang="ts">
  import { theme } from "../../theme";
  import { AppState } from "../../AppState";
  import { devToolsEnabled } from "./DevToolsSubsystem";
  import { uniqueId } from "../../utils";

  const appState = AppState.fromContext();

  let zoom = appState.zoom;
  let center = appState.center;

  const inputId = uniqueId();
</script>

{#if $devToolsEnabled}
  <div class="card mt-3">
    <div class="card-body">
      <span>Open in:</span>
      <a
        href="https://openstreetmap.org/#map={$zoom + 1}/{$center.lat}/{$center.lon}"
        target="_blank"
      >
        OSM
      </a>
      <a
        href="https://google.com/maps/@{$center.lat},{$center.lon},{$zoom + 1}z"
        target="_blank"
      >
        Google Maps
      </a>
      <a
        href="https://bing.com/maps?cp={$center.lat}~{$center.lon}&lvl={$zoom + 1}"
        target="_blank"
      >
        Bing Maps
      </a>

      <div class="form-check">
        <input
          class="form-check-input"
          id={inputId}
          type="checkbox"
          bind:checked={$theme.inspector}
        />
        <label class="form-check-label" for={inputId}>Tile Inspector</label>
      </div>
    </div>
  </div>
{/if}
