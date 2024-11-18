<script lang="ts">
  import { faBars } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { Button } from "@sveltestrap/sveltestrap";
  import { fly } from "svelte/transition";
  import { AppState } from "../AppState";
  import { Subsystems } from "../subsystems/Subsystem";
  import { resolvedTheme } from "../theme";
  import ComponentInstance from "./ComponentInstance.svelte";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";

  const subsystems = Subsystems.fromContext();

  const sidebarItems = subsystems.components("sidebar");
  const toolbarItems = subsystems.components("toolbar");

  const appState = AppState.fromContext();
  const appMenuOpen = appState.appMenuOpen;
  const activeSidebarTab = appState.activeSidebarTab;

  const openAppMenu = () => {
    appMenuOpen.set(true);
  };
</script>

<div
  class="position-absolute top-0 start-0 bottom-0 overflow-hidden z-0"
  style="pointer-events: none; right: 50px;"
>
  <div class="h-100 d-flex flex-row" style="pointer-events: none">
    <div
      class="p-3 h-100"
      style="pointer-events: none; width: calc(max(50%, 300px)); max-width: calc(min(400px, 100%));"
    >
      <div class="h-100">
        {#if $activeSidebarTab == null}
          <div transition:fly={{ x: -200 }} class="h-100">
            <div class="d-flex flex-column h-100 sidebar-content">
              <div class="d-flex">
                <Button
                  color={$resolvedTheme === "light" ? "light" : "secondary"}
                  class="me-3"
                  on:click={openAppMenu}
                >
                  <FontAwesomeIcon icon={faBars} />
                </Button>
                <ThemeSwitcher />
              </div>

              {#each sidebarItems as component}
                <ComponentInstance {component} />
              {/each}
            </div>
          </div>
        {:else}
          <div transition:fly={{ x: 200 }}>
            <div style="position: absolute; width: 100%; max-width: 100%;">
              {#await $activeSidebarTab}
                <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              {:then tab}
                <svelte:component this={tab} />
              {/await}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div
      class="pt-3 flex-grow-1 d-flex align-items-start justify-content-center"
      style="pointer-events: none"
    >
      <span style="pointer-events: auto" class="d-inline-flex">
        {#each toolbarItems as component}
          <span>
            <ComponentInstance {component} />
          </span>
        {/each}
      </span>
    </div>
  </div>
</div>

<style>
  :global(.sidebar-content > *) {
    pointer-events: auto;
  }
</style>
