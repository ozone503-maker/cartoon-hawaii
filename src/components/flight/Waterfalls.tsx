import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Group, Mesh } from "three";
import type { Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = {
  color: "#d9f6ff",
  emissive: "#7fcfe8",
  emissiveIntensity: 0.48,
  transparent: true,
  opacity: 0.7,
  roughness: 0.12,
  metalness: 0.02,
  side: DoubleSide,
  depthWrite: false,
} as const;

const FOAM = {
  color: "#f4fbff",
  transparent: true,
  opacity: 0.4,
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
  const curtainW = rainbow ? w * 1.7 : w * (drop > 2.3 ? 1.0 : 1.18);
  const run = Math.max(0.1, drop * 0.07);
  const ribbons = rainbow
    ? [
        { x: -0.31, width: 0.36, len: 0.93, y: -0.02, opacity: 0.5 },
        { x: 0.0, width: 0.44, len: 1.0, y: 0.0, opacity: 0.58 },
        { x: 0.32, width: 0.32, len: 0.88, y: -0.05, opacity: 0.46 },
      ]
    : [
        { x: -0.2, width: 0.28, len: 0.96, y: -0.025, opacity: 0.48 },
        { x: 0.02, width: 0.34, len: 1.0, y: 0.0, opacity: 0.6 },
        { x: 0.23, width: 0.22, len: 0.91, y: -0.045, opacity: 0.44 },
      ];

  return (
    <group>
      {ribbons.map((r, i) => (
        <mesh
          key={i}
          position={[r.x * curtainW, -drop * (r.len / 2) + r.y, run * (0.45 + i * 0.04)]}
          rotation={[-0.025 - i * 0.01, 0, 0]}
        >
          <planeGeometry args={[curtainW * r.width, drop * r.len, 1, 4]} />
          <meshStandardMaterial {...WATER} opacity={r.opacity} />
        </mesh>
      ))}

      <FlowStreaks drop={drop} width={curtainW} run={run} count={rainbow ? 9 : 7} speed={rainbow ? 0.95 : 1.08} />
      <ImpactZone w={curtainW} drop={drop} run={run} mist={rainbow ? 1.1 : 1.0} />
      {rainbow ? <RainbowMist drop={drop} run={run} /> : null}
    </group>
  );
}

function CascadeFall({ drop, w, thread }: { drop: number; w: number; thread?: boolean }) {
  const ww = thread ? w * 0.48 : w * 1.3;
  const stages = thread ? 2 : 3;
  const stageDrop = drop / stages;
  const stageRun = Math.max(0.2, drop * (thread ? 0.13 : 0.23));

  return (
    <group>
      {Array.from({ length: stages }, (_, i) => {
        const z = i * stageRun + stageRun * 0.45;
        const y = -(i * stageDrop + stageDrop * 0.48);
        const lean = -0.14 - i * 0.03;
        const stageW = ww * (1 - i * 0.07);
        return (
          <group key={i}>
            <mesh position={[0, y, z]} rotation={[lean, 0, 0]}>
              <planeGeometry args={[stageW, stageDrop * 1.03, 1, 2]} />
              <meshStandardMaterial {...WATER} opacity={thread ? 0.54 : 0.62} />
            </mesh>
            <FlowStreaks
              drop={stageDrop * 0.96}
              width={stageW}
              run={0.04}
              count={thread ? 2 : 4}
              speed={thread ? 0.72 : 0.92}
              offsetY={-i * stageDrop}
              offsetZ={z}
              narrow={thread}
            />
            {!thread ? <StepPool w={stageW} y={-(i + 1) * stageDrop} z={(i + 0.9) * stageRun} seed={i} /> : null}
          </group>
        );
      })}

      <ImpactZone w={ww} drop={drop} run={stageRun * stages} mist={thread ? 0.55 : 0.85} />
    </group>
  );
}

function FlowStreaks({
  drop,
  width,
  run,
  count,
  speed,
  offsetY = 0,
  offsetZ = 0,
  narrow = false,
}: {
  drop: number;
  width: number;
  run: number;
  count: number;
  speed: number;
  offsetY?: number;
  offsetZ?: number;
  narrow?: boolean;
}) {
  const group = useRef<Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i * 0.61803398875) % 1 - 0.5) * width * (narrow ? 0.5 : 0.82),
        phase: (i * 0.37) % 1,
        speed: speed * (0.82 + (i % 3) * 0.11),
        len: drop * (0.12 + (i % 4) * 0.022),
        bright: i % 2 === 0,
      })),
    [count, drop, narrow, speed, width],
  );

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < g.children.length; i++) {
      const child = g.children[i] as Mesh;
      const s = seeds[i]!;
      const travel = ((t * s.speed + s.phase) % 1) * drop;
      child.position.y = offsetY - travel - s.len * 0.5;
      child.position.x = s.x + Math.sin(t * 1.3 + i * 1.7) * width * 0.018;
      child.position.z = offsetZ + run * 0.5 + Math.sin(t * 0.9 + i) * 0.012;
    }
  });

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i}>
          <planeGeometry args={[Math.max(0.015, width * (s.bright ? 0.075 : 0.045)), s.len]} />
          <meshStandardMaterial
            {...WATER}
            opacity={s.bright ? 0.9 : 0.68}
            emissiveIntensity={s.bright ? 0.82 : 0.58}
          />
        </mesh>
      ))}
    </group>
  );
}

