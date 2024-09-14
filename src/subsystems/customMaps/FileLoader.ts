import {
  LngLatBounds,
  type LngLatBoundsLike,
  type LngLatLike,
  type Map,
} from "maplibre-gl";
import { addStyle, handleStyleImageMissing } from "./style";

export class FileLoader {
  private map: Map = null;
  private nextFileId = 0;
  private files: MapFile[] = [];

  public setupMapStyle(map: Map): void {
    this.map = map;

    for (const file of this.files) {
      this.addFileToMap(file);
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

  public handleStyleImageMissing(imageId: string, map: Map): void {
    handleStyleImageMissing(imageId, map);
  }

  private addMapFile(name: string, geojson: GeoJSON.GeoJSON) {
    const mapFile = {
      id: this.nextFileId++,
      name,
      geojson,
    };
    this.files.push(mapFile);
    this.addFileToMap(mapFile);
  }

  private addFileToMap(mapFile: MapFile) {
    if (this.map === null) {
      return;
    }

    const sourceId = `custom-map-${mapFile.id}`;

    if (typeof this.map.getSource(sourceId) !== "undefined") {
      return;
    }

    this.map.addSource(sourceId, {
      type: "geojson",
      data: mapFile.geojson,
    });

    this.map.addSource(sourceId + "-selected", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    addStyle(sourceId, this.map, mapFile.name);
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

interface MapFile {
  id: number;
  name: string;
  geojson: GeoJSON.GeoJSON;
}
