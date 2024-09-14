import { AppState } from "../../AppState";
import { Subsystem, type SubsystemComponent } from "../Subsystem";
import { derived } from "svelte/store";

export class PlaceCardSubsystem extends Subsystem {
  public cardComponents(): SubsystemComponent[] {
    return [
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
    ];
  }
}
