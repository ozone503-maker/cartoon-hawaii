import { useMemo } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";
import { RIVERS, type Fall } from "@/lib/hawaii/rivers";
import { hu, latLonToWorld, terrainY, wu } from "@/lib/hawaii/world";
import { Waterfall } from "./Waterfalls";

/** Terrain-hugging polyline; river Y drops at each fall so ribbons don't laser flat. */
function drape(pts: [number, number][], falls: Fall[]) {
  const out: Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = latLonToWorld(pts[i]![0], pts[i]![1]);
    const b = latLonToWorld(pts[i + 1]![0], pts[i + 1]![1]);
    const span = Math.hypot(b.x - a.x, b.z - a.z);
    const n = Math.max(4, Math.ceil(span / wu(0.22)));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      out.push(new Vector3(x, terrainY(x, z) + hu(0.055), z));
    }
  }
  const last = pts[pts.length - 1]!;
  const end = latLonToWorld(last[0], last[1]);
  out.push(new Vector3(end.x, terrainY(end.x, end.z) + hu(0.055), end.z));

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
    const span = Math.max(4, Math.ceil(drop / 0.28));
    for (let i = 0; i <= span && best + i < out.length; i++) {
      out[best + i]!.y -= (i / span) * drop;
    }
  }
  return out;
}

export function Rivers() {
  const paths = useMemo(
    () =>
      RIVERS.map((r) => ({
        id: r.id,
        w: r.w,
        falls: r.falls,
        points: drape(r.pts, r.falls),
      })),
    [],
  );

  return (
    <group>
      {paths.map((p) => (
        <group key={p.id}>
          <Ribbon points={p.points} width={p.w} riverId={p.id} />
          {p.falls.map((f) => (
            <Waterfall key={f.id} fall={f} points={p.points} riverId={p.id} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Ribbon({ points, width, riverId }: { points: Vector3[]; width: number; riverId: string }) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    if (points.length < 2) return g;

    const verts: number[] = [];
    const indices: number[] = [];
    const channelScale = riverId === "wailuku" ? 0.82 : riverId === "hookelekele" ? 0.72 : 1;
    const half = Math.max(0.075, width * channelScale * 0.5);

    for (let i = 0; i < points.length; i++) {
      const p = points[i]!;
      const prev = points[Math.max(0, i - 1)]!;
      const next = points[Math.min(points.length - 1, i + 1)]!;
      const tx = next.x - prev.x;
      const tz = next.z - prev.z;
      const mag = Math.hypot(tx, tz) || 1;
      const px = -tz / mag;
      const pz = tx / mag;

      verts.push(p.x + px * half, p.y, p.z + pz * half);
      verts.push(p.x - px * half, p.y, p.z - pz * half);

      if (i < points.length - 1) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, c, b, b, c, d);
      }
    }

    g.setAttribute("position", new Float32BufferAttribute(verts, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [points, riverId, width]);

  const youngBasalt = riverId === "wailuku" || riverId === "hookelekele";

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={youngBasalt ? "#6eb8c8" : "#3a96b0"}
        roughness={youngBasalt ? 0.22 : 0.28}
        metalness={0.02}
        emissive={youngBasalt ? "#1a4a58" : "#124858"}
        emissiveIntensity={youngBasalt ? 0.22 : 0.28}
        transparent
        opacity={0.9}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}
