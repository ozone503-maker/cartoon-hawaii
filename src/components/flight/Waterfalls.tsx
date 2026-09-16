import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Mesh } from "three";
import type { Vector3 } from "three";
import type { Fall, FallProfile } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = {
  color: "#e6fbff",
  emissive: "#76d7ee",
  emissiveIntensity: 0.48,
  transparent: true,
  opacity: 0.76,
  roughness: 0.1,
  metalness: 0,
  side: DoubleSide,
  depthWrite: false,
} as const;

const FOAM = {
  color: "#fbfdff",
  transparent: true,
  opacity: 0.48,
  roughness: 0.28,
  depthWrite: false,
} as const;

const BASALT = "#242b29";
const BASALT_LIT = "#343c38";

export function Waterfall({ fall, points, riverId }: { fall: Fall; points: Vector3[]; riverId: string }) {
  const pose = useMemo(() => getPose(fall, points, riverId), [fall, points, riverId]);

  return (
    <group position={[pose.x, pose.y, pose.z]} rotation={[0, pose.yaw, 0]}>
      <ProfileFall fall={fall} drop={pose.drop} run={pose.run} width={pose.width} />
    </group>
  );
}

function getPose(fall: Fall, points: Vector3[], riverId: string) {
  const { x, z } = latLonToWorld(fall.lat, fall.lon);
  let best = 0;
  let distance = Infinity;
  points.forEach((p, i) => {
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < distance) {
      distance = d;
      best = i;
    }
  });

  const prev = points[Math.max(0, best - 1)]!;
  const next = points[Math.min(points.length - 1, best + 1)] ?? points[best]!;
  const yaw = Math.atan2(next.x - prev.x, next.z - prev.z);
  const fx = Math.sin(yaw);
  const fz = Math.cos(yaw);
  const lip = terrainY(x, z) + 0.075;

  const isWailuku = riverId === "wailuku" || riverId === "hookelekele";
  const isTall = fall.profile === "akaka" || fall.profile === "waipio-horsetail";
  const maxSearch = isTall ? 3.2 : isWailuku ? 4.6 : 6.5;
  const target = isTall ? fall.h * 0.96 : isWailuku ? fall.h * 0.86 : fall.h * 0.76;
  let bestY = lip;
  let bestRun = 0.55;

  for (let r = 0.45; r <= maxSearch; r += 0.22) {
    const y = terrainY(x + fx * r, z + fz * r) + 0.055;
    if (y < bestY) {
      bestY = y;
      bestRun = r;
    }
    if (lip - y >= target) break;
  }

  const terrainDrop = Math.max(0.34, lip - bestY);
  let drop = Math.max(terrainDrop, fall.h * 0.82);
  let run = bestRun;

  switch (fall.profile) {
    case "akaka":
      drop = Math.max(drop, fall.h);
      run = Math.min(run, Math.max(0.22, drop * 0.13));
      break;
    case "waipio-horsetail":
      drop = Math.max(drop, fall.h * 1.05);
      run = Math.min(run, Math.max(0.28, drop * 0.18));
      break;
    case "rainbow":
      drop = Math.max(drop, fall.h * 0.92);
      run = Math.min(run, Math.max(0.34, drop * 0.28));
      break;
    case "umauma":
      drop = Math.max(drop, fall.h * 0.9);
      run = Math.max(run, drop * 0.78);
      break;
    case "peepee":
      drop = Math.max(0.42, Math.min(drop, fall.h * 1.35));
      run = Math.max(1.1, run);
      break;
    default:
      if (isWailuku) run = Math.min(run, Math.max(0.55, drop * 0.48));
  }

  return { x, z, y: lip, yaw, run, drop, width: Math.max(0.14, fall.w) };
}

function ProfileFall({ fall, drop, run, width }: { fall: Fall; drop: number; run: number; width: number }) {
  switch (fall.profile) {
    case "rainbow":
      return <RainbowFalls drop={drop} run={run} width={width} />;
    case "peepee":
      return <PeepeeBoilingPots drop={drop} run={run} width={width} />;
    case "akaka":
      return <AkakaFalls drop={drop} run={run} width={width} />;
    case "umauma":
      return <UmaumaFalls drop={drop} run={run} width={width} />;
    case "waipio-horsetail":
      return <WaipioHorsetail drop={drop} run={run} width={width} />;
    case "wailuku-upper-cascade":
      return <WailukuCascade drop={drop} run={run} width={width} stages={3} broad />;
    case "wailuku-mid-cascade":
      return <WailukuCascade drop={drop} run={run} width={width} stages={2} />;
    default:
      return <SacredThread profile={fall.profile} drop={drop} run={run} width={width} />;
  }
}

