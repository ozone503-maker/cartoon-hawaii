import { DoubleSide } from "three";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
import { kaLaeCape, kaLaeShoreLat, KA_LAE_CLIFF_H } from "@/lib/hawaii/coast";
import { Puuhonua } from "./Puuhonua";

/**
 * Kaʻū shore as it actually is:
 * Punaluʻu = black-sand beach on the water.
 * Ka Lae = south point cliffs, not a pancake.
 */
export function KauCoast() {
  return (
    <group>
      <Punaluu />
      <KaLae />
      <Papakolea />
      <Puuhonua />
    </group>
  );
}

function Punaluu() {
  const { x, z } = latLonToWorld(19.1358, -155.5044);
  const y = terrainY(x, z);
  const palms = [
    [-0.85, -0.55],
    [-0.4, -0.7],
    [0.15, -0.62],
    [0.7, -0.5],
    [1.05, -0.28],
  ] as const;
  const honu = [
    [-0.25, 0.12],
    [0.35, 0.05],
    [0.05, 0.28],
  ] as const;
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[0.1, 0.04, 0.15]} scale={[1.7, 0.85, 1]}>
        <circleGeometry args={[1, 20]} />
        <meshStandardMaterial color="#1a1818" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[0.15, 0.05, 0.22]} scale={[1.15, 0.5, 1]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#0e0e10" roughness={1} />
      </mesh>
      {palms.map(([px, pz], i) => (
        <Palm key={i} x={px} z={pz} />
      ))}
      {honu.map(([hx, hz], i) => (
        <Honu key={i} x={hx} z={hz} />
      ))}
    </group>
  );
}

/** Cliff glued to the green cape — same height as the plateau, not a raft in the sea. */
function KaLae() {
  const H = KA_LAE_CLIFF_H;
  const LAVA = "#5a4a40";
  const LAVA_DARK = "#322822";
  const LAVA_GREY = "#5c564e";
  const cape = kaLaeCape();
  const segs = [];
  for (let i = 0; i < cape.length - 1; i++) {
    const a = latLonToWorld(cape[i]![0], cape[i]![1]);
    const b = latLonToWorld(cape[i + 1]![0], cape[i + 1]![1]);
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    segs.push({
      x: (a.x + b.x) / 2,
      z: (a.z + b.z) / 2,
      len,
      yaw: Math.atan2(-dz, dx),
      h: H * (0.92 + (i % 5) * 0.03),
    });
  }
  const diveLon = -155.6864;
  const dive = latLonToWorld(kaLaeShoreLat(diveLon) + 0.0002, diveLon);
  return (
    <group>
      {segs.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation={[0, s.yaw, 0]}>
          <mesh position={[0, s.h / 2, 0.18]}>
            <boxGeometry args={[s.len + 0.12, s.h, 0.55]} />
            <meshStandardMaterial color={i % 2 ? LAVA_DARK : LAVA} roughness={0.96} />
          </mesh>
          <mesh position={[0, s.h * 0.4, 0.42]}>
            <boxGeometry args={[s.len * 0.8, s.h * 0.72, 0.28]} />
            <meshStandardMaterial color={i % 3 ? LAVA_GREY : LAVA_DARK} roughness={0.95} />
          </mesh>
        </group>
      ))}
      <group position={[dive.x, H, dive.z]}>
        <mesh position={[0, 0.02, 0.1]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <planeGeometry args={[2.4, 1.6]} />
          <meshStandardMaterial color="#a07048" roughness={0.96} />
        </mesh>
        <mesh position={[0, -H + 0.38, 0.85]} scale={[1.6, 1.05, 1.2]}>
          <sphereGeometry args={[0.38, 10, 7]} />
          <meshStandardMaterial color="#08080a" roughness={1} />
        </mesh>
        <GreenHoist y={0} />
        <mesh position={[0.4, 0.12, 0.15]}>
          <boxGeometry args={[0.2, 0.18, 0.14]} />
          <meshStandardMaterial color="#e25a28" roughness={0.55} />
        </mesh>
        <Ladder x={-0.4} top={0} z={0.7} len={H * 0.55} />
        <Ladder x={0.18} top={0} z={0.75} len={H * 0.92} />
        <Truck x={-0.85} z={-0.4} y={0} />
        <Truck x={-1.6} z={-0.95} y={0} />
        <Truck x={1.1} z={-0.8} y={0} />
        <Person x={-0.45} z={-0.08} y={0} />
        <Person x={-0.05} z={0.04} y={0} />
        <Person x={0.38} z={-0.12} y={0} />
        <Person x={0.8} z={-0.5} y={0} />
      </group>
    </group>
  );
}

