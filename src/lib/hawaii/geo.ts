/** Real-world extrema of Hawaiʻi Island, matched to the painted map blob. */
export const GEO = {
  latMin: 18.9108,
  latMax: 20.268,
  lonMin: -156.0614,
  lonMax: -154.806,
} as const;

/** Pixel size of public/maps/hawaii-cartoon.jpg */
export const MAP_SIZE = { w: 1728, h: 1152 } as const;

/**
 * Axis-aligned island bounds inside the cartoon painting (px).
 * Derived from the painted land mass, inset slightly off the frame edge.
 */
export const ISLAND_PX = {
  x: 328,
  y: 46,
  w: 1216,
  h: 1088,
} as const;

export type Point = { x: number; y: number };

export function project(lat: number, lon: number): Point {
  const nx = (lon - GEO.lonMin) / (GEO.lonMax - GEO.lonMin);
  const ny = (GEO.latMax - lat) / (GEO.latMax - GEO.latMin);
  return {
    x: ISLAND_PX.x + nx * ISLAND_PX.w,
    y: ISLAND_PX.y + ny * ISLAND_PX.h,
  };
}

export function coastlinePath(points: [number, number][]): string {
  if (points.length === 0) return "";
  const cmds: string[] = [];
  points.forEach(([lon, lat], i) => {
    const { x, y } = project(lat, lon);
    cmds.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  });
  cmds.push("Z");
  return cmds.join(" ");
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