function RainbowFalls({ drop, run, width }: { drop: number; run: number; width: number }) {
  const w = width * 2.05;
  return (
    <group>
      <BasaltFace drop={drop} run={run} width={w * 1.45} color="#2b322f" />
      <CaveMouth drop={drop} run={run} width={w} />
      <WaterSheet drop={drop} run={run} width={w} strands={5} opacity={0.64} />
      <FlowDashes drop={drop} run={run} width={w} count={11} speed={0.34} />
      <ImpactPool drop={drop} run={run} width={w * 1.2} mist={1.25} />
      <RainbowHint drop={drop} run={run} width={w} />
    </group>
  );
}

function PeepeeBoilingPots({ drop, run, width }: { drop: number; run: number; width: number }) {
  const pots = [
    { z: 0.08, y: -0.03, r: 0.56 },
    { z: run * 0.33, y: -drop * 0.22, r: 0.66 },
    { z: run * 0.68, y: -drop * 0.55, r: 0.61 },
    { z: run, y: -drop, r: 0.72 },
  ];

  return (
    <group>
      <BasaltSlot drop={Math.max(0.5, drop)} run={run} width={width * 1.85} low />
      {pots.map((p, i) => (
        <group key={i} position={[0, p.y, p.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[Math.max(0.18, width * p.r), 18]} />
            <meshStandardMaterial color="#4aa9c1" roughness={0.16} emissive="#123f4d" emissiveIntensity={0.16} />
          </mesh>
          <PulseRing width={Math.max(0.16, width * p.r)} seed={i} />
          <HexColumns width={width} index={i} />
          {i < pots.length - 1 ? (
            <ShortCascade
              width={width * 0.46}
              drop={Math.max(0.11, drop * (0.18 + i * 0.035))}
              run={Math.max(0.18, run * 0.18)}
              y={-0.03}
              z={width * 0.25}
            />
          ) : null}
        </group>
      ))}
    </group>
  );
}

function AkakaFalls({ drop, run, width }: { drop: number; run: number; width: number }) {
  const w = width * 1.04;
  return (
    <group>
      <TallGorge drop={drop} run={run} width={w * 2.5} sheer />
      <WaterSheet drop={drop} run={run} width={w} strands={3} opacity={0.58} narrow />
      <FlowDashes drop={drop} run={run} width={w} count={8} speed={0.39} />
      <ImpactPool drop={drop} run={run} width={w * 1.25} mist={1.45} compact />
    </group>
  );
}

function UmaumaFalls({ drop, run, width }: { drop: number; run: number; width: number }) {
  const stages = 3;
  const sd = drop / stages;
  const sr = run / stages;
  const widths = [1.15, 0.92, 1.04];

  return (
    <group>
      {Array.from({ length: stages }, (_, i) => {
        const stageW = width * widths[i]!;
        const y = -i * sd;
        const z = i * sr;
        return (
          <group key={i}>
            <BasaltFace drop={sd} run={sr} width={stageW * 1.8} y={y} z={z} color={i % 2 ? "#303832" : "#28302d"} />
            <WaterSheet drop={sd} run={sr} width={stageW} strands={4} opacity={0.68} y={y} z={z} />
            <FlowDashes drop={sd} run={sr} width={stageW} count={5} speed={0.32 + i * 0.025} y={y} z={z} />
            <TerracePool y={y - sd} z={z + sr} width={stageW * 1.25} seed={i + 4} />
          </group>
        );
      })}
      <MistAt y={-drop + 0.1} z={run + 0.04} width={width} amount={0.7} />
    </group>
  );
}

function WaipioHorsetail({ drop, run, width }: { drop: number; run: number; width: number }) {
  const w = width * 0.78;
  return (
    <group>
      <TallGorge drop={drop} run={run} width={width * 4.2} />
      <WaterSheet drop={drop} run={run} width={w} strands={2} opacity={0.5} narrow />
      <FlowDashes drop={drop} run={run} width={w} count={6} speed={0.3} sway={0.035} />
      <ImpactPool drop={drop} run={run} width={width * 0.95} mist={0.9} compact />
    </group>
  );
}

function WailukuCascade({
  drop,
  run,
  width,
  stages,
  broad = false,
}: {
  drop: number;
  run: number;
  width: number;
  stages: number;
  broad?: boolean;
}) {
  const sd = drop / stages;
  const sr = run / stages;
  return (
    <group>
      <BasaltSlot drop={drop} run={run} width={width * (broad ? 2.1 : 1.75)} />
      {Array.from({ length: stages }, (_, i) => {
        const scale = broad ? 1 - i * 0.09 : 0.82 + i * 0.08;
        return (
          <group key={i}>
            <WaterSheet drop={sd} run={sr} width={width * scale} strands={broad ? 4 : 3} opacity={0.7} y={-i * sd} z={i * sr} />
            <FlowDashes drop={sd} run={sr} width={width * scale} count={broad ? 5 : 4} speed={0.34} y={-i * sd} z={i * sr} />
            {i < stages - 1 ? <TerracePool y={-(i + 1) * sd} z={(i + 1) * sr} width={width * 0.72} seed={i + 12} /> : null}
          </group>
        );
      })}
      <ImpactPool drop={drop} run={run} width={width} mist={0.72} compact />
    </group>
  );
}

function SacredThread({ profile, drop, run, width }: { profile: FallProfile; drop: number; run: number; width: number }) {
  const n = Number(profile.slice(-1)) || 1;
  const strands = [1, 2, 1, 3, 2, 1, 2][n - 1] ?? 1;
  const stages = [2, 1, 3, 2, 2, 3, 1][n - 1] ?? 2;
  const lateral = [-0.08, 0.06, -0.03, 0.1, -0.09, 0.04, 0][n - 1] ?? 0;
  const sd = drop / stages;
  const sr = run / stages;
  const w = width * (0.38 + strands * 0.08);

  return (
    <group position={[lateral, 0, 0]}>
      <BasaltSlot drop={drop} run={run} width={w * 1.8} tight />
      {Array.from({ length: stages }, (_, i) => (
        <group key={i}>
          <WaterSheet drop={sd} run={sr} width={w * (1 - i * 0.07)} strands={strands} opacity={0.58} narrow y={-i * sd} z={i * sr} />
          <FlowDashes drop={sd} run={sr} width={w} count={Math.max(2, strands + 1)} speed={0.28 + n * 0.008} sway={0.018} y={-i * sd} z={i * sr} />
          {i < stages - 1 ? <TerracePool y={-(i + 1) * sd} z={(i + 1) * sr} width={w * 0.64} seed={20 + n + i} /> : null}
        </group>
      ))}
      <ImpactPool drop={drop} run={run} width={w * 0.72} mist={0.25} compact tiny />
    </group>
  );
}

function WaterSheet({
  drop,
  run,
  width,
  strands,
  opacity,
  narrow = false,
  y = 0,
  z = 0,
}: {
  drop: number;
  run: number;
  width: number;
  strands: number;
  opacity: number;
  narrow?: boolean;
  y?: number;
  z?: number;
}) {
  const { len, pitch } = sheetPose(drop, run);
  const layout = useMemo(
    () =>
      Array.from({ length: strands }, (_, i) => {
        const centered = strands === 1 ? 0 : i / (strands - 1) - 0.5;
        return {
          x: centered * width * (narrow ? 0.42 : 0.68),
          w: width * (narrow ? 0.36 : 0.3 + (i % 2) * 0.07),
          len: 0.88 + ((i * 17) % 5) * 0.025,
          alpha: opacity * (0.82 + (i % 3) * 0.08),
        };
      }),
    [narrow, opacity, strands, width],
  );

  return (
    <group>
      {layout.map((s, i) => (
        <mesh key={i} position={[s.x, y - drop * s.len * 0.5, z + run * 0.5 + 0.035 + i * 0.005]} rotation={[pitch, 0, 0]}>
          <planeGeometry args={[Math.max(0.025, s.w), len * s.len, 1, 4]} />
          <meshStandardMaterial {...WATER} opacity={s.alpha} />
        </mesh>
      ))}
    </group>
  );
}

function FlowDashes({
  drop,
  run,
  width,
  count,
  speed,
  sway = 0.012,
  y = 0,
  z = 0,
}: {
  drop: number;
  run: number;
  width: number;
  count: number;
  speed: number;
  sway?: number;
  y?: number;
  z?: number;
}) {
  const refs = useRef<(Mesh | null)[]>([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (((i * 0.61803398875) % 1) - 0.5) * width * 0.66,
        phase: (i * 0.193) % 1,
        speed: speed * (0.88 + (i % 3) * 0.09),
      })),
    [count, speed, width],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i]!;
      const p = (s.phase + t * s.speed) % 1;
      m.position.set(s.x + Math.sin(t * 1.1 + i) * width * sway, y - drop * p, z + run * p + 0.062);
      const pulse = Math.sin(Math.PI * p);
      m.scale.set(1, 0.76 + pulse * 0.55, 1);
    });
  });

  return (
    <group>
      {seeds.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          rotation={[-Math.atan2(run, drop), 0, 0]}
        >
          <planeGeometry args={[Math.max(0.014, width * 0.055), Math.max(0.1, Math.hypot(drop, run) * 0.095)]} />
          <meshStandardMaterial {...WATER} opacity={0.95} emissiveIntensity={0.86} />
        </mesh>
      ))}
    </group>
  );
}

