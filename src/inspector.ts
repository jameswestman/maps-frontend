import type {
  Feature,
  Map,
  MapGeoJSONFeature,
  StyleSpecification,
} from "maplibre-gl";
import { brightColor } from "./thirdparty/maplibre-gl-inspect/colors";
import { writable } from "svelte/store";

export const createInspector = async (map: Map, dark: boolean) => {
  const tileJson = await (
    await fetch("https://tiles.maps.jwestman.net/data/streets_v3.json")
  ).json();

  const fills = [];
  const lines = [];
  const circles = [];
  const symbols = [];

  for (const layer of tileJson.vector_layers) {
    const color = brightColor(layer.id, 1);

    fills.push({
      id: `${layer.id}-inspect-fill`,
      source: "tiles",
      "source-layer": layer.id,
      type: "fill",
      filter: [
        "in",
        ["geometry-type"],
        ["literal", ["Polygon", "MultiPolygon"]],
      ],
      paint: {
        "fill-color": color,
        "fill-opacity": 0.5,
      },
    });
    lines.push({
      id: `${layer.id}-inspect-line`,
      source: "tiles",
      "source-layer": layer.id,
      type: "line",
      filter: [
        "in",
        ["geometry-type"],
        ["literal", ["LineString", "MultiLineString"]],
      ],
      paint: {
        "line-color": color,
        "line-opacity": 0.5,
      },
    });
    circles.push({
      id: `${layer.id}-inspect-circle`,
      source: "tiles",
      "source-layer": layer.id,
      type: "circle",
      filter: ["in", ["geometry-type"], ["literal", ["Point", "MultiPoint"]]],
      paint: {
        "circle-radius": 2,
        "circle-color": color,
      },
    });
    symbols.push({
      id: `${layer.id}-inspect-symbol-line`,
      source: "tiles",
      "source-layer": layer.id,
      type: "symbol",
      filter: [
        "all",
        ["has", "name"],
        [
          "in",
          ["geometry-type"],
          ["literal", ["LineString", "MultiLineString"]],
        ],
      ],
      layout: {
        "text-field": ["get", "name"],
        "text-size": 8,
        "symbol-placement": "line",
      },
      paint: {
        "text-color": dark ? "#fff" : "#000",
        "text-halo-color": color,
        "text-halo-width": 0.5,
      },
    });
    symbols.push({
      id: `${layer.id}-inspect-symbol-point`,
      source: "tiles",
      "source-layer": layer.id,
      type: "symbol",
      filter: [
        "all",
        ["has", "name"],
        [
          "!",
          [
            "in",
            ["geometry-type"],
            ["literal", ["LineString", "MultiLineString"]],
          ],
        ],
      ],
      layout: {
        "text-field": ["get", "name"],
        "text-size": 8,
      },
      paint: {
        "text-color": dark ? "#fff" : "#000",
        "text-halo-color": color,
        "text-halo-width": 0.5,
      },
    });
  }

  map.setStyle(
    {
      version: 8,
      sources: {
        tiles: {
          type: "vector",
          tiles: [
            "https://tiles.maps.jwestman.net/data/streets_v3/{z}/{x}/{y}.pbf",
          ],
          minzoom: 0,
          maxzoom: 14,
        },
      },
      glyphs: "https://tiles.maps.jwestman.net/fonts/{fontstack}/{range}.pbf",
      metadata: {
        inspector: true,
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": dark ? "#111" : "#eee",
          },
        },
        ...fills,
        ...lines,
        ...circles,
        ...symbols,
      ],
    },
    { diff: false }
  );
};

export interface InspectionState {
  features: MapGeoJSONFeature[];
  clicked: boolean;
  coords?: [number, number];
}

export const inspectedFeatures = writable<InspectionState>({
  features: [],
  clicked: false,
});
