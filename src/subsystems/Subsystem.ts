import type { Map } from "maplibre-gl";
import type { Place } from "../Place";
import type { Theme } from "src/theme";
import { getContext, type ComponentType } from "svelte";

export class Subsystem {
  public onMount() {}

  public onDestroy() {}

  public setupMapStyle(map: Map, theme: Theme) {}

  public placeSelected(place: Place) {}

  public placeDeselected(place: Place) {}

  public placeCardComponents(): SubsystemComponent[] {
    return [];
  }

  public cardComponents(): SubsystemComponent[] {
    return [];
  }
}

export class Subsystems {
  public static fromContext(): Subsystems {
    return getContext<Subsystems>("subsystems");
  }

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

  public placeCardComponents(): SubsystemComponent[] {
    const components: SubsystemComponent[] = [];
    this.call((s) => {
      components.push(...s.placeCardComponents());
    });
    components.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return components;
  }

  public cardComponents(): SubsystemComponent[] {
    const components: SubsystemComponent[] = [];
    this.call((s) => {
      components.push(...s.cardComponents());
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

  public get<T extends Subsystem>(t: new (...args: any[]) => T): T {
    return this.subsystems.find((s) => s instanceof t) as T;
  }
}

export interface SubsystemComponent {
  component: ComponentType;
  order?: number;
}
