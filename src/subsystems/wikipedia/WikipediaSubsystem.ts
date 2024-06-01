import { Subsystem, type PlaceCardComponent } from "../Subsystem";
import WikipediaImage from "./WikipediaImage.svelte";
import WikipediaSummary from "./WikipediaSummary.svelte";

export class WikipediaSubsystem extends Subsystem {
  public placeCardComponents(): PlaceCardComponent[] {
    return [
      { component: WikipediaSummary, order: 0 },
      { component: WikipediaImage, order: 100 },
    ];
  }
}
