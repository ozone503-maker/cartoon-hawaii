import { HALEMAUMAU_WORLD, kilaueaSurfaceY, PIT_R } from "@/lib/hawaii/kilauea";
import { hu } from "@/lib/hawaii/world";

/** Halemaʻumaʻu lava lake. Must fill the pit or it rasterizes as one orange pixel. */
export function Caldera() {
  const pit = HALEMAUMAU_WORLD;
  const y = kilaueaSurfaceY(pit.x, pit.z);
  return (
    <group position={[pit.x, y, pit.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, hu(0.05), 0]}>
        <circleGeometry args={[PIT_R * 0.92, 48]} />
        <meshBasicMaterial color="#1a100e" polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, hu(0.1), 0]}>
        <circleGeometry args={[PIT_R * 0.7, 48]} />
        <meshBasicMaterial color="#c2410c" polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, hu(0.14), 0]}>
        <circleGeometry args={[PIT_R * 0.38, 40]} />
        <meshBasicMaterial color="#ffb020" polygonOffset polygonOffsetFactor={-3} />
      </mesh>
      <pointLight color="#ff6a18" intensity={3} distance={PIT_R * 4} position={[0, hu(1.2), 0]} />
    </group>
  );
}