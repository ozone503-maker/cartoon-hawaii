import { latLonToWorld, terrainY, worldToLatLon } from "./world";

const CAL = latLonToWorld(19.4069, -155.2834);
const PIT = latLonToWorld(19.405, -155.291);
const IKI = latLonToWorld(19.4165, -155.242);

/** ~4 × 3 km caldera. Inner pit is Halemaʻumaʻu, west of center. */
export const KILAUEA_RX = 3.1;
export const KILAUEA_RZ = 2.2;
export const PIT_R = 1.15;
export const IKI_RX = 1.35;
export const IKI_RZ = 0.95;

export function inKilaueaCaldera(x: number, z: number) {
  const dx = (x - CAL.x) / KILAUEA_RX;
  const dz = (z - CAL.z) / KILAUEA_RZ;
  return dx * dx + dz * dz < 1.08;
}

export function inKilaueaIki(x: number, z: number) {
  const dx = (x - IKI.x) / IKI_RX;
  const dz = (z - IKI.z) / IKI_RZ;
  return dx * dx + dz * dz < 1;
}

/** Volcano Village / park-gate rainforest belt (NE of caldera). */
export function inVolcanoVillage(x: number, z: number) {
  const ll = worldToLatLon(x, z);
  return ll.lat > 19.42 && ll.lat < 19.48 && ll.lon > -155.27 && ll.lon < -155.17;
}

/** No trees on the caldera floor or Iki floor. */
export function inKilaueaCinder(x: number, z: number) {
  return inKilaueaCaldera(x, z) || inKilaueaIki(x, z);
}

export function kilaueaBowlY(x: number, z: number, y0: number) {
  let y = y0;
  const dx = (x - CAL.x) / KILAUEA_RX;
  const dz = (z - CAL.z) / KILAUEA_RZ;
  const e = dx * dx + dz * dz;
  if (e < 1.08) {
    const t = Math.min(1, (1.08 - e) / 0.16);
    let drop = t * 0.7;
    const px = (x - PIT.x) / PIT_R;
    const pz = (z - PIT.z) / PIT_R;
    const pe = px * px + pz * pz;
    if (pe < 1) drop += Math.min(1, (1 - pe) / 0.35) * 0.55;
    y = y0 - drop;
  }

  const ix = (x - IKI.x) / IKI_RX;
  const iz = (z - IKI.z) / IKI_RZ;
  const ie = ix * ix + iz * iz;
  if (ie < 1.05) {
    const t = Math.min(1, (1.05 - ie) / 0.18);
    y = Math.min(y, y0 - t * 0.48);
  }
  return y;
}

export function kilaueaSurfaceY(x: number, z: number) {
  return kilaueaBowlY(x, z, terrainY(x, z));
}

export const KILAUEA_WORLD = CAL;
export const HALEMAUMAU_WORLD = PIT;
export const KILAUEA_IKI_WORLD = IKI;

/** 2018 lower East Rift waypoints (Leilani → Kapoho / Pohoiki). Landsat already black; props reinforce. */
export const EAST_RIFT_2018: [number, number][] = [
  [19.475, -154.92],
  [19.478, -154.905],
  [19.482, -154.89],
  [19.49, -154.87],
  [19.498, -154.85],
  [19.505, -154.835],
  [19.512, -154.82],
];
