import { hu, latLonToWorld, terrainY, worldToLatLon, wu } from "./world";

const CAL = latLonToWorld(19.4069, -155.2834);
const PIT = latLonToWorld(19.405, -155.291);

/** ~4 × 3 km caldera. Inner pit is Halemaʻumaʻu, west of center. Authored at WORLD 240. */
export const KILAUEA_RX = wu(3.1);
export const KILAUEA_RZ = wu(2.2);
export const PIT_R = wu(1.15);

export function inKilaueaCaldera(x: number, z: number) {
  const dx = (x - CAL.x) / KILAUEA_RX;
  const dz = (z - CAL.z) / KILAUEA_RZ;
  return dx * dx + dz * dz < 1.08;
}

export function inVolcanoVillage(x: number, z: number) {
  const ll = worldToLatLon(x, z);
  return ll.lat > 19.42 && ll.lat < 19.48 && ll.lon > -155.27 && ll.lon < -155.17;
}

/** No trees on the caldera floor. Desert and NP forest can grow. */
export function inKilaueaCinder(x: number, z: number) {
  return inKilaueaCaldera(x, z);
}

export function kilaueaBowlY(x: number, z: number, y0: number) {
  const dx = (x - CAL.x) / KILAUEA_RX;
  const dz = (z - CAL.z) / KILAUEA_RZ;
  const e = dx * dx + dz * dz;
  if (e >= 1.08) return y0;
  const t = Math.min(1, (1.08 - e) / 0.16);
  let drop = t * hu(0.7);
  const px = (x - PIT.x) / PIT_R;
  const pz = (z - PIT.z) / PIT_R;
  const pe = px * px + pz * pz;
  if (pe < 1) drop += Math.min(1, (1 - pe) / 0.35) * hu(0.55);
  return y0 - drop;
}

export function kilaueaSurfaceY(x: number, z: number) {
  return kilaueaBowlY(x, z, terrainY(x, z));
}

export const KILAUEA_WORLD = CAL;
export const HALEMAUMAU_WORLD = PIT;
