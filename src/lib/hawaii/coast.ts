import { hasAlbedo, latLonToWorld, sampleAlbedo, terrainY } from "./world";

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
 * Heightmap owns the Ka Lae cape cliff (see scripts/fix-kau-height.py).
 * Do NOT dig a lat-band moat (failed approach). Optional mild exaggerate
 * of an existing drop so the lip reads from chase-cam — ocean stays ≥ 0.
 */
export function kauCliffY(lat: number, lon: number, y0: number) {
  if (lon < -155.75 || lon > -155.61 || lat > 19.03 || lat < 18.88) return y0;
  if (y0 <= 0.02) return y0;
  if (y0 > 0.12 && y0 < 0.7) {
    const { x, z } = latLonToWorld(lat, lon);
    const south = terrainY(x, z + 1.6);
    const west = terrainY(x - 1.6, z);
    if (south < y0 * 0.4 || west < y0 * 0.4) return y0 * 1.12;
  }
  return y0;
}

function isDryLand(x: number, z: number) {
  const y = terrainY(x, z);
  if (y < 0.15) return false;
  if (!hasAlbedo()) return y > 0.18;
  const { r, g, b } = sampleAlbedo(x, z);
  // Cyan / blue water albedo — not the jump lip (b > r).
  if (b > r + 8 && g >= r - 10) return false;
  return true;
}

/**
 * Snap jump / beach props onto dry cape land.
 * Jump target sits in ocean west of the Landsat tip — walk north AND east
 * to the nearest dry lip, then ease seaward to the last dry pixel.
 */
export function snapToLand(lat: number, lon: number) {
  let best: { lat: number; lon: number; x: number; z: number; y: number; d: number } | null =
    null;
  for (let i = 0; i < 70; i++) {
    for (let j = 0; j < 45; j++) {
      const la = lat + i * 0.00045;
      const lo = lon + j * 0.00045;
      const { x, z } = latLonToWorld(la, lo);
      if (!isDryLand(x, z)) continue;
      const d = (la - lat) * (la - lat) + (lo - lon) * (lo - lon);
      if (!best || d < best.d) best = { lat: la, lon: lo, x, z, y: terrainY(x, z), d };
    }
    // Also pure-north in case east overshoots
    const laN = lat + i * 0.00045;
    const { x, z } = latLonToWorld(laN, lon);
    if (isDryLand(x, z)) {
      const d = (laN - lat) * (laN - lat);
      if (!best || d < best.d) best = { lat: laN, lon, x, z, y: terrainY(x, z), d };
    }
  }
  if (!best) {
    const { x, z } = latLonToWorld(lat, lon);
    return { lat, lon, x, z, y: terrainY(x, z) };
  }
  // Walk back toward the sea (south / west) to the last dry lip pixel.
  let lipLat = best.lat;
  let lipLon = best.lon;
  for (let i = 0; i < 60; i++) {
    const nextLat = lipLat - 0.00035;
    const { x, z } = latLonToWorld(nextLat, lipLon);
    if (!isDryLand(x, z)) break;
    lipLat = nextLat;
  }
  for (let i = 0; i < 40; i++) {
    const nextLon = lipLon - 0.00035;
    const { x, z } = latLonToWorld(lipLat, nextLon);
    if (!isDryLand(x, z)) break;
    lipLon = nextLon;
  }
  const { x, z } = latLonToWorld(lipLat, lipLon);
  return { lat: lipLat, lon: lipLon, x, z, y: terrainY(x, z) };
}
