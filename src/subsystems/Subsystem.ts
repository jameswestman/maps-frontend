import type { Map } from "maplibre-gl";
import type { Place } from "../Place";
import type { Theme } from "src/theme";

export class Subsystem {
  public onMount() {}

  public onDestroy() {}

  public setupMapStyle(map: Map, theme: Theme) {}

  public placeSelected(place: Place) {}

  public placeDeselected(place: Place) {}
}
