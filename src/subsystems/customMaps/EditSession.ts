import type { AppState } from "../../AppState";
import type {
  GeoJSONSource,
  GeoJSONSourceDiff,
  Map,
  MapGeoJSONFeature,
} from "maplibre-gl";
import { get, readonly, writable } from "svelte/store";
import type { MapFile } from "./MapFile";
import { uniqueId } from "../../utils";
import type { MapTool } from "../../MapTool";
import { registerEventListeners } from "../../utils/eventListeners";

export class EditSession {
  private appState: AppState;
  private map: Map;
  public readonly mapFile: MapFile;
  private readonly _mode = writable(null);
  public readonly mode = readonly(this._mode);

  private vertexSourceName = uniqueId("L") + "-custom-map-edit";

  private selectedFeature: number | null = null;
  private editingVertex: MapGeoJSONFeature | null = null;

  private drawingLinestring: [number, number][] = null;

  private beforeUnloadHandler: (event: BeforeUnloadEvent) => void;

  private mapTool: MapTool;

  constructor(appState: AppState, mapFile: MapFile) {
    this.appState = appState;
    this.mapFile = mapFile;

    let toolCleanup: (() => void) | null = null;
    let dragPanEnabled = false;
    this.setMode("select");
    this.mapTool = {
      start: (map) => {
        const endDrag = () => {
          if (this.editingVertex !== null) {
            this.editingVertex = null;
            if (dragPanEnabled) {
              map.dragPan.enable();
            }
          }
        };

        toolCleanup = registerEventListeners(map, {
          mousedown: (event) => {
            const originalEvent = event.originalEvent as MouseEvent;
            originalEvent.preventDefault();
            const features = event.target
              .queryRenderedFeatures([
                originalEvent.clientX,
                originalEvent.clientY,
              ])
              .filter((f) => f.layer.id === this.vertexSourceName + "-bg");

            if (features.length > 0) {
              this.editingVertex = features[0];

              dragPanEnabled = map.dragPan.isEnabled();
              map.dragPan.disable();
            }
          },

          mouseup: endDrag,
          mouseout: endDrag,

          dblclick: (event) => {
            if (this.drawingLinestring !== null) {
              const currentMode = get(this.mode);
              if (["linestring", "polygon"].includes(currentMode)) {
                event.preventDefault();

                let geometry: GeoJSON.Geometry;
                if (currentMode === "linestring") {
                  geometry = {
                    type: "LineString",
                    coordinates: this.drawingLinestring,
                  };
                } else {
                  geometry = {
                    type: "Polygon",
                    coordinates: [this.drawingLinestring],
                  };
                }

                this.updateOriginalFeature({
                  add: [
                    {
                      id: this.mapFile.addFeature({
                        type: "Feature",
                        properties: {},
                        geometry,
                      }),
                      type: "Feature",
                      properties: {},
                      geometry,
                    },
                  ],
                });

                this.drawingLinestring = null;
                this.updateDrawingLinestring();
              }
            }
          },

          mousemove: (event) => {
            const originalEvent = event.originalEvent as MouseEvent;
            const lngLat = event.target.unproject([
              originalEvent.clientX,
              originalEvent.clientY,
            ]);

            if (this.drawingLinestring !== null) {
              const currentMode = get(this.mode);
              const features = event.target
                .queryRenderedFeatures(event.point)
                .filter(
                  (f) =>
                    f.geometry.type === "Point" &&
                    (f.layer.metadata?.["libshumate:cursor"] ??
                      f.layer.metadata?.["cursor"])
                );

              const [lon, lat] =
                features.length > 0
                  ? (features[0].geometry as GeoJSON.Point).coordinates
                  : lngLat.toArray();

              /* For polygons, update the second to last point, since
               * the last point loops back to the first */
              const lastPt =
                currentMode === "polygon"
                  ? this.drawingLinestring.length - 2
                  : this.drawingLinestring.length - 1;

              this.drawingLinestring[lastPt] = [lon, lat];
              this.updateDrawingLinestring();
            } else if (this.editingVertex !== null) {
              const vertexSource = map.getSource(
                this.vertexSourceName
              ) as GeoJSONSource;

              const feature = this.mapFile.featureMap[this.selectedFeature];
              const { i, j, k } = this.editingVertex.properties;
              if (typeof k !== "undefined") {
                /* MultiPolygon */
                feature.geometry.coordinates[i][j][k] = lngLat.toArray();

                /* If the first/last vertex of a ring is moved, update the other end */
                const len = feature.geometry.coordinates[i][j].length;
                if (k === 0) {
                  feature.geometry.coordinates[i][j][len - 1] =
                    lngLat.toArray();
                } else if (k === len - 1) {
                  feature.geometry.coordinates[i][j][0] = lngLat.toArray();
                }
              } else if (typeof j !== "undefined") {
                /* Polygon or MultiLineString */
                feature.geometry.coordinates[i][j] = lngLat.toArray();

                if (feature.geometry.type === "Polygon") {
                  const len = feature.geometry.coordinates[i].length;
                  if (j === 0) {
                    feature.geometry.coordinates[i][len - 1] = lngLat.toArray();
                  } else if (j === len - 1) {
                    feature.geometry.coordinates[i][0] = lngLat.toArray();
                  }
                }
              } else if (typeof i !== "undefined") {
                /* LineString or MultiPoint */
                feature.geometry.coordinates[i] = lngLat.toArray();
              } else {
                /* Point */
                feature.geometry.coordinates = lngLat.toArray();
              }

              vertexSource.updateData({
                update: [
                  {
                    id: this.editingVertex.id,
                    newGeometry: {
                      type: "Point",
                      coordinates: lngLat.toArray(),
                    },
                  },
                ],
              });

              this.updateOriginalFeature({
                update: [
                  {
                    id: this.selectedFeature,
                    newGeometry: feature.geometry,
                  },
                ],
              });
            }
          },
        });
      },

      stop: () => {
        toolCleanup!();
      },

      getCursor: (features) => {
        if (get(this.mode) === "select") {
          const filtered = features.filter(
            (f) =>
              f.layer.source === this.mapFile.sourceId ||
              (f.layer.metadata?.["libshumate:cursor"] ??
                f.layer.metadata?.["cursor"])
          );

          if (filtered.length > 0) {
            return "pointer";
          } else {
            return "grab";
          }
        } else {
          const filtered = features.filter(
            (f) =>
              (f.layer.metadata?.["libshumate:cursor"] ??
                f.layer.metadata?.["cursor"]) &&
              f.geometry.type === "Point"
          );

          if (
            filtered.length > 0 &&
            !filtered[0].layer.metadata?.["custom-map"]
          ) {
            return "copy";
          } else {
            return "crosshair";
          }
        }
      },

      onClick: (event, place) => {
        const features = event.target.queryRenderedFeatures(event.point);

        switch (get(this.mode)) {
          case "select":
            const editing = features.filter(
              (f) => f.layer.source === this.mapFile.sourceId
            );

            if (editing.length > 0) {
              this.appState.selectedFeature.set(null);
              this.selectFeature(editing[0].id as number);
            } else {
              this.appState.selectedFeature.set(place);
              this.deselectFeature();
            }
            break;

          case "point":
            let feature: GeoJSON.Feature;
            if (place) {
              feature = {
                type: "Feature",
                properties: {
                  title: place.name,
                },
                geometry: {
                  type: "Point",
                  coordinates: [place.location.lon, place.location.lat],
                },
              };
            } else {
              feature = {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: [event.lngLat.lng, event.lngLat.lat],
                },
              };
            }

            const featureId = this.mapFile.addFeature(feature);
            const originalSource = this.map.getSource(
              this.mapFile.sourceId
            ) as GeoJSONSource;
            originalSource.updateData({
              add: [{ ...feature, id: featureId }],
            });
            break;

          case "linestring":
          case "polygon":
            const pt: [number, number] =
              place !== null
                ? [place.location.lon, place.location.lat]
                : [event.lngLat.lng, event.lngLat.lat];

            if (this.drawingLinestring === null) {
              this.drawingLinestring = [pt];
            } else {
              this.drawingLinestring[this.drawingLinestring.length - 1] = pt;
            }
            this.drawingLinestring.push(pt);
            if (get(this.mode) === "polygon") {
              this.drawingLinestring.push(this.drawingLinestring[0]);
            }
            this.updateDrawingLinestring();

            break;

          default:
            break;
        }
      },
    };
    this.appState.setMapTool(this.mapTool);
  }

  public downloadFile() {
    const json = JSON.stringify(this.mapFile.geojson);
    const blob = new Blob([json], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.mapFile.name;
    a.click();

    this.uninhibitClose();
  }

  public setupMapStyle(map: Map) {
    this.map = map;

    map.addSource(this.vertexSourceName, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    map.addSource(this.vertexSourceName + "-linestring", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    map.addLayer({
      id: this.vertexSourceName + "-bg",
      source: this.vertexSourceName,
      type: "circle",
      paint: {
        "circle-radius": 7,
        "circle-color": "white",
      },
    });

    map.addLayer({
      id: this.vertexSourceName + "-fg",
      source: this.vertexSourceName,
      type: "circle",
      paint: {
        "circle-radius": 5,
        "circle-color": "#00ffff",
      },
    });

    map.addLayer({
      id: this.vertexSourceName + "-linestring",
      source: this.vertexSourceName + "-linestring",
      type: "line",
      paint: {
        "line-color": "#00ffff",
        "line-width": 2,
      },
    });
  }

  public stop() {
    this.deselectFeature();
    this.map.removeLayer(this.vertexSourceName + "-bg");
    this.map.removeLayer(this.vertexSourceName + "-fg");
    this.map.removeSource(this.vertexSourceName);
    this.appState.setMapTool(null);
  }

  public setMode(mode: string) {
    const currentMode = get(this.mode);
    if (currentMode === mode) {
      return;
    }

    switch (currentMode) {
      case null:
        this.appState.setMapTool(this.mapTool);
        break;
      case "select":
        this.deselectFeature();
        break;
      default:
        break;
    }

    this._mode.set(mode);

    switch (mode) {
      case null:
        this.appState.setMapTool(null);
      case "select":
        this.appState.selectedFeature.set(null);
        break;
      default:
        break;
    }
  }

  private selectFeature(id: number) {
    this.setMode("select");

    this.selectedFeature = id;
    const feature = this.mapFile.featureMap[id];
    const vertexFeats = [];
    let vId = 0;
    let i = 0;
    switch (feature.geometry.type) {
      case "Point":
        vertexFeats.push({
          type: "Feature",
          id: vId++,
          geometry: {
            type: "Point",
            coordinates: feature.geometry.coordinates,
          },
        });
        break;
      case "MultiPoint":
      case "LineString":
        for (const coord of feature.geometry.coordinates) {
          vertexFeats.push({
            type: "Feature",
            id: vId++,
            geometry: {
              type: "Point",
              coordinates: coord,
            },
            properties: {
              i,
            },
          });
          i++;
        }
        break;
      case "MultiLineString":
      case "Polygon":
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
          const ring = feature.geometry.coordinates[i];

          for (let j = 0; j < ring.length; j++) {
            /* Skip the last vertex of a Polygon, since it's the same as the first */
            if (j === ring.length - 1 && feature.geometry.type === "Polygon") {
              continue;
            }

            vertexFeats.push({
              type: "Feature",
              id: vId++,
              geometry: {
                type: "Point",
                coordinates: ring[j],
              },
              properties: {
                i,
                j,
              },
            });
          }
        }
        break;
      case "MultiPolygon":
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
          const poly = feature.geometry.coordinates[i];
          for (let j = 0; j < poly.length; j++) {
            const ring = poly[j];
            /* Again the -1 is to skip the last vertex of a ring */
            for (let k = 0; k < ring.length - 1; k++) {
              vertexFeats.push({
                type: "Feature",
                id: vId++,
                geometry: {
                  type: "Point",
                  coordinates: ring[k],
                },
                properties: {
                  i,
                  j,
                  k,
                },
              });
            }
          }
        }
        break;
    }

    const source = this.map.getSource(this.vertexSourceName) as GeoJSONSource;
    source.setData({
      type: "FeatureCollection",
      features: vertexFeats,
    });
  }

  private deselectFeature() {
    this.selectedFeature = null;
    (this.map.getSource(this.vertexSourceName) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: [],
    });
  }

  private updateOriginalFeature(update: GeoJSONSourceDiff) {
    const originalSource = this.map.getSource(
      this.mapFile.sourceId
    ) as GeoJSONSource;
    originalSource.updateData(update);

    this.inhibitClose();
  }

  private updateDrawingLinestring() {
    const source = this.map.getSource(
      this.vertexSourceName + "-linestring"
    ) as GeoJSONSource;

    if (this.drawingLinestring === null || this.drawingLinestring.length < 2) {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
    } else {
      source.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: this.drawingLinestring,
            },
          },
        ],
      });
    }
  }

  private inhibitClose() {
    if (!this.beforeUnloadHandler) {
      this.beforeUnloadHandler = (event) => {
        event.preventDefault();
        return true;
      };
      window.addEventListener("beforeunload", this.beforeUnloadHandler);
    }
  }

  private uninhibitClose() {
    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
  }
}
