import { theme } from "../../theme";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import { persisted } from "svelte-local-storage-store";
import { derived } from "svelte/store";

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
        {
          componentImport: () =>
            import("./InspectorCard.svelte").then((m) => m.default),
          loadCondition: () => derived(theme, ($theme) => $theme.inspector),
        },
      ],
    };
  }
}
