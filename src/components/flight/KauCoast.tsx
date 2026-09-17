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

function KaLae() {
  const { x, z } = latLonToWorld(18.9152, -155.6824);
  const H = 2.2;
  const GRASS = "#8a9a48";
  const GRASS_DRY = "#c4b06a";
  const LAVA = "#5c4838";
  const LAVA_DARK = "#3a2c24";
  const LIP = "#8a7a58";
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0.1, H, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 2.8]} />
        <meshStandardMaterial color={GRASS} roughness={0.96} />
      </mesh>
      <mesh position={[0.05, H, 0.7]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <planeGeometry args={[3.2, 2.2]} />
        <meshStandardMaterial color={GRASS_DRY} roughness={0.96} />
      </mesh>
      <mesh position={[0, H, 2.35]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <planeGeometry args={[1.7, 1.9]} />
        <meshStandardMaterial color={GRASS} roughness={0.97} />
      </mesh>
      <mesh position={[0.05, H + 0.03, -0.4]} rotation={[-Math.PI / 2, 0, 0.02]}>
        <planeGeometry args={[0.28, 5.4]} />
        <meshStandardMaterial color="#c9b48a" roughness={0.9} />
      </mesh>
      <mesh position={[0, H / 2, 3.15]}>
        <boxGeometry args={[1.85, H, 0.42]} />
        <meshStandardMaterial color={LAVA} roughness={0.94} />
      </mesh>
      <mesh position={[0, H * 0.22, 3.38]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.7, H * 0.48, 0.32]} />
        <meshStandardMaterial color={LAVA_DARK} roughness={0.95} />
      </mesh>
      <mesh position={[0, H - 0.08, 3.02]}>
        <boxGeometry args={[1.9, 0.16, 0.5]} />
        <meshStandardMaterial color={LIP} roughness={0.92} />
      </mesh>
      <mesh position={[-1.85, H / 2, 0.35]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[0.4, H, 5.6]} />
        <meshStandardMaterial color={LAVA} roughness={0.94} />
      </mesh>
      <mesh position={[-2.08, H * 0.28, 0.55]} rotation={[0, 0.18, 0.08]}>
        <boxGeometry args={[0.28, H * 0.55, 5.2]} />
        <meshStandardMaterial color={LAVA_DARK} roughness={0.95} />
      </mesh>
      <mesh position={[-1.72, H - 0.07, 0.4]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[0.55, 0.14, 5.4]} />
        <meshStandardMaterial color={LIP} roughness={0.92} />
      </mesh>
      <mesh position={[-1.95, H + 0.02, 1.35]}>
        <boxGeometry args={[0.85, 0.08, 0.9]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.62} />
      </mesh>
      {[0.15, -0.35, -0.85, -1.35].map((ly) => (
        <mesh key={ly} position={[-2.12, H * 0.55 + ly, 1.4]} rotation={[0, 0.18, 0]}>
          <boxGeometry args={[0.04, 0.07, 0.32]} />
          <meshStandardMaterial color="#8a8e92" metalness={0.35} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[-2.05, 0.05, 1.5]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <circleGeometry args={[1.1, 12]} />
        <meshStandardMaterial color="#d8eef8" transparent opacity={0.38} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.04, 3.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 12]} />
        <meshStandardMaterial color="#e8f4fa" transparent opacity={0.32} depthWrite={false} />
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
