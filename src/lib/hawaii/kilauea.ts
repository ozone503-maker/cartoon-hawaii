import { latLonToWorld, terrainY } from "./world";

const CAL = latLonToWorld(19.4069, -155.2834);
const PIT = latLonToWorld(19.4035, -155.291);

/** Oval caldera in world units (~4 km). */
const RX = 3.55;
const RZ = 2.55;
const PR = 1.05;

export function inKilaueaCaldera(x: number, z: number) {
  const dx = (x - CAL.x) / RX;
  const dz = (z - CAL.z) / RZ;
  return dx * dx + dz * dz < 1.12;
}

/** Depress the shield into Halemaʻumaʻu — the mountain is the crater. */
export function kilaueaBowlY(x: number, z: number, y0: number) {
  const dx = (x - CAL.x) / RX;
  const dz = (z - CAL.z) / RZ;
  const e = dx * dx + dz * dz;
  if (e >= 1.12) return y0;
  const inner = Math.max(0, 1 - e);
  let drop = inner * inner * 1.15;
  const px = (x - PIT.x) / PR;
  const pz = (z - PIT.z) / PR;
  const pe = px * px + pz * pz;
  if (pe < 1) drop += (1 - pe) * (1 - pe) * 0.55;
  return y0 - drop;
}

export function kilaueaSurfaceY(x: number, z: number) {
  return kilaueaBowlY(x, z, terrainY(x, z));
}

export const KILAUEA_WORLD = CAL;
export const HALEMAUMAU_WORLD = PIT;