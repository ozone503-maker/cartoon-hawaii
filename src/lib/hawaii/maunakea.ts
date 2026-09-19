import { latLonToWorld, wu } from "./world";

/** USGS summit (Puʻu Wēkiu). No telescope sits on the true peak. */
export const SUMMIT_LL = { lat: 19.8207, lon: -155.4681 } as const;

/**
 * Maunakea Observatories — IFA aerial survey, 25 Sep 1996
 * https://irtfweb.ifa.hawaii.edu/observing/telescopeCoordinates.php
 * CSO omitted (dismantled). SMA from published array center.
 */
export const TELESCOPES = [
  { id: "keck1", name: "Keck I", lat: 19.825947, lon: -155.474719, kind: "keck" as const },
  { id: "keck2", name: "Keck II", lat: 19.826561, lon: -155.474234, kind: "keck" as const },
  { id: "subaru", name: "Subaru", lat: 19.825504, lon: -155.476019, kind: "subaru" as const },
  { id: "gemini", name: "Gemini North", lat: 19.823801, lon: -155.469047, kind: "gemini" as const },
  { id: "cfht", name: "CFHT", lat: 19.825252, lon: -155.468876, kind: "white" as const, r: wu(0.16) },
  { id: "irtf", name: "NASA IRTF", lat: 19.826218, lon: -155.471999, kind: "white" as const, r: wu(0.13) },
  { id: "ukirt", name: "UKIRT", lat: 19.822431, lon: -155.470327, kind: "ukirt" as const },
  { id: "uh22", name: "UH 2.2 m", lat: 19.822991, lon: -155.469434, kind: "white" as const, r: wu(0.11) },
  { id: "uh06", name: "UH 0.6 m", lat: 19.821614, lon: -155.470963, kind: "white" as const, r: wu(0.08) },
  { id: "jcmt", name: "JCMT", lat: 19.822808, lon: -155.477001, kind: "jcmt" as const },
  { id: "sma", name: "SMA", lat: 19.8244, lon: -155.4777, kind: "sma" as const },
] as const;

/** Last stretch of Mauna Kea Access Road onto the ridge. */
export const ACCESS_ROAD: [number, number][] = [
  [19.7606, -155.456],
  [19.782, -155.468],
  [19.802, -155.478],
  [19.814, -155.48],
  [19.8228, -155.477],
  [19.8259, -155.4747],
  [19.8262, -155.472],
  [19.8253, -155.4689],
];

export const SUMMIT_R = wu(5.2);

export function summitWorld() {
  return latLonToWorld(SUMMIT_LL.lat, SUMMIT_LL.lon);
}

export function inMaunaKeaSummit(x: number, z: number) {
  const p = summitWorld();
  const dx = x - p.x;
  const dz = z - p.z;
  return dx * dx + dz * dz < SUMMIT_R * SUMMIT_R;
}
