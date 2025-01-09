<script lang="ts">
  import {
    ListGroup,
    ListGroupItem,
    Offcanvas,
  } from "@sveltestrap/sveltestrap";
  import { AppState } from "../../AppState";
  import Feedback from "./Feedback.svelte";
  import { resolvedTheme, theme, ThemeVariant } from "../../theme";
  import { isMounted, uniqueId } from "../../utils";
  import { devToolsEnabled } from "../devTools/DevToolsSubsystem";
  import { Subsystems } from "../Subsystem";
  import ComponentInstance from "../../components/ComponentInstance.svelte";

  const commitHash = __COMMIT_HASH__.substring(0, 8);

  const subsystems = Subsystems.fromContext();
  const appState = AppState.fromContext();

  const appMenuOpen = appState.appMenuOpen;

  const menuSections = subsystems.components("menuSections");

  const toggle = () => {
    appMenuOpen.update((value) => !value);
  };

  let feedback: Feedback;

  const showFeedback = () => {
    feedback.toggle();
  };

  const toggleDarkMode = (e: Event) => {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    theme.set({
      ...$theme,
      variant: target.checked ? ThemeVariant.DARK : ThemeVariant.LIGHT,
    });
  };

  const toggleSatellite = (e: Event) => {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    theme.set({
      ...$theme,
      satellite: target.checked,
    });
  };

  const toggleDevTools = (e: Event) => {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    devToolsEnabled.set(target.checked);
  };

  const mounted = isMounted();

  const darkModeInputID = uniqueId();
  const devToolsInputID = uniqueId();
  const satelliteInputID = uniqueId();
</script>

<Offcanvas
  isOpen={$mounted && $appMenuOpen}
  {toggle}
  header="Menu"
  backdrop
  class="app-menu-offcanvas"
>
  <div
    class="d-flex flex-column justify-content-between"
    style="min-height: 100%;"
  >
    <div>
      <ListGroup flush>
        <ListGroupItem>
          <h2 class="h6 mb-0" style="font-weight: bold;">Settings</h2>
        </ListGroupItem>
        <ListGroupItem>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id={darkModeInputID}
              checked={$resolvedTheme === "dark"}
              on:change={toggleDarkMode}
            />
            <label class="form-check-label" for={darkModeInputID}>
              Dark Mode
            </label>
          </div>
        </ListGroupItem>

        <ListGroupItem>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id={satelliteInputID}
              checked={$theme.satellite}
              on:change={toggleSatellite}
            />
            <label class="form-check-label" for={darkModeInputID}>
              Satellite
              <small class="d-block opacity-75">North America only</small>
            </label>
          </div>
        </ListGroupItem>

        <ListGroupItem>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id={devToolsInputID}
              bind:checked={$devToolsEnabled}
              on:change={toggleDevTools}
            />
            <label class="form-check-label" for={devToolsInputID}>
              Dev Tools
            </label>
          </div>
        </ListGroupItem>
      </ListGroup>

      {#each menuSections as component}
        <ComponentInstance {component} />
      {/each}

      <ListGroup flush>
        <ListGroupItem>
          <h2 class="h6 mt-3 mb-0" style="font-weight: bold;">Links</h2>
        </ListGroupItem>
        <ListGroupItem href="javascript:void(showAttributionDialog());">
          Data Sources
        </ListGroupItem>
        <button class="list-group-item text-start" on:click={showFeedback}>
          Feedback
        </button>
      </ListGroup>

      <ListGroup flush>
        <ListGroupItem>
          <h2 class="h6 mt-3 mb-0" style="font-weight: bold;">Support maps.jwestman.net</h2>
        </ListGroupItem>
        <ListGroupItem href="https://github.com/sponsors/jameswestman" target="_blank">
          GitHub Sponsors
        </ListGroupItem>
        <ListGroupItem href="https://www.patreon.com/jwestman" target="_blank">
          Patreon
        </ListGroupItem>
      </ListGroup>
    </div>

    <div class="opacity-50 text-center" style="font-size: 0.75em">
      version {commitHash}
    </div>
  </div>
</Offcanvas>

<Feedback bind:this={feedback} />
