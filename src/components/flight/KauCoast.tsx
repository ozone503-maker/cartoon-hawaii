import { DoubleSide } from "three";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
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

/** West-lip jump cliff: rusty lava deck, sheer basalt, green hoist, ladders. */
function KaLae() {
  const { x, z } = latLonToWorld(18.9134, -155.6832);
  const H = 1.7;
  const LAVA = "#5a4638";
  const LAVA_DARK = "#3a2c24";
  const RUST = "#8a5a40";
  const DECK = "#a87850";
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0.55, H / 2, 0.2]}>
        <boxGeometry args={[3.6, H, 7.2]} />
        <meshStandardMaterial color={LAVA} roughness={0.96} />
      </mesh>
      <mesh position={[0.55, H + 0.03, 0.2]} rotation={[-Math.PI / 2, 0, 0.04]}>
        <planeGeometry args={[3.55, 7.1]} />
        <meshStandardMaterial color={DECK} roughness={0.98} />
      </mesh>
      <mesh position={[0.9, H + 0.04, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 2.4]} />
        <meshStandardMaterial color={RUST} roughness={0.97} />
      </mesh>
      <mesh position={[1.8, H + 0.02, -3.4]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[4.2, 3.2]} />
        <meshStandardMaterial color="#8a9a48" roughness={0.96} />
      </mesh>
      <mesh position={[-1.28, H / 2, 0.15]}>
        <boxGeometry args={[0.28, H, 7.0]} />
        <meshStandardMaterial color={LAVA_DARK} roughness={0.95} />
      </mesh>
      {[
        [0.9, 0.85],
        [-0.4, 1.1],
        [-1.5, 0.7],
        [1.8, 0.95],
        [2.6, 0.55],
      ].map(([zz, hh], i) => (
        <mesh key={i} position={[-1.42, hh / 2, zz]}>
          <boxGeometry args={[0.38 + (i % 2) * 0.12, hh, 1.15]} />
          <meshStandardMaterial color={i % 2 ? LAVA : LAVA_DARK} roughness={0.94} />
        </mesh>
      ))}
      <mesh position={[-1.55, 0.28, 0.2]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.7, 0.55, 2.4]} />
        <meshStandardMaterial color="#1a1614" roughness={1} />
      </mesh>
      <mesh position={[-1.7, 0.22, 0.15]} scale={[1.1, 0.7, 1.4]}>
        <sphereGeometry args={[0.38, 8, 6]} />
        <meshStandardMaterial color="#0c0c0e" roughness={1} />
      </mesh>
      <mesh position={[0.2, H / 2, 3.7]}>
        <boxGeometry args={[2.6, H, 0.35]} />
        <meshStandardMaterial color={LAVA_DARK} roughness={0.95} />
      </mesh>
      <GreenHoist y={H} />
      <Ladder x={-1.38} y={H} z={-0.15} />
      <Ladder x={-1.38} y={H} z={0.55} />
      <Truck x={0.15} z={-0.35} y={H} />
      <Truck x={1.1} z={-1.8} y={H} />
      <Person x={-0.85} z={0.2} y={H} />
      <Person x={-0.55} z={0.55} y={H} />
      <Person x={-0.2} z={-0.05} y={H} />
      <Person x={0.45} z={0.7} y={H} />
      <mesh position={[-1.9, 0.04, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.3, 12]} />
        <meshStandardMaterial color="#d8eef8" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GreenHoist({ y }: { y: number }) {
  return (
    <group position={[-1.05, y, 0.15]}>
      <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#3aaa3a" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0.22, 0.28, 0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.05, 0.62, 0.05]} />
        <meshStandardMaterial color="#2e8a2e" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[-0.22, 0.12, 0]}>
        <boxGeometry args={[0.22, 0.16, 0.16]} />
        <meshStandardMaterial color="#d45a28" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Ladder({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y / 2, z]}>
      <mesh>
        <boxGeometry args={[0.03, y * 0.92, 0.12]} />
        <meshStandardMaterial color="#c4b08a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Truck({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.28, 0.1, 0.16]} />
        <meshStandardMaterial color="#5a5e62" roughness={0.55} />
      </mesh>
      <mesh position={[0.06, 0.14, 0]}>
        <boxGeometry args={[0.12, 0.1, 0.15]} />
        <meshStandardMaterial color="#4a4e52" roughness={0.55} />
      </mesh>
    </group>
  );
}

function Person({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.09, 0]}>
        <capsuleGeometry args={[0.035, 0.08, 3, 6]} />
        <meshStandardMaterial color="#d8c4a8" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Papakolea() {
  const { x, z } = latLonToWorld(18.9364, -155.6464);
  const y = terrainY(x, z);
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
