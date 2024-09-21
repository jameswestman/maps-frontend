import { AppState } from "../../AppState";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import { derived } from "svelte/store";

export class AppMenuSubsystem extends Subsystem {
  public components(): SubsystemComponents {
    return {
      appRoot: [
        {
          componentImport: () =>
            import("./AppMenu.svelte").then((module) => module.default),
          loadCondition: () => AppState.fromContext().appMenuOpen,
          order: 0,
        },
      ],
    };
  }
}
