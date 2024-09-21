import { getContext, type ComponentType } from "svelte";
import { readonly, writable } from "svelte/store";
import type { Location, Place } from "./Place";
import { type MapTool } from "./MapTool";

export class AppState {
  public static fromContext(): AppState {
    return getContext<AppState>("appState");
  }

  public constructor() {}

  public readonly zoom = writable(0);
  public readonly center = writable<Location>({ lat: 0, lon: 0 });

  public readonly selectedFeature = writable<Place | null>(null);
  public readonly placeCardClosed = writable(true);

  public readonly activeSidebarTab = writable<
    ComponentType | Promise<ComponentType> | null
  >(null);

  public readonly attributionOpen = writable(false);
  public readonly appMenuOpen = writable(false);

  public readonly _$mapTool = writable<MapTool>(null);
  public readonly mapTool = readonly(this._$mapTool);

  public setMapTool(tool: MapTool) {
    this._$mapTool.set(tool);
  }
}
