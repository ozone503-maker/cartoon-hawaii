import { useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, Object3D, Vector3 } from "three";
import { RIVERS, type Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
import { Waterfall } from "./Waterfalls";

const WATER = "#3aaed4";
const dummy = new Object3D();

function drape(pts: [number, number][], falls: Fall[]) {
  const out: Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = latLonToWorld(pts[i]![0], pts[i]![1]);
    const b = latLonToWorld(pts[i + 1]![0], pts[i + 1]![1]);
    const span = Math.hypot(b.x - a.x, b.z - a.z);
    const n = Math.max(2, Math.ceil(span / 0.4));
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

  for (const f of falls) {
    const fp = latLonToWorld(f.lat, f.lon);
    let best = 0;
    let d = Infinity;
    out.forEach((p, i) => {
      const dd = (p.x - fp.x) ** 2 + (p.z - fp.z) ** 2;
      if (dd < d) {
        d = dd;
        best = i;
      }
    });
    const drop = Math.max(f.h, 0.85);
    const span = 5;
    for (let i = 0; i <= span && best + i < out.length; i++) {
      out[best + i]!.y -= (i / span) * drop;
    }
  }
  return out;
}

export function Rivers() {
  const paths = useMemo(() => {
    return RIVERS.map((r) => ({
      id: r.id,
      w: r.w,
      falls: r.falls,
      points: drape(r.pts, r.falls),
    }));
  }, []);

  return (
    <group>
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
  const mesh = useRef<InstancedMesh>(null);
  const count = Math.max(1, points.length - 1);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      const a = points[i]!;
      const b = points[i + 1] ?? a;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const xz = Math.hypot(dx, dz) || 0.01;
      const len = Math.hypot(dx, dy, dz) || 0.01;
      dummy.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
      dummy.rotation.set(-Math.atan2(dy, xz), Math.atan2(dx, dz), 0);
      dummy.scale.set(1, 1.2, len);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [points, count]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[Math.max(width, 0.2), 0.1, 1]} />
      <meshStandardMaterial color={WATER} roughness={0.2} metalness={0.1} emissive="#1a6a88" emissiveIntensity={0.45} />
    </instancedMesh>
  );
}
