import { DoubleSide } from "three";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";
import { Puuhonua } from "./Puuhonua";

/**
 * Kaʻū shore as it actually is:
 * Punaluʻu = black-sand beach on the water, honu, a few palms inland.
 * Ka Lae = grassy south point, cliffs into deep water — not rainforest.
 */
export function KauCoast() {
  return (
    <group>
      <Punaluu />
      <KaLae />
      <Papakolea />
      <Puuhonua />
    </group>
  );
}

function Punaluu() {
  const { x, z } = latLonToWorld(19.1358, -155.5044);
  const y = terrainY(x, z);
  const palms = [
    [-0.85, -0.55],
    [-0.4, -0.7],
    [0.15, -0.62],
    [0.7, -0.5],
    [1.05, -0.28],
  ] as const;
  const honu = [
    [-0.25, 0.12],
    [0.35, 0.05],
    [0.05, 0.28],
  ] as const;
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[0.1, 0.04, 0.15]} scale={[1.7, 0.85, 1]}>
        <circleGeometry args={[1, 20]} />
        <meshStandardMaterial color="#1a1818" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[0.15, 0.05, 0.22]} scale={[1.15, 0.5, 1]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#0e0e10" roughness={1} />
      </mesh>
      {palms.map(([px, pz], i) => (
        <Palm key={i} x={px} z={pz} />
      ))}
      {honu.map(([hx, hz], i) => (
        <Honu key={i} x={hx} z={hz} />
      ))}
    </group>
  );
}

function KaLae() {
  const { x, z } = latLonToWorld(18.9108, -155.6813);
  const y = terrainY(x, z);
  const H = 2.85;
  return (
    <group position={[x, y, z]}>
      {/* Grass peninsula — not a pancake. Tip points south into the drop. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -0.35]} scale={[1.15, 1.7, 1]}>
        <circleGeometry args={[1.55, 20]} />
        <meshStandardMaterial color="#b8954a" roughness={0.96} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0.55]} scale={[0.95, 1.05, 1]}>
        <circleGeometry args={[1.15, 16]} />
        <meshStandardMaterial color="#c4a45a" roughness={0.96} />
      </mesh>

      {/* South face — the famous drop into the current */}
      <mesh position={[0.05, -H / 2, 1.55]}>
        <boxGeometry args={[2.6, H, 0.22]} />
        <meshStandardMaterial color="#6b5340" roughness={0.92} />
      </mesh>
      <mesh position={[0.05, -H * 0.72, 1.78]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[2.5, H * 0.55, 0.18]} />
        <meshStandardMaterial color="#4a382c" roughness={0.94} />
      </mesh>

      {/* West face — jump and fish side */}
      <mesh position={[-1.22, -H / 2, 0.35]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[0.22, H, 2.9]} />
        <meshStandardMaterial color="#5c4838" roughness={0.92} />
      </mesh>
      <mesh position={[-1.42, -H * 0.7, 0.45]} rotation={[0, 0.18, 0.12]}>
        <boxGeometry args={[0.18, H * 0.6, 2.7]} />
        <meshStandardMaterial color="#3f3028" roughness={0.94} />
      </mesh>

      {/* East face, lower */}
      <mesh position={[1.18, -H / 2.3, 0.5]} rotation={[0, -0.12, 0]}>
        <boxGeometry args={[0.18, H * 0.85, 2.4]} />
        <meshStandardMaterial color="#6a5340" roughness={0.93} />
      </mesh>

      {/* Concrete jump pad on the SW lip */}
      <mesh position={[-0.72, 0.08, 1.05]}>
        <boxGeometry args={[0.55, 0.07, 0.7]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.62} />
      </mesh>
      <mesh position={[-0.72, 0.13, 1.28]}>
        <boxGeometry args={[0.5, 0.04, 0.12]} />
        <meshStandardMaterial color="#7a8086" roughness={0.55} />
      </mesh>

      {/* Rusted ladder down the west face */}
      {[-0.2, -0.7, -1.2, -1.7].map((ly) => (
        <mesh key={ly} position={[-1.28, ly, 1.0]}>
          <boxGeometry args={[0.04, 0.08, 0.28]} />
          <meshStandardMaterial color="#8a5a38" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-1.28, -0.95, 0.88]}>
        <boxGeometry args={[0.03, 1.9, 0.03]} />
        <meshStandardMaterial color="#6a4030" metalness={0.45} roughness={0.48} />
      </mesh>
      <mesh position={[-1.28, -0.95, 1.12]}>
        <boxGeometry args={[0.03, 1.9, 0.03]} />
        <meshStandardMaterial color="#6a4030" metalness={0.45} roughness={0.48} />
      </mesh>

      {/* Deep water under the jump — the current that pulls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, -H - 0.05, 2.4]}>
        <circleGeometry args={[2.2, 16]} />
        <meshStandardMaterial color="#062038" roughness={0.22} metalness={0.12} />
      </mesh>
    </group>
  );
}

function Papakolea() {
  const { x, z } = latLonToWorld(18.9364, -155.6464);
  const y = terrainY(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[0, 0.05, 0.1]} scale={[0.7, 0.42, 1]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#5a7a38" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.18, -0.35]}>
        <cylinderGeometry args={[0.55, 0.7, 0.35, 10, 1, true]} />
        <meshStandardMaterial color="#8a5a38" roughness={0.92} side={DoubleSide} />
      </mesh>
    </group>
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
