import { useMemo } from "react";
import { DoubleSide } from "three";
import type { Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = {
  color: "#c8eefc",
  emissive: "#8ad6ee",
  emissiveIntensity: 0.7,
  transparent: true,
  opacity: 0.72,
  roughness: 0.2,
  metalness: 0.04,
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

  const h = Math.max(0.45, fall.h);
  const w = Math.max(0.22, fall.w);

  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      {fall.kind === "rainbow" && <RainbowFall h={h} w={w} />}
      {fall.kind === "plunge" && <PlungeFall h={h} w={w} />}
      {fall.kind === "cascade" && <CascadeFall h={h} w={w} />}
      {fall.kind === "pots" && <PotsFall w={w} />}
      {fall.kind === "thread" && <ThreadFall h={h} w={w} />}
    </group>
  );
}

/** Rock palis with water sheeting down the downstream face — not a white cube. */
function Palis({ w, h }: { w: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h / 2, -0.18]}>
        <boxGeometry args={[w * 2.6, h, 0.55]} />
        <meshStandardMaterial color="#6a5e50" roughness={0.96} />
      </mesh>
      <mesh position={[0, h + 0.03, -0.02]}>
        <boxGeometry args={[w * 2.2, 0.1, 0.7]} />
        <meshStandardMaterial color="#5a5248" roughness={0.95} />
      </mesh>
      <mesh position={[0, h * 0.48, 0.16]}>
        <boxGeometry args={[w * 1.05, h * 0.92, 0.07]} />
        <meshStandardMaterial {...WATER} />
      </mesh>
      <mesh position={[0, h * 0.45, 0.24]}>
        <boxGeometry args={[w * 0.55, h * 0.85, 0.05]} />
        <meshStandardMaterial {...WATER} opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.08, 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[w * 1.35, 14]} />
        <meshStandardMaterial color="#1a6a88" roughness={0.22} metalness={0.1} emissive="#0d4a62" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.18, 0.4]}>
        <sphereGeometry args={[w * 0.7, 8, 6]} />
        <meshStandardMaterial color="#eef8ff" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
}

function RainbowFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Palis w={w} h={h} />
      <mesh position={[0, h * 0.28, -0.02]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c} position={[0, 0.28, 0.55]} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.38 + i * 0.024, 0.01, 5, 14, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function PlungeFall({ h, w }: { h: number; w: number }) {
  return <Palis w={w} h={h} />;
}

function CascadeFall({ h, w }: { w: number; h: number }) {
  const a = h * 0.55;
  const b = h * 0.4;
  return (
    <group>
      <Palis w={w} h={a} />
      <group position={[0, 0, 0.55]}>
        <mesh position={[0, b / 2, -0.1]}>
          <boxGeometry args={[w * 1.8, b, 0.35]} />
          <meshStandardMaterial color="#6a5e50" roughness={0.96} />
        </mesh>
        <mesh position={[0, b * 0.48, 0.12]}>
          <boxGeometry args={[w * 0.85, b * 0.9, 0.06]} />
          <meshStandardMaterial {...WATER} />
        </mesh>
        <mesh position={[0, 0.06, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[w * 0.7, 12]} />
          <meshStandardMaterial color="#1a6a88" roughness={0.22} />
        </mesh>
      </group>
    </group>
  );
}

function PotsFall({ w }: { w: number }) {
  const pots = [-0.38, 0, 0.38];
  return (
    <group>
      {pots.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * 0.42, 14]} />
            <meshStandardMaterial color="#1a4a5c" roughness={0.22} emissive="#0a3040" emissiveIntensity={0.4} />
          </mesh>
          {i < pots.length - 1 ? (
            <mesh position={[0, 0.07, (z + pots[i + 1]!) / 2]}>
              <boxGeometry args={[w * 0.18, 0.08, 0.32]} />
              <meshStandardMaterial {...WATER} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}

function ThreadFall({ h, w }: { h: number; w: number }) {
  const ww = Math.max(0.12, w * 0.55);
  return (
    <group>
      <mesh position={[0, h / 2, -0.1]}>
        <boxGeometry args={[ww * 3.2, h, 0.32]} />
        <meshStandardMaterial color="#5e564c" roughness={0.96} />
      </mesh>
      <mesh position={[0, h * 0.48, 0.1]}>
        <boxGeometry args={[ww, h * 0.9, 0.05]} />
        <meshStandardMaterial {...WATER} />
      </mesh>
      <mesh position={[0, 0.05, 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ww * 1.6, 10]} />
        <meshStandardMaterial color="#1a6a88" roughness={0.22} />
      </mesh>
    </group>
  );
}
