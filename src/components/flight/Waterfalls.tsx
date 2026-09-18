import { useMemo } from "react";
import { DoubleSide } from "three";
import type { Vector3 } from "three";
import type { Fall, FallProfile } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

/** Thin white/cyan sheet — phone-safe (no toon, no transmission). */
const WATER = {
  color: "#dff6ff",
  emissive: "#7ecfe0",
  emissiveIntensity: 0.42,
  transparent: true,
  opacity: 0.72,
  roughness: 0.14,
  metalness: 0,
  side: DoubleSide,
  depthWrite: false,
} as const;

const FOAM = {
  color: "#f7fcff",
  transparent: true,
  opacity: 0.38,
  roughness: 0.35,
  depthWrite: false,
} as const;

const ROCK = "#2a322e";
const ROCK_LIT = "#3a433e";

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
  const lip = terrainY(x, z) + 0.07;

  const isWailuku = riverId === "wailuku" || riverId === "hookelekele";
  const isTall = fall.profile === "akaka" || fall.profile === "waipio-horsetail";
  const maxSearch = isTall ? 3.0 : isWailuku ? 4.2 : 5.5;
  const target = isTall ? fall.h * 0.96 : isWailuku ? fall.h * 0.86 : fall.h * 0.76;
  let bestY = lip;
  let bestRun = 0.55;

  for (let r = 0.4; r <= maxSearch; r += 0.2) {
    const y = terrainY(x + fx * r, z + fz * r) + 0.05;
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
      run = Math.min(run, Math.max(0.22, drop * 0.12));
      break;
    case "waipio-horsetail":
      drop = Math.max(drop, fall.h * 1.05);
      run = Math.min(run, Math.max(0.26, drop * 0.16));
      break;
    case "rainbow":
      drop = Math.max(drop, fall.h * 0.92);
      run = Math.min(run, Math.max(0.34, drop * 0.28));
      break;
    case "umauma":
      drop = Math.max(drop, fall.h * 0.9);
      run = Math.max(run, drop * 0.75);
      break;
    case "peepee":
      drop = Math.max(0.4, Math.min(drop, fall.h * 1.3));
      run = Math.max(1.05, run);
      break;
    default:
      if (isWailuku) run = Math.min(run, Math.max(0.5, drop * 0.48));
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
  const w = width * 1.95;
  return (
    <group>
      <RockFace drop={drop} run={run} width={w * 1.35} />
      <mesh position={[0, -drop * 0.72, run * 0.72]} scale={[1.3, 0.7, 0.3]}>
        <sphereGeometry args={[Math.max(0.12, w * 0.42), 8, 6]} />
        <meshStandardMaterial color="#0e1210" roughness={1} />
      </mesh>
      <WaterSheet drop={drop} run={run} width={w} strands={4} opacity={0.68} />
      <Pool drop={drop} run={run} width={w * 1.15} mist />
      <RainbowHint drop={drop} run={run} width={w} />
    </group>
  );
}

function PeepeeBoilingPots({ drop, run, width }: { drop: number; run: number; width: number }) {
  const pots = [
    { z: 0.06, y: -0.02, r: 0.5 },
    { z: run * 0.35, y: -drop * 0.25, r: 0.62 },
    { z: run * 0.7, y: -drop * 0.58, r: 0.58 },
    { z: run, y: -drop, r: 0.68 },
  ];
  return (
    <group>
      <RockFace drop={Math.max(0.45, drop)} run={run} width={width * 1.7} color="#313936" />
      {pots.map((p, i) => (
        <group key={i} position={[0, p.y, p.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[Math.max(0.16, width * p.r), 14]} />
            <meshStandardMaterial color="#3f98ae" roughness={0.2} emissive="#123844" emissiveIntensity={0.18} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[width * p.r * 0.45, width * p.r, 12]} />
            <meshStandardMaterial {...FOAM} />
          </mesh>
          {[-0.55, 0.55].map((sx, j) => (
            <mesh key={j} position={[sx * width * 0.55, 0.03, 0]}>
              <cylinderGeometry args={[width * 0.055, width * 0.055, width * 0.28, 6]} />
              <meshStandardMaterial color={j ? ROCK_LIT : ROCK} roughness={1} />
            </mesh>
          ))}
          {i < pots.length - 1 ? (
            <WaterSheet
              drop={Math.max(0.1, drop * 0.2)}
              run={Math.max(0.16, run * 0.16)}
              width={width * 0.42}
              strands={2}
              opacity={0.62}
              y={-0.02}
              z={width * 0.2}
            />
          ) : null}
        </group>
      ))}
    </group>
  );
}

