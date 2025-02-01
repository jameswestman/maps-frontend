import { GeoJSONSource, type Map } from "maplibre-gl";
import type { Theme } from "../../theme";
import { Subsystem } from "../Subsystem";
import { unitSetting } from "../../units";
import { get } from "svelte/store";
import { ClickableScaleControl } from "./ClickableScaleControl";
import { AppState } from "../../AppState";

export class MeasurementSubsystem extends Subsystem {
  private map: Map;
  private scale: ClickableScaleControl;
  private appState: AppState;

  private _features: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  constructor() {
    super();
    this.appState = AppState.fromContext();
  }

  public get features(): GeoJSON.FeatureCollection {
    return this._features;
  }

  public set features(features: GeoJSON.FeatureCollection) {
    this._features = features;
    if (this.map) {
      (this.map.getSource("measure-source") as GeoJSONSource).setData(features);
    }
  }

  public setupMapStyle(map: Map, theme: Theme): void {
    if (this.scale) {
      this.map.removeControl(this.scale);
    }

    this.map = map;
    this.scale = new ClickableScaleControl(this.appState, {
      unit: get(unitSetting),
    });
    map.addControl(this.scale);
    unitSetting.subscribe((unit) => {
      this.scale.setUnit(unit);
    });

    map.addSource("measure-source", {
      type: "geojson",
      data: this.features,
    });

    map.addLayer({
      id: "measure-line",
      type: "line",
      source: "measure-source",
      filter: ["!", ["get", "mouse"]],
      layout: {},
      paint: {
        "line-color": "orange",
        "line-width": 2,
      },
    });

    map.addLayer({
      id: "measure-line-mouse",
      type: "line",
      source: "measure-source",
      filter: ["get", "mouse"],
      layout: {},
      paint: {
        "line-color": "orange",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    });
  }
}