function GreenHoist({ y }: { y: number }) {
  return (
    <group position={[0, y, 0.35]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[-0.02, 0.38, -0.12]} rotation={[0.08, 0, 0.42]}>
        <boxGeometry args={[0.055, 0.85, 0.055]} />
        <meshStandardMaterial color="#3aaa38" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[-0.02, 0.38, 0.12]} rotation={[-0.08, 0, 0.42]}>
        <boxGeometry args={[0.055, 0.85, 0.055]} />
        <meshStandardMaterial color="#2f9a30" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[-0.28, 0.72, 0]} rotation={[0, 0, 1.15]}>
        <boxGeometry args={[0.045, 0.7, 0.045]} />
        <meshStandardMaterial color="#3aaa38" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[-0.55, 0.22, 0]}>
        <boxGeometry args={[0.02, 0.55, 0.02]} />
        <meshStandardMaterial color="#8a8e92" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Ladder({ x, top, z, len }: { x: number; top: number; z: number; len: number }) {
  return (
    <group position={[x, top - len / 2, z]}>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.025, len, 0.025]} />
        <meshStandardMaterial color="#c9b48a" roughness={0.65} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.025, len, 0.025]} />
        <meshStandardMaterial color="#c9b48a" roughness={0.65} metalness={0.15} />
      </mesh>
      {[-0.35, -0.15, 0.05, 0.25, 0.4].map((t) => (
        <mesh key={t} position={[0, t * len, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.12]} />
          <meshStandardMaterial color="#b8a070" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Truck({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.32, 0.1, 0.16]} />
        <meshStandardMaterial color="#6a6e72" roughness={0.5} />
      </mesh>
      <mesh position={[0.07, 0.15, 0]}>
        <boxGeometry args={[0.14, 0.1, 0.15]} />
        <meshStandardMaterial color="#4a5056" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Person({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.1, 0]}>
        <capsuleGeometry args={[0.032, 0.09, 3, 6]} />
        <meshStandardMaterial color="#d8c4a8" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Papakolea() {
  const lon = -155.6464;
  const lat = kaLaeShoreLat(lon) + 0.0035;
  const { x, z } = latLonToWorld(lat, lon);
  const y = Math.max(KA_LAE_CLIFF_H * 0.35, terrainY(x, z));
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[0, 0.05, 0.1]} scale={[0.7, 0.42, 1]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#5a7a38" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.18, -0.35]}>
        <cylinderGeometry args={[0.55, 0.7, 0.35, 10, 1, true]} />
        <meshStandardMaterial color="#8a5a38" roughness={0.92} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function Palm({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.9, 6]} />
        <meshStandardMaterial color="#7a5a30" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.22, 0.92, Math.sin((i / 5) * Math.PI * 2) * 0.22]} rotation={[0.7, (i / 5) * Math.PI * 2, 0]}>
          <sphereGeometry args={[0.16, 8, 6]} />
          <meshStandardMaterial color="#2dad48" />
        </mesh>
      ))}
    </group>
  );
}

function Honu({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.08, z]} rotation={[0.1, x * 4, 0]} scale={[1.1, 0.35, 0.7]}>
      <sphereGeometry args={[0.07, 8, 6]} />
      <meshStandardMaterial color="#3a6a48" roughness={0.8} />
    </mesh>
  );
}
