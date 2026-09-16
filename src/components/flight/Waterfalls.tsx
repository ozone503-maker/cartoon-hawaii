import { useMemo } from "react";
import { DoubleSide } from "three";
import type { Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = {
  color: "#d4f2ff",
  emissive: "#9adff2",
  emissiveIntensity: 0.85,
  transparent: true,
  opacity: 0.8,
  roughness: 0.18,
  metalness: 0.04,
  side: DoubleSide,
  depthWrite: false,
} as const;

export function Waterfall({ fall, points }: { fall: Fall; points: Vector3[] }) {
  const pose = useMemo(() => {
    const { x, z } = latLonToWorld(fall.lat, fall.lon);
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
    const yaw = Math.atan2(nxt.x - prv.x, nxt.z - prv.z);
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);
    const yLip = terrainY(x - fx * 0.2, z - fz * 0.2);
    const yDown = terrainY(x + fx * 1.6, z + fz * 1.6);
    const drop = Math.max(fall.h, yLip - yDown, 0.85);
    return { x, z, y: yLip, yaw, drop, w: Math.max(0.16, fall.w), kind: fall.kind };
  }, [fall, points]);

  return (
    <group position={[pose.x, pose.y, pose.z]} rotation={[0, pose.yaw, 0]}>
      {pose.kind === "pots" ? <PotsFall w={pose.w} /> : <SlopeFall drop={pose.drop} w={pose.w} kind={pose.kind} />}
    </group>
  );
}

/** Water rides the hillside — no brown tower. */
function SlopeFall({ drop, w, kind }: { drop: number; w: number; kind: Fall["kind"] }) {
  const run = Math.max(0.45, drop * 0.32);
  const len = Math.hypot(run, drop);
  const pitch = Math.atan2(drop, run);
  const ww = kind === "thread" ? w * 0.45 : w;

  return (
    <group>
      <mesh position={[0, -drop / 2, run / 2]} rotation={[pitch, 0, 0]}>
        <boxGeometry args={[ww * 1.35, 0.07, len]} />
        <meshStandardMaterial {...WATER} />
      </mesh>
      <mesh position={[0, -drop / 2, run / 2 + 0.03]} rotation={[pitch, 0, 0]}>
        <boxGeometry args={[ww * 0.5, 0.05, len]} />
        <meshStandardMaterial {...WATER} opacity={0.5} />
      </mesh>
      <mesh position={[0, -drop + 0.05, run + 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.28, ww * 1.5), 14]} />
        <meshStandardMaterial color="#1a6a88" roughness={0.2} metalness={0.1} emissive="#0d4a62" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -drop + 0.18, run + 0.08]}>
        <sphereGeometry args={[Math.max(0.2, ww * 0.75), 8, 6]} />
        <meshStandardMaterial color="#eef8ff" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {kind === "rainbow" ? <RainbowBits drop={drop} run={run} /> : null}
      {kind === "cascade" ? (
        <mesh position={[0, -drop * 0.55, run * 0.7]} rotation={[pitch * 0.7, 0, 0]}>
          <boxGeometry args={[ww * 1.1, 0.06, len * 0.4]} />
          <meshStandardMaterial {...WATER} />
        </mesh>
      ) : null}
    </group>
  );
}

function RainbowBits({ drop, run }: { drop: number; run: number }) {
  return (
    <group>
      <mesh position={[-0.18, -drop * 0.35, run * 0.4]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c} position={[0, -drop + 0.35, run + 0.2]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.32 + i * 0.022, 0.01, 5, 14, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.32} />
        </mesh>
      ))}
    </group>
  );
}

function PotsFall({ w }: { w: number }) {
  const pots = [-0.34, 0, 0.34];
  return (
    <group>
      {pots.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * 0.4, 14]} />
            <meshStandardMaterial color="#1a4a5c" roughness={0.22} emissive="#0a3040" emissiveIntensity={0.4} />
          </mesh>
          {i < pots.length - 1 ? (
            <mesh position={[0, 0.05, (z + pots[i + 1]!) / 2]}>
              <boxGeometry args={[w * 0.16, 0.06, 0.28]} />
              <meshStandardMaterial {...WATER} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}
