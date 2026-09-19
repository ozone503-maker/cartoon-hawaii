import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { ACCESS_ROAD, TELESCOPES, summitWorld } from "@/lib/hawaii/maunakea";
import { hu, latLonToWorld, terrainY, WORLD_SCALE, wu } from "@/lib/hawaii/world";

/**
 * Summit ridge of Mauna Kea. Telescopes sit on surveyed IFA pins.
 * The true peak (Puʻu Wēkiu) has no dome and no fake cinder disc.
 */
export function MaunaKea() {
  const p = summitWorld();
  const y = terrainY(p.x, p.z);

  const road = useMemo(
    () =>
      ACCESS_ROAD.map(([lat, lon]) => {
        const { x, z } = latLonToWorld(lat, lon);
        return new Vector3(x, terrainY(x, z) + hu(0.09), z);
      }),
    [],
  );

  return (
    <group>
      <Peak />
      {TELESCOPES.map((t) => (
        <Observatory key={t.id} {...t} />
      ))}
      <Line points={road} color="#c8b8a0" lineWidth={2.4} />
      <pointLight position={[p.x, y + hu(3.2), p.z]} color="#e8f0ff" intensity={1.6} distance={wu(14)} />
    </group>
  );
}

function Peak() {
  const p = summitWorld();
  const y = terrainY(p.x, p.z);
  // Dark alpine cinder / bare rock — NO snow (Jessie override).
  return (
    <group position={[p.x, y, p.z]} scale={WORLD_SCALE}>
      <mesh position={[0, 0.12, 0]}>
        <coneGeometry args={[0.42, 0.28, 8]} />
        <meshStandardMaterial color="#6a5248" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#5a5048" roughness={0.92} />
      </mesh>
    </group>
  );
}

type Scope = (typeof TELESCOPES)[number];

function Observatory(t: Scope) {
  const { x, z } = latLonToWorld(t.lat, t.lon);
  const y = terrainY(x, z);
  return (
    <group position={[x, y, z]} scale={WORLD_SCALE}>
      {t.kind === "keck" && <Keck />}
      {t.kind === "subaru" && <Subaru />}
      {t.kind === "gemini" && <Gemini />}
      {t.kind === "white" && <WhiteDome r={t.r} />}
      {t.kind === "ukirt" && <Ukirt />}
      {t.kind === "jcmt" && <Jcmt />}
      {t.kind === "sma" && <Sma />}
    </group>
  );
}

const SILVER = "#d8dee6";
const WHITE = "#f3f1ea";

function Keck() {
  return (
    <group>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.52, 0.56, 0.46]} />
        <meshStandardMaterial color={SILVER} metalness={0.45} roughness={0.35} emissive="#9aa4b0" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0.46, 0]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.4, 0.08, 0.36]} />
        <meshStandardMaterial color="#c9d0d8" metalness={0.5} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.32, 0.18]}>
        <boxGeometry args={[0.08, 0.28, 0.02]} />
        <meshStandardMaterial color="#1a2430" />
      </mesh>
    </group>
  );
}

function Subaru() {
  return (
    <group>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.72, 14]} />
        <meshStandardMaterial color={SILVER} metalness={0.4} roughness={0.38} emissive="#9aa4b0" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0.14, 0.34, 0]}>
        <boxGeometry args={[0.06, 0.4, 0.18]} />
        <meshStandardMaterial color="#1c2834" />
      </mesh>
    </group>
  );
}

function Gemini() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.28, 14]} />
        <meshStandardMaterial color={SILVER} metalness={0.38} roughness={0.4} emissive="#9aa4b0" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={SILVER} metalness={0.42} roughness={0.34} emissive="#9aa4b0" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0.12, 0.4, 0]}>
        <boxGeometry args={[0.05, 0.22, 0.14]} />
        <meshStandardMaterial color="#1c2834" />
      </mesh>
    </group>
  );
}

function WhiteDome({ r }: { r: number }) {
  return (
    <group>
      <mesh position={[0, r * 0.7, 0]}>
        <cylinderGeometry args={[r, r * 1.05, r * 1.1, 12]} />
        <meshStandardMaterial color={WHITE} roughness={0.55} emissive="#e8e4dc" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, r * 1.35, 0]}>
        <sphereGeometry args={[r * 1.02, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={WHITE} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Ukirt() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.28, 0.32, 0.24]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.34, 0]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.3, 0.06, 0.28]} />
        <meshStandardMaterial color="#c8c2b8" metalness={0.2} roughness={0.45} />
      </mesh>
    </group>
  );
}

function Jcmt() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.5, 16]} />
        <meshStandardMaterial color={WHITE} roughness={0.48} emissive="#e8e4dc" emissiveIntensity={0.14} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.05, 16]} />
        <meshStandardMaterial color="#d8d4cc" />
      </mesh>
    </group>
  );
}

function Sma() {
  const dishes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (i / 8) * Math.PI * 2;
    return { x: Math.cos(a) * 0.32, z: Math.sin(a) * 0.32 };
  });
  return (
    <group>
      {dishes.map((d, i) => (
        <group key={i} position={[d.x, 0, d.z]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.16, 6]} />
            <meshStandardMaterial color="#9aa2aa" metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.18, 0]} rotation={[0.55, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.02, 0.04, 10]} />
            <meshStandardMaterial color={WHITE} metalness={0.35} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
