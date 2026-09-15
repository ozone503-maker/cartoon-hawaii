/** Real-world extrema of Hawaiʻi Island (Upolu, Ka Lae, Keahole, Kumukahi). */
export const GEO = {
  latMin: 18.9108,
  latMax: 20.268,
  lonMin: -156.0614,
  lonMax: -154.806,
} as const;

/** Pixel size of public/maps/hawaii-cartoon.jpg (and hawaii-usgs.jpg). */
export const MAP_SIZE = { w: 1118, h: 1280 } as const;

/**
 * Axis-aligned island bounds inside the NASA Landsat frame (px).
 * Same pixels as the raw satellite — color grade does not move land.
 */
export const ISLAND_PX = {
  x: 36,
  y: 36,
  w: 1046,
  h: 1208,
} as const;

export type Point = { x: number; y: number };
export type LatLon = { lat: number; lon: number };

export function project(lat: number, lon: number): Point {
  const nx = (lon - GEO.lonMin) / (GEO.lonMax - GEO.lonMin);
  const ny = (GEO.latMax - lat) / (GEO.latMax - GEO.latMin);
  return {
    x: ISLAND_PX.x + nx * ISLAND_PX.w,
    y: ISLAND_PX.y + ny * ISLAND_PX.h,
  };
}

export function unproject(x: number, y: number): LatLon {
  const nx = (x - ISLAND_PX.x) / ISLAND_PX.w;
  const ny = (y - ISLAND_PX.y) / ISLAND_PX.h;
  return {
    lon: GEO.lonMin + nx * (GEO.lonMax - GEO.lonMin),
    lat: GEO.latMax - ny * (GEO.latMax - GEO.latMin),
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

export type GridLine = {
  kind: "lat" | "lon";
  value: number;
  major: boolean;
  a: Point;
  b: Point;
};

export function gridLines(): GridLine[] {
  const lines: GridLine[] = [];
  for (let lat = 19.0; lat <= 20.2 + 1e-9; lat += 0.2) {
    const v = Math.round(lat * 10) / 10;
    const major = Math.abs(v * 2 - Math.round(v * 2)) < 1e-6;
    lines.push({
      kind: "lat",
      value: v,
      major,
      a: project(v, GEO.lonMin),
      b: project(v, GEO.lonMax),
    });
  }
  for (let lon = -156.0; lon <= -154.8 + 1e-9; lon += 0.2) {
    const v = Math.round(lon * 10) / 10;
    const major = Math.abs(v * 2 - Math.round(v * 2)) < 1e-6;
    lines.push({
      kind: "lon",
      value: v,
      major,
      a: project(GEO.latMin, v),
      b: project(GEO.latMax, v),
    });
  }
  return lines;
}

export function formatLatLon(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}  ${Math.abs(lon).toFixed(3)}°${ew}`;
}
