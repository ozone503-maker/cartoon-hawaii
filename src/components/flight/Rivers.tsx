import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { RIVERS } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
import { Waterfall, WaterTick } from "./Waterfalls";

const WATER = "#3aaed4";

/** Windward rivers draped on the terrain. Each fall is its real shape. */
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
      <WaterTick />
      {paths.map((p) => (
        <group key={p.id}>
          <Line points={p.points} color={WATER} lineWidth={5} />
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
