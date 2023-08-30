<script lang="ts">
  import { Card, CardBody } from "sveltestrap";
  import { resolvedTheme } from "../theme";

  export let zoom: number;
  export let lat: number;
  export let lng: number;
</script>

<Card
  color={$resolvedTheme === "dark" ? "dark" : "light"}
  inverse={$resolvedTheme === "dark"}
>
  <CardBody>
    <span>Open in:</span>
    <a
      href="https://openstreetmap.org/#map={zoom + 1}/{lat}/{lng}"
      target="_blank"
    >
      OpenStreetMap
    </a>
    <a
      href="https://tiles.maps.jwestman.net/data/streets_v3/#{zoom}/{lat}/{lng}"
      target="_blank"
    >
      Tile Inspector
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
  </CardBody>
</Card>
