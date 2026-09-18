import { DoubleSide } from "three";
import {
  HALEMAUMAU_WORLD,
  KILAUEA_RX,
  KILAUEA_RZ,
  KILAUEA_WORLD,
  PIT_R,
  kilaueaSurfaceY,
} from "@/lib/hawaii/kilauea";
import { terrainY } from "@/lib/hawaii/world";

/**
 * Nested caldera from the map: tan-grey floor, black Halemaʻumaʻu pit to the west.
 * Brown desert is the atlas, not a black disc.
 */
export function Caldera() {
  const c = KILAUEA_WORLD;
  const pit = HALEMAUMAU_WORLD;
  const rimY = terrainY(c.x + KILAUEA_RX * 0.9, c.z);
  const floorY = kilaueaSurfaceY(c.x, c.z);
  const pitY = kilaueaSurfaceY(pit.x, pit.z);
  const h = Math.max(0.35, rimY - floorY);
  const ph = Math.max(0.25, floorY - pitY);

  return (
    <group>
      <group position={[c.x, 0, c.z]} scale={[KILAUEA_RX, 1, KILAUEA_RZ]}>
        <mesh position={[0, floorY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.92, 40]} />
          <meshStandardMaterial color="#5c5248" roughness={0.97} />
        </mesh>
        <mesh position={[0, floorY + h / 2, 0]}>
          <cylinderGeometry args={[0.98, 0.92, h, 40, 1, true]} />
          <meshStandardMaterial color="#6a5a4c" roughness={0.96} side={DoubleSide} />
        </mesh>
        <mesh position={[0, rimY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.06, 40]} />
          <meshStandardMaterial color="#7a6a58" roughness={0.96} />
        </mesh>
      </group>
      <group position={[pit.x, 0, pit.z]}>
        <mesh position={[0, pitY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[PIT_R * 0.92, 24]} />
          <meshStandardMaterial color="#1a1614" roughness={0.98} />
        </mesh>
        <mesh position={[0, pitY + ph / 2, 0]}>
          <cylinderGeometry args={[PIT_R * 0.95, PIT_R * 0.88, ph, 24, 1, true]} />
          <meshStandardMaterial color="#2a221c" roughness={0.96} side={DoubleSide} />
        </mesh>
        <mesh position={[0.15, pitY + 0.03, -0.2]} rotation={[-Math.PI / 2, 0, 0.4]}>
          <circleGeometry args={[0.28, 10]} />
          <meshStandardMaterial color="#d8d0b8" roughness={0.9} />
        </mesh>
        <mesh position={[0, pitY + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 12]} />
          <meshStandardMaterial color="#c45a22" emissive="#ff6a20" emissiveIntensity={0.5} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}