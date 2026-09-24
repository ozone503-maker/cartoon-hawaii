import { GROUND_SCALE, hu, latLonToWorld, wu } from "./world";

/** Mokuʻāweoweo — long NE–SW caldera on the shield, not a peak. USGS summit area. */
const ML = latLonToWorld(19.4756, -155.6055);
const ANG = 0.65;
export const MAUNA_LOA_WORLD = ML;
export const MAUNA_LOA_ANG = ANG;

/** Same scale bug as Kīlauea: wu() sizes were for the 960-wide island. */
export const MAUNA_LOA_RX = wu(4.4) * GROUND_SCALE;
export const MAUNA_LOA_RZ = wu(1.7) * GROUND_SCALE;

export function maunaLoaBowlY(x: number, z: number, y0: number) {
  const dx0 = x - ML.x;
  const dz0 = z - ML.z;
  const c = Math.cos(ANG);
  const s = Math.sin(ANG);
  const dx = dx0 * c + dz0 * s;
  const dz = -dx0 * s + dz0 * c;
  const e = (dx * dx) / (MAUNA_LOA_RX * MAUNA_LOA_RX) + (dz * dz) / (MAUNA_LOA_RZ * MAUNA_LOA_RZ);
  if (e >= 1.05) return y0;
  const t = Math.min(1, (1.05 - e) / 0.18);
  return y0 - t * hu(1.35) * GROUND_SCALE;
}
