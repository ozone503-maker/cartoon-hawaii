import { useMemo } from "react";
import { DoubleSide } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
import type { Vector3 } from "three";

const WATER = {
  color: "#d7f4ff",
  emissive: "#9ee7ff",
  emissiveIntensity: 1.05,
  transparent: true,
  opacity: 0.78,
  roughness: 0.16,
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

  const h = Math.max(fall.h, 1.05);
  const w = Math.max(fall.w, 0.42);

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

/** Falling water as a volume so it reads from the chase cam and from above. */
function Column({ w, h }: { w: number; h: number }) {
  const thick = Math.max(0.42, w * 0.85);
  return (
    <group>
      <mesh position={[0, h + 0.08, -thick * 0.25]}>
        <boxGeometry args={[w * 1.7, 0.16, thick * 0.7]} />
        <meshStandardMaterial color="#5c564c" roughness={0.96} />
      </mesh>
      <mesh position={[0, h / 2, 0.06]}>
        <boxGeometry args={[w, h, thick]} />
        <meshStandardMaterial {...WATER} />
      </mesh>
      <mesh position={[0, h / 2, 0.06]}>
        <boxGeometry args={[w * 0.4, h, thick * 0.4]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.85}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.22, 0.12]}>
        <sphereGeometry args={[Math.max(0.38, w * 1.15), 10, 8]} />
        <meshStandardMaterial color="#f4fbff" transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Pool({ r, z, dark }: { r: number; z: number; dark?: boolean }) {
  return (
    <mesh position={[0, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 16]} />
      <meshStandardMaterial
        color={dark ? "#163a4a" : "#1f7a9a"}
        roughness={0.2}
        metalness={0.12}
        emissive={dark ? "#0a2836" : "#0d4a62"}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function RainbowFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Column w={w} h={h} />
      <mesh position={[-0.28, h * 0.22, -0.12]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      <Pool r={0.72} z={0.32} />
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c} position={[0, 0.32, 0.4]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.42 + i * 0.028, 0.012, 6, 16, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  );
}

function PlungeFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Column w={w} h={h} />
      <Pool r={w * 1.6} z={0.22} dark />
    </group>
  );
}

function CascadeFall({ h, w }: { h: number; w: number }) {
  const top = h * 0.55;
  return (
    <group>
      <Column w={w} h={top} />
      <mesh position={[0, top * 0.15, 0.28]}>
        <boxGeometry args={[w * 0.9, top * 0.5, Math.max(0.35, w * 0.7)]} />
        <meshStandardMaterial {...WATER} />
      </mesh>
      <Pool r={w * 0.7} z={0.22} />
    </group>
  );
}

function PotsFall({ w }: { w: number }) {
  const pots = [-0.42, 0, 0.42];
  return (
    <group>
      {pots.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * 0.38, 14]} />
            <meshStandardMaterial
              color="#1a4a5c"
              roughness={0.22}
              emissive="#0a3040"
              emissiveIntensity={0.45}
            />
          </mesh>
          {i < pots.length - 1 ? (
            <mesh position={[0, 0.1, (z + pots[i + 1]!) / 2]}>
              <boxGeometry args={[w * 0.28, 0.16, 0.38]} />
              <meshStandardMaterial {...WATER} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}

function ThreadFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Column w={Math.max(0.28, w)} h={h} />
      <Pool r={Math.max(0.32, w)} z={0.16} />
    </group>
  );
}
