import { HALEMAUMAU_WORLD, kilaueaSurfaceY } from "@/lib/hawaii/kilauea";

/** Glow in Halemaʻumaʻu. The caldera shape is the atlas + the island bowl — no oval prop. */
export function Caldera() {
  const pit = HALEMAUMAU_WORLD;
  const y = kilaueaSurfaceY(pit.x, pit.z);
  return (
    <group position={[pit.x, y, pit.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.32, 12]} />
        <meshStandardMaterial color="#c45a22" emissive="#ff6a20" emissiveIntensity={0.45} roughness={0.6} />
      </mesh>
      <pointLight color="#ff7a28" intensity={1.1} distance={5} position={[0, 0.2, 0]} />
    </group>
  );
}