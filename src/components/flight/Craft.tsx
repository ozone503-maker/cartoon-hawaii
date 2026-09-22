import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { hu, UFO_LENGTH, terrainY } from "@/lib/hawaii/world";

/** Glossy candy-blue — the standing-portrait look, not Minecraft plastic. */
const SKIN = "#3ec8e8";
const SKIN_DEEP = "#2bb4d6";
const SKIN_MAT = { color: SKIN, metalness: 0.78, roughness: 0.16 } as const;
const SKIN_DARK = { color: SKIN_DEEP, metalness: 0.8, roughness: 0.18 } as const;
const EYE = { color: "#07080a", metalness: 0.55, roughness: 0.12 } as const;
const CHROME = { color: "#c5d2dc", metalness: 0.82, roughness: 0.16 } as const;
const CHROME_DARK = { color: "#8a9aaa", metalness: 0.78, roughness: 0.22 } as const;

/**
 * MDP faces local −Z (flight forward). The chase cam sits on local +Z,
 * so the player sees the back of the cranium through the bubble — the
 * same rear composition as the reference, not a portrait.
 */
export function Craft({ craft }: { craft: CraftState }) {
  const ref = useRef<Group>(null);
  const bank = useRef(0);
  const shadow = useRef<Group>(null);

  useFrame((_, rawDt) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(0.05, rawDt);
    g.position.set(craft.x, craft.y, craft.z);
    const target = -craft.steer * (0.18 + Math.min(0.16, Math.abs(craft.speed) * 0.02));
    bank.current += (target - bank.current) * (1 - Math.exp(-8 * dt));
    g.rotation.order = "YXZ";
    g.rotation.y = craft.yaw;
    g.rotation.x = craft.vy * 0.018;
    g.rotation.z = bank.current;
    if (shadow.current) {
      const gy = terrainY(craft.x, craft.z) + hu(0.05);
      shadow.current.position.set(craft.x, gy, craft.z);
    }
  });

  const s = UFO_LENGTH / 2.2;
  return (
    <>
      <group ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <circleGeometry args={[1.15, 20]} />
          <meshBasicMaterial color="#061018" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>
      <group ref={ref} scale={s} position={[craft.x, craft.y, craft.z]} rotation={[0, craft.yaw, 0]}>
        <pointLight position={[0.35, 0.7, 0.4]} color="#e8f6ff" intensity={2.4} distance={6} />
        <pointLight position={[-0.4, 0.45, -0.2]} color="#7ad4ea" intensity={1.1} distance={4} />
        <Hull />
        <Cockpit />
        <Mdp />
        <Dome />
        <Leg x={-0.62} z={0.58} />
        <Leg x={0.62} z={0.58} />
        <Leg x={0} z={-0.78} />
      </group>
    </>
  );
}

