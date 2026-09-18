import { latLonToWorld, terrainY } from "./world";

/** Open coast — no rainforest canopy. Pins stay on the real shoreline. */
const ZONES: { lat: number; lon: number; r: number }[] = [
  { lat: 19.1358, lon: -155.5044, r: 2.4 }, // Punaluʻu black sand
  { lat: 18.9108, lon: -155.6813, r: 8.5 }, // Ka Lae
  { lat: 18.9364, lon: -155.6464, r: 2.2 }, // Papakōlea
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

/**
 * First land pixel walking north. Requires inland height ≥ this sample
 * so ocean shelf does not count as the cape.
 */
export function kaLaeShoreLat(lon: number) {
  const key = Math.round(lon * 2500);
  const hit = shoreCache.get(key);
  if (hit !== undefined) return hit;
  let lat = 18.9;
  for (let n = 0; n < 140; n++) {
    const a = latLonToWorld(lat, lon);
    const b = latLonToWorld(lat + 0.005, lon);
    const y = terrainY(a.x, a.z);
    const yn = terrainY(b.x, b.z);
    if (y > 0.07 && yn >= y - 0.01) {
      shoreCache.set(key, lat);
      return lat;
    }
    lat += 0.0004;
  }
  shoreCache.set(key, 18.926);
  return 18.926;
}

/**
 * Keep the heightmap cape. Only drop thin beaches so the existing land
 * becomes a cliff all the way around to Papakōlea — no raft in the sea.
 */
export function kauCliffY(lat: number, lon: number, y0: number) {
  if (lon < -155.75 || lon > -155.61 || lat > 19.03 || lat < 18.88) return y0;
  const { x, z } = latLonToWorld(lat, lon);
  const south = terrainY(x, z + 2.2);
  const north = terrainY(x, z - 2.2);
  if (y0 < 0.045 && north < 0.1) return y0;
  if (y0 < 0.32 && south < 0.07 && north > 0.16) return -0.12;
  return y0;
}

export function snapToLand(lat: number, lon: number) {
  let la = lat;
  for (let i = 0; i < 60; i++) {
    const { x, z } = latLonToWorld(la, lon);
    const y = terrainY(x, z);
    if (y > 0.12) return { lat: la, lon, x, z, y };
    la += 0.0006;
  }
  const { x, z } = latLonToWorld(lat, lon);
  return { lat, lon, x, z, y: terrainY(x, z) };
}