<script lang="ts">
  import { Spinner } from "@sveltestrap/sveltestrap";
  import type { SubsystemComponent } from "../subsystems/Subsystem";
  import type { ComponentType } from "svelte";

  export let component: SubsystemComponent;
  export let args: any | null = null;

  let condition =
    typeof component.condition === "function"
      ? component.condition()
      : component.condition;

  let resolvedComponent: Promise<ComponentType> = null;

  $: {
    if (resolvedComponent === null && ($condition ?? true)) {
      resolvedComponent =
        "component" in component
          ? Promise.resolve(component.component)
          : component.componentImport();
    }
  }
</script>

{#await resolvedComponent}
  <Spinner color="primary" />
{:then component}
  <svelte:component this={component} {...args} />
{/await}
