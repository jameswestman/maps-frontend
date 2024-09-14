import { Subsystem, type SubsystemComponents } from "../Subsystem";
import WikipediaImage from "./WikipediaImage.svelte";
import WikipediaSummary from "./WikipediaSummary.svelte";

export class WikipediaSubsystem extends Subsystem {
  public components(): SubsystemComponents {
    return {
      placeCard: [
        { component: WikipediaSummary, order: 99 },
        { component: WikipediaImage, order: 100 },
      ],
    };
  }
}
