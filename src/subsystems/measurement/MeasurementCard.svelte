<script lang="ts">
  import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { AppState } from "../../AppState";
  import { Subsystems } from "../Subsystem";
  import { MeasurementSubsystem } from "./MeasurementSubsystem";
  import { onMount } from "svelte";
  import type { MapTool } from "../../MapTool";
  import { Place } from "../../Place";
  import { registerEventListeners } from "../../utils/eventListeners";
  import type { MapMouseEvent } from "maplibre-gl";
  import * as turf from "@turf/turf";
  import { unitSetting } from "../../units";
  import { derived } from "svelte/store";

  const appState = AppState.fromContext();
  const subsystem = Subsystems.fromContext().get(MeasurementSubsystem);

  interface Segment {
    start: Place;
    end: Place;
    distance: number;
  }

  var places: Place[] = [];
  var segments: Segment[] = [];

  onMount(() => {
    let toolCleanup: (() => void) | null = null;

    var tool: MapTool = {
      getCursor: () => "crosshair",

      start: (map) => {
        toolCleanup = registerEventListeners(map, {
          mousemove: (event: MapMouseEvent) => {
            const newPlace = new Place({
              location: {
                lat: event.lngLat.lat,
                lon: event.lngLat.lng,
              },
            });

            if (places.length > 0) {
              places[places.length - 1] = newPlace;
            } else {
              places.push(newPlace);
            }

            updateSource();
          },
        });
      },

      stop: () => {
        if (toolCleanup) {
          toolCleanup();
          toolCleanup = null;
        }
      },

      onClick: (event, place) => {
        if (place) {
          places.push(place);
        } else {
          const place = new Place({
            location: {
              lat: event.lngLat.lat,
              lon: event.lngLat.lng,
            },
          });
          places.push(place);
        }

        updateSource();
      },
    };

    appState.setMapTool(tool);

    return teardown;
  });

  const updateSource = () => {
    const newSegments: Segment[] = [];
    for (let i = 0; i < places.length - 1; i++) {
      const start = places[i];
      const end = places[i + 1];

      newSegments.push({
        start,
        end,
        distance: turf.length(
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [start.location.lon, start.location.lat],
                [end.location.lon, end.location.lat],
              ],
            },
            properties: {},
          },
          { units: "meters" }
        ),
      });
    }

    segments = newSegments;
    subsystem.features = {
      type: "FeatureCollection",
      features: segments.map((segment, i) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [segment.start.location.lon, segment.start.location.lat],
            [segment.end.location.lon, segment.end.location.lat],
          ],
        },
        properties: {
          mouse: i === newSegments.length - 1,
        },
      })),
    };
  };

  const teardown = () => {
    appState.setMapTool(null);
    subsystem.features = {
      type: "FeatureCollection",
      features: [],
    };
  };

  const closeSidebar = () => {
    appState.activeSidebarTab.set(null);
    teardown();
  };

  const formatDistance = derived(unitSetting, (unit) => {
    switch (unit) {
      case "imperial":
        return (distance: number) => {
          const feet = turf.convertLength(distance, "meters", "feet");
          if (feet > 5280) {
            const miles = feet / 5280;
            if (miles > 100) {
              return Math.round(miles).toLocaleString() + " mi";
            } else {
              return (Math.round(miles * 100) / 100).toLocaleString() + " mi";
            }
          } else {
            return Math.round(feet).toLocaleString() + " ft";
          }
        };
      case "metric":
        return (distance: number) => {
          if (distance > 1000) {
            return (distance / 1000).toFixed(2).toLocaleString() + " km";
          } else {
            return Math.round(distance).toLocaleString() + " m";
          }
        };
    }
  });
</script>

<div class="card">
  <div class="py-1 d-flex align-items-center justify-content-between">
    <span class="d-flex align-items-center">
      <button class="btn" type="button" on:click={closeSidebar}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <h5 class="m-0">Measurement</h5>
    </span>
  </div>

  <div class="list-group list-group-flush">
    {#if segments.length > 0}
      {#each segments as segment, i}
        <div class="list-group-item d-flex align-items-center">
          <div class="d-flex justify-content-between flex-grow-1">
            <span>{i + 1}</span>
            <span class="tnum">{$formatDistance(segment.distance)}</span>
          </div>

          <div class="ms-3">
            <button
              class="btn btn-link"
              style="padding: 0; color: var(--bs-body-color);"
              title="Remove"
              on:click={() => {
                places.splice(i + 1, 1);
                updateSource();
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      {/each}

      {#if segments.length > 1}
        <div class="list-group-item d-flex align-items-center">
          <div class="d-flex justify-content-between flex-grow-1 fw-bold">
            <span>Total</span>
            <span class="tnum">{$formatDistance(segments.reduce((acc, s) => acc + s.distance, 0))}</span>
          </div>
        </div>
      {/if}
    {:else}
      <div class="list-group-item">Click on the map to add points</div>
    {/if}
  </div>
</div>
