import type { FeatureIdentifier } from "maplibre-gl";
import { getLangCode } from "./utils";

export interface Location {
  lat: number;
  lon: number;
}

export class Place {
  public readonly originalName?: string;
  public readonly location: Location;
  public readonly tags: { [key: string]: string };
  public readonly featureId?: FeatureIdentifier;

  constructor({
    name,
    location,
    tags,
    featureId,
  }: {
    name?: string;
    location: Location;
    tags?: { [key: string]: string };
    featureId?: FeatureIdentifier;
  }) {
    this.originalName = name;
    this.location = location;
    this.tags = tags ?? {};
    this.featureId = featureId;
  }

  public get name() {
    return this.originalName ??
      this.tags["name:" + getLangCode()] ??
      this.tags["name"] ??
      this.tags["ref"];
  }
}
