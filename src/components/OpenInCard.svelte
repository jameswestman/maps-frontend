<script lang="ts">
  import { Card, CardBody, Input } from "sveltestrap";
  import { resolvedTheme, theme } from "../theme";

  export let zoom: number;
  export let lat: number;
  export let lng: number;
</script>

<Card>
  <CardBody>
    <span>Open in:</span>
    <a
      href="https://openstreetmap.org/#map={zoom + 1}/{lat}/{lng}"
      target="_blank"
    >
      OpenStreetMap
    </a>
    <a href="https://google.com/maps/@{lat},{lng},{zoom + 1}z" target="_blank">
      Google Maps
    </a>
    <a
      href="https://bing.com/maps?cp={lat}~{lng}&lvl={zoom + 1}"
      target="_blank"
    >
      Bing Maps
    </a>
    <a href="https://qwant.com/maps#map={zoom}/{lat}/{lng}" target="_blank">
      Qwant Maps
    </a>

    <Input
      id="tile_inspector"
      type="checkbox"
      label="Inspect Data"
      bind:checked={$theme.inspector}
    />
  </CardBody>
</Card>
