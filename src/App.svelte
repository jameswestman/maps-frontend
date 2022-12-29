<script lang="ts">
  import { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import { onDestroy, onMount } from "svelte";
  import {
    Alert,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    Input,
    InputGroup,
    Navbar,
    NavbarBrand,
  } from "sveltestrap";

  let map: Map;
  let mapContainer: HTMLElement;

  let variant = "light";

  const setVariant = (newVariant: string) => {
    variant = newVariant;
    map.setStyle(`https://tiles.maps.jwestman.net/styles/${variant}/style.json`);
  };

  onMount(() => {
    map = new Map({
      container: mapContainer,
      style: "https://tiles.maps.jwestman.net/styles/light/style.json",
    });
  });

  onDestroy(() => {
    map.remove();
  });
</script>

<div>
  <div class="map" id="map" bind:this={mapContainer} />

  <div class="container position-absolute top-0 left-0 right-0">
    <div class="row">
      <div class="col-12 col-md-6 col-lg-4 p-3">
        <ButtonGroup class="w-100">
          <Button active={variant === "light"} on:click={() => setVariant("light")}>Light</Button>
          <Button active={variant === "dark"} on:click={() => setVariant("dark")}>Dark</Button>
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
