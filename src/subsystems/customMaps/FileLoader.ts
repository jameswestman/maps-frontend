import { LngLatBounds, type LngLatLike, type Map } from "maplibre-gl";
import { addStyle, handleStyleImageMissing, removeStyle } from "./style";
import { derived, get, readonly, writable } from "svelte/store";
import { flatten, lazy } from "../../utils/stores";
import type { AppState } from "../../AppState";
import { MapFile } from "./MapFile";

export class FileLoader {
  private map: Map = null;
  private appState: AppState;

  private nextFileId = 1;
  private files: MapFile[] = [];
  private fileEditor = lazy(() =>
    import("./FileEditor").then((module) => {
      const editor = new module.FileEditor(this.appState);
      editor.setupMapStyle(this.map);
      return editor;
    })
  );

  private _$files = writable(this.files);
  public readonly $files = readonly(this._$files);

  public readonly $editSession = flatten(
    derived(this.fileEditor, (fileEditor) => fileEditor?.$editSession)
  );

  constructor(appState: AppState) {
    this.appState = appState;
  }

  public setupMapStyle(map: Map): void {
    this.map = map;

    for (const file of this.files) {
      this.addFileToMap(file);
    }

    if (this.fileEditor.started()) {
      this.fileEditor.use((fileEditor) => {
        fileEditor.setupMapStyle(map);
      });
    }
  }

  public async loadFiles(files: FileList) {
    let bounds = null;

    for (const file of files) {
      const geojson = JSON.parse(await file.text());

      const fileBounds = geoJsonBounds(geojson);
      if (fileBounds !== null) {
        bounds = fileBounds.extend(bounds);
      }

      this.addMapFile(file.name, geojson);
    }

    if (bounds !== null) {
      this.map?.fitBounds(bounds, { padding: 50 });
    }
  }

  public removeFile(mapFile: MapFile) {
    const index = this.files.indexOf(mapFile);
    if (index === -1) {
      return;
    }

    this.files.splice(index, 1);
    this._$files.set(this.files);

    removeStyle(mapFile.sourceId, this.map);
    this.map.removeSource(mapFile.sourceId);

    this.fileEditor.use((fileEditor) => {
      if (get(fileEditor?.$editSession)?.mapFile === mapFile) {
        fileEditor.editFile(null);
      }
    });
  }

  public toggleEdit(file: MapFile) {
    this.fileEditor.use((fileEditor) => {
      if (get(fileEditor.$editSession)?.mapFile === file) {
        fileEditor.editFile(null);
      } else {
        fileEditor.editFile(file);
      }
    });
  }

  public handleStyleImageMissing(imageId: string, map: Map): void {
    handleStyleImageMissing(imageId, map);
  }

  private addMapFile(name: string, geojson: GeoJSON.GeoJSON) {
    const mapFile = new MapFile(name, geojson);
    this.files.push(mapFile);
    this._$files.set(this.files);
    this.addFileToMap(mapFile);
  }

  private addFileToMap(mapFile: MapFile) {
    if (this.map === null) {
      return;
    }

    if (typeof this.map.getSource(mapFile.sourceId) !== "undefined") {
      return;
    }

    this.map.addSource(mapFile.sourceId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: mapFile.displayFeatures,
      },
    });

    addStyle(this.map, mapFile);
  }
}

const geoJsonBounds = (geojson: GeoJSON.GeoJSON): LngLatBounds | null => {
  let bounds: LngLatBounds = null;
  const extend = (p: LngLatLike) => {
    if (bounds === null) {
      bounds = new LngLatBounds(p, p);
    } else {
      bounds.extend(p);
    }
  };

  switch (geojson.type) {
    case "FeatureCollection":
      for (const feature of geojson.features) {
        if (bounds === null) {
          bounds = geoJsonBounds(feature);
        } else {
          bounds.extend(geoJsonBounds(feature));
        }
      }
      return bounds;
    case "GeometryCollection":
      for (const geometry of geojson.geometries) {
        if (bounds === null) {
          bounds = geoJsonBounds(geometry);
        } else {
          bounds.extend(geoJsonBounds(geometry));
        }
      }
      return bounds;
    case "Feature":
      return geoJsonBounds(geojson.geometry);
    case "Point":
      const p: LngLatLike = [geojson.coordinates[0], geojson.coordinates[1]];
      return new LngLatBounds(p, p);
    case "MultiPoint":
    case "LineString":
      for (const point of geojson.coordinates) {
        extend([point[0], point[1]]);
      }
      return bounds;
    case "MultiLineString":
    case "Polygon":
      for (const line of geojson.coordinates) {
        for (const point of line) {
          extend([point[0], point[1]]);
        }
      }
      return bounds;
    case "MultiPolygon":
      for (const polygon of geojson.coordinates) {
        for (const line of polygon) {
          for (const point of line) {
            extend([point[0], point[1]]);
          }
        }
      }
      return bounds;
    default:
      return null;
  }
};
