import { Subsystem, type SubsystemComponent } from "../Subsystem";
import PlaceCard from "./PlaceCard.svelte";

export class PlaceCardSubsystem extends Subsystem {
  public cardComponents(): SubsystemComponent[] {
    return [
      {
        component: PlaceCard,
        order: 0,
      },
    ];
  }
}