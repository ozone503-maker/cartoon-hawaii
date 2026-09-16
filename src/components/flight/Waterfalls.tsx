import { useMemo } from "react";
import { DoubleSide } from "three";
import type { Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = {
  color: "#d9f6ff",
  emissive: "#7fcfe8",
  emissiveIntensity: 0.48,
  transparent: true,
  opacity: 0.74,
  roughness: 0.12,
  metalness: 0.02,
  side: DoubleSide,
  depthWrite: false,
} as const;

const FOAM = {
  color: "#f4fbff",
  transparent: true,
  opacity: 0.42,
  roughness: 0.3,
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
    const yLip = terrainY(x - fx * 0.18, z - fz * 0.18) + 0.05;
    const yDown = terrainY(x + fx * 1.5, z + fz * 1.5);
    const drop = Math.max(fall.h, yLip - yDown, 0.72);

    return { x, z, y: yLip, yaw, drop, w: Math.max(0.14, fall.w), kind: fall.kind };
  }, [fall, points]);

  return (
    <group position={[pose.x, pose.y, pose.z]} rotation={[0, pose.yaw, 0]}>
      {pose.kind === "pots" ? (
        <PotsFall w={pose.w} />
      ) : pose.kind === "plunge" || pose.kind === "rainbow" ? (
        <PlungeFall drop={pose.drop} w={pose.w} rainbow={pose.kind === "rainbow"} />
      ) : (
        <CascadeFall drop={pose.drop} w={pose.w} thread={pose.kind === "thread"} />
      )}
    </group>
  );
}

function PlungeFall({ drop, w, rainbow }: { drop: number; w: number; rainbow?: boolean }) {
  const curtainW = rainbow ? w * 1.65 : w * 1.25;
  const run = Math.max(0.12, drop * 0.08);
  const strips = [-0.34, -0.1, 0.14, 0.32];

  return (
    <group>
      <mesh position={[0, -drop / 2, run * 0.5]} rotation={[-0.04, 0, 0]}>
        <planeGeometry args={[curtainW, drop, 1, 5]} />
        <meshStandardMaterial {...WATER} opacity={0.63} />
      </mesh>

      {strips.map((s, i) => (
        <mesh
          key={s}
          position={[s * curtainW, -drop * (0.48 + i * 0.015), run * (0.42 + i * 0.04) + 0.018]}
          rotation={[-0.025 - i * 0.008, 0, 0]}
        >
          <planeGeometry args={[curtainW * (i % 2 ? 0.16 : 0.11), drop * (0.84 + i * 0.035)]} />
          <meshStandardMaterial {...WATER} opacity={0.88} emissiveIntensity={0.66} />
        </mesh>
      ))}

      <Pool w={curtainW} drop={drop} run={run} />
      <Mist w={curtainW} drop={drop} run={run} />
      {rainbow ? <RainbowMist drop={drop} run={run} /> : null}
    </group>
  );
}

function CascadeFall({ drop, w, thread }: { drop: number; w: number; thread?: boolean }) {
  const ww = thread ? w * 0.5 : w * 1.25;
  const stages = thread ? 2 : 3;
  const stageDrop = drop / stages;
  const stageRun = Math.max(0.2, drop * (thread ? 0.15 : 0.24));

  return (
    <group>
      {Array.from({ length: stages }, (_, i) => {
        const z = i * stageRun + stageRun * 0.45;
        const y = -(i * stageDrop + stageDrop * 0.48);
        const lean = -0.14 - i * 0.035;
        return (
          <group key={i}>
            <mesh position={[0, y, z]} rotation={[lean, 0, 0]}>
              <planeGeometry args={[ww * (1 - i * 0.08), stageDrop * 1.04, 1, 3]} />
              <meshStandardMaterial {...WATER} opacity={thread ? 0.66 : 0.73} />
            </mesh>
            <mesh position={[ww * 0.2, y - stageDrop * 0.04, z + 0.018]} rotation={[lean * 0.85, 0, 0]}>
              <planeGeometry args={[ww * 0.13, stageDrop * 0.86]} />
              <meshStandardMaterial {...WATER} opacity={0.9} emissiveIntensity={0.7} />
            </mesh>
            {!thread ? (
              <mesh position={[0, -(i + 1) * stageDrop + 0.04, (i + 0.9) * stageRun]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[ww * 0.68, 14]} />
                <meshStandardMaterial color="#2c86a4" roughness={0.18} emissive="#14556d" emissiveIntensity={0.24} />
              </mesh>
            ) : null}
          </group>
        );
      })}

      <Pool w={ww} drop={drop} run={stageRun * stages} />
      <Mist w={ww} drop={drop} run={stageRun * stages} small={thread} />
    </group>
  );
}

function Pool({ w, drop, run }: { w: number; drop: number; run: number }) {
  return (
    <>
      <mesh position={[0, -drop + 0.03, run + 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.24, w * 1.55), 18]} />
        <meshStandardMaterial color="#176783" roughness={0.2} metalness={0.04} emissive="#0b4054" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, -drop + 0.055, run + 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(0.09, w * 0.45), Math.max(0.16, w * 0.92), 18]} />
        <meshStandardMaterial {...FOAM} opacity={0.5} />
      </mesh>
    </>
  );
}

function Mist({ w, drop, run, small = false }: { w: number; drop: number; run: number; small?: boolean }) {
  const puffs = small ? [-0.12, 0.12] : [-0.3, -0.1, 0.12, 0.31];
  return (
    <group>
      {puffs.map((x, i) => (
        <mesh key={x} position={[x * w * 1.8, -drop + 0.13 + (i % 2) * 0.05, run + 0.04 + i * 0.025]}>
          <sphereGeometry args={[Math.max(0.09, w * (0.42 + (i % 2) * 0.1)), 7, 5]} />
          <meshStandardMaterial {...FOAM} opacity={small ? 0.22 : 0.3} />
        </mesh>
      ))}
    </group>
  );
}

function RainbowMist({ drop, run }: { drop: number; run: number }) {
  return (
    <group position={[0, -drop + 0.3, run + 0.16]} rotation={[0.28, 0, 0]}>
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[0.3 + i * 0.024, 0.008, 4, 16, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function PotsFall({ w }: { w: number }) {
  const pots = [-0.36, 0, 0.36];
  return (
    <group>
      {pots.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.03 - i * 0.035, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * (0.46 + i * 0.04), 16]} />
            <meshStandardMaterial color="#164f68" roughness={0.2} emissive="#0a3344" emissiveIntensity={0.3} />
          </mesh>
          {i < pots.length - 1 ? (
            <mesh position={[0, 0.035 - i * 0.035, (z + pots[i + 1]!) / 2]} rotation={[-0.08, 0, 0]}>
              <planeGeometry args={[w * 0.24, 0.3]} />
              <meshStandardMaterial {...WATER} opacity={0.8} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}
