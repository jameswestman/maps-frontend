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
  const searchBarItems = subsystems.components("searchBar");

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
      <div class="h-100 position-relative">
        {#if $activeSidebarTab == null}
          <div transition:fly={{ x: -200 }} class="position-absolute top-0 bottom-0 start-0 end-0">
            <div class="d-flex flex-column h-100 w-100 sidebar-content">
              <div class="d-flex">
                <button
                  class="btn me-3 btn-{$resolvedTheme}"
                  class:btn-outline-secondary={$resolvedTheme === "dark"}
                  on:click={openAppMenu}
                >
                  <FontAwesomeIcon icon={faBars} />
              </button>

                {#each searchBarItems as component}
                  <ComponentInstance {component} />
                {/each}
              </div>

              {#each sidebarItems as component}
                <ComponentInstance {component} />
              {/each}
            </div>
          </div>
        {:else}
          <div transition:fly={{ x: 200 }} class="position-absolute top-0 bottom-0 start-0 end-0">
            <div class="d-flex flex-column h-100 w-100 sidebar-content">
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
