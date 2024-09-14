import { Subsystem, type SubsystemComponent } from "../Subsystem";

export class PlaceCardSubsystem extends Subsystem {
  public cardComponents(): SubsystemComponent[] {
    return [
      {
        componentImport: () =>
          import("./PlaceCard.svelte").then((module) => module.default),
        order: 0,
      },
    ];
  }
}
