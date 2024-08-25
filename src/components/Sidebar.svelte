<script lang="ts">
  import { Subsystems, type SubsystemComponent } from "../subsystems/Subsystem";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
  import OpenInCard from "./OpenInCard.svelte";
  import PlaceCard from "../subsystems/placeCard/PlaceCard.svelte";
  import InspectorCard from "./InspectorCard.svelte";
  import { AppState } from "../AppState";
  import { fly } from "svelte/transition";

  const subsystems = Subsystems.fromContext();
  const appState = AppState.fromContext();
</script>

<div
  class="container position-absolute top-0 left-0 right-0 bottom-0 overflow-hidden"
  style="pointer-events: none"
>
  <div class="row h-100" style="pointer-events: none">
    <div
      class="col-12 col-md-6 col-lg-4 p-3 overflow-scroll h-100"
      style="pointer-events: none"
    >
      <div style="pointer-events: auto; position: relative;">
        {#if $appState.activeSidebarTab == null}
          <div transition:fly={{ x: -200 }}>
            <div style="position: absolute; width: 100%; max-width: 100%;">
              <ThemeSwitcher />

              <div class="mt-3">
                <OpenInCard
                  zoom={$appState.zoom}
                  lat={$appState.center.lat}
                  lng={$appState.center.lng}
                />
              </div>

              <div class="mt-3">
                <InspectorCard />
              </div>

              {#each subsystems.cardComponents() as component}
                <div class="mt-3">
                  {#if component}
                    <svelte:component this={component.component} />
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div transition:fly={{ x: 200 }}>
            <div style="position: absolute; width: 100%; max-width: 100%;">
              <svelte:component this={$appState.activeSidebarTab} />
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
