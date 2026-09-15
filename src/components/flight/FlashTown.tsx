import { flashtownWorld, CLEARING_R } from "@/lib/hawaii/puna";
import { terrainY } from "@/lib/hawaii/world";

/**
 * Homestead at the surveyed FlashTown pin. The UFO lands on the pad;
 * the cabin sits east toward Volcano Road so Mauna Kea stays ahead at spawn.
 */
export function FlashTown() {
  const p = flashtownWorld();
  const y = terrainY(p.x, p.z);

  return (
    <group position={[p.x, y, p.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[CLEARING_R, 36]} />
        <meshStandardMaterial color="#7a9a4a" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[1.05, 1.22, 28]} />
        <meshStandardMaterial color="#d76a4d" emissive="#d76a4d" emissiveIntensity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[1.02, 28]} />
        <meshStandardMaterial color="#c4b49a" roughness={0.7} />
      </mesh>
      <Cabin />
      <Tank />
      <Shed />
      <LotTrees />
      <pointLight position={[1.55, 1.15, 0.35]} color="#ffd9a8" intensity={2.4} distance={8} />
    </group>
  );
}

function Cabin() {
  return (
    <group position={[1.55, 0, 0.35]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.15, 0.72, 0.78]} />
        <meshStandardMaterial color="#c9a67a" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.78, 0.02]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[1.28, 0.07, 0.92]} />
        <meshStandardMaterial color="#4a4038" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.92, -0.08]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[1.28, 0.07, 0.55]} />
        <meshStandardMaterial color="#3f3832" roughness={0.48} metalness={0.28} />
      </mesh>
      <mesh position={[0.08, 0.86, 0.12]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.72, 0.02, 0.42]} />
        <meshStandardMaterial
          color="#1a3350"
          emissive="#16304c"
          emissiveIntensity={0.4}
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.28, 0.42]}>
        <boxGeometry args={[0.22, 0.38, 0.04]} />
        <meshStandardMaterial color="#5c4030" />
      </mesh>
      <Window x={-0.32} y={0.42} z={0.4} />
      <Window x={0.32} y={0.42} z={0.4} />
      <Window x={-0.58} y={0.44} z={0.12} rotY={Math.PI / 2} />
      <mesh position={[0, 0.16, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.7, 0.35, 0.04]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.85} />
      </mesh>
      <mesh position={[-0.32, 0.22, 0.62]}>
        <boxGeometry args={[0.05, 0.28, 0.05]} />
        <meshStandardMaterial color="#6a5040" />
      </mesh>
      <mesh position={[0.32, 0.22, 0.62]}>
        <boxGeometry args={[0.05, 0.28, 0.05]} />
        <meshStandardMaterial color="#6a5040" />
      </mesh>
    </group>
  );
}

function Window({ x, y, z, rotY = 0 }: { x: number; y: number; z: number; rotY?: number }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, rotY, 0]}>
      <boxGeometry args={[0.22, 0.2, 0.03]} />
      <meshStandardMaterial color="#f2e0b0" emissive="#e8c878" emissiveIntensity={0.65} />
    </mesh>
  );
}

function Tank() {
  return (
    <group position={[2.25, 0, -0.35]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.78, 14]} />
        <meshStandardMaterial color="#ece6d4" roughness={0.42} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.84, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.06, 14]} />
        <meshStandardMaterial color="#c8c0b0" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Shed() {
  return (
    <group position={[2.35, 0, 0.85]} rotation={[0, -0.4, 0]}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.42, 0.4, 0.32]} />
        <meshStandardMaterial color="#8d6a48" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.46, 0]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.48, 0.05, 0.4]} />
        <meshStandardMaterial color="#5a5048" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}

function LotTrees() {
  const spots = [
    [-2.1, -1.4, 0.55],
    [-2.35, 0.9, 0.48],
    [2.4, -1.6, 0.42],
    [0.9, -2.2, 0.5],
    [-1.1, 2.15, 0.46],
    [2.6, 1.5, 0.4],
  ] as const;
  return (
    <group>
      {spots.map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, s * 0.45, 0]}>
            <cylinderGeometry args={[0.05, 0.07, s * 0.7, 6]} />
            <meshStandardMaterial color="#5a3a28" />
          </mesh>
          <mesh position={[0, s * 0.95, 0]}>
            <sphereGeometry args={[s * 0.55, 10, 8]} />
            <meshToonMaterial color={i % 2 ? "#2dad48" : "#3fbf55"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
