import type { Evented } from "maplibre-gl";

/**
 * Register event listeners on a MapLibre object and return a cleanup function.
 */
export const registerEventListeners = (
  object: Evented,
  handlers: Record<string, (...args: any[]) => void>
): () => void => {
  const cleanup: [string, () => void][] = [];
  for (const [name, listener] of Object.entries(handlers)) {
    const h = (...args: any[]) => listener(...args);
    object.on(name, h);
    cleanup.push([name, h]);
  }
  return () => {
    for (const [name, h] of cleanup) {
      object.off(name, h);
    }
  };
};
