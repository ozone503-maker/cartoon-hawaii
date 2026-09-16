import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Mesh } from "three";
import type { Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const WATER = {
  color: "#dff8ff",
  emissive: "#79d7ef",
  emissiveIntensity: 0.58,
  transparent: true,
  opacity: 0.72,
  roughness: 0.12,
  metalness: 0.01,
  side: DoubleSide,
  depthWrite: false,
} as const;

const FOAM = {
  color: "#f7fcff",
  transparent: true,
  opacity: 0.46,
  roughness: 0.28,
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

    const prv = points[Math.max(0, best - 1)]!;
    const nxt = points[Math.min(points.length - 1, best + 1)] ?? points[best]!;
    const yaw = Math.atan2(nxt.x - prv.x, nxt.z - prv.z);
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);

    const yLip = terrainY(x, z) + 0.08;
    let run = 0.8;
    let bestY = yLip;
    let bestRun = run;
    const wanted = Math.max(0.55, fall.h * 0.72);

    for (let r = 0.6; r <= 8; r += 0.28) {
      const y = terrainY(x + fx * r, z + fz * r) + 0.06;
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

    run = bestRun;
    const drop = Math.max(0.5, yLip - bestY);
    return { x, z, y: yLip, yaw, run, drop, w: Math.max(0.14, fall.w), kind: fall.kind };
  }, [fall, points]);

  return (
    <group position={[pose.x, pose.y, pose.z]} rotation={[0, pose.yaw, 0]}>
      {pose.kind === "pots" ? (
        <PotsFall w={pose.w} run={pose.run} drop={pose.drop} />
      ) : pose.kind === "cascade" || pose.kind === "thread" ? (
        <CascadeFall drop={pose.drop} run={pose.run} w={pose.w} thread={pose.kind === "thread"} />
      ) : (
        <PlungeFall drop={pose.drop} run={pose.run} w={pose.w} rainbow={pose.kind === "rainbow"} />
      )}
    </group>
  );
}

function sheetPose(drop: number, run: number) {
  const len = Math.hypot(drop, run);
  const pitch = -Math.atan2(run, drop);
  return { len, pitch };
}

function PlungeFall({ drop, run, w, rainbow }: { drop: number; run: number; w: number; rainbow?: boolean }) {
  const width = rainbow ? w * 1.9 : w * 1.3;
  const { len, pitch } = sheetPose(drop, run);
  const strips = rainbow ? [-0.34, -0.08, 0.18, 0.37] : [-0.25, 0, 0.26];

  return (
    <group>
      <RockFace drop={drop} run={run} width={width} />
      {strips.map((x, i) => (
        <mesh
          key={i}
          position={[x * width, -drop / 2, run / 2 + 0.025 + i * 0.008]}
          rotation={[pitch, 0, 0]}
        >
          <planeGeometry args={[width * (i % 2 === 0 ? 0.28 : 0.2), len * (0.94 - i * 0.035), 1, 5]} />
          <meshStandardMaterial {...WATER} opacity={0.48 + (i % 2) * 0.16} />
        </mesh>
      ))}
      <FlowDashes drop={drop} run={run} width={width} count={rainbow ? 10 : 7} />
      <ImpactZone drop={drop} run={run} w={width} />
      {rainbow ? <RainbowHint drop={drop} run={run} /> : null}
    </group>
  );
}

