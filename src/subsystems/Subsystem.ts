import type { Map } from "maplibre-gl";
import type { Place } from "../Place";
import type { Theme } from "src/theme";
import type { ComponentType } from "svelte";

export class Subsystem {
  public onMount() {}

  public onDestroy() {}

  public setupMapStyle(map: Map, theme: Theme) {}

  public placeSelected(place: Place) {}

  public placeDeselected(place: Place) {}

  public placeCardComponents(): PlaceCardComponent[] {
    return [];
  }
}

export class Subsystems {
  constructor(private subsystems: Subsystem[]) {}

  public onMount() {
    this.call((s) => s.onMount());
  }

  public onDestroy() {
    this.call((s) => s.onDestroy());
  }

  public setupMapStyle(map: Map, theme: Theme) {
    this.call((s) => s.setupMapStyle(map, theme));
  }

  public placeSelected(place: Place) {
    this.call((s) => s.placeSelected(place));
  }

  public placeDeselected(place: Place) {
    this.call((s) => s.placeDeselected(place));
  }

  public placeCardComponents(): PlaceCardComponent[] {
    const components: PlaceCardComponent[] = [];
    this.call((s) => {
      components.push(...s.placeCardComponents());
    });
    components.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return components;
  }

  public call(f: (subsystem: Subsystem) => void) {
    this.subsystems.forEach((s) => {
      try {
        f(s);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export interface PlaceCardComponent {
  component: ComponentType;
  order?: number;
}
