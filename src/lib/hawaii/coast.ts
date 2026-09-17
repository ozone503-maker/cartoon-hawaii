import { latLonToWorld } from "./world";

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

/** Rounded southern land edge at Ka Lae (parabola opening north from the point). */
export function kaLaeCapeLat(lon: number) {
  const dlon = lon + 155.6813;
  return 18.9108 + 16 * dlon * dlon;
}

export function southOfKaLae(lat: number, lon: number) {
  if (lon < -155.718 || lon > -155.645) return false;
  return lat < kaLaeCapeLat(lon);
}

/** Lip of the cape, west → east, for the cliff ribbon. */
export function kaLaeCape(): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    const lon = -155.714 + (i / 18) * 0.066;
    pts.push([kaLaeCapeLat(lon) + 0.00035, lon]);
  }
  return pts;
}