function AkakaFalls({ drop, run, width }: { drop: number; run: number; width: number }) {
  const w = width * 0.95;
  return (
    <group>
      <GorgeWalls drop={drop} run={run} width={w * 2.2} sheer />
      <WaterSheet drop={drop} run={run} width={w} strands={2} opacity={0.6} narrow />
      <Pool drop={drop} run={run} width={w * 1.1} mist compact />
    </group>
  );
}

function UmaumaFalls({ drop, run, width }: { drop: number; run: number; width: number }) {
  const stages = 3;
  const sd = drop / stages;
  const sr = run / stages;
  const widths = [1.12, 0.9, 1.02];
  return (
    <group>
      {Array.from({ length: stages }, (_, i) => {
        const stageW = width * widths[i]!;
        return (
          <group key={i}>
            <RockFace drop={sd} run={sr} width={stageW * 1.6} y={-i * sd} z={i * sr} color={i % 2 ? ROCK_LIT : ROCK} />
            <WaterSheet drop={sd} run={sr} width={stageW} strands={3} opacity={0.66} y={-i * sd} z={i * sr} />
            <mesh position={[0, -(i + 1) * sd + 0.04, (i + 1) * sr]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[Math.max(0.1, stageW * 0.9), 12]} />
              <meshStandardMaterial color="#3f96ac" roughness={0.22} emissive="#123844" emissiveIntensity={0.14} />
            </mesh>
          </group>
        );
      })}
      <MistBlob y={-drop + 0.08} z={run} r={Math.max(0.12, width * 0.55)} />
    </group>
  );
}

function WaipioHorsetail({ drop, run, width }: { drop: number; run: number; width: number }) {
  const w = width * 0.72;
  return (
    <group>
      <GorgeWalls drop={drop} run={run} width={width * 3.6} />
      <WaterSheet drop={drop} run={run} width={w} strands={1} opacity={0.52} narrow />
      <Pool drop={drop} run={run} width={width * 0.9} mist compact />
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
      <RockFace drop={drop} run={run} width={width * (broad ? 1.9 : 1.55)} />
      {Array.from({ length: stages }, (_, i) => {
        const scale = broad ? 1 - i * 0.08 : 0.85 + i * 0.07;
        return (
          <WaterSheet
            key={i}
            drop={sd}
            run={sr}
            width={width * scale}
            strands={broad ? 3 : 2}
            opacity={0.68}
            y={-i * sd}
            z={i * sr}
          />
        );
      })}
      <Pool drop={drop} run={run} width={width} mist compact />
    </group>
  );
}

function SacredThread({ profile, drop, run, width }: { profile: FallProfile; drop: number; run: number; width: number }) {
  const n = Number(profile.slice(-1)) || 1;
  const strands = [1, 2, 1, 2, 2, 1, 2][n - 1] ?? 1;
  const stages = [2, 1, 3, 2, 2, 3, 1][n - 1] ?? 2;
  const lateral = [-0.07, 0.05, -0.03, 0.08, -0.08, 0.04, 0][n - 1] ?? 0;
  const sd = drop / stages;
  const sr = run / stages;
  const w = width * (0.36 + strands * 0.08);
  return (
    <group position={[lateral, 0, 0]}>
      <RockFace drop={drop} run={run} width={w * 1.5} />
      {Array.from({ length: stages }, (_, i) => (
        <WaterSheet
          key={i}
          drop={sd}
          run={sr}
          width={w * (1 - i * 0.06)}
          strands={strands}
          opacity={0.58}
          narrow
          y={-i * sd}
          z={i * sr}
        />
      ))}
      <Pool drop={drop} run={run} width={w * 0.7} compact tiny />
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
          x: centered * width * (narrow ? 0.38 : 0.62),
          w: width * (narrow ? 0.34 : 0.28 + (i % 2) * 0.06),
          len: 0.9 + ((i * 17) % 5) * 0.02,
          alpha: opacity * (0.85 + (i % 3) * 0.06),
        };
      }),
    [narrow, opacity, strands, width],
  );

  return (
    <group>
      {layout.map((s, i) => (
        <mesh key={i} position={[s.x, y - drop * s.len * 0.5, z + run * 0.5 + 0.03]} rotation={[pitch, 0, 0]}>
          <planeGeometry args={[Math.max(0.02, s.w), len * s.len]} />
          <meshStandardMaterial {...WATER} opacity={s.alpha} />
        </mesh>
      ))}
    </group>
  );
}

