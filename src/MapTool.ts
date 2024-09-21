import type { Map, MapGeoJSONFeature, MapMouseEvent } from "maplibre-gl";
import type { Place } from "./Place";

export interface MapTool {
  start?(map: Map): void;
  stop?(): void;

  getCursor?(features: MapGeoJSONFeature[]): string;

  onClick?(event: MapMouseEvent, place: Place): void;
}

