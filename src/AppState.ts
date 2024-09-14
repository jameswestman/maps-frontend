import { getContext, type ComponentType } from "svelte";
import { type Writable } from "svelte/store";
import type { Place } from "./Place";

export class AppState {
  public static fromContext(): Writable<AppState> {
    return getContext<Writable<AppState>>("appState");
  }

  public constructor() {}

  public zoom = 0;
  public center = {
    lat: 0,
    lng: 0,
  };

  public selectedFeature: Place | null = null;
  public placeCardClosed = false;
  public placeCardLoading = false;

  public activeSidebarTab: ComponentType | Promise<ComponentType> | null = null;

  public attributionOpen = false;
  public appMenuOpen = false;
}
