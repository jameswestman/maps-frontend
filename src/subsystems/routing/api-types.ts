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

export interface RouteLocation {
  lat: number;
  lon: number;
  type?: "break" | "through" | "via" | "break_through";
  heading?: number;
}

export interface RouteRequest {
  locations: RouteLocation[];
  costing: Costing;
  costing_options?: object;
  units: "miles" | "kilometers";
  language?: string;
}

interface RouteSummary {
  time: number;
  length: number;
  has_toll: boolean;
  has_highway: boolean;
  has_ferry: boolean;
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface RouteLeg {
  shape: string;
  maneuvers: RouteManeuver[];
}

export interface RouteTransitInfo {}

export interface RouteManeuver {
  type: number;
  instruction: string;
  verbal_transition_alert_instruction: string;
  verbal_pre_transition_instruction: string;
  verbal_post_transition_instruction: string;
  street_names: string[];
  begin_street_names: string[];
  time: number;
  length: number;
  begin_shape_index: number;
  end_shape_index: number;
  toll: boolean;
  highway: boolean;
  rough: boolean;
  gate: boolean;
  ferry: boolean;
  sign: {
    exit_number_elements: string[];
    exit_branch_elements: string[];
    exit_toward_elements: string[];
    exit_name_elements: string[];
  };
  roundabout_exit_count: number;
  depart_instruction: string;
  verbal_depart_instruction: string;
  arrive_instruction: string;
  verbal_arrive_instruction: string;
  transit_info: RouteTransitInfo;
  verbal_multi_cue: boolean;
  travel_mode: "drive" | "pedestrian" | "bicycle" | "transit";
  travel_type:
    | "car"
    | "foot"
    | "road"
    | "tram"
    | "metro"
    | "rail"
    | "bus"
    | "ferry"
    | "cable_car"
    | "gondola"
    | "funicular";
  bus_maneuver_type:
    | "NoneAction"
    | "RentBikeAtBikeShare"
    | "ReturnBikeAtBikeShare";
}
export interface RouteTrip {
  status: number;
  status_message: string;
  units: "kilometers" | "miles";
  language: string;
  legs: RouteLeg[];
  locations: RouteLocation[];
  summary: RouteSummary;
}
export interface RouteResponse {
  trip: RouteTrip;
}
export const unitAbbrev = (unit: string) => {
  switch (unit) {
    case "kilometers":
      return "km";
    case "miles":
      return "mi";
    default:
      return unit;
  }
};
