<script lang="ts">
  import { theme } from "../../theme";
  import { AppState } from "../../AppState";
  import { devToolsEnabled } from "./DevToolsSubsystem";
  import { uniqueId } from "../../utils";

  const appState = AppState.fromContext();

  let zoom = 0;
  let lat = 0;
  let lng = 0;

  $: {
    zoom = $appState.zoom;
    lat = $appState.center.lat;
    lng = $appState.center.lng;
  }

  const inputId = uniqueId();
</script>

{#if $devToolsEnabled}
  <div class="card">
    <div class="card-body">
      <span>Open in:</span>
      <a
        href="https://openstreetmap.org/#map={zoom + 1}/{lat}/{lng}"
        target="_blank"
      >
        OpenStreetMap
      </a>
      <a
        href="https://google.com/maps/@{lat},{lng},{zoom + 1}z"
        target="_blank"
      >
        Google Maps
      </a>
      <a
        href="https://bing.com/maps?cp={lat}~{lng}&lvl={zoom + 1}"
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
