import { GEO, ISLAND_PX, MAP_SIZE, project } from "./geo";
import { HOME_ID, PLACES, type Place } from "./places";

export type NavWaypoint = {
  id: string;
  name: string;
  also?: string;
  lat: number;
  lon: number;
  elevFt: number;
  kind: Place["kind"];
  region: Place["region"];
  icao?: string;
  mapX: number;
  mapY: number;
};

export function toWaypoint(place: Place): NavWaypoint {
  const { x, y } = project(place.lat, place.lon);
  return {
    id: place.id,
    name: place.name,
    also: place.also,
    lat: place.lat,
    lon: place.lon,
    elevFt: place.elevFt ?? 0,
    kind: place.kind,
    region: place.region,
    icao: place.icao,
    mapX: Math.round(x * 10) / 10,
    mapY: Math.round(y * 10) / 10,
  };
}

export function navManifest() {
  const waypoints = PLACES.map(toWaypoint);
  return {
    version: 1,
    owner: "grok-map" as const,
    homeId: HOME_ID,
    geo: GEO,
    mapSize: MAP_SIZE,
    islandPx: ISLAND_PX,
    waypoints,
    airports: waypoints.filter((w) => w.kind === "airport"),
    home: waypoints.find((w) => w.id === HOME_ID) ?? null,
  };
}

export type HawaiiMapBridge = {
  version: number;
  owner: "grok-map";
  homeId: string;
  geo: typeof GEO;
  mapSize: typeof MAP_SIZE;
  islandPx: typeof ISLAND_PX;
  waypoints: NavWaypoint[];
  airports: NavWaypoint[];
  home: NavWaypoint | null;
  project: typeof project;
  flyTo: (id: string) => void;
  fit: () => void;
};

declare global {
  interface Window {
    __hawaiiMap?: HawaiiMapBridge;
  }
}
