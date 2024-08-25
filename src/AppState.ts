import { getContext, type ComponentType } from "svelte";
import { writable, type Writable } from "svelte/store";
import type { Place } from "./Place";
import type { SubsystemComponent } from "./subsystems/Subsystem";

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

  public activeSidebarTab: ComponentType | null = null;
}
