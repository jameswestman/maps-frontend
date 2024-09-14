import { AppState } from "../../AppState";
import { Subsystem, type SubsystemComponent } from "../Subsystem";
import { derived } from "svelte/store";

export class AttributionSubsystem extends Subsystem {
  public appRootComponents(): SubsystemComponent[] {
    return [
      {
        componentImport: () =>
          import("./Attribution.svelte").then((m) => m.default),
        condition: () =>
          derived(
            AppState.fromContext(),
            ($appState) => $appState.attributionOpen
          ),
        order: 100,
      },
    ];
  }
}
