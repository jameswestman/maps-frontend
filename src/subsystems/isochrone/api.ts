export type Costing =
  | "auto"
  | "bicycle"
  | "bus"
  | "bikeshare"
  | "truck"
  | "hov"
  | "taxi"
  | "motor_scooter"
  | "motorcycle"
  | "multimodal"
  | "pedestrian";

export interface InputLocation {
  lat: number;
  lon: number;
}

export interface InputContour {
  time?: number;
  distance?: number;
  color?: string;
}

export interface Input {
  locations: InputLocation[];
  contours: InputContour[];
  costing: Costing;
}

export const fetchIsochrone = async (
  input: Input,
  abort?: AbortSignal
): Promise<any> => {
  const response = await fetch(
    "https://routing.maps.jwestman.net/isochrone?json=" +
      encodeURIComponent(JSON.stringify(input)),
    {
      signal: abort,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch isochrone");
  }

  if (abort?.aborted) {
    throw new Error("Aborted");
  }

  return await response.json();
};
