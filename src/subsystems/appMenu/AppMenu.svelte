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

  const commitHash = __COMMIT_HASH__.substring(0, 8);

  const appState = AppState.fromContext();

  const toggle = () => {
    appState.update((a) => {
      a.appMenuOpen = !a.appMenuOpen;
      return a;
    });
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

  const toggleDevTools = (e: Event) => {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    devToolsEnabled.set(target.checked);
  };

  const mounted = isMounted();

  const darkModeInputID = uniqueId();
  const devToolsInputID = uniqueId();
</script>

<Offcanvas
  isOpen={$mounted && $appState.appMenuOpen}
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
    </div>

    <div class="opacity-50 text-center" style="font-size: 0.75em">
      version {commitHash}
    </div>
  </div>
</Offcanvas>

<Feedback bind:this={feedback} />
