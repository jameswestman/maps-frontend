import type { Map } from "maplibre-gl";
import type { Place } from "../Place";
import type { Theme } from "src/theme";
import { getContext, type ComponentType } from "svelte";
import type { Readable } from "svelte/store";

export class Subsystem {
  public onMount() {}

  public onDestroy() {}

  public setupMapStyle(map: Map, theme: Theme) {}

  public placeSelected(place: Place) {}

  public placeDeselected(place: Place) {}

  public appRootComponents(): SubsystemComponent[] {
    return [];
  }

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

  public appRootComponents(): SubsystemComponent[] {
    const components: SubsystemComponent[] = [];
    this.call((s) => {
      components.push(...s.appRootComponents());
    });
    components.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return components;
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

/**
 * A subsystem component that is immediately available.
 */
export interface ImmediateSubsystemComponent extends SubsystemComponentShared {
  component: ComponentType;
}

/**
 * A subsystem component that loads asynchronously.
 */
export interface DeferredSubsystemComponent extends SubsystemComponentShared {
  componentImport: () => Promise<ComponentType>;
}

export interface SubsystemComponentShared {
  condition?: Readable<boolean> | (() => Readable<boolean>);
  order?: number;
}

export type SubsystemComponent =
  | ImmediateSubsystemComponent
  | DeferredSubsystemComponent;
