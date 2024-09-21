import type { FeatureIdentifier } from "maplibre-gl";
import { getLangCode } from "./utils";

export interface Location {
  lat: number;
  lon: number;
}

export interface PlaceOrigin {
  type: "osm" | "custom-map";
  name?: string;
}

export class Place {
  public readonly originalName?: string;
  public readonly location: Location;
  public readonly tags: { [key: string]: string };
  public readonly featureId?: FeatureIdentifier;
  public readonly geometryType?: GeoJSON.GeoJsonGeometryTypes;
  public readonly origin?: PlaceOrigin;
  public readonly showMarker: boolean;

  constructor({
    name,
    location,
    tags,
    featureId,
    origin,
    geometryType,
    showMarker,
  }: {
    name?: string;
    location: Location;
    tags?: { [key: string]: string };
    featureId?: FeatureIdentifier;
    origin?: PlaceOrigin;
    geometryType?: GeoJSON.GeoJsonGeometryTypes;
    showMarker?: boolean;
  }) {
    this.originalName = name;
    this.location = location;
    this.tags = tags ?? {};
    this.featureId = featureId;
    this.origin = origin;
    this.geometryType = geometryType;
    this.showMarker = showMarker ?? true;
  }

  public get name() {
    return (
      this.originalName ??
      (this.origin?.type === "custom-map" ? this.tags["title"] : undefined) ??
      this.tags["name:" + getLangCode()] ??
      this.tags["name"] ??
      this.tags["ref"]
    );
  }
}
