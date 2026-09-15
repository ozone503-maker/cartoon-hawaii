import { latLonToWorld } from "./world";

/** Real windward streams. Falls sit inland. Mouths meet the bay — they are not waterfalls. */
export type FallKind = "rainbow" | "plunge" | "cascade" | "pots" | "thread";
export type Fall = {
  lat: number;
  lon: number;
  h: number;
  w: number;
  kind: FallKind;
};
export type River = {
  id: string;
  w: number;
  pts: [number, number][];
  falls: Fall[];
};

export const RIVERS: River[] = [
  {
    id: "wailuku",
    w: 0.28,
    pts: [
      [19.80722, -155.42028],
      [19.77029, -155.36417],
      [19.755, -155.30],
      [19.745, -155.24],
      [19.735, -155.20],
      [19.728, -155.175],
      [19.722, -155.155],
      [19.7154, -155.1404],
      [19.7153, -155.1306],
      [19.7215, -155.1165],
      [19.7194, -155.1094],
      [19.72554, -155.09167],
      [19.72778, -155.0875],
    ],
    falls: [
      { lat: 19.7154, lon: -155.1404, h: 0.95, w: 0.32, kind: "cascade" },
      { lat: 19.7153, lon: -155.1306, h: 0.45, w: 0.36, kind: "pots" },
      { lat: 19.7215, lon: -155.1165, h: 0.75, w: 0.26, kind: "cascade" },
      { lat: 19.7194, lon: -155.1094, h: 1.35, w: 0.32, kind: "rainbow" },
    ],
  },
  {
    id: "hookelekele",
    w: 0.16,
    pts: [
      [19.70813, -155.16649],
      [19.70857, -155.1645],
      [19.70981, -155.15731],
      [19.71125, -155.15735],
      [19.71171, -155.15625],
      [19.71084, -155.1532],
      [19.7154, -155.1404],
    ],
    falls: [
      { lat: 19.70813, lon: -155.16649, h: 1.15, w: 0.2, kind: "thread" },
      { lat: 19.70857, lon: -155.1645, h: 1.05, w: 0.18, kind: "thread" },
      { lat: 19.70981, lon: -155.15731, h: 1.4, w: 0.22, kind: "thread" },
      { lat: 19.71125, lon: -155.15735, h: 1.3, w: 0.2, kind: "thread" },
      { lat: 19.71171, lon: -155.15625, h: 1.2, w: 0.2, kind: "thread" },
      { lat: 19.7102, lon: -155.15309, h: 1.0, w: 0.18, kind: "thread" },
      { lat: 19.71084, lon: -155.1532, h: 0.95, w: 0.18, kind: "thread" },
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
    falls: [{ lat: 19.8539, lon: -155.1522, h: 2.15, w: 0.16, kind: "plunge" }],
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
    falls: [{ lat: 19.8917, lon: -155.1408, h: 2.2, w: 0.28, kind: "cascade" }],
  },
  {
    id: "waipio-wailoa",
    w: 0.18,
    pts: [
      [20.112, -155.618],
      [20.114, -155.611],
      [20.116, -155.6],
      [20.1185, -155.5908],
    ],
    falls: [{ lat: 20.114, lon: -155.611, h: 2.45, w: 0.14, kind: "plunge" }],
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
    const n = Math.max(8, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.22));
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
