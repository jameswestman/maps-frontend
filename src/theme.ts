import { useColorMode } from "@sveltestrap/sveltestrap";
import { persisted } from "svelte-local-storage-store";
import { derived } from "svelte/store";

export enum ThemeVariant {
  SYSTEM,
  LIGHT,
  DARK,
}

export interface Theme {
  variant: ThemeVariant;
  inspector: boolean;
}

export const theme = persisted("theme2", {
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

resolvedTheme.subscribe((theme) => {
  useColorMode(theme);
});
