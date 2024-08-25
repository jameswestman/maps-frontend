import type { GeoJSONSource, Map } from "maplibre-gl";
import { Subsystem } from "../Subsystem";
import type { Place } from "../../Place";
import { fetchIsochrone } from "./api";
import { ThemeVariant, type Theme } from "../../theme";
import { addMapLayerUnder } from "../../utils";

/** When a place is selected, show walking distances around it. */
export class Isochrone extends Subsystem {
  private geojson: any;
  private abortPrevious?: AbortController;
  private map: Map;

  public setupMapStyle(map: Map, theme: Theme): void {
    this.map = map;

    if (theme.inspector) return;

    map.addSource("isochrone", {
      type: "geojson",
      data: this.geojson ?? {
        type: "FeatureCollection",
        features: [],
      },
    });

    addMapLayerUnder(map, "poi", {
      id: "isochrone-line",
      source: "isochrone",
      type: "line",
      minzoom: 10,
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color":
          theme.variant === ThemeVariant.DARK ? "#00607f" : "#007fff",
        "line-opacity": 0.5,
        "line-width": ["/", 60, ["get", "contour"]],
        "line-dasharray": [2, 2],
      },
    });

    addMapLayerUnder(map, "poi", {
      id: "isochrone-symbol",
      source: "isochrone",
      type: "symbol",
      minzoom: 10,
      layout: {
        "text-field": "{contour} minute walk",
        "symbol-placement": "line",
        "text-overlap": "always",
      },
      paint: {
        "text-color":
          theme.variant === ThemeVariant.DARK ? "#00607f" : "#007fff",
        "text-halo-color":
          theme.variant === ThemeVariant.DARK ? "#000" : "#fff",
        "text-halo-width": 1,
      },
    });
  }

  public placeSelected(place: Place): void {
    if (this.abortPrevious) {
      this.abortPrevious.abort();
    }

    const abort = (this.abortPrevious = new AbortController());

    (async () => {
      const geojson = await fetchIsochrone(
        {
          locations: [place.location],
          contours: [{ time: 5 }, { time: 10 }, { time: 15 }],
          costing: "pedestrian",
        },
        abort.signal
      );

      if (abort.signal.aborted) {
        return;
      }

      this.setGeojson(geojson);
    })();
  }

  public placeDeselected(place: Place): void {
    if (this.abortPrevious) {
      this.abortPrevious.abort();
    }

    this.setGeojson(null);
  }

  private setGeojson(geojson: any) {
    this.geojson = geojson;
    if (this.map) {
      const source: GeoJSONSource = this.map.getSource(
        "isochrone"
      ) as GeoJSONSource;
      if (source) {
        source.setData(
          geojson ?? {
            type: "FeatureCollection",
            features: [],
          }
        );
      }
    }
  }
}
