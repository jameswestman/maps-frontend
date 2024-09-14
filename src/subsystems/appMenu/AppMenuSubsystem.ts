import { AppState } from "../../AppState";
import { Subsystem, type SubsystemComponent } from "../Subsystem";
import { derived } from "svelte/store";

export class AppMenuSubsystem extends Subsystem {
  public appRootComponents(): SubsystemComponent[] {
    return [
      {
        componentImport: () =>
          import("./AppMenu.svelte").then((module) => module.default),
        condition: () =>
          derived(AppState.fromContext(), ($appState) => $appState.appMenuOpen),
        order: 0,
      },
    ];
  }
}