function Hull() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[1.32, 1.42, 0.18, 40]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[1.18, 1.32, 0.16, 40]} />
        <meshStandardMaterial color="#d8e4ee" metalness={0.86} roughness={0.12} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.95, 0.55, 0.16, 28]} />
        <meshStandardMaterial {...CHROME_DARK} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.28, 0.055, 10, 48]} />
        <meshStandardMaterial color="#3ad6e8" emissive="#1ec5d8" emissiveIntensity={2.1} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.03, 8, 40]} />
        <meshStandardMaterial color="#3ad6e8" emissive="#1ec5d8" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Cockpit() {
  return (
    <group>
      <mesh position={[0, 0.16, 0.12]}>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color="#1a2026" metalness={0.4} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.28, -0.4]} rotation={[0.48, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.08, 20]} />
        <meshStandardMaterial color="#2a3238" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.335, -0.38]} rotation={[0.48, 0, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#1a6a88" emissive="#0d8a9e" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Dome() {
  return (
    <mesh position={[0, 0.38, 0]} renderOrder={4}>
      <sphereGeometry args={[0.92, 32, 20, 0, Math.PI * 2, 0, Math.PI / 1.65]} />
      <meshStandardMaterial
        color="#cfeaf6"
        transparent
        opacity={0.14}
        roughness={0.06}
        metalness={0.05}
        depthWrite={false}
      />
    </mesh>
  );
}

function Leg({ x, z }: { x: number; z: number }) {
  const lean = Math.atan2(x, z) * 0.15;
  return (
    <group position={[x, -0.08, z]} rotation={[z > 0 ? 0.35 : -0.28, 0, lean]}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.042, 0.48, 8]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#3ad6e8" emissive="#1ec5d8" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Mdp() {
  return (
    <group position={[0, 0.18, 0.1]} renderOrder={2}>
      {/* torso */}
      <mesh position={[0, 0.2, 0.04]} scale={[0.62, 1.05, 0.42]}>
        <sphereGeometry args={[0.16, 16, 14]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      <mesh position={[0, 0.08, 0.05]} scale={[0.7, 0.45, 0.5]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial {...SKIN_DARK} />
      </mesh>
      {/* thin neck */}
      <mesh position={[0, 0.38, 0.05]}>
        <cylinderGeometry args={[0.028, 0.038, 0.14, 12]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      {/* giant glossy cranium */}
      <mesh position={[0, 0.58, 0.1]} scale={[1.12, 1.28, 1.15]}>
        <sphereGeometry args={[0.22, 24, 20]} />
        <meshStandardMaterial {...SKIN_DARK} />
      </mesh>
      <mesh position={[-0.12, 0.32, 0.12]} scale={[0.55, 0.42, 0.5]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      <mesh position={[0.12, 0.32, 0.12]} scale={[0.55, 0.42, 0.5]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      <mesh position={[0.06, 0.7, -0.02]} scale={[0.45, 0.32, 0.28]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#dff6ff" metalness={0.9} roughness={0.06} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* almond eyes — wrap far enough that banked chase still catches them */}
      <mesh position={[-0.085, 0.55, -0.145]} rotation={[0.2, 0.42, 0.08]} scale={[1.35, 0.72, 0.32]}>
        <sphereGeometry args={[0.062, 14, 12]} />
        <meshStandardMaterial {...EYE} />
      </mesh>
      <mesh position={[0.085, 0.55, -0.145]} rotation={[0.2, -0.42, -0.08]} scale={[1.35, 0.72, 0.32]}>
        <sphereGeometry args={[0.062, 14, 12]} />
        <meshStandardMaterial {...EYE} />
      </mesh>
      <mesh position={[-0.07, 0.56, -0.168]} scale={[0.35, 0.28, 0.12]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#cfe8f4" metalness={0.9} roughness={0.08} />
      </mesh>
      <mesh position={[0.07, 0.56, -0.168]} scale={[0.35, 0.28, 0.12]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#cfe8f4" metalness={0.9} roughness={0.08} />
      </mesh>
      {/* skinny arms on the console */}
      <mesh position={[-0.14, 0.18, 0.02]} rotation={[1.12, 0, 0.55]}>
        <cylinderGeometry args={[0.02, 0.028, 0.32, 8]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      <mesh position={[0.14, 0.18, 0.02]} rotation={[1.12, 0, -0.55]}>
        <cylinderGeometry args={[0.02, 0.028, 0.32, 8]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      <mesh position={[-0.2, 0.2, -0.24]} scale={[1.1, 0.7, 1.4]}>
        <sphereGeometry args={[0.034, 10, 8]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      <mesh position={[0.2, 0.2, -0.24]} scale={[1.1, 0.7, 1.4]}>
        <sphereGeometry args={[0.034, 10, 8]} />
        <meshStandardMaterial {...SKIN_MAT} />
      </mesh>
      <mesh position={[-0.2, 0.205, -0.22]} rotation={[1.2, 0, 0.2]}>
        <torusGeometry args={[0.022, 0.006, 6, 10]} />
        <meshStandardMaterial color="#1a1c1e" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
