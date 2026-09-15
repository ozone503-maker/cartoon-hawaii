import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

/**
 * Puʻuhonua o Hōnaunau — Place of Refuge at the bottom of the South Kona slope.
 * Great wall, lava flat, cove. Surveyed pin. Sacred ground, kept simple.
 */
export function Puuhonua() {
  const { x, z } = latLonToWorld(19.4217, -155.9106);
  const y = terrainY(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.15]} position={[-0.15, 0.03, 0]} scale={[1.35, 0.9, 1]}>
        <circleGeometry args={[1, 18]} />
        <meshStandardMaterial color="#3a322c" roughness={0.98} />
      </mesh>
      {/* Great Wall — inland side of the refuge */}
      <mesh position={[0.55, 0.22, 0.05]} rotation={[0, 0.12, 0]}>
        <boxGeometry args={[0.22, 0.42, 2.15]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.95} />
      </mesh>
      <mesh position={[0.05, 0.18, 1.05]} rotation={[0, 1.05, 0]}>
        <boxGeometry args={[0.18, 0.34, 1.1]} />
        <meshStandardMaterial color="#5c4e40" roughness={0.95} />
      </mesh>
      {/* Hale o Keawe platform */}
      <mesh position={[-0.15, 0.12, -0.55]}>
        <boxGeometry args={[0.7, 0.14, 0.55]} />
        <meshStandardMaterial color="#4a4038" roughness={0.9} />
      </mesh>
      <mesh position={[-0.15, 0.38, -0.55]}>
        <coneGeometry args={[0.28, 0.42, 4]} />
        <meshStandardMaterial color="#7a5a38" roughness={0.88} />
      </mesh>
      {/* Kiʻi on the bay */}
      {[-0.45, -0.15, 0.15].map((oz, i) => (
        <mesh key={i} position={[-0.85, 0.28, oz]}>
          <cylinderGeometry args={[0.06, 0.08, 0.48, 6]} />
          <meshStandardMaterial color="#3d342c" roughness={0.9} />
        </mesh>
      ))}
      {/* Cove */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.15, 0.02, 0.1]} scale={[0.7, 0.45, 1]}>
        <circleGeometry args={[1, 14]} />
        <meshStandardMaterial color="#1a6a88" roughness={0.28} />
      </mesh>
    </group>
  );
}
