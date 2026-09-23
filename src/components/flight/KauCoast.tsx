import { hu, latLonToWorld, terrainY, WORLD_SCALE } from "@/lib/hawaii/world";
import { snapToLand } from "@/lib/hawaii/coast";
import { Puuhonua } from "./Puuhonua";

/**
 * Beaches from the aerials, on the real shore:
 * Punaluʻu black crescent, Papakōlea olive cove, Hāpuna white crescent, Pololū black mouth.
 * Ka Lae stays the cliff.
 */
export function KauCoast() {
  return (
    <group>
      <Punaluu />
      <KaLae />
      <Papakolea />
      <Hapuna />
      <Pololu />
      <Puuhonua />
    </group>
  );
}

function shore(lat: number, lon: number) {
  const snapped = snapToLand(lat, lon);
  if (snapped.y > hu(0.04)) return snapped;
  const { x, z } = latLonToWorld(lat, lon);
  return { x, z, y: terrainY(x, z) };
}

function Punaluu() {
  const { x, z, y } = shore(19.1358, -155.5044);
  const palms = [-0.7, -0.35, 0.0, 0.35, 0.7, 1.0] as const;
  return (
    <group position={[x, y, z]} scale={WORLD_SCALE}>
      <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[0.05, 0.05, 0.22]} scale={[1.55, 0.48, 1]}>
        <circleGeometry args={[0.72, 24]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[0.08, 0.06, 0.48]} scale={[1.35, 0.22, 1]}>
        <circleGeometry args={[0.72, 18]} />
        <meshStandardMaterial color="#f4f7f8" roughness={0.4} transparent opacity={0.82} />
      </mesh>
      <LavaPoint x={-1.15} z={0.15} />
      <LavaPoint x={1.25} z={0.05} />
      {palms.map((px, i) => (
        <Palm key={i} x={px} z={-0.28} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[0.15, 0.04, -0.95]} scale={[0.7, 0.45, 1]}>
        <circleGeometry args={[0.55, 16]} />
        <meshStandardMaterial color="#3aaa48" roughness={0.7} />
      </mesh>
      <mesh position={[0.85, 0.08, -0.45]}>
        <boxGeometry args={[0.22, 0.1, 0.16]} />
        <meshStandardMaterial color="#c4a574" roughness={0.7} />
      </mesh>
      <Honu x={0.1} z={0.18} />
      <Honu x={0.42} z={0.12} />
    </group>
  );
}

function Hapuna() {
  const { x, z, y } = shore(19.9919, -155.8244);
  return (
    <group position={[x, y, z]} scale={WORLD_SCALE} rotation={[0, 0.4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.15, 0.05, 0]} scale={[0.42, 1.7, 1]}>
        <circleGeometry args={[0.85, 24]} />
        <meshStandardMaterial color="#f4e4c8" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.42, 0.06, 0]} scale={[0.12, 1.45, 1]}>
        <circleGeometry args={[0.85, 16]} />
        <meshStandardMaterial color="#f7fbfc" roughness={0.35} transparent opacity={0.75} />
      </mesh>
      <LavaPoint x={0.15} z={-1.35} />
      <LavaPoint x={0.05} z={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.55, 0.04, 0.1]} scale={[0.7, 1.2, 1]}>
        <circleGeometry args={[0.45, 14]} />
        <meshStandardMaterial color="#3d8f45" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Pololu() {
  const { x, z, y } = shore(20.2042, -155.733);
  return (
    <group position={[x, y, z]} scale={WORLD_SCALE}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -0.2]} scale={[0.7, 0.32, 1]}>
        <circleGeometry args={[0.55, 16]} />
        <meshStandardMaterial color="#14120f" roughness={1} />
      </mesh>
      <LavaPoint x={-0.55} z={-0.05} />
      <LavaPoint x={0.6} z={0.05} />
    </group>
  );
}

