import type { Map } from "maplibre-gl";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import { writable } from "svelte/store";
import DropHandler from "./DropHandler.svelte";
import type { FileLoader } from "./FileLoader";

export const dropActive = writable(false);

export class CustomMapsSubsystem extends Subsystem {
  private map: Map;
  private fileLoader: Promise<FileLoader>;

  public setupMapStyle(map: Map): void {
    this.map = map;

    if (this.fileLoader) {
      this.fileLoader.then((fileLoader) => {
        fileLoader.setupMapStyle(map);
      });
    } else {
      this.map = map;
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
        const loader = new m.FileLoader();
        loader.setupMapStyle(this.map);
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
          condition: dropActive,
          order: 100,
        },
      ],
    };
  }
}
