import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { DRIVEWAY, mountainViewWorld } from "@/lib/hawaii/puna";
import { hu, isCanopy, latLonToWorld, terrainY, WORLD_SCALE, wu } from "@/lib/hawaii/world";

function hash(i: number) {
  let n = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Hwy 11 strip at the surveyed post office — shops, not a downtown. */
export function MountainView() {
  const po = mountainViewWorld();
  const y = terrainY(po.x, po.z);
  const hilo = latLonToWorld(19.592, -155.057);
  const fx = hilo.x - po.x;
  const fz = hilo.z - po.z;
  const len = Math.hypot(fx, fz) || 1;
  const hx = fx / len;
  const hz = fz / len;
  const yaw = Math.atan2(hx, hz);
  const rx = hz;
  const rz = -hx;

  const lots = useMemo(() => jungleLots(po.x, po.z), [po.x, po.z]);
  const drive = useMemo(
    () =>
      DRIVEWAY.map(([lat, lon]) => {
        const { x, z } = latLonToWorld(lat, lon);
        return new Vector3(x, terrainY(x, z) + hu(0.08), z);
      }),
    [],
  );

  return (
    <group>
      <group position={[po.x, y, po.z]} rotation={[0, yaw, 0]} scale={WORLD_SCALE}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <planeGeometry args={[7.2, 0.7]} />
          <meshStandardMaterial color="#c4b496" roughness={0.78} />
        </mesh>
        <Shop z={-1.4} x={0.55} w={0.7} d={0.45} h={0.42} color="#f4f0e6" trim="#3a5a9a" />
        <Shop z={-0.35} x={0.58} w={0.55} d={0.4} h={0.38} color="#d2b48c" trim="#8a4a32" />
        <Shop z={0.55} x={0.52} w={0.48} d={0.36} h={0.34} color="#c45c4a" trim="#f4ecd6" />
        <Shop z={1.45} x={0.6} w={0.62} d={0.42} h={0.4} color="#e8d6b0" trim="#5a7a68" />
        <mesh position={[-0.7, 0.22, -0.8]}>
          <boxGeometry args={[0.18, 0.16, 0.32]} />
          <meshStandardMaterial color="#f0c040" />
        </mesh>
      </group>
      {lots.map((lot) => (
        <JungleCabin key={lot.i} {...lot} />
      ))}
      <Line points={drive} color="#b08a60" lineWidth={2.2} />
      <group position={[po.x + rx * wu(2.2), y, po.z + rz * wu(2.2)]} scale={WORLD_SCALE}>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 1.1, 6]} />
          <meshStandardMaterial color="#6a5648" />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.35, 0.12, 0.04]} />
          <meshStandardMaterial color="#d76a4d" />
        </mesh>
      </group>
    </group>
  );
}

function Shop({
  z,
  x,
  w,
  d,
  h,
  color,
  trim,
}: {
  z: number;
  x: number;
  w: number;
  d: number;
  h: number;
  color: string;
  trim: string;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[d, h, w]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>
      <mesh position={[0, h + 0.04, 0]}>
        <boxGeometry args={[d + 0.06, 0.06, w + 0.08]} />
        <meshStandardMaterial color={trim} roughness={0.55} />
      </mesh>
      <mesh position={[-d / 2 - 0.01, h * 0.45, 0]}>
        <boxGeometry args={[0.02, h * 0.28, w * 0.28]} />
        <meshStandardMaterial color="#f2e0b0" emissive="#e8c878" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

type Lot = { i: number; x: number; z: number; y: number; yaw: number; h: number; w: number };

function jungleLots(cx: number, cz: number): Lot[] {
  const out: Lot[] = [];
  for (let i = 0; i < 22; i++) {
    const a = hash(i) * Math.PI * 2;
    const r = wu(3.4) + hash(i + 3) * wu(9.5);
    const x = cx + Math.cos(a) * r * 0.85 - wu(2.4);
    const z = cz + Math.sin(a) * r;
    if (!isCanopy(x, z)) continue;
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < wu(2.2) * wu(2.2)) continue;
    const ft = latLonToWorld(19.5397, -155.1417);
    const fdx = x - ft.x;
    const fdz = z - ft.z;
    if (fdx * fdx + fdz * fdz < wu(3.4) * wu(3.4)) continue;
    out.push({
      i,
      x,
      z,
      y: terrainY(x, z),
      yaw: hash(i + 9) * 6.2,
      h: hu(0.22) + hash(i + 5) * hu(0.18),
      w: wu(0.28) + hash(i + 7) * wu(0.16),
    });
  }
  return out;
}

function JungleCabin({ x, y, z, yaw, h, w }: Lot) {
  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, w * 0.72]} />
        <meshStandardMaterial color="#c4a07a" roughness={0.85} />
      </mesh>
      <mesh position={[0, h + hu(0.03), 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[w + wu(0.06), hu(0.05), w * 0.82]} />
        <meshStandardMaterial color="#5a5048" metalness={0.18} roughness={0.5} />
      </mesh>
    </group>
  );
}
