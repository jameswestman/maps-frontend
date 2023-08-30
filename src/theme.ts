import type { Map } from "maplibre-gl";
import { persisted } from "svelte-local-storage-store";
import { derived } from "svelte/store";
import { createInspector } from "./inspector";

export enum ThemeVariant {
  SYSTEM,
  LIGHT,
  DARK,
}

export interface Theme {
  variant: ThemeVariant;
  inspector: boolean;
}

export const theme = persisted("theme", {
  variant: ThemeVariant.SYSTEM,
  inspector: false,
});

export const resolveThemeVariant = (theme: Theme) => {
  switch (theme.variant) {
    case ThemeVariant.SYSTEM:
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    case ThemeVariant.DARK:
      return "dark";
    case ThemeVariant.LIGHT:
      return "light";
  }
};

export const resolvedTheme = derived(theme, (theme) =>
  resolveThemeVariant(theme)
);

export const updateMapStyle = (map: Map, theme: Theme) => {
  if (!map)
    return;

  if (theme.inspector) {
    createInspector(map, resolveThemeVariant(theme) === "dark");
  } else {
    map.setStyle(
      `https://tiles.maps.jwestman.net/styles/${resolveThemeVariant(
        theme
      )}/style.json`
    );
  }
};
