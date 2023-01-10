<script lang="ts">
  import { Map, MapMouseEvent } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import { onDestroy, onMount } from "svelte";
  import { Alert, Button, ButtonGroup, Progress } from "sveltestrap";

  let map: Map;
  let mapContainer: HTMLElement;

  let variant = "light";

  interface SponsorInfo {
    title: string;
    description: string;
    percentComplete: number;
    targetValue: number;
  }
  let sponsorInfo: SponsorInfo;

  const setVariant = (newVariant: string) => {
    variant = newVariant;
    map.setStyle(
      `https://tiles.maps.jwestman.net/styles/${variant}/style.json`
    );
  };

  const fetchSponsor = async () => {
    const res = await fetch("https://sponsors-endpoint.jwestman.net/goal");
    sponsorInfo = await res.json();
  };

  onMount(() => {
    fetchSponsor();

    map = new Map({
      container: mapContainer,
      style: "https://tiles.maps.jwestman.net/styles/light/style.json",
      hash: true,
    });

    map.on("styledata", (event) => {
      const style = map.getStyle();
      for (const layer of style.layers) {
        if (!layer.metadata) continue;
        const cursor = layer.metadata["libshumate:cursor"];

        if (cursor) {
          map.on("mouseenter", layer.id, (event: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(event.point);
            if (features.length > 0) {
              console.log("mouseenter");
              const canvas = mapContainer.querySelector(
                ".maplibregl-canvas"
              ) as HTMLElement;
              canvas.style.cursor = cursor;
            }
          });

          map.on("mouseleave", layer.id, () => {
            const canvas = mapContainer.querySelector(
              ".maplibregl-canvas"
            ) as HTMLElement;
            canvas.style.cursor = "grab";
          });
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
    class="container position-absolute top-0 left-0 right-0"
    style="pointer-events: none"
  >
    <div class="row" style="pointer-events: none">
      <div class="col-12 col-md-6 col-lg-4 p-3" style="pointer-events: auto">
        <ButtonGroup class="w-100">
          <Button
            active={variant === "light"}
            on:click={() => setVariant("light")}
          >
            Light
          </Button>
          <Button
            active={variant === "dark"}
            on:click={() => setVariant("dark")}
          >
            Dark
          </Button>
        </ButtonGroup>

        <Alert class="mt-3" color="warning" dismissible>
          <h5>Known Issues:</h5>
          <ul>
            <li>
              Labels in some scripts don't appear. This isn't an issue in
              libshumate, which uses the native font stack.
            </li>
            <li>
              Labels aren't localized. This requires extra support in libshumate
              and the web renderer.
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
              encourages me to devote more time to improving this map style and
              other projects.
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

<style>
  .map {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
