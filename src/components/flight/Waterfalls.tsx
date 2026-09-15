import { useMemo } from "react";
import { DoubleSide, Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const FALL_MAT = {
  color: "#dff6ff",
  emissive: "#9ee7ff",
  emissiveIntensity: 0.85,
  transparent: true,
  opacity: 0.82,
  roughness: 0.18,
  metalness: 0.05,
  side: DoubleSide,
  depthWrite: false,
} as const;

export function Waterfall({ fall, points }: { fall: Fall; points: Vector3[] }) {
  const { x, z } = latLonToWorld(fall.lat, fall.lon);
  const y = terrainY(x, z);
  const yaw = useMemo(() => {
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
    return Math.atan2(nxt.x - prv.x, nxt.z - prv.z);
  }, [points, x, z]);

  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      {fall.kind === "rainbow" && <RainbowFall h={fall.h} w={fall.w} />}
      {fall.kind === "plunge" && <PlungeFall h={fall.h} w={fall.w} />}
      {fall.kind === "cascade" && <CascadeFall h={fall.h} w={fall.w} />}
      {fall.kind === "pots" && <PotsFall w={fall.w} />}
      {fall.kind === "thread" && <ThreadFall h={fall.h} w={fall.w} />}
    </group>
  );
}

function Sheet({ w, h, y, z }: { w: number; h: number; y: number; z: number }) {
  return (
    <mesh position={[0, y, z]}>
      <boxGeometry args={[w, h, 0.12]} />
      <meshStandardMaterial {...FALL_MAT} />
    </mesh>
  );
}

function Veil({ w, h }: { w: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h + 0.04, -0.04]}>
        <boxGeometry args={[w * 1.4, 0.08, 0.24]} />
        <meshStandardMaterial color="#6a6358" roughness={0.95} />
      </mesh>
      <Sheet w={w} h={h} y={h / 2} z={0.05} />
      <Sheet w={w * 0.45} h={h} y={h / 2} z={0.11} />
      <mesh position={[0, h * 0.1, 0.14]}>
        <sphereGeometry args={[w * 0.55, 8, 6]} />
        <meshStandardMaterial color="#e8f6ff" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Pool({ r, z, dark }: { r: number; z: number; dark?: boolean }) {
  return (
    <mesh position={[0, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 14]} />
      <meshStandardMaterial color={dark ? "#163a4a" : "#1f6a88"} roughness={0.22} metalness={0.12} />
    </mesh>
  );
}

function RainbowFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Veil w={w} h={h} />
      <mesh position={[-0.26, h * 0.28, -0.08]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      <Pool r={0.62} z={0.3} />
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c} position={[0, 0.26, 0.36]} rotation={[0.25, 0, 0]}>
          <torusGeometry args={[0.4 + i * 0.026, 0.012, 6, 16, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function PlungeFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Veil w={w} h={h} />
      <Pool r={w * 1.5} z={0.18} dark />
    </group>
  );
}

function CascadeFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Veil w={w} h={h * 0.55} />
      <group position={[0, 0, 0.14]}>
        <Sheet w={w * 0.85} h={h * 0.45} y={h * 0.22} z={0.06} />
        <Pool r={w * 0.5} z={0.16} />
      </group>
    </group>
  );
}

function PotsFall({ w }: { w: number }) {
  const pots = [-0.4, 0, 0.4];
  return (
    <group>
      {pots.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * 0.3, 12]} />
            <meshStandardMaterial color="#1a4a5c" roughness={0.25} emissive="#0a3040" emissiveIntensity={0.35} />
          </mesh>
          {i < pots.length - 1 ? (
            <Sheet w={w * 0.2} h={0.14} y={0.09} z={(z + pots[i + 1]!) / 2} />
          ) : null}
        </group>
      ))}
    </group>
  );
}

function ThreadFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Veil w={w} h={h} />
      <Pool r={w} z={0.12} />
    </group>
  );
}
