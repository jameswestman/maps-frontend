import type { RouteRequest, RouteResponse } from "./api-types";

export const fetchRoute = async (
  request: RouteRequest,
  signal?: AbortSignal
) => {
  const response = await fetch(
    "https://routing.maps.jwestman.net/route?json=" +
      encodeURIComponent(JSON.stringify(request)),
    {
      signal,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch route");
  }

  const data = await response.json();
  return data as RouteResponse;
};
