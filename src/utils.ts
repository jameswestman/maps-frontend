import type { LayerSpecification, Map } from "maplibre-gl";

export const addMapLayerUnder = (
  map: Map,
  category: string,
  layer: LayerSpecification
) => {
  let beforeId: string | undefined;
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.metadata?.["category"] === category) {
      beforeId = layer.id;
      break;
    }
  }
  map.addLayer(layer, beforeId);
};

export const addMapLayerAbove = (
  map: Map,
  category: string,
  layer: LayerSpecification
) => {
  let prevId;
  let beforeId: string | undefined;
  for (const layer of map.getStyle().layers.toReversed()) {
    if (layer.metadata?.["category"] === category) {
      beforeId = prevId;
      break;
    }
    prevId = layer.id;
  }
  map.addLayer(layer, beforeId);
};

export const getLangCode = () => {
  return navigator.language.split("-")[0];
};
