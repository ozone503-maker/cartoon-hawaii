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

/** West-lip jump cliff — layered lava, cave, green hoist, ladders. */
function KaLae() {
  const { x, z } = latLonToWorld(18.9134, -155.6832);
  const H = 2.05;
  const LAVA = "#6a5344";
  const LAVA_DARK = "#3e322a";
  const LAVA_GREY = "#5c534c";
  const DECK = "#b06a48";
  const RUST = "#8a4e38";
  return (
    <group position={[x, 0, z]} rotation={[0, 0.2, 0]}>
      <mesh position={[1.05, H / 2, 0.15]}>
        <boxGeometry args={[4.4, H, 8.4]} />
        <meshStandardMaterial color={LAVA} roughness={0.97} />
      </mesh>
      <mesh position={[1.05, H + 0.025, 0.15]} rotation={[-Math.PI / 2, 0, 0.03]}>
        <planeGeometry args={[4.35, 8.3]} />
        <meshStandardMaterial color={DECK} roughness={0.98} />
      </mesh>
      <mesh position={[0.35, H + 0.04, -0.2]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <planeGeometry args={[2.4, 3.1]} />
        <meshStandardMaterial color={RUST} roughness={0.97} />
      </mesh>
      <mesh position={[2.4, H + 0.02, -3.6]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <planeGeometry args={[5.2, 4.0]} />
        <meshStandardMaterial color="#9aa050" roughness={0.96} />
      </mesh>
      <mesh position={[1.4, H + 0.035, -2.4]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.42, 5.6]} />
        <meshStandardMaterial color="#c4b08a" roughness={0.9} />
      </mesh>
      {[0.15, 0.55, 0.95, 1.4].map((yy, i) => (
        <mesh key={`band-${i}`} position={[-1.22 - i * 0.04, yy, 0.1]}>
          <boxGeometry args={[0.42 + (i % 2) * 0.18, 0.38, 8.0]} />
          <meshStandardMaterial color={i % 2 ? LAVA_GREY : LAVA_DARK} roughness={0.95} />
        </mesh>
      ))}
      {[
        [-2.1, 1.15, 1.35],
        [-0.7, 0.85, 1.05],
        [0.6, 1.25, 0.9],
        [1.9, 0.7, 1.2],
        [2.9, 1.05, 0.75],
      ].map(([zz, hh, deep], i) => (
        <mesh key={`block-${i}`} position={[-1.45 - (i % 2) * 0.12, hh / 2, zz]}>
          <boxGeometry args={[deep, hh, 1.05]} />
          <meshStandardMaterial color={i % 2 ? LAVA : LAVA_DARK} roughness={0.94} />
        </mesh>
      ))}
      <mesh position={[-1.15, H - 0.06, 0.1]}>
        <boxGeometry args={[0.7, 0.14, 8.1]} />
        <meshStandardMaterial color="#8a7a62" roughness={0.92} />
      </mesh>
      <mesh position={[-1.85, 0.42, 0.05]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[1.15, 0.85, 2.6]} />
        <meshStandardMaterial color="#121110" roughness={1} />
      </mesh>
      <mesh position={[-2.05, 0.28, 0.05]} scale={[1.35, 0.85, 1.7]}>
        <sphereGeometry args={[0.42, 10, 7]} />
        <meshStandardMaterial color="#0a0a0c" roughness={1} />
      </mesh>
      <mesh position={[0.4, H / 2, 4.25]}>
        <boxGeometry args={[3.2, H, 0.4]} />
        <meshStandardMaterial color={LAVA_DARK} roughness={0.95} />
      </mesh>
      <GreenHoist y={H} />
      <mesh position={[-1.15, H + 0.1, 0.55]}>
        <boxGeometry args={[0.22, 0.2, 0.16]} />
        <meshStandardMaterial color="#e25a28" roughness={0.55} />
      </mesh>
      <Ladder x={-1.48} top={H} z={-0.35} len={H * 0.72} />
      <Ladder x={-1.52} top={H} z={0.35} len={H * 1.05} />
      <Truck x={0.05} z={-0.55} y={H} />
      <Truck x={1.15} z={-2.1} y={H} />
      <Truck x={2.3} z={-3.4} y={H} />
      <Person x={-0.95} z={0.15} y={H} />
      <Person x={-0.7} z={0.48} y={H} />
      <Person x={-0.35} z={-0.12} y={H} />
      <Person x={0.2} z={0.7} y={H} />
      <Person x={0.55} z={-0.9} y={H} />
      <mesh position={[-2.35, 0.03, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 14]} />
        <meshStandardMaterial color="#163a58" roughness={0.22} metalness={0.08} />
      </mesh>
    </group>
  );
}

function GreenHoist({ y }: { y: number }) {
  return (
    <group position={[-1.15, y, 0.05]}>
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
