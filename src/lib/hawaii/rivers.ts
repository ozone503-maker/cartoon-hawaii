import { latLonToWorld } from "./world";

/** Real windward streams. Falls sit inland. Mouths meet the bay — they are not waterfalls. */
export type Fall = { lat: number; lon: number; h: number; w: number };
export type River = {
  id: string;
  w: number;
  pts: [number, number][];
  falls: Fall[];
};

export const RIVERS: River[] = [
  {
    id: "wailuku",
    w: 0.22,
    pts: [
      [19.742, -155.168],
      [19.734, -155.148],
      [19.728, -155.132],
      [19.7215, -155.1165],
      [19.7194, -155.1094],
      [19.72, -155.098],
      [19.723, -155.09],
      [19.725, -155.086],
    ],
    falls: [
      { lat: 19.7215, lon: -155.1165, h: 0.7, w: 0.28 },
      { lat: 19.7194, lon: -155.1094, h: 1.55, w: 0.52 },
    ],
  },
  {
    id: "kolekole",
    w: 0.16,
    pts: [
      [19.848, -155.162],
      [19.8539, -155.1522],
      [19.86, -155.14],
      [19.868, -155.13],
      [19.8783, -155.1225],
    ],
    falls: [{ lat: 19.8539, lon: -155.1522, h: 2.55, w: 0.36 }],
  },
  {
    id: "umauma",
    w: 0.14,
    pts: [
      [19.888, -155.152],
      [19.8917, -155.1408],
      [19.9, -155.128],
      [19.908, -155.118],
    ],
    falls: [{ lat: 19.8917, lon: -155.1408, h: 1.7, w: 0.3 }],
  },
  {
    id: "wailoa",
    w: 0.18,
    pts: [
      [20.112, -155.618],
      [20.114, -155.611],
      [20.116, -155.6],
      [20.1185, -155.5908],
    ],
    falls: [{ lat: 20.114, lon: -155.611, h: 3.1, w: 0.28 }],
  },
  {
    id: "pololu",
    w: 0.14,
    pts: [
      [20.196, -155.722],
      [20.201, -155.728],
      [20.2042, -155.733],
    ],
    falls: [],
  },
];

const xz: { x: number; z: number }[] = [];
for (const r of RIVERS) {
  for (let i = 0; i < r.pts.length - 1; i++) {
    const a = latLonToWorld(r.pts[i]![0], r.pts[i]![1]);
    const b = latLonToWorld(r.pts[i + 1]![0], r.pts[i + 1]![1]);
    const n = 6;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      xz.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
}

export function inRiver(x: number, z: number) {
  const r2 = 0.48 * 0.48;
  for (const p of xz) {
    const dx = x - p.x;
    const dz = z - p.z;
    if (dx * dx + dz * dz < r2) return true;
  }
  return false;
}
