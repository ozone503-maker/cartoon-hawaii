import { useMemo } from "react";
import { DoubleSide } from "three";
import {
  EAST_RIFT_2018,
  HALEMAUMAU_WORLD,
  KILAUEA_IKI_WORLD,
  KILAUEA_RX,
  KILAUEA_RZ,
  KILAUEA_WORLD,
  kilaueaSurfaceY,
} from "@/lib/hawaii/kilauea";
import { hu, latLonToWorld, terrainY, WORLD_SCALE, wu } from "@/lib/hawaii/world";

/**
 * Kīlauea scenery — terrain bowl does the nested pit; props are restrained
 * (no glowing pancake / oval disc over the desert).
 */
export function Caldera() {
  return (
    <group>
      <HalemaumauSteam />
      <KilaueaIki />
      <EastRift2018 />
      <VolcanoVillageGrove />
      <RimOhiaHints />
    </group>
  );
}

/** Tiny warm accent deep in Halemaʻumaʻu + steam — not a caldera-sized glow disc. */
function HalemaumauSteam() {
  const pit = HALEMAUMAU_WORLD;
  const y = kilaueaSurfaceY(pit.x, pit.z);
  const cal = KILAUEA_WORLD;
  const rimY = kilaueaSurfaceY(cal.x + KILAUEA_RX * 0.55, cal.z);
  return (
    <group>
      <group position={[pit.x, y, pit.z]} scale={WORLD_SCALE}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry args={[0.28, 12]} />
          <meshStandardMaterial color="#1a1210" roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[0.12, 10]} />
          <meshStandardMaterial color="#8a3a18" emissive="#c45a22" emissiveIntensity={0.35} roughness={0.7} />
        </mesh>
        {[0.15, 0.32, 0.48].map((h, i) => (
          <mesh key={i} position={[(i - 1) * 0.08, 0.12 + h, i * 0.04]}>
            <sphereGeometry args={[0.14 + i * 0.04, 6, 5]} />
            <meshStandardMaterial color="#d8dde0" transparent opacity={0.18 - i * 0.03} depthWrite={false} />
          </mesh>
        ))}
        <pointLight color="#ff7a28" intensity={0.55} distance={3.5} position={[0, 0.15, 0]} />
      </group>
      {/* Soft black floor wash inside bowl — thin, sits on surface, not a floating egg */}
      <mesh position={[cal.x, rimY - hu(0.55), cal.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.min(KILAUEA_RX, KILAUEA_RZ) * 0.72, 20]} />
        <meshStandardMaterial color="#1c1814" transparent opacity={0.35} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function KilaueaIki() {
  const p = KILAUEA_IKI_WORLD;
  const y = kilaueaSurfaceY(p.x, p.z);
  return (
    <group position={[p.x, y, p.z]} scale={WORLD_SCALE}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1.35, 1, 0.95]}>
        <circleGeometry args={[1.0, 18]} />
        <meshStandardMaterial color="#2a2420" roughness={0.95} />
      </mesh>
      {/* Thin pali lip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]} scale={[1.35, 1, 0.95]}>
        <ringGeometry args={[0.92, 1.05, 18]} />
        <meshStandardMaterial color="#3a4a32" roughness={1} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function EastRift2018() {
  const segs = useMemo(() => {
    const out: { x: number; y: number; z: number; len: number; yaw: number }[] = [];
    for (let i = 0; i < EAST_RIFT_2018.length - 1; i++) {
      const a = latLonToWorld(EAST_RIFT_2018[i]![0], EAST_RIFT_2018[i]![1]);
      const b = latLonToWorld(EAST_RIFT_2018[i + 1]![0], EAST_RIFT_2018[i + 1]![1]);
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 0.01;
      const x = (a.x + b.x) / 2;
      const z = (a.z + b.z) / 2;
      out.push({
        x,
        y: terrainY(x, z) + hu(0.06),
        z,
        len,
        yaw: Math.atan2(dx, dz),
      });
    }
    return out;
  }, []);

  return (
    <group>
      {segs.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[-Math.PI / 2, 0, -s.yaw]}>
          <planeGeometry args={[wu(0.55) + (i % 2) * wu(0.2), s.len * 1.05]} />
          <meshStandardMaterial color="#12100e" roughness={1} transparent opacity={0.55} depthWrite={false} side={DoubleSide} />
        </mesh>
      ))}
      {/* New lava coast hint near Kapoho / Pohoiki — dark shelf, no rebuilt Puʻu ʻŌʻō cone */}
      {(() => {
        const c = latLonToWorld(19.508, -154.815);
        const y = terrainY(c.x, c.z) + hu(0.04);
        return (
          <mesh position={[c.x, y, c.z]} rotation={[-Math.PI / 2, 0, 0.4]}>
            <planeGeometry args={[wu(2.2), wu(1.1)]} />
            <meshStandardMaterial color="#0e0c0a" roughness={1} transparent opacity={0.45} depthWrite={false} side={DoubleSide} />
          </mesh>
        );
      })()}
    </group>
  );
}

/** Cheap rainforest read at Volcano Village / park gate. */
function VolcanoVillageGrove() {
  const trees = useMemo(() => {
    const origin = latLonToWorld(19.43, -155.238);
    const list: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = wu(0.4) + (i % 5) * wu(0.22);
      const x = origin.x + Math.cos(a) * r * 1.4;
      const z = origin.z + Math.sin(a) * r;
      list.push({ x, y: terrainY(x, z) + hu(0.35), z, s: wu(0.35) + (i % 3) * wu(0.08) });
    }
    return list;
  }, []);

  return (
    <group>
      {trees.map((t, i) => (
        <mesh key={i} position={[t.x, t.y, t.z]}>
          <sphereGeometry args={[t.s, 6, 5]} />
          <meshStandardMaterial color={i % 2 ? "#2f8a3a" : "#3a9a42"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** Sparse ʻōhiʻa on the NE rainforest rim — not on the black floor. */
function RimOhiaHints() {
  const trees = useMemo(() => {
    const cal = KILAUEA_WORLD;
    const list: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const a = -0.6 + (i / 11) * 1.4;
      const x = cal.x + Math.cos(a) * KILAUEA_RX * 1.05;
      const z = cal.z + Math.sin(a) * KILAUEA_RZ * 1.05 - wu(0.4);
      if (x < cal.x) continue;
      list.push({ x, y: terrainY(x, z) + hu(0.28), z, s: wu(0.28) + (i % 3) * wu(0.05) });
    }
    return list;
  }, []);
  return (
    <group>
      {trees.map((t, i) => (
        <mesh key={i} position={[t.x, t.y, t.z]}>
          <sphereGeometry args={[t.s, 6, 5]} />
          <meshStandardMaterial color="#2a7a34" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}
