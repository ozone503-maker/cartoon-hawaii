import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Mesh } from "three";
import type { Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = {
  color: "#e4fbff",
  emissive: "#77d5ea",
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.74,
  roughness: 0.1,
  metalness: 0,
  side: DoubleSide,
  depthWrite: false,
} as const;

const FOAM = {
  color: "#fbfdff",
  transparent: true,
  opacity: 0.46,
  roughness: 0.28,
  depthWrite: false,
} as const;

export function Waterfall({ fall, points, riverId }: { fall: Fall; points: Vector3[]; riverId: string }) {
  const youngBasalt = riverId === "wailuku" || riverId === "hookelekele";

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

    const prv = points[Math.max(0, best - 1)]!;
    const nxt = points[Math.min(points.length - 1, best + 1)] ?? points[best]!;
    const yaw = Math.atan2(nxt.x - prv.x, nxt.z - prv.z);
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);

    const yLip = terrainY(x, z) + 0.075;
    const wanted = Math.max(youngBasalt ? 0.65 : 0.55, fall.h * (youngBasalt ? 0.9 : 0.72));
    const maxSearch = youngBasalt ? 4.8 : 8;
    let bestY = yLip;
    let bestRun = youngBasalt ? 0.7 : 0.8;

    for (let r = 0.5; r <= maxSearch; r += 0.24) {
      const y = terrainY(x + fx * r, z + fz * r) + 0.055;
      if (y < bestY) {
        bestY = y;
        bestRun = r;
      }
      if (yLip - y >= wanted) {
        bestY = y;
        bestRun = r;
        break;
      }
    }

    const terrainDrop = Math.max(0.35, yLip - bestY);
    const drop = youngBasalt ? Math.max(terrainDrop, fall.h * 0.84) : Math.max(0.5, terrainDrop);
    const run = youngBasalt ? Math.min(bestRun, Math.max(0.62, drop * 0.42)) : bestRun;

    return { x, z, y: yLip, yaw, run, drop, w: Math.max(0.14, fall.w), kind: fall.kind };
  }, [fall, points, youngBasalt]);

  return (
    <group position={[pose.x, pose.y, pose.z]} rotation={[0, pose.yaw, 0]}>
      {pose.kind === "pots" ? (
        <PotsFall w={pose.w} run={pose.run} drop={pose.drop} basalt={youngBasalt} />
      ) : pose.kind === "cascade" || pose.kind === "thread" ? (
        <CascadeFall
          drop={pose.drop}
          run={pose.run}
          w={pose.w}
          thread={pose.kind === "thread"}
          basalt={youngBasalt}
        />
      ) : (
        <PlungeFall
          drop={pose.drop}
          run={pose.run}
          w={pose.w}
          rainbow={pose.kind === "rainbow"}
          basalt={youngBasalt}
        />
      )}
    </group>
  );
}

function sheetPose(drop: number, run: number) {
  const len = Math.hypot(drop, run);
  const pitch = -Math.atan2(run, drop);
  return { len, pitch };
}

function PlungeFall({
  drop,
  run,
  w,
  rainbow,
  basalt,
}: {
  drop: number;
  run: number;
  w: number;
  rainbow?: boolean;
  basalt?: boolean;
}) {
  const width = rainbow ? w * (basalt ? 1.6 : 1.85) : w * (basalt ? 1.08 : 1.28);
  const { len, pitch } = sheetPose(drop, run);
  const strips = rainbow ? [-0.34, -0.1, 0.14, 0.36] : [-0.24, 0, 0.24];

  return (
    <group>
      <BasaltGorge drop={drop} run={run} width={width} slot={basalt} />

      {strips.map((x, i) => (
        <mesh
          key={i}
          position={[x * width, -drop / 2, run / 2 + 0.035 + i * 0.007]}
          rotation={[pitch, 0, 0]}
        >
          <planeGeometry args={[width * (i % 2 === 0 ? 0.28 : 0.2), len * (0.96 - i * 0.03), 1, 5]} />
          <meshStandardMaterial {...WATER} opacity={0.5 + (i % 2) * 0.14} />
        </mesh>
      ))}

      <mesh position={[0, -drop * 0.51, run * 0.51 + 0.055]} rotation={[pitch, 0, 0]}>
        <planeGeometry args={[Math.max(0.035, width * 0.16), len * 0.92, 1, 4]} />
        <meshStandardMaterial {...WATER} opacity={0.86} emissiveIntensity={0.72} />
      </mesh>

      <FlowDashes drop={drop} run={run} width={width} count={rainbow ? 10 : 8} />
      <ImpactZone drop={drop} run={run} w={width} compact={basalt} />
      {rainbow ? <RainbowHint drop={drop} run={run} /> : null}
    </group>
  );
}

