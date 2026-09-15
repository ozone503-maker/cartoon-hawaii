import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
import { HOME_ID, placeById } from "@/lib/hawaii/places";

/** Homestead at Mountain View — exaggerated so chase-cam can read it. */
export function FlashTown() {
  const home = placeById(HOME_ID)!;
  const { x, z } = latLonToWorld(home.lat, home.lon);
  const y = terrainY(x, z);

  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[1.35, 24]} />
        <meshStandardMaterial color="#3d6a38" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.28, 0.08]} castShadow>
        <boxGeometry args={[0.9, 0.52, 0.62]} />
        <meshStandardMaterial color="#c4a07a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0.08]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.02, 0.08, 0.74]} />
        <meshStandardMaterial color="#6a5648" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0.12, 0.68, 0.08]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.5]} />
        <meshStandardMaterial
          color="#1c3a58"
          emissive="#1a3350"
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0.62, 0.38, -0.22]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.5, 12]} />
        <meshStandardMaterial color="#ece6d4" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.32, 0.4]}>
        <boxGeometry args={[0.18, 0.28, 0.04]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.38, 24]} />
        <meshStandardMaterial color="#d76a4d" emissive="#d76a4d" emissiveIntensity={0.25} />
      </mesh>
      <pointLight position={[0, 1.1, 0]} color="#ffd9a8" intensity={1.2} distance={6} />
    </group>
  );
}
