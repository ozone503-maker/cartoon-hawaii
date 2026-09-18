import { DoubleSide } from "three";
import {
  HALEMAUMAU_WORLD,
  KILAUEA_RX,
  KILAUEA_RZ,
  KILAUEA_WORLD,
  kilaueaSurfaceY,
} from "@/lib/hawaii/kilauea";
import { terrainY } from "@/lib/hawaii/world";

/** Crater you can see into — rim, walls, black floor. No lid. */
export function Caldera() {
  const c = KILAUEA_WORLD;
  const rimY = terrainY(c.x + KILAUEA_RX, c.z);
  const floorY = kilaueaSurfaceY(c.x, c.z);
  const h = Math.max(0.55, rimY - floorY);
  const pit = HALEMAUMAU_WORLD;
  const py = kilaueaSurfaceY(pit.x, pit.z);

  return (
    <group position={[c.x, 0, c.z]} scale={[KILAUEA_RX, 1, KILAUEA_RZ]}>
      <mesh position={[0, floorY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 40]} />
        <meshStandardMaterial color="#0e0c0b" roughness={0.98} />
      </mesh>
      <mesh position={[0, floorY + h / 2, 0]}>
        <cylinderGeometry args={[0.98, 0.9, h, 40, 1, true]} />
        <meshStandardMaterial color="#2a2420" roughness={0.96} side={DoubleSide} />
      </mesh>
      <mesh position={[0, rimY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.92, 1.08, 40]} />
        <meshStandardMaterial color="#3a322c" roughness={0.97} />
      </mesh>
      <mesh
        position={[(pit.x - c.x) / KILAUEA_RX, py + 0.04, (pit.z - c.z) / KILAUEA_RZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1 / KILAUEA_RX, 1, 1 / KILAUEA_RZ]}
      >
        <circleGeometry args={[0.42, 14]} />
        <meshStandardMaterial color="#c45a22" emissive="#ff6a20" emissiveIntensity={0.55} roughness={0.55} />
      </mesh>
    </group>
  );
}