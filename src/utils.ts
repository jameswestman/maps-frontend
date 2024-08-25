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

export interface TaskQueueStateInitial {
  status: "initial";
}

export interface TaskQueueStateLoading {
  status: "loading";
}

export interface TaskQueueStateSuccess<T> {
  status: "success";
  value: T;
}

export interface TaskQueueStateError {
  status: "error";
  error: Error;
}

export type TaskQueueState<T> =
  | TaskQueueStateInitial
  | TaskQueueStateLoading
  | TaskQueueStateSuccess<T>
  | TaskQueueStateError;

export const taskQueue = <T>(): [
  SvelteStore<TaskQueueState<T>>,
  (f: T | ((abort: AbortController) => Promise<T>)) => void
] => {
  const store = writable<TaskQueueState<T>>({ status: "initial" });
  let prevAbort: AbortController;

  const queue = (f: T | ((abort: AbortController) => Promise<T>)) => {
    prevAbort?.abort();
    const abort = (prevAbort = new AbortController());
    if (typeof f === "function") {
      store.set({ status: "loading" });
      (f as (abort: AbortController) => Promise<T>)(abort)
        .then((val) => {
          if (!abort.signal.aborted) {
            store.set({ value: val, status: "success" });
          }
        })
        .catch((error) => {
          if (!abort.signal.aborted) {
            store.set({ error, status: "error" });
          }
        });
    } else {
      store.set({ value: f, status: "success" });
    }
  };

  return [readonly(store), queue];
};

export const getLocation = async (options?: PositionOptions) => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    // navigator.geolocation.getCurrentPosition(resolve, reject, options);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
};
