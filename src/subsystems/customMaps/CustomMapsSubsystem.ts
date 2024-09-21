import type { Map } from "maplibre-gl";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import { derived, readonly, writable, type Writable } from "svelte/store";
import DropHandler from "./DropHandler.svelte";
import type { FileLoader } from "./FileLoader";
import { flatten } from "../../utils/stores";
import { AppState } from "../../AppState";

export const dropActive = writable(false);

export class CustomMapsSubsystem extends Subsystem {
  private map: Map;
  private appState: AppState;

  private fileLoader: Promise<FileLoader>;
  private _$fileLoader: Writable<FileLoader> = writable(null);
  public readonly $fileLoader = readonly(this._$fileLoader);

  constructor() {
    super();
    this.appState = AppState.fromContext();
  }

  public setupMapStyle(map: Map): void {
    this.map = map;

    if (this.fileLoader) {
      this.fileLoader.then((fileLoader) => {
        fileLoader.setupMapStyle(map);
      });
    }
  }

  public handleStyleImageMissing(imageId: string, map: Map): void {
    if (this.fileLoader) {
      this.fileLoader.then((fileLoader) => {
        fileLoader.handleStyleImageMissing(imageId, map);
      });
    }
  }

  public dropFiles(files: FileList): void {
    if (!this.fileLoader) {
      this.fileLoader = import("./FileLoader").then((m) => {
        const loader = new m.FileLoader(this.appState);
        loader.setupMapStyle(this.map);
        this._$fileLoader.set(loader);
        return loader;
      });
    }

    this.fileLoader.then((fileLoader) => {
      fileLoader.loadFiles(files);
    });
  }

  public components(): SubsystemComponents {
    return {
      appRoot: [
        {
          component: DropHandler,
        },
        {
          componentImport: () =>
            import("./DropZone.svelte").then((m) => m.default),
          loadCondition: dropActive,
          order: 100,
        },
      ],
      menuSections: [
        {
          componentImport: () =>
            import("./MenuItems.svelte").then((m) => m.default),
        },
      ],
      toolbar: [
        {
          componentImport: () =>
            import("./EditToolbar.svelte").then((m) => m.default),
          loadCondition: derived(
            flatten(
              derived(
                this._$fileLoader,
                ($fileLoader) => $fileLoader?.$editSession
              )
            ),
            ($editingFile) => {
              return !!$editingFile;
            }
          ),
        },
      ],
      sidebar: [
        {
          componentImport: () =>
            import("./SidebarCard.svelte").then((m) => m.default),
          order: -50,
          loadCondition: derived(
            this._$fileLoader,
            ($fileLoader) => $fileLoader !== null
          ),
        },
      ],
    };
  }
}
