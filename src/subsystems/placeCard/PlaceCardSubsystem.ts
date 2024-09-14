import { AppState } from "../../AppState";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import { derived } from "svelte/store";

export class PlaceCardSubsystem extends Subsystem {
  public components(): SubsystemComponents {
    return {
      sidebar: [
        {
          componentImport: () =>
            import("./PlaceCard.svelte").then((m) => m.default),
          condition: () =>
            derived(
              AppState.fromContext(),
              (appState) =>
                appState.placeCardLoading ||
                (appState.selectedFeature !== null && !appState.placeCardClosed)
            ),
          order: 0,
        },
      ],
    };
  }
}
