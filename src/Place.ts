import type { FeatureIdentifier } from "maplibre-gl";

export class Place {
  public readonly name?: string;
  public readonly location?: [number, number];
  public readonly tags?: { [key: string]: string };
  public readonly featureId?: FeatureIdentifier;

  constructor({
    name,
    location,
    tags,
    featureId,
  }: {
    name?: string;
    location?: [number, number];
    tags?: { [key: string]: string };
    featureId?: FeatureIdentifier;
  }) {
    this.name = name;
    this.location = location;
    this.tags = tags;
    this.featureId = featureId;
  }
}
