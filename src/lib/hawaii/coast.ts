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

/** Walk north from the map edge until the heightmap is land. */
export function kaLaeShoreLat(lon: number) {
  const key = Math.round(lon * 2500);
  const hit = shoreCache.get(key);
  if (hit !== undefined) return hit;
  let lat = 18.905;
  for (let n = 0; n < 80; n++) {
    const { x, z } = latLonToWorld(lat, lon);
    if (terrainY(x, z) > 0.1) {
      shoreCache.set(key, lat);
      return lat;
    }
    lat += 0.0006;
  }
  shoreCache.set(key, 18.92);
  return 18.92;
}

export function southOfKaLae(lat: number, lon: number) {
  if (lon < -155.72 || lon > -155.642) return false;
  return lat < kaLaeShoreLat(lon) - 0.00025;
}

/** On-land cape behind the lip — raised so the cliff is the island, not a raft. */
export function onKaLaePlateau(lat: number, lon: number) {
  if (lon < -155.72 || lon > -155.642) return false;
  const shore = kaLaeShoreLat(lon);
  return lat >= shore - 0.00025 && lat < shore + 0.014;
}

export const KA_LAE_CLIFF_H = 1.62;

/** Lip of the cape snapped to the 3D shoreline, west → east. */
export function kaLaeCape(): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const lon = -155.716 + (i / 20) * 0.072;
    out.push([kaLaeShoreLat(lon) + 0.00015, lon]);
  }
  return out;
}