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
          loadCondition: () => {
            const appState = AppState.fromContext();
            return derived(
              [appState.selectedFeature, appState.placeCardClosed],
              ([selectedFeature, placeCardClosed]) =>
                selectedFeature !== null && !placeCardClosed
            );
          },
          order: 0,
        },
      ],
    };
  }
}
