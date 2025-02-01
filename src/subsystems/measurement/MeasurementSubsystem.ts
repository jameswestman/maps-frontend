import { ScaleControl, type Map } from "maplibre-gl";
import type { Theme } from "../../theme";
import { Subsystem } from "../Subsystem";
import { unitSetting } from "../../units";
import { get } from "svelte/store";

export class MeasurementSubsystem extends Subsystem {
  private map: Map;
  private scale: ScaleControl;

  public setupMapStyle(map: Map, theme: Theme): void {
    if (this.scale) {
      this.map.removeControl(this.scale);
    }

    this.map = map;
    this.scale = new ScaleControl({
      maxWidth: 80,
      unit: get(unitSetting),
    });
    map.addControl(this.scale);
    unitSetting.subscribe((unit) => {
      this.scale.setUnit(unit);
    });
  }
}