function CascadeFall({
  drop,
  run,
  w,
  thread,
  basalt,
}: {
  drop: number;
  run: number;
  w: number;
  thread?: boolean;
  basalt?: boolean;
}) {
  const stages = thread ? 2 : 3;
  const width = thread ? w * (basalt ? 0.46 : 0.55) : w * (basalt ? 1.05 : 1.35);
  const sd = drop / stages;
  const sr = run / stages;

  return (
    <group>
      {Array.from({ length: stages }, (_, i) => {
        const { len, pitch } = sheetPose(sd, sr);
        const y0 = -i * sd;
        const z0 = i * sr;
        return (
          <group key={i}>
            <BasaltGorge drop={sd} run={sr} width={width * 0.96} y={y0} z={z0} slot={basalt} subtle={i > 0} />
            <mesh position={[0, y0 - sd / 2, z0 + sr / 2 + 0.028]} rotation={[pitch, 0, 0]}>
              <planeGeometry args={[width * (1 - i * 0.07), len * 0.98, 1, 3]} />
              <meshStandardMaterial {...WATER} opacity={thread ? 0.62 : 0.7} />
            </mesh>
            <FlowDashes
              drop={sd}
              run={sr}
              width={width * (1 - i * 0.07)}
              count={thread ? 3 : 5}
              offsetY={y0}
              offsetZ={z0}
            />
          </group>
        );
      })}
      <ImpactZone drop={drop} run={run} w={width} small={thread} compact={basalt} />
    </group>
  );
}

