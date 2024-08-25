import { Subsystem, type SubsystemComponent } from "../Subsystem";
import WikipediaImage from "./WikipediaImage.svelte";
import WikipediaSummary from "./WikipediaSummary.svelte";

export class WikipediaSubsystem extends Subsystem {
  public placeCardComponents(): SubsystemComponent[] {
    return [
      { component: WikipediaSummary, order: 99 },
      { component: WikipediaImage, order: 100 },
    ];
  }
}
