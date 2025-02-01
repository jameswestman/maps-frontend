import {
  Map,
  ScaleControl,
  type ControlPosition,
  type IControl,
  type ScaleControlOptions,
  type Unit,
} from "maplibre-gl";
import type { AppState } from "../../AppState";
import MeasurementCard from "./MeasurementCard.svelte";
import { get } from "svelte/store";

export class ClickableScaleControl implements IControl {
  private scale: ScaleControl;
  private wrapper: HTMLElement;
  private appState: AppState;

  constructor(appState: AppState, options?: ScaleControlOptions) {
    this.scale = new ScaleControl(options);
    this.appState = appState;
  }

  onAdd(map: Map): HTMLElement {
    this.wrapper = document.createElement("span");
    const scaleElement = this.scale.onAdd(map);
    this.wrapper.appendChild(scaleElement);

    this.wrapper.style.cursor = "pointer";
    this.wrapper.title = "Click to measure distance";
    this.wrapper.addEventListener("click", () => {
      this.appState.activeSidebarTab.set(
        import("./MeasurementCard.svelte").then((x) => x.default)
      );
    });

    return this.wrapper;
  }

  onRemove(): void {
    this.scale.onRemove();
  }

  getDefaultPosition(): ControlPosition {
    return this.scale.getDefaultPosition();
  }

  setUnit(unit: Unit): void {
    this.scale.setUnit(unit);
  }
}
