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

/** South-facing palis — this IS the coast, not a shed on the beach. */
function KaLae() {
  const { x, z } = latLonToWorld(18.9118, -155.6838);
  const H = 2.45;
  const W = 16.5;
  const LAVA = "#5a4a40";
  const LAVA_DARK = "#322822";
  const LAVA_GREY = "#5c564e";
  const columns: { x: number; h: number; d: number; w: number }[] = [];
  for (let i = -9; i <= 9; i++) {
    if (i === -1 || i === 0) continue;
    columns.push({
      x: i * 0.82,
      h: H * (0.72 + ((i * i) % 5) * 0.05),
      d: 0.42 + (i % 3) * 0.08,
      w: 0.7,
    });
  }
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0.2, H, -3.1]} rotation={[-Math.PI / 2, 0, 0.04]}>
        <planeGeometry args={[W + 1.5, 7.2]} />
        <meshStandardMaterial color="#7a8a42" roughness={0.97} />
      </mesh>
      <mesh position={[-0.4, H + 0.03, -2.4]} rotation={[-Math.PI / 2, 0, 0.35]}>
        <planeGeometry args={[0.7, 5.4]} />
        <meshStandardMaterial color="#c4a06a" roughness={0.92} />
      </mesh>
      <mesh position={[1.1, H + 0.03, -2.6]} rotation={[-Math.PI / 2, 0, -0.28]}>
        <planeGeometry args={[0.55, 5.0]} />
        <meshStandardMaterial color="#c4a06a" roughness={0.92} />
      </mesh>
      <mesh position={[2.4, H + 0.03, -2.2]} rotation={[-Math.PI / 2, 0, -0.55]}>
        <planeGeometry args={[0.48, 4.2]} />
        <meshStandardMaterial color="#b89058" roughness={0.92} />
      </mesh>
      <mesh position={[-1.6, H + 0.02, -1.1]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[3.4, 2.2]} />
        <meshStandardMaterial color="#a07048" roughness={0.96} />
      </mesh>
      <mesh position={[0, H / 2, 0.28]}>
        <boxGeometry args={[W, H, 0.7]} />
        <meshStandardMaterial color={LAVA_DARK} roughness={0.96} />
      </mesh>
      {columns.map((c, i) => (
        <mesh key={i} position={[c.x, c.h / 2, 0.72]}>
          <boxGeometry args={[c.w, c.h, c.d]} />
          <meshStandardMaterial color={i % 2 ? LAVA : i % 3 ? LAVA_DARK : LAVA_GREY} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, H - 0.04, 0.45]}>
        <boxGeometry args={[W, 0.14, 0.95]} />
        <meshStandardMaterial color="#7a6e5c" roughness={0.93} />
      </mesh>
      <mesh position={[-0.35, 0.45, 1.15]} scale={[2.1, 1.15, 1.4]}>
        <sphereGeometry args={[0.42, 10, 7]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      <mesh position={[-0.35, 0.22, 1.35]}>
        <boxGeometry args={[1.7, 0.55, 0.9]} />
        <meshStandardMaterial color="#101014" roughness={1} />
      </mesh>
      <mesh position={[-0.35, 0.03, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 14]} />
        <meshStandardMaterial color="#0e2a44" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[-0.35, 0.05, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.7, 16]} />
        <meshStandardMaterial color="#d8eef8" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <GreenHoist y={H} />
      <mesh position={[0.45, H + 0.12, 0.35]}>
        <boxGeometry args={[0.2, 0.18, 0.14]} />
        <meshStandardMaterial color="#e25a28" roughness={0.55} />
      </mesh>
      <Ladder x={-0.55} top={H} z={0.95} len={H * 0.55} />
      <Ladder x={0.15} top={H} z={1.0} len={H * 0.95} />
      <Truck x={-1.1} z={-0.55} y={H} />
      <Truck x={-2.4} z={-1.4} y={H} />
      <Truck x={1.6} z={-1.8} y={H} />
      <Person x={-0.6} z={-0.15} y={H} />
      <Person x={-0.2} z={0.05} y={H} />
      <Person x={0.35} z={-0.2} y={H} />
      <Person x={0.9} z={-0.7} y={H} />
      <Person x={-1.5} z={-0.45} y={H} />
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
