import { Subsystem, type SubsystemComponent } from "../Subsystem";
import { persisted } from "svelte-local-storage-store";

export const devToolsEnabled = persisted("devToolsEnabled", true);

export class DevToolsSubsystem extends Subsystem {
  public cardComponents(): SubsystemComponent[] {
    return [
      {
        componentImport: () =>
          import("./DevTools.svelte").then((m) => m.default),
        condition: () => devToolsEnabled,
        order: -100,
      },
    ];
  }
}
