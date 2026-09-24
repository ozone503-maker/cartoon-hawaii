import { HALEMAUMAU_WORLD, kilaueaSurfaceY, PIT_R } from "@/lib/hawaii/kilauea";
import { hu } from "@/lib/hawaii/world";

/** Glow in Halemaʻumaʻu. The caldera shape is the island bowl, not an oval lid. */
export function Caldera() {
  const pit = HALEMAUMAU_WORLD;
  const y = kilaueaSurfaceY(pit.x, pit.z);
  const lake = PIT_R * 0.42;
  return (
    <group position={[pit.x, y, pit.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, hu(0.08), 0]}>
        <circleGeometry args={[lake, 24]} />
        <meshStandardMaterial color="#e25a18" emissive="#ff5a12" emissiveIntensity={0.85} roughness={0.45} />
      </mesh>
      <pointLight color="#ff7a28" intensity={2.4} distance={PIT_R * 3} position={[0, hu(0.6), 0]} />
    </group>
  );
}
