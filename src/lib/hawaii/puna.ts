import { latLonToWorld, wu } from "./world";

/** FlashTown lot — CDP centroid / home pin. */
export const FLASHTOWN_LL = { lat: 19.5397, lon: -155.1417 } as const;

/** Mountain View Post Office on Volcano Road (Hwy 11). USGS. */
export const MOUNTAIN_VIEW_PO = { lat: 19.54925, lon: -155.10907 } as const;

/** Gameplay clearing around the cabin so the UFO can land. Position stays locked. */
export const CLEARING_R = wu(2.9);

export function flashtownWorld() {
  return latLonToWorld(FLASHTOWN_LL.lat, FLASHTOWN_LL.lon);
}

export function mountainViewWorld() {
  return latLonToWorld(MOUNTAIN_VIEW_PO.lat, MOUNTAIN_VIEW_PO.lon);
}

export function inFlashTownClearing(x: number, z: number) {
  const p = flashtownWorld();
  const dx = x - p.x;
  const dz = z - p.z;
  return dx * dx + dz * dz < CLEARING_R * CLEARING_R;
}

export function inMountainViewStrip(x: number, z: number) {
  const p = mountainViewWorld();
  const dx = x - p.x;
  const dz = z - p.z;
  return dx * dx + dz * dz < wu(1.6) * wu(1.6);
}

/** Country lane from the lot to Volcano Road. */
export const DRIVEWAY: [number, number][] = [
  [19.5397, -155.1417],
  [19.5428, -155.132],
  [19.5462, -155.1205],
  [19.54925, -155.10907],
];
