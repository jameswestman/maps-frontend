import { readonly, writable } from "svelte/store";
import { EditSession } from "./EditSession";
import type { Map } from "maplibre-gl";
import type { AppState } from "src/AppState";
import type { MapFile } from "./MapFile";

export class FileEditor {
  private map: Map = null;
  private appState: AppState;

  private editSession: EditSession = null;
  private _$editSession = writable(this.editSession);
  public readonly $editSession = readonly(this._$editSession);

  constructor(appState: AppState) {
    this.appState = appState;
  }

  public setupMapStyle(map: Map): void {
    this.map = map;
    if (this.editSession !== null) {
      this.editSession.setupMapStyle(map);
    }
  }

  public editFile(file: MapFile) {
    if (this.editSession !== null) {
      this.editSession.stop();
    }

    if (file !== null) {
      this.editSession = new EditSession(this.appState, file);
      this.editSession.setupMapStyle(this.map);
    } else {
      this.editSession = null;
    }

    this._$editSession.set(this.editSession);
  }
}