function FlowDashes({
  drop,
  run,
  width,
  count,
  offsetY = 0,
  offsetZ = 0,
}: {
  drop: number;
  run: number;
  width: number;
  count: number;
  offsetY?: number;
  offsetZ?: number;
}) {
  const refs = useRef<(Mesh | null)[]>([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (((i * 0.61803398875) % 1) - 0.5) * width * 0.68,
        phase: (i * 0.19) % 1,
        speed: 0.3 + (i % 3) * 0.038,
      })),
    [count, width],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i]!;
      const p = (s.phase + t * s.speed) % 1;
      m.position.set(
        s.x + Math.sin(t * 1.15 + i) * width * 0.012,
        offsetY - drop * p,
        offsetZ + run * p + 0.058,
      );
      const fade = Math.sin(Math.PI * p);
      m.scale.set(1, 0.72 + fade * 0.62, 1);
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
          <planeGeometry args={[Math.max(0.014, width * 0.055), Math.max(0.1, Math.hypot(drop, run) * 0.105)]} />
          <meshStandardMaterial {...WATER} opacity={0.95} emissiveIntensity={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function BasaltGorge({
  drop,
  run,
  width,
  y = 0,
  z = 0,
  slot = false,
  subtle = false,
}: {
  drop: number;
  run: number;
  width: number;
  y?: number;
  z?: number;
  slot?: boolean;
  subtle?: boolean;
}) {
  const { len, pitch } = sheetPose(drop, run);
  if (drop < 0.42) return null;

  const faceW = width * (slot ? 1.5 : 1.72);
  const wallW = width * (slot ? 0.9 : 0.66);
  const rock = subtle ? "#343a37" : "#272d2b";

  return (
    <group>
      <mesh position={[0, y - drop / 2, z + run / 2 - 0.04]} rotation={[pitch, 0, 0]}>
        <planeGeometry args={[faceW, len * 1.03, 2, 5]} />
        <meshStandardMaterial color={rock} roughness={1} metalness={0} side={DoubleSide} />
      </mesh>

      {slot ? (
        <>
          <mesh
            position={[-faceW * 0.43, y - drop / 2, z + run / 2 - 0.015]}
            rotation={[pitch, 0.34, 0]}
          >
            <planeGeometry args={[wallW, len * 1.04, 1, 4]} />
            <meshStandardMaterial color="#202624" roughness={1} metalness={0} side={DoubleSide} />
          </mesh>
          <mesh
            position={[faceW * 0.43, y - drop / 2, z + run / 2 - 0.015]}
            rotation={[pitch, -0.34, 0]}
          >
            <planeGeometry args={[wallW, len * 1.04, 1, 4]} />
            <meshStandardMaterial color="#2c3330" roughness={1} metalness={0} side={DoubleSide} />
          </mesh>
          <mesh position={[0, y - drop * 0.55, z + run * 0.53 - 0.02]} rotation={[pitch, 0, 0]}>
            <planeGeometry args={[faceW * 0.88, Math.max(0.06, len * 0.045)]} />
            <meshStandardMaterial color="#454c47" roughness={1} side={DoubleSide} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function ImpactZone({
  drop,
  run,
  w,
  small = false,
  compact = false,
}: {
  drop: number;
  run: number;
  w: number;
  small?: boolean;
  compact?: boolean;
}) {
  const ring = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.075;
    ring.current.scale.set(s, s, s);
  });

  const poolScale = compact ? 0.82 : 1;

  return (
    <group position={[0, -drop + 0.065, run + 0.055]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.18, w * (small ? 0.8 : 1.18) * poolScale), 18]} />
        <meshStandardMaterial color="#4daac3" roughness={0.16} emissive="#164958" emissiveIntensity={0.14} />
      </mesh>
      <mesh ref={ring} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(0.07, w * 0.3), Math.max(0.13, w * 0.62), 18]} />
        <meshStandardMaterial {...FOAM} />
      </mesh>
      {!small ? <Mist w={w * (compact ? 0.82 : 1)} /> : null}
    </group>
  );
}

function Mist({ w }: { w: number }) {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (t * 0.15 + i * 0.23) % 1;
      m.position.x = (i - 1.5) * w * 0.22 + Math.sin(t + i) * w * 0.05;
      m.position.y = 0.05 + p * 0.17;
      m.position.z = p * 0.09;
      const s = 0.78 + p * 0.34;
      m.scale.set(s, s * 0.7, s);
    });
  });
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
        >
          <sphereGeometry args={[Math.max(0.065, w * 0.25), 7, 5]} />
          <meshStandardMaterial {...FOAM} opacity={0.23} />
        </mesh>
      ))}
    </group>
  );
}

function RainbowHint({ drop, run }: { drop: number; run: number }) {
  return (
    <group position={[0, -drop + 0.27, run + 0.15]} rotation={[0.25, 0, 0]}>
      {["#ff7b73", "#ffd95a", "#70d17b", "#63a5ff"].map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[0.23 + i * 0.02, 0.006, 4, 14, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function PotsFall({
  w,
  run,
  drop,
  basalt,
}: {
  w: number;
  run: number;
  drop: number;
  basalt?: boolean;
}) {
  const pools = 3;
  const channelW = basalt ? w * 0.82 : w;

  return (
    <group>
      {basalt ? <BasaltGorge drop={Math.max(drop, 0.5)} run={run} width={channelW} slot subtle /> : null}
      {Array.from({ length: pools }, (_, i) => {
        const p = i / (pools - 1);
        return (
          <group key={i} position={[0, -drop * p + 0.04, run * p]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[channelW * (0.42 + i * 0.05), 16]} />
              <meshStandardMaterial color="#3f91a8" roughness={0.18} emissive="#103d49" emissiveIntensity={0.14} />
            </mesh>
            <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[channelW * 0.14, channelW * 0.31, 14]} />
              <meshStandardMaterial {...FOAM} opacity={0.34} />
            </mesh>
          </group>
        );
      })}
      <FlowDashes drop={drop} run={run} width={channelW * 0.42} count={5} />
    </group>
  );
}
