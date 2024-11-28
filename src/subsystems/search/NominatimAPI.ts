import { Place } from "../../Place";

export const doSearch = async (query: string): Promise<Place[]> => {
  const queryString = new URLSearchParams({
    format: "geocodejson",
    q: query,
    namedetails: "1",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${queryString}`
  );

  const data: GeoJSON.FeatureCollection = await response.json();
  return data.features.map((result) => {
    const geometry = result.geometry as GeoJSON.Point;
    const place = new Place({
      name: result.properties.geocoding.name,
      origin: { type: "nominatim" },
      location: {
        lat: geometry.coordinates[1],
        lon: geometry.coordinates[0],
      },
    });

    return place;
  });
};
