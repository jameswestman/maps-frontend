import { Subsystem, type SubsystemComponents } from "../Subsystem";
import { persisted } from "svelte-local-storage-store";

export const devToolsEnabled = persisted("devToolsEnabled", true);

export class DevToolsSubsystem extends Subsystem {
  public components(): SubsystemComponents {
    return {
      sidebar: [
        {
          componentImport: () =>
            import("./DevTools.svelte").then((m) => m.default),
          loadCondition: () => devToolsEnabled,
          order: -100,
        },
      ],
    };
  }
}