function BasaltFace({ drop, run, width, y = 0, z = 0, color = BASALT }: { drop: number; run: number; width: number; y?: number; z?: number; color?: string }) {
  const { len, pitch } = sheetPose(drop, run);
  return (
    <mesh position={[0, y - drop / 2, z + run / 2 - 0.035]} rotation={[pitch, 0, 0]}>
      <planeGeometry args={[width, len * 1.03, 2, 5]} />
      <meshStandardMaterial color={color} roughness={1} metalness={0} side={DoubleSide} />
    </mesh>
  );
}

function BasaltSlot({
  drop,
  run,
  width,
  tight = false,
  low = false,
}: {
  drop: number;
  run: number;
  width: number;
  tight?: boolean;
  low?: boolean;
}) {
  const { len, pitch } = sheetPose(drop, run);
  const faceW = width * (tight ? 1.25 : 1.55);
  const wallW = width * (tight ? 0.95 : 0.78);
  return (
    <group>
      <BasaltFace drop={drop} run={run} width={faceW} color={low ? "#313936" : BASALT} />
      <mesh position={[-faceW * 0.47, -drop / 2, run / 2]} rotation={[pitch, 0.42, 0]}>
        <planeGeometry args={[wallW, len * 1.05, 1, 4]} />
        <meshStandardMaterial color="#1d2321" roughness={1} side={DoubleSide} />
      </mesh>
      <mesh position={[faceW * 0.47, -drop / 2, run / 2]} rotation={[pitch, -0.42, 0]}>
        <planeGeometry args={[wallW, len * 1.05, 1, 4]} />
        <meshStandardMaterial color={BASALT_LIT} roughness={1} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function TallGorge({ drop, run, width, sheer = false }: { drop: number; run: number; width: number; sheer?: boolean }) {
  const { len, pitch } = sheetPose(drop, run);
  return (
    <group>
      <BasaltFace drop={drop} run={run} width={width} color={sheer ? "#28302d" : "#303833"} />
      <mesh position={[-width * 0.45, -drop / 2, run / 2]} rotation={[pitch, sheer ? 0.2 : 0.3, 0]}>
        <planeGeometry args={[width * 0.72, len * 1.04, 2, 5]} />
        <meshStandardMaterial color="#202623" roughness={1} side={DoubleSide} />
      </mesh>
      <mesh position={[width * 0.45, -drop / 2, run / 2]} rotation={[pitch, sheer ? -0.2 : -0.3, 0]}>
        <planeGeometry args={[width * 0.72, len * 1.04, 2, 5]} />
        <meshStandardMaterial color="#39413c" roughness={1} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function CaveMouth({ drop, run, width }: { drop: number; run: number; width: number }) {
  return (
    <mesh position={[0, -drop * 0.76, run * 0.76 - 0.04]} scale={[1.35, 0.72, 0.28]}>
      <sphereGeometry args={[Math.max(0.13, width * 0.46), 10, 7]} />
      <meshStandardMaterial color="#101514" roughness={1} />
    </mesh>
  );
}

function ImpactPool({
  drop,
  run,
  width,
  mist,
  compact = false,
  tiny = false,
}: {
  drop: number;
  run: number;
  width: number;
  mist: number;
  compact?: boolean;
  tiny?: boolean;
}) {
  const radius = Math.max(tiny ? 0.08 : 0.16, width * (compact ? 0.8 : 1.18));
  return (
    <group position={[0, -drop + 0.065, run + 0.05]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 18]} />
        <meshStandardMaterial color="#49a8c1" roughness={0.16} emissive="#123f4e" emissiveIntensity={0.15} />
      </mesh>
      <PulseRing width={radius * 0.72} seed={31} />
      {mist > 0 ? <MistAt y={0.03} z={0} width={radius} amount={mist} /> : null}
    </group>
  );
}

function TerracePool({ y, z, width, seed }: { y: number; z: number; width: number; seed: number }) {
  return (
    <group position={[0, y + 0.04, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.1, width), 16]} />
        <meshStandardMaterial color="#4aa5bd" roughness={0.18} emissive="#123c49" emissiveIntensity={0.13} />
      </mesh>
      <PulseRing width={Math.max(0.08, width * 0.55)} seed={seed} />
    </group>
  );
}

function PulseRing({ width, seed }: { width: number; seed: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.05 + seed) * 0.08;
    ref.current.scale.set(s, s, s);
  });
  return (
    <mesh ref={ref} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[width * 0.44, width, 16]} />
      <meshStandardMaterial {...FOAM} opacity={0.42} />
    </mesh>
  );
}

