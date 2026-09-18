import { latLonToWorld, terrainY } from "./world";

/** Open coast — no rainforest canopy. Pins stay on the real shoreline. */
const ZONES: { lat: number; lon: number; r: number }[] = [
  { lat: 19.1358, lon: -155.5044, r: 2.4 }, // Punaluʻu black sand
  { lat: 18.9108, lon: -155.6813, r: 8.5 }, // Ka Lae cliffs wrap the cape
  { lat: 18.9364, lon: -155.6464, r: 1.8 }, // Papakōlea
  { lat: 19.9919, lon: -155.8244, r: 1.6 }, // Hāpuna
  { lat: 19.4217, lon: -155.9106, r: 2.2 }, // Puʻuhonua lava flat
];

const pts = ZONES.map((z) => ({ ...latLonToWorld(z.lat, z.lon), r2: z.r * z.r }));

export function inOpenCoast(x: number, z: number) {
  for (const p of pts) {
    const dx = x - p.x;
    const dz = z - p.z;
    if (dx * dx + dz * dz < p.r2) return true;
  }
  return false;
}

const shoreCache = new Map<number, number>();

/** Kaʻu south shore from west of the point through Papakōlea. */
export function onKauSouthCoast(lat: number, lon: number) {
  return lon > -155.745 && lon < -155.618 && lat < 19.02;
}

/** Walk north until the heightmap is real land — not the ocean shelf. */
export function kaLaeShoreLat(lon: number) {
  const key = Math.round(lon * 2500);
  const hit = shoreCache.get(key);
  if (hit !== undefined) return hit;
  let lat = 18.905;
  for (let n = 0; n < 90; n++) {
    const { x, z } = latLonToWorld(lat, lon);
    if (terrainY(x, z) > 0.22) {
      shoreCache.set(key, lat);
      return lat;
    }
    lat += 0.00055;
  }
  shoreCache.set(key, 18.922);
  return 18.922;
}

/** Hold the lip high, then drop to the sea — the island edge IS the cliff. */
export function kauCliffY(lat: number, lon: number, y0: number) {
  if (!onKauSouthCoast(lat, lon)) return y0;
  const shore = kaLaeShoreLat(lon);
  if (lat < shore) return -0.55;
  const inland = latLonToWorld(shore + 0.0035, lon);
  const lip = Math.max(0.55, terrainY(inland.x, inland.z));
  const t = Math.min(1, Math.max(0, (lat - shore) / 0.01));
  if (t < 0.14) return lip;
  return lip * (1 - t) + y0 * t;
}