import { uniqueId } from "../../utils";

export class MapFile {
  public readonly featureMap = new Map<number, GeoJSON.Feature>();
  public readonly displayFeatures: GeoJSON.Feature[] = [];
  private nextFeatureId = 1;
  public readonly sourceId: string;

  constructor(
    public readonly name: string,
    public readonly geojson: GeoJSON.GeoJSON
  ) {
    this.sourceId = uniqueId("L") + "-custom-map-view";

    /* Replace all the IDs in the GeoJSON with new ones, to make sure
       every feature has a unique ID */
    this.processFeature(this.geojson);
  }

  public addFeature(feature: GeoJSON.Feature) {
    this.ensureFileIsFeatureCollection();
    (this.geojson as GeoJSON.FeatureCollection).features.push(feature);
    this.processFeature(feature);
    return this.nextFeatureId - 1;
  }

  private processFeature(feature: GeoJSON.GeoJSON) {
    switch (feature.type) {
      case "Feature":
        this.featureMap[this.nextFeatureId] = feature;
        this.displayFeatures.push({
          ...feature,
          id: this.nextFeatureId,
        });
        this.nextFeatureId++;
        break;
      case "FeatureCollection":
        for (const f of feature.features) {
          this.processFeature(f);
        }
        break;
      default:
        this.processFeature({
          type: "Feature",
          properties: {},
          geometry: feature,
        });
        break;
    }
  }

  private ensureFileIsFeatureCollection() {
    switch (this.geojson.type) {
      case "Feature":
        return {
          type: "FeatureCollection",
          features: [this.geojson],
        };
      case "FeatureCollection":
        return this.geojson;
      default:
        return {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: this.geojson,
            },
          ],
        };
    }
  }
}