function MistAt({ y, z, width, amount }: { y: number; z: number; width: number; amount: number }) {
  const refs = useRef<(Mesh | null)[]>([]);
  const count = amount > 1 ? 5 : amount > 0.5 ? 4 : 2;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (t * (0.13 + i * 0.008) + i * 0.21) % 1;
      m.position.x = (i - (count - 1) / 2) * width * 0.28 + Math.sin(t + i) * width * 0.07;
      m.position.y = y + p * 0.19 * amount;
      m.position.z = z + p * 0.1;
      const s = 0.76 + p * 0.4;
      m.scale.set(s, s * 0.72, s);
    });
  });
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }}>
          <sphereGeometry args={[Math.max(0.055, width * 0.24), 7, 5]} />
          <meshStandardMaterial {...FOAM} opacity={0.2 + amount * 0.07} />
        </mesh>
      ))}
    </group>
  );
}

function ShortCascade({ width, drop, run, y, z }: { width: number; drop: number; run: number; y: number; z: number }) {
  return (
    <group position={[0, y, z]}>
      <WaterSheet drop={drop} run={run} width={width} strands={2} opacity={0.64} />
      <FlowDashes drop={drop} run={run} width={width} count={2} speed={0.3} />
    </group>
  );
}

function HexColumns({ width, index }: { width: number; index: number }) {
  const xs = [-0.72, -0.54, 0.54, 0.72];
  return (
    <group>
      {xs.map((x, i) => (
        <mesh key={`${index}-${i}`} position={[x * width, 0.02 + (i % 2) * 0.035, 0]}>
          <cylinderGeometry args={[width * 0.07, width * 0.07, width * (0.35 + (i % 2) * 0.18), 6]} />
          <meshStandardMaterial color={i % 2 ? BASALT_LIT : BASALT} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function RainbowHint({ drop, run, width }: { drop: number; run: number; width: number }) {
  return (
    <group position={[0, -drop + 0.27, run + 0.14]} rotation={[0.22, 0, 0]}>
      {["#ff817a", "#ffd962", "#72d680", "#68aaff"].map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[Math.max(0.18, width * 0.45) + i * 0.018, 0.0055, 4, 14, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function sheetPose(drop: number, run: number) {
  return { len: Math.hypot(drop, run), pitch: -Math.atan2(run, drop) };
}
