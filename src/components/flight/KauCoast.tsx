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

/** West-lip jump cliff — columnar lava, undercut cave, green hoist, ladders. */
function KaLae() {
  const { x, z } = latLonToWorld(18.9126, -155.6862);
  const H = 1.58;
  const LAVA = "#6a5344";
  const LAVA_DARK = "#3a2e28";
  const LAVA_GREY = "#5a534c";
  const DECK = "#b26542";
  const RUST = "#8a4a32";
  const columns = [
    { z: -2.6, h: 1.05, d: 0.42, w: 0.38 },
    { z: -2.15, h: 1.28, d: 0.5, w: 0.44 },
    { z: -1.68, h: 1.42, d: 0.48, w: 0.4 },
    { z: -1.22, h: 1.5, d: 0.55, w: 0.46 },
    { z: -0.72, h: 0.62, d: 0.7, w: 0.5 },
    { z: 0.28, h: 0.7, d: 0.72, w: 0.52 },
    { z: 0.78, h: 1.48, d: 0.5, w: 0.42 },
    { z: 1.22, h: 1.55, d: 0.58, w: 0.48 },
    { z: 1.7, h: 1.32, d: 0.46, w: 0.4 },
    { z: 2.18, h: 1.12, d: 0.4, w: 0.36 },
    { z: 2.58, h: 0.92, d: 0.38, w: 0.34 },
  ] as const;
  return (
    <group position={[x, 0, z]} rotation={[0, 0.32, 0]}>
      <mesh position={[1.8, H - 0.04, -0.4]} rotation={[-Math.PI / 2, 0, 0.06]}>
        <planeGeometry args={[5.4, 7.2]} />
        <meshStandardMaterial color="#9aa050" roughness={0.97} />
      </mesh>
      <mesh position={[0.55, H, 0.05]}>
        <boxGeometry args={[2.8, 0.16, 5.6]} />
        <meshStandardMaterial color={DECK} roughness={0.98} />
      </mesh>
      <mesh position={[0.15, H + 0.09, 0.1]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[1.9, 2.6]} />
        <meshStandardMaterial color={RUST} roughness={0.97} />
      </mesh>
      <mesh position={[1.15, H + 0.08, -1.8]} rotation={[-Math.PI / 2, 0, 0.18]}>
        <planeGeometry args={[0.38, 4.2]} />
        <meshStandardMaterial color="#c4b08a" roughness={0.9} />
      </mesh>
      {columns.map((c, i) => (
        <mesh key={i} position={[-0.95 - (i % 3) * 0.06, c.h / 2, c.z]}>
          <boxGeometry args={[c.d, c.h, c.w]} />
          <meshStandardMaterial color={i % 2 ? LAVA : i % 3 ? LAVA_DARK : LAVA_GREY} roughness={0.96} />
        </mesh>
      ))}
      <mesh position={[-0.82, H - 0.05, 0.05]}>
        <boxGeometry args={[0.55, 0.12, 5.5]} />
        <meshStandardMaterial color="#8a7a62" roughness={0.92} />
      </mesh>
      <mesh position={[-1.35, 0.38, -0.22]} scale={[1.6, 1.05, 1.9]}>
        <sphereGeometry args={[0.38, 10, 7]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      <mesh position={[-1.55, 0.22, -0.2]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.9, 0.55, 1.5]} />
        <meshStandardMaterial color="#101014" roughness={1} />
      </mesh>
      <mesh position={[0.2, H / 2, 2.95]}>
        <boxGeometry args={[2.4, H * 0.92, 0.38]} />
        <meshStandardMaterial color={LAVA_DARK} roughness={0.95} />
      </mesh>
      <mesh position={[-1.7, 0.02, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 14]} />
        <meshStandardMaterial color="#0e2a44" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[-1.55, 0.04, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 1.45, 16]} />
        <meshStandardMaterial color="#d8eef8" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <GreenHoist y={H} />
      <mesh position={[-0.72, H + 0.12, 0.42]}>
        <boxGeometry args={[0.2, 0.18, 0.14]} />
        <meshStandardMaterial color="#e25a28" roughness={0.55} />
      </mesh>
      <Ladder x={-1.18} top={H} z={-0.55} len={H * 0.58} />
      <Ladder x={-1.22} top={H} z={0.18} len={H * 0.98} />
      <Truck x={0.15} z={-0.35} y={H} />
      <Truck x={0.95} z={-1.55} y={H} />
      <Truck x={1.7} z={-2.6} y={H} />
      <Person x={-0.7} z={0.05} y={H} />
      <Person x={-0.48} z={0.38} y={H} />
      <Person x={-0.2} z={-0.22} y={H} />
      <Person x={0.35} z={0.55} y={H} />
      <Person x={0.7} z={-0.85} y={H} />
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
