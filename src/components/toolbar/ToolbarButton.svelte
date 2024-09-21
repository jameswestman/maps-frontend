<script lang="ts">
  import { Tooltip } from "@sveltestrap/sveltestrap";
  import { resolvedTheme } from "../../theme";
  import { createEventDispatcher } from "svelte";

  export let tooltip: string;
  export let active: boolean = false;

  const dispatch = createEventDispatcher();

  let button: HTMLButtonElement;
</script>

<button
  bind:this={button}
  class="btn {active
    ? 'btn-primary'
    : $resolvedTheme === 'dark'
      ? 'btn-secondary'
      : 'btn-light'}"
  class:active
  on:click={() => dispatch("click")}
>
  <slot />
</button>
<Tooltip target={button} delay={0}>
  {tooltip}
</Tooltip>
