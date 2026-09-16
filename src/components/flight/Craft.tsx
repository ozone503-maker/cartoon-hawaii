import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { UFO_LENGTH, terrainY } from "@/lib/hawaii/world";

const SKIN = "#f2ead8";
const HELMET = "#efe6d2";
const VISOR = "#1c2a38";
const ACCENT = "#d76a4d";

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
      const gy = terrainY(craft.x, craft.z) + 0.05;
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
        <pointLight position={[0, 0.5, 0.15]} color="#d7eef6" intensity={2.1} distance={5} />
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
        <meshStandardMaterial color="#c9d3da" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[1.18, 1.32, 0.16, 40]} />
        <meshStandardMaterial color="#dde4ea" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.95, 0.55, 0.16, 28]} />
        <meshStandardMaterial color="#9aa8b4" metalness={0.65} roughness={0.35} />
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
      <mesh position={[0, 0.22, 0.16]}>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <meshStandardMaterial color="#2a3036" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.38, 0.22]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.32, 0.26, 0.07]} />
        <meshStandardMaterial color="#1a2026" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.28, -0.4]} rotation={[0.48, 0, 0]}>
        <boxGeometry args={[0.72, 0.08, 0.28]} />
        <meshStandardMaterial color="#2e363c" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.335, -0.38]} rotation={[0.48, 0, 0]}>
        <planeGeometry args={[0.22, 0.15]} />
        <meshStandardMaterial color="#1a6a88" emissive="#0d8a9e" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[-0.22, 0.325, -0.36]} rotation={[0.48, 0, 0]}>
        <circleGeometry args={[0.048, 16]} />
        <meshStandardMaterial color="#9aa8b0" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.22, 0.325, -0.36]} rotation={[0.48, 0, 0]}>
        <circleGeometry args={[0.048, 16]} />
        <meshStandardMaterial color="#9aa8b0" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Dome() {
  return (
    <mesh position={[0, 0.4, 0]} renderOrder={4}>
      <sphereGeometry args={[0.86, 32, 20, 0, Math.PI * 2, 0, Math.PI / 1.72]} />
      <meshStandardMaterial
        color="#d8eef8"
        transparent
        opacity={0.22}
        roughness={0.08}
        metalness={0.08}
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
        <meshStandardMaterial color="#9aa8b3" metalness={0.62} roughness={0.32} />
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
    <group position={[0, 0.22, 0.08]} renderOrder={2}>
      <mesh position={[0, 0.18, 0.02]}>
        <cylinderGeometry args={[0.13, 0.16, 0.28, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.34, 0.02]}>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshStandardMaterial color={HELMET} roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.42, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.145, 0.028, 8, 20]} />
        <meshStandardMaterial color={ACCENT} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.36, -0.09]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.04]} />
        <meshStandardMaterial color={VISOR} roughness={0.2} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.58, 0.02]}>
        <cylinderGeometry args={[0.012, 0.018, 0.16, 8]} />
        <meshStandardMaterial color="#c8c0b4" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.68, 0.02]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[-0.16, 0.34, 0.02]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={HELMET} roughness={0.4} />
      </mesh>
      <mesh position={[0.16, 0.34, 0.02]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={HELMET} roughness={0.4} />
      </mesh>
      <mesh position={[-0.18, 0.12, 0.02]} rotation={[0.9, 0, 0.4]}>
        <cylinderGeometry args={[0.025, 0.03, 0.28, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      <mesh position={[0.18, 0.12, 0.02]} rotation={[0.9, 0, -0.4]}>
        <cylinderGeometry args={[0.025, 0.03, 0.28, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      <mesh position={[-0.2, 0.16, -0.22]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 0.16, -0.22]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
    </group>
  );
}
