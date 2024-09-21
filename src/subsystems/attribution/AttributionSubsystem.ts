import { AppState } from "../../AppState";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import { derived } from "svelte/store";

export class AttributionSubsystem extends Subsystem {
  public components(): SubsystemComponents {
    return {
      appRoot: [
        {
          componentImport: () =>
            import("./Attribution.svelte").then((m) => m.default),
          loadCondition: () => AppState.fromContext().attributionOpen,
          order: 100,
        },
      ],
    };
  }
}
