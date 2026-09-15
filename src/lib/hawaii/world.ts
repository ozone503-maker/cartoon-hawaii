import { GEO, MAP_SIZE, project, unproject, type LatLon } from "./geo";

/** World units for the full Landsat frame (including ocean margin). */
export const WORLD = {
  w: 240,
  d: (240 * MAP_SIZE.h) / MAP_SIZE.w,
} as const;

/** 4205 m (Mauna Kea) maps to this many world units — mild exaggeration so shields read. */
export const HEIGHT_SCALE = 24 / 4205;

export const UFO_LENGTH = 2.2;

export function latLonToWorld(lat: number, lon: number): { x: number; z: number } {
  const p = project(lat, lon);
  return {
    x: (p.x / MAP_SIZE.w) * WORLD.w - WORLD.w / 2,
    z: (p.y / MAP_SIZE.h) * WORLD.d - WORLD.d / 2,
  };
}

export function worldToLatLon(x: number, z: number): LatLon {
  const px = ((x + WORLD.w / 2) / WORLD.w) * MAP_SIZE.w;
  const py = ((z + WORLD.d / 2) / WORLD.d) * MAP_SIZE.h;
  return unproject(px, py);
}

export function headingDeg(yaw: number) {
  let d = ((-yaw * 180) / Math.PI) % 360;
  if (d < 0) d += 360;
  return d;
}

let heightPx: Uint8ClampedArray | null = null;
let hw = 0;
let hh = 0;

let colorPx: Uint8ClampedArray | null = null;
let cw = 0;
let ch = 0;

async function decodePixels(src: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
}

export async function loadHeightmap() {
  if (!heightPx) {
    const h = await decodePixels("/maps/hawaii-height.png?v=kau2");
    heightPx = h.data;
    hw = h.w;
    hh = h.h;
  }
  if (!colorPx) {
    const c = await decodePixels("/maps/hawaii-usgs.jpg");
    colorPx = c.data;
    cw = c.w;
    ch = c.h;
  }
}

function height01(px: number, py: number) {
  if (!heightPx || !hw) return 0;
  const x = Math.max(0, Math.min(hw - 1, px));
  const y = Math.max(0, Math.min(hh - 1, py));
  return heightPx[(y * hw + x) * 4]! / 255;
}

export function terrainY(x: number, z: number): number {
  if (!heightPx || !hw) return 0;
  const u = ((x + WORLD.w / 2) / WORLD.w) * (hw - 1);
  const v = ((z + WORLD.d / 2) / WORLD.d) * (hh - 1);
  const x0 = Math.floor(u);
  const y0 = Math.floor(v);
  const fx = u - x0;
  const fy = v - y0;
  const meters =
    ((height01(x0, y0) * (1 - fx) + height01(x0 + 1, y0) * fx) * (1 - fy) +
      (height01(x0, y0 + 1) * (1 - fx) + height01(x0 + 1, y0 + 1) * fx) * fy) *
    4205;
  return meters * HEIGHT_SCALE;
}

/** Landsat RGB 0–255 at a world point. Ocean / missing → dark blue. */
export function sampleAlbedo(x: number, z: number): { r: number; g: number; b: number } {
  if (!colorPx || !cw) return { r: 14, g: 40, b: 62 };
  const u = ((x + WORLD.w / 2) / WORLD.w) * (cw - 1);
  const v = ((z + WORLD.d / 2) / WORLD.d) * (ch - 1);
  const px = Math.max(0, Math.min(cw - 1, Math.round(u)));
  const py = Math.max(0, Math.min(ch - 1, Math.round(v)));
  const i = (py * cw + px) * 4;
  return { r: colorPx[i]!, g: colorPx[i + 1]!, b: colorPx[i + 2]! };
}

/** True where the Landsat pixel is vegetation on land — no invented forests. */
export function isCanopy(x: number, z: number): boolean {
  const h = terrainY(x, z);
  if (h < 0.22) return false;
  const { r, g, b } = sampleAlbedo(x, z);
  if (g < 48 || r > 210) return false;
  return g > r + 6 && g >= b - 4 && 2 * g - r - b > 10;
}

export { GEO };
