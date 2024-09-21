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

  public components(): SubsystemComponents {
    return {};
  }

  public handleStyleImageMissing(imageId: string, map: Map) {}
}

export class Subsystems {
  private _components: SubsystemComponents = {};

  public static fromContext(): Subsystems {
    return getContext<Subsystems>("subsystems");
  }

  constructor(private subsystems: Subsystem[]) {
    for (const s of subsystems) {
      const components = s.components();
      for (const key in components) {
        if (!this._components[key]) {
          this._components[key] = [];
        }
        this._components[key].push(...components[key]);
      }
    }
    for (const key in this._components) {
      this._components[key].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }

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

  public components(key: string): SubsystemComponent[] {
    return this._components[key] ?? [];
  }

  public handleStyleImageMissing(imageId: string, map: Map) {
    this.call((s) => s.handleStyleImageMissing(imageId, map));
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
  loadCondition?: Readable<boolean> | (() => Readable<boolean>);
  order?: number;
}

export type SubsystemComponent =
  | ImmediateSubsystemComponent
  | DeferredSubsystemComponent;

export type SubsystemComponents = { [key: string]: SubsystemComponent[] };