function RockFace({
  drop,
  run,
  width,
  y = 0,
  z = 0,
  color = ROCK,
}: {
  drop: number;
  run: number;
  width: number;
  y?: number;
  z?: number;
  color?: string;
}) {
  const { len, pitch } = sheetPose(drop, run);
  return (
    <mesh position={[0, y - drop / 2, z + run / 2 - 0.03]} rotation={[pitch, 0, 0]}>
      <planeGeometry args={[width, len]} />
      <meshStandardMaterial color={color} roughness={1} side={DoubleSide} />
    </mesh>
  );
}

function GorgeWalls({ drop, run, width, sheer = false }: { drop: number; run: number; width: number; sheer?: boolean }) {
  const { len, pitch } = sheetPose(drop, run);
  return (
    <group>
      <RockFace drop={drop} run={run} width={width} color={sheer ? "#28302d" : "#303833"} />
      <mesh position={[-width * 0.42, -drop / 2, run / 2]} rotation={[pitch, sheer ? 0.18 : 0.28, 0]}>
        <planeGeometry args={[width * 0.65, len]} />
        <meshStandardMaterial color="#202623" roughness={1} side={DoubleSide} />
      </mesh>
      <mesh position={[width * 0.42, -drop / 2, run / 2]} rotation={[pitch, sheer ? -0.18 : -0.28, 0]}>
        <planeGeometry args={[width * 0.65, len]} />
        <meshStandardMaterial color={ROCK_LIT} roughness={1} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function Pool({
  drop,
  run,
  width,
  mist = false,
  compact = false,
  tiny = false,
}: {
  drop: number;
  run: number;
  width: number;
  mist?: boolean;
  compact?: boolean;
  tiny?: boolean;
}) {
  const radius = Math.max(tiny ? 0.08 : 0.14, width * (compact ? 0.75 : 1.1));
  return (
    <group position={[0, -drop + 0.05, run + 0.04]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 14]} />
        <meshStandardMaterial color="#3f96ac" roughness={0.2} emissive="#123844" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.45, radius, 12]} />
        <meshStandardMaterial {...FOAM} />
      </mesh>
      {mist ? <MistBlob y={0.04} z={0} r={radius * 0.7} /> : null}
    </group>
  );
}

function MistBlob({ y, z, r }: { y: number; z: number; r: number }) {
  return (
    <mesh position={[0, y, z]}>
      <sphereGeometry args={[Math.max(0.06, r), 6, 5]} />
      <meshStandardMaterial {...FOAM} opacity={0.22} />
    </mesh>
  );
}

function RainbowHint({ drop, run, width }: { drop: number; run: number; width: number }) {
  return (
    <group position={[0, -drop + 0.26, run + 0.12]} rotation={[0.2, 0, 0]}>
      {["#ff817a", "#ffd962", "#72d680", "#68aaff"].map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[Math.max(0.16, width * 0.42) + i * 0.016, 0.005, 4, 12, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.14} />
        </mesh>
      ))}
    </group>
  );
}

/** Plane faces +Z; tilt so sheet rides the hillside into the pool. */
function sheetPose(drop: number, run: number) {
  return { len: Math.hypot(drop, run), pitch: -Math.atan2(run, drop) };
}
