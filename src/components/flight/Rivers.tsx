import { useMemo } from "react";
import { Vector3 } from "three";
import { RIVERS } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
import { Waterfall, WaterTick } from "./Waterfalls";

const WATER = "#3aaed4";

function drape(pts: [number, number][]) {
  const out: Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = latLonToWorld(pts[i]![0], pts[i]![1]);
    const b = latLonToWorld(pts[i + 1]![0], pts[i + 1]![1]);
    const span = Math.hypot(b.x - a.x, b.z - a.z);
    const n = Math.max(2, Math.ceil(span / 0.16));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      out.push(new Vector3(x, terrainY(x, z) + 0.08, z));
    }
  }
  const last = pts[pts.length - 1]!;
  const end = latLonToWorld(last[0], last[1]);
  out.push(new Vector3(end.x, terrainY(end.x, end.z) + 0.08, end.z));
  return out;
}

/** Windward rivers glued to the ground. Steep drops become rapids. */
export function Rivers() {
  const paths = useMemo(() => {
    return RIVERS.map((r) => ({
      id: r.id,
      w: r.w,
      falls: r.falls,
      points: drape(r.pts),
    }));
  }, []);

  return (
    <group>
      <WaterTick />
      {paths.map((p) => (
        <group key={p.id}>
          <Ribbon points={p.points} width={p.w} />
          {p.falls.map((f, i) => (
            <Waterfall key={i} fall={f} points={p.points} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Ribbon({ points, width }: { points: Vector3[]; width: number }) {
  return (
    <group>
      {points.slice(0, -1).map((a, i) => {
        const b = points[i + 1]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const xz = Math.hypot(dx, dz) || 0.01;
        const len = Math.hypot(dx, dy, dz) || 0.01;
        const yaw = Math.atan2(dx, dz);
        const pitch = -Math.atan2(dy, xz);
        return (
          <mesh
            key={i}
            position={[(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2]}
            rotation={[pitch, yaw, 0]}
          >
            <boxGeometry args={[width, 0.07, len]} />
            <meshStandardMaterial
              color={WATER}
              roughness={0.2}
              metalness={0.1}
              emissive="#1a6a88"
              emissiveIntensity={0.45}
            />
          </mesh>
        );
      })}
    </group>
  );
}
