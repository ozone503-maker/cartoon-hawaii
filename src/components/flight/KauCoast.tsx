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
  const { x, z } = latLonToWorld(18.9148, -155.6815);
  const yLand = Math.max(1.85, terrainY(x, z));
  const W = 5.2;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, yLand, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, 3.6]} />
        <meshStandardMaterial color="#6a8a42" roughness={0.95} />
      </mesh>
      <mesh position={[0, yLand / 2, 0.95]}>
        <boxGeometry args={[W, yLand + 0.25, 0.7]} />
        <meshStandardMaterial color="#6b5340" roughness={0.93} />
      </mesh>
      <mesh position={[0, yLand * 0.28, 1.35]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[W * 0.96, yLand * 0.6, 0.45]} />
        <meshStandardMaterial color="#4a382c" roughness={0.94} />
      </mesh>
      <mesh position={[-2.2, yLand / 2, 0.2]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.55, yLand + 0.2, 2.8]} />
        <meshStandardMaterial color="#5c4838" roughness={0.93} />
      </mesh>
      <mesh position={[0, 0.04, 1.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 14]} />
        <meshStandardMaterial color="#d8eef8" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh position={[-1.4, yLand + 0.04, 0.55]}>
        <boxGeometry args={[0.7, 0.05, 0.7]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.6} />
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