function CascadeFall({ drop, run, w, thread }: { drop: number; run: number; w: number; thread?: boolean }) {
  const stages = thread ? 2 : 3;
  const width = thread ? w * 0.55 : w * 1.35;
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
            {!thread ? <RockFace drop={sd} run={sr} width={width * 0.95} y={y0} z={z0} subtle /> : null}
            <mesh position={[0, y0 - sd / 2, z0 + sr / 2 + 0.02]} rotation={[pitch, 0, 0]}>
              <planeGeometry args={[width * (1 - i * 0.08), len * 0.96, 1, 3]} />
              <meshStandardMaterial {...WATER} opacity={thread ? 0.58 : 0.66} />
            </mesh>
            <FlowDashes
              drop={sd}
              run={sr}
              width={width * (1 - i * 0.08)}
              count={thread ? 2 : 4}
              offsetY={y0}
              offsetZ={z0}
            />
          </group>
        );
      })}
      <ImpactZone drop={drop} run={run} w={width} small={thread} />
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
        x: (((i * 0.61803398875) % 1) - 0.5) * width * 0.72,
        phase: (i * 0.19) % 1,
        speed: 0.28 + (i % 3) * 0.035,
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
        s.x + Math.sin(t * 1.2 + i) * width * 0.015,
        offsetY - drop * p,
        offsetZ + run * p + 0.045,
      );
      const fade = Math.sin(Math.PI * p);
      m.scale.set(1, 0.75 + fade * 0.55, 1);
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
          <planeGeometry args={[Math.max(0.018, width * 0.065), Math.max(0.11, Math.hypot(drop, run) * 0.11)]} />
          <meshStandardMaterial {...WATER} opacity={0.92} emissiveIntensity={0.82} />
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
  subtle = false,
}: {
  drop: number;
  run: number;
  width: number;
  y?: number;
  z?: number;
  subtle?: boolean;
}) {
  const { len, pitch } = sheetPose(drop, run);
  if (drop < 0.6) return null;
  return (
    <mesh position={[0, y - drop / 2, z + run / 2 - 0.035]} rotation={[pitch, 0, 0]}>
      <planeGeometry args={[width * (subtle ? 1.45 : 1.75), len * 1.02, 2, 4]} />
      <meshStandardMaterial
        color={subtle ? "#343a36" : "#2d3533"}
        roughness={1}
        metalness={0}
        side={DoubleSide}
      />
    </mesh>
  );
}

function ImpactZone({ drop, run, w, small = false }: { drop: number; run: number; w: number; small?: boolean }) {
  const ring = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.08;
    ring.current.scale.set(s, s, s);
  });

  return (
    <group position={[0, -drop + 0.07, run + 0.06]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(0.22, w * (small ? 0.95 : 1.35)), 18]} />
        <meshStandardMaterial color="#1d6f8d" roughness={0.22} emissive="#0d475d" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={ring} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(0.08, w * 0.34), Math.max(0.15, w * 0.72), 18]} />
        <meshStandardMaterial {...FOAM} />
      </mesh>
      {!small ? <Mist w={w} /> : null}
    </group>
  );
}

function Mist({ w }: { w: number }) {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (t * 0.16 + i * 0.23) % 1;
      m.position.x = (i - 1.5) * w * 0.24 + Math.sin(t + i) * w * 0.06;
      m.position.y = 0.06 + p * 0.18;
      m.position.z = p * 0.1;
      const s = 0.8 + p * 0.35;
      m.scale.set(s, s * 0.72, s);
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
          <sphereGeometry args={[Math.max(0.07, w * 0.28), 7, 5]} />
          <meshStandardMaterial {...FOAM} opacity={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function RainbowHint({ drop, run }: { drop: number; run: number }) {
  return (
    <group position={[0, -drop + 0.28, run + 0.16]} rotation={[0.25, 0, 0]}>
      {["#ff7b73", "#ffd95a", "#70d17b", "#63a5ff"].map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[0.24 + i * 0.021, 0.006, 4, 14, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.17} />
        </mesh>
      ))}
    </group>
  );
}

function PotsFall({ w, run, drop }: { w: number; run: number; drop: number }) {
  const pools = 3;
  return (
    <group>
      {Array.from({ length: pools }, (_, i) => {
        const p = i / (pools - 1);
        return (
          <group key={i} position={[0, -drop * p + 0.04, run * p]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[w * (0.48 + i * 0.06), 16]} />
              <meshStandardMaterial color="#17566f" roughness={0.22} emissive="#0a3446" emissiveIntensity={0.26} />
            </mesh>
            <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[w * 0.16, w * 0.34, 14]} />
              <meshStandardMaterial {...FOAM} opacity={0.34} />
            </mesh>
          </group>
        );
      })}
      <FlowDashes drop={drop} run={run} width={w * 0.45} count={4} />
    </group>
  );
}
