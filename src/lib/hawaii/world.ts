import { GEO, MAP_SIZE, project, unproject, type LatLon } from "./geo";

/**
 * Authoring reference width (pre–Jessie enlarge). Absolute world-unit props
 * authored at this scale multiply by WORLD_SCALE.
 */
export const WORLD_BASE_W = 240;

/**
 * Full Landsat frame width in world units.
 * 960 = 4× WORLD_BASE_W so Mauna Kea ↔ Mauna Loa spacing reads as a real island
 * (craft-slowdown alone was insufficient — volcanoes still felt stacked).
 */
export const WORLD = {
  w: 960,
  d: (960 * MAP_SIZE.h) / MAP_SIZE.w,
} as const;

/** Linear scale from WORLD_BASE_W → WORLD.w (horizontal / craft / prop sizes). */
export const WORLD_SCALE = WORLD.w / WORLD_BASE_W; // 4

/**
 * Vertical exaggeration multiplier vs the old 24/4205 authoring.
 * Slightly under ×4 so peaks keep relative height to width without eating the sky.
 */
export const HEIGHT_MULT = 3.75;

/** 4205 m (Mauna Kea) → world units. Old was 24/4205; now × HEIGHT_MULT. */
export const HEIGHT_SCALE = (24 * HEIGHT_MULT) / 4205;

/** Craft length — scales with WORLD so relative size stays similar. */
export const UFO_LENGTH = 2.2 * WORLD_SCALE;

/** Scale a value authored at WORLD_BASE_W (240) into current world units. */
export function wu(n: number) {
  return n * WORLD_SCALE;
}

/** Scale a vertical value authored against old HEIGHT_SCALE (24/4205). */
export function hu(n: number) {
  return n * HEIGHT_MULT;
}

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
  await new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(`timeout ${src}`)), 12000);
    img.onload = () => {
      window.clearTimeout(t);
      resolve();
    };
    img.onerror = () => {
      window.clearTimeout(t);
      reject(new Error(src));
    };
    img.src = src;
  });
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
}

export async function loadHeightmap() {
  if (!heightPx) {
    const h = await decodePixels("/maps/hawaii-height.png?v=kau7");
    heightPx = h.data;
    hw = h.w;
    hh = h.h;
  }
}

export async function loadAlbedo() {
  if (colorPx) return;
  try {
    const c = await decodePixels("/maps/hawaii-usgs.jpg");
    colorPx = c.data;
    cw = c.w;
    ch = c.h;
  } catch {
    /* forest uses a height-only fallback */
  }
}

function height01(px: number, py: number) {
  if (!heightPx || !hw) return 0;
  const x = Math.max(0, Math.min(hw - 1, px));
  const y = Math.max(0, Math.min(hh - 1, py));
  return heightPx[(y * hw + x) * 4]! / 255;
}

/** Heightmap elevation in metres (0–4205). */
export function terrainMeters(x: number, z: number): number {
  if (!heightPx || !hw) return 0;
  const u = ((x + WORLD.w / 2) / WORLD.w) * (hw - 1);
  const v = ((z + WORLD.d / 2) / WORLD.d) * (hh - 1);
  const x0 = Math.floor(u);
  const y0 = Math.floor(v);
  const fx = u - x0;
  const fy = v - y0;
  return (
    ((height01(x0, y0) * (1 - fx) + height01(x0 + 1, y0) * fx) * (1 - fy) +
      (height01(x0, y0 + 1) * (1 - fx) + height01(x0 + 1, y0 + 1) * fx) * fy) *
    4205
  );
}

export function terrainY(x: number, z: number): number {
  return terrainMeters(x, z) * HEIGHT_SCALE;
}

export function hasAlbedo() {
  return !!colorPx;
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
  if (h < hu(0.22) || h > hu(9)) return false;
  if (!colorPx) return h < hu(6.5);
  const { r, g, b } = sampleAlbedo(x, z);
  if (g < 48 || r > 210) return false;
  return g > r + 6 && g >= b - 4 && 2 * g - r - b > 10;
}

export { GEO };
