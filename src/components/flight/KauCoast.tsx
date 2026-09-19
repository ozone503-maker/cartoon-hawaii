import { DoubleSide } from "three";
import { hu, latLonToWorld, terrainY, WORLD_SCALE } from "@/lib/hawaii/world";
import { snapToLand } from "@/lib/hawaii/coast";
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
  // Beach at water — snap keeps palms/honu on dry sand, not Nāʻālehu upslope.
  const p = snapToLand(19.1358, -155.5044);
  const { x, z, y } = p;
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
    <group position={[x, y, z]} scale={WORLD_SCALE}>
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

/** Jump gear on the real lip — no separate palisade in the ocean. */
function KaLae() {
  const p = snapToLand(18.9119, -155.6864);
  const drop = Math.max(hu(0.55), p.y);
  return (
    <group position={[p.x, p.y, p.z]} scale={WORLD_SCALE}>
      <mesh position={[0, -Math.min(p.y / WORLD_SCALE, 0.55) * 0.7, 0.5]} scale={[1.1, 0.8, 1]}>
        <sphereGeometry args={[0.2, 10, 7]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      <GreenHoist y={0} />
      <mesh position={[0.28, 0.1, 0.1]}>
        <boxGeometry args={[0.16, 0.14, 0.12]} />
        <meshStandardMaterial color="#e25a28" roughness={0.55} />
      </mesh>
      <Ladder x={-0.22} top={0} z={0.38} len={(drop / WORLD_SCALE) * 0.55} />
      <Ladder x={0.1} top={0} z={0.42} len={(drop / WORLD_SCALE) * 0.9} />
      <Truck x={-0.55} z={-0.28} y={0} />
      <Truck x={-1.05} z={-0.65} y={0} />
      <Truck x={0.7} z={-0.5} y={0} />
      <Person x={-0.28} z={-0.05} y={0} />
      <Person x={0.06} z={0.03} y={0} />
      <Person x={0.28} z={-0.08} y={0} />
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
  // Green-sand cove in a *broken* cone on the east cape — not a donut in the ocean.
  const p = snapToLand(18.9364, -155.6464);
  return (
    <group position={[p.x, p.y, p.z]} scale={WORLD_SCALE}>
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[0.1, 0.03, 0.2]} scale={[0.95, 0.55, 1]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#6a7a38" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.25]} position={[0.15, 0.05, 0.28]} scale={[0.55, 0.32, 1]}>
        <circleGeometry args={[1, 14]} />
        <meshStandardMaterial color="#8a9a3c" roughness={0.92} />
      </mesh>
      {/* Landward arc only (thetaLength < 2π) — open to the sea */}
      <mesh position={[0.0, 0.2, -0.2]} rotation={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.48, 0.62, 0.36, 12, 1, true, 0.35, Math.PI * 1.35]} />
        <meshStandardMaterial color="#8a5a38" roughness={0.92} side={DoubleSide} />
      </mesh>
      <mesh position={[-0.35, 0.14, -0.05]} rotation={[0.15, 0.2, 0.1]}>
        <boxGeometry args={[0.55, 0.22, 0.28]} />
        <meshStandardMaterial color="#7a4a30" roughness={0.95} />
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
