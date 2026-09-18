import { latLonToWorld, terrainY, worldToLatLon } from "./world";

const CAL = latLonToWorld(19.4069, -155.2834);
const PIT = latLonToWorld(19.4035, -155.291);

/** Oval caldera in world units (~4 km). */
export const KILAUEA_RX = 3.55;
export const KILAUEA_RZ = 2.55;
const PR = 1.05;

export function inKilaueaCaldera(x: number, z: number) {
  const dx = (x - CAL.x) / KILAUEA_RX;
  const dz = (z - CAL.z) / KILAUEA_RZ;
  return dx * dx + dz * dz < 1.12;
}

export function inVolcanoVillage(x: number, z: number) {
  const ll = worldToLatLon(x, z);
  return ll.lat > 19.418 && ll.lat < 19.46 && ll.lon > -155.265 && ll.lon < -155.198;
}

/** Summit desert — black cinder, except the village in the ʻōhiʻa. */
export function inKilaueaCinder(x: number, z: number) {
  if (inVolcanoVillage(x, z)) return false;
  const dx = (x - CAL.x) / (KILAUEA_RX * 2.4);
  const dz = (z - CAL.z) / (KILAUEA_RZ * 2.5);
  return dx * dx + dz * dz < 1;
}

/** Depress the shield into Halemaʻumaʻu — the mountain is the crater. */
export function kilaueaBowlY(x: number, z: number, y0: number) {
  const dx = (x - CAL.x) / KILAUEA_RX;
  const dz = (z - CAL.z) / KILAUEA_RZ;
  const e = dx * dx + dz * dz;
  if (e >= 1.06) return y0;
  const t = Math.min(1, (1.06 - e) / 0.18);
  let drop = t * 1.55;
  const px = (x - PIT.x) / PR;
  const pz = (z - PIT.z) / PR;
  const pe = px * px + pz * pz;
  if (pe < 1) drop += (1 - pe) * 0.4;
  return y0 - drop;
}

export function kilaueaSurfaceY(x: number, z: number) {
  return kilaueaBowlY(x, z, terrainY(x, z));
}

export const KILAUEA_WORLD = CAL;
export const HALEMAUMAU_WORLD = PIT;