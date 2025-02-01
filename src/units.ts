import { persisted } from "svelte-local-storage-store";

export type Unit = "metric" | "imperial";

export const unitSetting = persisted<Unit>("units", "metric");