/** Jump gear on the real lip — no separate palisade in the ocean. */
function KaLae() {
  const p = snapToLand(18.9119, -155.6864);
  const drop = Math.max(hu(0.55), p.y);
  return (
    <group position={[p.x, p.y, p.z]} scale={WORLD_SCALE}>
      <mesh position={[0, -Math.min(p.y / WORLD_SCALE, 0.55) * 0.7, 0.5]} scale={[1.1, 0.8, 1]}>
        <sphereGeometry args={[0.2, 10, 7]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      <GreenHoist y={0} />
      <mesh position={[0.28, 0.1, 0.1]}>
        <boxGeometry args={[0.16, 0.14, 0.12]} />
        <meshStandardMaterial color="#e25a28" roughness={0.55} />
      </mesh>
      <Ladder x={-0.22} top={0} z={0.38} len={(drop / WORLD_SCALE) * 0.55} />
      <Ladder x={0.1} top={0} z={0.42} len={(drop / WORLD_SCALE) * 0.9} />
      <Truck x={-0.55} z={-0.28} y={0} />
      <Truck x={-1.05} z={-0.65} y={0} />
    </group>
  );
}

function GreenHoist({ y }: { y: number }) {
  return (
    <group position={[0, y, 0.35]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[-0.02, 0.38, -0.12]} rotation={[0.08, 0, 0.42]}>
        <boxGeometry args={[0.055, 0.85, 0.055]} />
        <meshStandardMaterial color="#3aaa38" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[-0.02, 0.38, 0.12]} rotation={[-0.08, 0, 0.42]}>
        <boxGeometry args={[0.055, 0.85, 0.055]} />
        <meshStandardMaterial color="#2f9a30" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[-0.28, 0.72, 0]} rotation={[0, 0, 1.15]}>
        <boxGeometry args={[0.045, 0.7, 0.045]} />
        <meshStandardMaterial color="#3aaa38" roughness={0.42} metalness={0.28} />
      </mesh>
      <mesh position={[-0.55, 0.22, 0]}>
        <boxGeometry args={[0.02, 0.55, 0.02]} />
        <meshStandardMaterial color="#8a8e92" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Ladder({ x, top, z, len }: { x: number; top: number; z: number; len: number }) {
  return (
    <group position={[x, top - len / 2, z]}>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.025, len, 0.025]} />
        <meshStandardMaterial color="#c9b48a" roughness={0.65} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.025, len, 0.025]} />
        <meshStandardMaterial color="#c9b48a" roughness={0.65} metalness={0.15} />
      </mesh>
      {[-0.35, -0.15, 0.05, 0.25, 0.4].map((t) => (
        <mesh key={t} position={[0, t * len, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.12]} />
          <meshStandardMaterial color="#b8a070" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Truck({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.32, 0.1, 0.16]} />
        <meshStandardMaterial color="#6a6e72" roughness={0.5} />
      </mesh>
      <mesh position={[0.07, 0.15, 0]}>
        <boxGeometry args={[0.14, 0.1, 0.15]} />
        <meshStandardMaterial color="#4a5056" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Papakolea() {
  const { x, z, y } = shore(18.9364, -155.6464);
  return (
    <group position={[x, y, z]} scale={WORLD_SCALE}>
      <mesh position={[-0.35, 0.28, -0.15]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.55, 1.15]} />
        <meshStandardMaterial color="#b7a588" roughness={0.95} />
      </mesh>
      <mesh position={[0.4, 0.22, -0.35]}>
        <boxGeometry args={[0.9, 0.42, 0.16]} />
        <meshStandardMaterial color="#a89878" roughness={0.95} />
      </mesh>
      <mesh position={[0.55, 0.2, 0.25]}>
        <boxGeometry args={[0.16, 0.4, 0.7]} />
        <meshStandardMaterial color="#c4b496" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.5]} position={[0.05, 0.06, 0.18]} scale={[0.55, 0.32, 1]}>
        <circleGeometry args={[0.48, 16]} />
        <meshStandardMaterial color="#7c8a3a" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.5]} position={[0.02, 0.07, 0.38]} scale={[0.4, 0.14, 1]}>
        <circleGeometry args={[0.48, 12]} />
        <meshStandardMaterial color="#f4f7f8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function LavaPoint({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.08, z]}>
      <coneGeometry args={[0.22, 0.16, 7]} />
      <meshStandardMaterial color="#1a1816" roughness={1} />
    </mesh>
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
