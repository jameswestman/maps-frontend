<script lang="ts">
  import { Map, MapMouseEvent, type Feature } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import { onDestroy, onMount } from "svelte";
  import {
    Alert,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    Progress,
  } from "sveltestrap";
  import PlaceCard from "./PlaceCard.svelte";
  import { resolvedTheme, Theme, theme } from "./theme";

  let map: Map;
  let mapContainer: HTMLElement;

  let zoom = 0;
  let lat = 0;
  let lng = 0;

  let selectedFeature: Feature;

  interface SponsorInfo {
    title: string;
    description: string;
    percentComplete: number;
    targetValue: number;
  }
  let sponsorInfo: SponsorInfo;

  const fetchSponsor = async () => {
    const res = await fetch("https://sponsors-endpoint.jwestman.net/goal");
    sponsorInfo = await res.json();
  };

  {
    const unsubscribe = resolvedTheme.subscribe((newTheme) => {
      if (map)
        map.setStyle(
          `https://tiles.maps.jwestman.net/styles/${newTheme}/style.json`
        );
    });
    onDestroy(unsubscribe);
  }

  onMount(() => {
    fetchSponsor();

    map = new Map({
      container: mapContainer,
      style: `https://tiles.maps.jwestman.net/styles/${$resolvedTheme}/style.json`,
      hash: true,
      customAttribution:
        "<a href='https://openmaptiles.org/' target='_blank'>&copy; OpenMapTiles</a> <a href='https://www.openstreetmap.org/copyright' target='_blank'>&copy; OpenStreetMap contributors</a>",
    });
    zoom = map.getZoom();
    [lng, lat] = map.getCenter().toArray();

    map.on("zoomend", () => {
      zoom = map.getZoom();
    });
    map.on("moveend", () => {
      [lng, lat] = map.getCenter().toArray();
    });

    const unregisterListeners: (() => void)[] = [];

    map.on("styledata", (event) => {
      const style = map.getStyle();
      for (const unregister of unregisterListeners) {
        unregister();
      }

      for (const layer of style.layers) {
        if (!layer.metadata) continue;
        const cursor = layer.metadata["libshumate:cursor"];

        if (cursor) {
          const mouseenter = (event: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(event.point);
            if (features.length > 0) {
              const canvas = mapContainer.querySelector(
                ".maplibregl-canvas"
              ) as HTMLElement;
              canvas.style.cursor = cursor;
            }
          };
          map.on("mouseenter", layer.id, mouseenter);
          unregisterListeners.push(() =>
            map.off("mouseenter", layer.id, mouseenter)
          );

          const mouseleave = () => {
            const canvas = mapContainer.querySelector(
              ".maplibregl-canvas"
            ) as HTMLElement;
            canvas.style.cursor = "grab";
          };
          map.on("mouseleave", layer.id, mouseleave);
          unregisterListeners.push(() =>
            map.off("mouseleave", layer.id, mouseleave)
          );

          const click = (event) => {
            selectedFeature = event.features[0];
          };
          map.on("click", layer.id, click);
          unregisterListeners.push(() => map.off("click", layer.id, click));
        }
      }
    });
  });

  onDestroy(() => {
    map.remove();
  });
</script>

<div>
  <div class="map" id="map" bind:this={mapContainer} />

  <div
    class="container position-absolute top-0 left-0 right-0 bottom-0 overflow-hidden"
    style="pointer-events: none"
  >
    <div class="row h-100" style="pointer-events: none">
      <div
        class="col-12 col-md-6 col-lg-4 p-3 overflow-scroll h-100"
        style="pointer-events: none"
      >
        <div style="pointer-events: auto">
          <ButtonGroup class="w-100">
            <Button
              active={$resolvedTheme === "light"}
              on:click={() => theme.set(Theme.LIGHT)}
            >
              Light
            </Button>
            <Button
              active={$resolvedTheme === "dark"}
              on:click={() => theme.set(Theme.DARK)}
            >
              Dark
            </Button>
          </ButtonGroup>

          <Card
            class="mt-3"
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
              <a
                href="https://qwant.com/maps#map={zoom}/{lat}/{lng}"
                target="_blank"
              >
                Qwant Maps
              </a>
            </CardBody>
          </Card>

          <div class="mt-3">
            <PlaceCard feature={selectedFeature} />
          </div>

          <Alert class="mt-3" color="warning" dismissible>
            <h5>Known Issues:</h5>
            <ul>
              <li>
                Labels in some scripts don't appear. This isn't an issue in
                libshumate, which uses the native font stack.
              </li>
              <li>
                Labels aren't localized. This requires extra support in
                libshumate and the web renderer.
              </li>
            </ul>
          </Alert>

          <Alert class="mt-3" color="success" dismissible>
            <h5>You can sponsor my work on GitHub Sponsors or Patreon!</h5>
            {#if sponsorInfo}
              <div>
                <strong>Current Goal: {sponsorInfo.title}</strong>
                <Progress
                  color={sponsorInfo.percentComplete >= 100
                    ? "success"
                    : "secondary"}
                  value={sponsorInfo.percentComplete}
                >
                  {sponsorInfo.percentComplete}%
                </Progress>
                <p class="mt-2">{sponsorInfo.description}</p>
              </div>
            {:else}
              <p>
                Your support helps me pay hosting costs for the map server, and
                encourages me to devote more time to improving this map style
                and other projects.
              </p>
            {/if}

            <div>
              <Button
                href="https://github.com/sponsors/jameswestman"
                color="primary"
              >
                GitHub Sponsors
              </Button>
              <Button href="https://patreon.com/jwestman" color="primary">
                Patreon
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .map {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
