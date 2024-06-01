import type { LayerSpecification, Map } from "maplibre-gl";
import { readonly, writable } from "svelte/store";

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

export const taskQueue = <T>(): [
  SvelteStore<T>,
  (f: T | ((abort: AbortController) => Promise<T>)) => void
] => {
  const store = writable<T>();
  let prevAbort: AbortController;

  const queue = (f: T | ((abort: AbortController) => Promise<T>)) => {
    prevAbort?.abort();
    const abort = (prevAbort = new AbortController());
    if (typeof f === "function") {
      (f as (abort: AbortController) => Promise<T>)(abort).then((val) => {
        if (!abort.signal.aborted) {
          store.set(val);
        }
      });
    } else {
      store.set(f);
    }
  };

  return [readonly(store), queue];
};
