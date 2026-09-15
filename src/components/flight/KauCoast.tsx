import { DoubleSide } from "three";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

/**
 * Kaʻū shore as it actually is:
 * Punaluʻu = black-sand beach on the water, honu, a few palms inland.
 * Ka Lae = grassy south point, cliffs into deep water — not rainforest.
 */
export function KauCoast() {
  return (
    <group>
      <Punaluu />
      <KaLae />
      <Papakolea />
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
  const { x, z } = latLonToWorld(18.9108, -155.6813);
  const y = terrainY(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -0.15]}>
        <circleGeometry args={[2.4, 24]} />
        <meshStandardMaterial color="#c4a45a" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.7, 1.05]}>
        <boxGeometry args={[3.4, 1.55, 0.22]} />
        <meshStandardMaterial color="#6a5340" roughness={0.92} />
      </mesh>
      <mesh position={[0, -1.45, 1.35]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[3.2, 0.9, 0.18]} />
        <meshStandardMaterial color="#4a3a30" roughness={0.94} />
      </mesh>
      <mesh position={[0.15, 0.22, 0.55]}>
        <boxGeometry args={[0.35, 0.08, 0.55]} />
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
