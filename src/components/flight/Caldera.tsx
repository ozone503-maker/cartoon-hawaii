import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

export function Caldera() {
  const { x, z } = latLonToWorld(19.4069, -155.2834);
  const y = terrainY(x, z);
  return (
    <group position={[x, y + 0.05, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.55, 24]} />
        <meshStandardMaterial color="#2a1c18" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.55, 20]} />
        <meshStandardMaterial
          color="#d25a24"
          emissive="#ff6a20"
          emissiveIntensity={1.1}
          roughness={0.4}
        />
      </mesh>
      <pointLight color="#ff7a28" intensity={2.2} distance={10} />
    </group>
  );
}
