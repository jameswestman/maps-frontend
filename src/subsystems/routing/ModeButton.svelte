<script lang="ts">
  import {
    faBicycle,
    faCar,
    faWalking,
    type IconDefinition,
  } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { Tooltip } from "@sveltestrap/sveltestrap";
  import { createEventDispatcher } from "svelte";
  import type { Costing } from "./api-types";

  export let activeMode: Costing;
  export let mode: Costing;

  const dispatch = createEventDispatcher();

  let icon: IconDefinition;
  let tooltip: string;

  $: icon = {
    auto: faCar,
    bicycle: faBicycle,
    pedestrian: faWalking,
  }[mode];

  $: tooltip = {
    auto: "Driving",
    bicycle: "Cycling",
    pedestrian: "Walking",
  }[mode];

  let button: HTMLElement;
</script>

<button
  bind:this={button}
  class:active={mode === activeMode}
  aria-current={mode === activeMode}
  class="btn btn-outline-secondary"
  type="button"
  on:click={() => {
    dispatch("click", { mode });
  }}
>
  <FontAwesomeIcon {icon} />
  <Tooltip target={button}>{tooltip}</Tooltip>
</button>
