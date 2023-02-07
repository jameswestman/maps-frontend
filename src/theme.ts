import { persisted } from "svelte-local-storage-store";
import { derived, writable } from "svelte/store";

export enum Theme {
  SYSTEM,
  LIGHT,
  DARK,
}

export const theme = persisted("theme", Theme.SYSTEM);

export const resolvedTheme = derived(theme, (t) => {
  switch (t) {
    case Theme.SYSTEM:
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    case Theme.DARK:
      return "dark";
    case Theme.LIGHT:
      return "light";
  }
});
