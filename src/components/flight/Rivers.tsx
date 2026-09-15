import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { DoubleSide, Vector3 } from "three";
import { RIVERS, type Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = "#3aaed4";
const FALL = "#e8f6ff";

/** Windward rivers draped on the terrain. Falls are curtains on the lip — not sea cliffs. */
export function Rivers() {
  const paths = useMemo(() => {
    return RIVERS.map((r) => ({
      id: r.id,
      w: r.w,
      falls: r.falls,
      points: r.pts.map(([lat, lon]) => {
        const { x, z } = latLonToWorld(lat, lon);
        return new Vector3(x, terrainY(x, z) + 0.06, z);
      }),
    }));
  }, []);

  return (
    <group>
      {paths.map((p) => (
        <group key={p.id}>
          <Line points={p.points} color={WATER} lineWidth={5} />
          <Ribbon points={p.points} width={p.w} />
          {p.falls.map((f, i) => (
            <Falls key={i} fall={f} points={p.points} />
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
        const mid = new Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz) || 0.01;
        const yaw = Math.atan2(dx, dz);
        return (
          <mesh key={i} position={mid.toArray()} rotation={[0, yaw, 0]}>
            <boxGeometry args={[width, 0.05, len]} />
            <meshStandardMaterial color={WATER} roughness={0.22} metalness={0.08} emissive="#1a6a88" emissiveIntensity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

function Falls({ fall, points }: { fall: Fall; points: Vector3[] }) {
  const { x, z } = latLonToWorld(fall.lat, fall.lon);
  const y = terrainY(x, z);
  const { fx, fz } = useMemo(() => {
    let best = 0;
    let d = Infinity;
    points.forEach((p, i) => {
      const dd = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (dd < d) {
        d = dd;
        best = i;
      }
    });
    const nxt = points[Math.min(points.length - 1, best + 1)] ?? points[best]!;
    const prv = points[Math.max(0, best - 1)]!;
    const dx = nxt.x - prv.x;
    const dz = nxt.z - prv.z;
    const len = Math.hypot(dx, dz) || 1;
    return { fx: dx / len, fz: dz / len };
  }, [points, x, z]);
  const yaw = Math.atan2(fx, fz);

  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, fall.h / 2, 0.04]}>
        <planeGeometry args={[fall.w, fall.h]} />
        <meshStandardMaterial
          color={FALL}
          emissive="#9ee7ff"
          emissiveIntensity={0.95}
          transparent
          opacity={0.82}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, fall.h / 2, 0.02]}>
        <planeGeometry args={[fall.w * 0.45, fall.h]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.04, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[fall.w * 0.7, 14]} />
        <meshStandardMaterial color="#1f6a88" roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.18, 0.1]}>
        <sphereGeometry args={[fall.w * 0.38, 8, 6]} />
        <meshStandardMaterial color="#d8f2ff" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
}
