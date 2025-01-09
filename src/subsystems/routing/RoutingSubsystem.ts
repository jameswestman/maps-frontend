import { Place } from "../../Place";
import { Subsystem, type SubsystemComponents } from "../Subsystem";
import DirectionsButton from "./DirectionsButton.svelte";
import { type Costing, type RouteResponse, type RouteTrip } from "./api-types";
import { getLocation, taskQueue } from "../../utils";
import { fetchRoute } from "./api";
import { readonly, writable } from "svelte/store";
import type { GeoJSONSource, Map } from "maplibre-gl";
import { ThemeVariant, type Theme } from "../../theme";
import { decode } from "@googlemaps/polyline-codec";
import ReturnToDirections from "./ReturnToDirections.svelte";

export class RoutingSubsystem extends Subsystem {
  private _stops: Place[] = [];
  private stopsStore = writable(this._stops);
  private responseTask = taskQueue<RouteResponse>();

  public route = this.responseTask[0];
  public stops = readonly(this.stopsStore);
  public loading = writable(false);

  private map: Map;
  private lastResponse?: RouteResponse;

  private _costing: Costing = "auto";

  public get costing(): Costing {
    return this._costing;
  }

  public set costing(value: Costing) {
    this._costing = value;
    this.updateRoute();
  }

  public setupMapStyle(map: Map, theme: Theme): void {
    this.map = map;

    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: null,
        properties: {},
      },
    });

    if (this.lastResponse) {
      this.setMapRouteData(this.lastResponse.trip);
    }

    const casingColor =
      theme.variant === ThemeVariant.DARK && !theme.satellite
        ? "#007fff"
        : "#ccccff";

    map.addLayer(
      {
        id: "route-overlay-casing",
        type: "line",
        source: "route",
        paint: {
          "line-color": casingColor,
          "line-width": 9,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
      },
      "ferry-line"
    );
    map.addLayer(
      {
        id: "route-overlay",
        type: "line",
        source: "route",
        paint: {
          "line-color": "blue",
          "line-width": 6,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
      },
      "ferry-line"
    );
    map.addLayer(
      {
        id: "route-overlay-arrows",
        type: "symbol",
        source: "route",
        paint: {
          "icon-color": casingColor,
        },
        layout: {
          "icon-image": "arrow1-right-symbolic",
          "symbol-placement": "line",
          "symbol-spacing": 50,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      },
      "ferry-line"
    );
  }

  private setMapRouteData(trip: RouteTrip): void {
    const source = this.map?.getSource("route") as GeoJSONSource;
    if (!source) return;

    if (trip === null) {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
      return;
    }

    source.setData({
      type: "FeatureCollection",
      features: trip.legs.map((leg) => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: decode(leg.shape, 6).map((coord) => {
            return [coord[1], coord[0]];
          }),
        },
      })),
    });
  }

  public components(): SubsystemComponents {
    return {
      placeCard: [
        {
          component: DirectionsButton,
          order: 0,
        },
      ],
      sidebar: [
        {
          component: ReturnToDirections,
          order: -1,
        },
      ],
    };
  }

  public async getDirections(place: Place) {
    if (!this._stops.length) {
      try {
        this.loading.set(true);
        const location = await getLocation({
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30,
        });
        this._stops = [
          new Place({
            name: "Current Location",
            location: location
              ? {
                  lat: location.coords.latitude,
                  lon: location.coords.longitude,
                }
              : { lat: 0, lon: 0 },
          }),
        ];
      } catch {
        // ignore
      }

      this.loading.set(false);
    }

    this._stops = [...this._stops, place];
    this.stopsStore.set(this._stops);

    this.updateRoute();
  }

  private updateRoute() {
    this.responseTask[1](async (abort) => {
      if (this._stops.length < 2) {
        this.lastResponse = undefined;
        this.setMapRouteData(null);
        return null;
      }

      const response = await fetchRoute(
        {
          locations: this._stops.map((place) => ({
            lon: place.location.lon,
            lat: place.location.lat,
            type: "break",
          })),
          costing: this.costing,
          units: "kilometers",
        },
        abort.signal
      );

      if (!abort.signal.aborted) {
        this.lastResponse = response;
        this.setMapRouteData(response.trip);
      }

      return response;
    });
  }

  public async removeStop(idx: number) {
    this._stops.splice(idx, 1);
    this.stopsStore.set(this._stops);
    this.updateRoute();
  }

  public async reorderStop(from: number, to: number) {
    const [removed] = this._stops.splice(from, 1);
    this._stops.splice(to, 0, removed);
    this.stopsStore.set(this._stops);
    this.updateRoute();
  }
}