function StepPool({ w, y, z, seed }: { w: number; y: number; z: number; seed: number }) {
  const ring = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = ring.current;
    if (!m) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.1 + seed) * 0.08;
    m.scale.set(pulse, pulse, pulse);
  });

  return (
    <group>
      <mesh position={[0, y + 0.035, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.13, w * 0.64), 14]} />
        <meshStandardMaterial color="#2c86a4" roughness={0.18} emissive="#14556d" emissiveIntensity={0.24} />
      </mesh>
      <mesh ref={ring} position={[0, y + 0.055, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(0.05, w * 0.2), Math.max(0.09, w * 0.42), 14]} />
        <meshStandardMaterial {...FOAM} opacity={0.38} />
      </mesh>
    </group>
  );
}

function ImpactZone({ w, drop, run, mist }: { w: number; drop: number; run: number; mist: number }) {
  const foam = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = foam.current;
    if (!m) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.075;
    m.scale.set(pulse, pulse, pulse);
    m.rotation.z = clock.elapsedTime * 0.08;
  });

  return (
    <group>
      <mesh position={[0, -drop + 0.03, run + 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.24, w * 1.5), 18]} />
        <meshStandardMaterial color="#176783" roughness={0.2} metalness={0.04} emissive="#0b4054" emissiveIntensity={0.25} />
      </mesh>
      <mesh ref={foam} position={[0, -drop + 0.055, run + 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(0.09, w * 0.42), Math.max(0.16, w * 0.95), 18]} />
        <meshStandardMaterial {...FOAM} opacity={0.52} />
      </mesh>
      <MistCloud w={w} drop={drop} run={run} amount={mist} />
    </group>
  );
}

function MistCloud({ w, drop, run, amount }: { w: number; drop: number; run: number; amount: number }) {
  const puffs = amount < 0.7 ? 2 : 4;
  return (
    <group>
      {Array.from({ length: puffs }, (_, i) => (
        <MistPuff key={i} w={w} drop={drop} run={run} i={i} amount={amount} />
      ))}
    </group>
  );
}

function MistPuff({ w, drop, run, i, amount }: { w: number; drop: number; run: number; i: number; amount: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime * (0.45 + i * 0.03) + i * 1.7;
    const drift = (Math.sin(t) + 1) * 0.5;
    m.position.x = ((i - 1.5) * 0.23 + Math.sin(t * 0.8) * 0.09) * w;
    m.position.y = -drop + 0.11 + drift * 0.16 * amount;
    m.position.z = run + 0.05 + drift * 0.12;
    const s = 0.88 + drift * 0.24;
    m.scale.set(s, s * 0.78, s);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[Math.max(0.08, w * (0.3 + (i % 2) * 0.08)) * amount, 7, 5]} />
      <meshStandardMaterial {...FOAM} opacity={0.18 + amount * 0.11} />
    </mesh>
  );
}

function RainbowMist({ drop, run }: { drop: number; run: number }) {
  return (
    <group position={[0, -drop + 0.3, run + 0.16]} rotation={[0.28, 0, 0]}>
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[0.3 + i * 0.024, 0.008, 4, 16, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.18} />
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
          <StepPool w={w * (0.72 + i * 0.06)} y={-i * 0.035} z={z} seed={i + 8} />
          {i < pots.length - 1 ? (
            <group>
              <mesh position={[0, -0.03 - i * 0.035, (z + pots[i + 1]!) / 2]} rotation={[-0.1, 0, 0]}>
                <planeGeometry args={[w * 0.23, 0.3]} />
                <meshStandardMaterial {...WATER} opacity={0.6} />
              </mesh>
              <FlowStreaks
                drop={0.28}
                width={w * 0.23}
                run={0.02}
                count={2}
                speed={0.58}
                offsetY={-i * 0.035}
                offsetZ={(z + pots[i + 1]!) / 2}
                narrow
              />
            </group>
          ) : null}
        </group>
      ))}
    </group>
  );
}
