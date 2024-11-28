import { derived, writable } from "svelte/store";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import SearchBar from "./SearchBar.svelte";
import type { Place } from "../../Place";
import type { Map } from "maplibre-gl";
import type { Theme } from "src/theme";

export class SearchSubsystem extends Subsystem {
  public readonly inputFocused = writable(false);
  public readonly query = writable("");
  public readonly results = writable<Promise<Place[]> | null>(null);

  private _map: Map;
  public get map(): Map {
    return this._map;
  }

  public setupMapStyle(map: Map, theme: Theme): void {
    this._map = map;
  }

  public components(): SubsystemComponents {
    return {
      searchBar: [{ component: SearchBar }],
      sidebar: [
        {
          componentImport: () =>
            import("./SearchResults.svelte").then((m) => m.default),
          loadCondition: () =>
            derived(
              [this.query, this.inputFocused],
              ([$query, $focused]) => $focused || $query.length > 0
            ),
          order: -200,
        },
      ],
    };
  }
}
