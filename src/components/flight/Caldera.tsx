import { DoubleSide } from "three";
import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { Vector3 } from "three";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

/**
 * Kīlauea: caldera + Halemaʻumaʻu pit, not a glowing pancake.
 * ~4 km across in real life. Floor black, steam, rim drive.
 */
export function Caldera() {
  const { x, z } = latLonToWorld(19.4069, -155.2834);
  const y = terrainY(x, z);
  const rim = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const rx = Math.cos(a) * 3.55;
      const rz = Math.sin(a) * 2.65;
      const wx = x + rx;
      const wz = z + rz;
      pts.push(new Vector3(rx, terrainY(wx, wz) - y + 0.08, rz));
    }
    return pts;
  }, [x, z, y]);

  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.18]} position={[0.15, -0.92, 0.1]} scale={[1.18, 0.82, 1]}>
        <circleGeometry args={[3.15, 28]} />
        <meshStandardMaterial color="#1c1410" roughness={0.96} />
      </mesh>
      <mesh rotation={[0, 0.18, 0]} position={[0.15, -0.46, 0.1]} scale={[1.18, 1, 0.82]}>
        <cylinderGeometry args={[3.2, 3.0, 0.95, 28, 1, true]} />
        <meshStandardMaterial color="#5a4034" roughness={0.95} side={DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.18]} position={[0.15, 0.02, 0.1]} scale={[1.18, 0.82, 1]}>
        <ringGeometry args={[3.05, 3.55, 28]} />
        <meshStandardMaterial color="#3d2a22" roughness={0.94} />
      </mesh>
      <group position={[-0.95, -0.92, 0.55]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.05, 20]} />
          <meshStandardMaterial color="#120c0a" roughness={0.98} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[1.05, 0.82, 0.55, 20, 1, true]} />
          <meshStandardMaterial color="#2a1814" roughness={0.96} side={DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]}>
          <circleGeometry args={[0.72, 16]} />
          <meshStandardMaterial color="#c45a22" emissive="#ff6a20" emissiveIntensity={0.85} roughness={0.45} />
        </mesh>
        <pointLight color="#ff7a28" intensity={1.6} distance={8} position={[0, -0.2, 0]} />
      </group>
      <Steam x={-0.7} z={0.4} />
      <Steam x={-1.2} z={0.7} />
      <Steam x={-0.5} z={0.9} />
      <Pit lat={19.395} lon={-155.265} r={0.55} />
      <Pit lat={19.386} lon={-155.25} r={0.42} />
      <Line points={rim} color="#c4b090" lineWidth={1.6} />
    </group>
  );
}

function Steam({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.35, z]}>
      <coneGeometry args={[0.18, 1.1, 6]} />
      <meshStandardMaterial color="#e8eef2" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}

function Pit({ lat, lon, r }: { lat: number; lon: number; r: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  const origin = latLonToWorld(19.4069, -155.2834);
  return (
    <group position={[x - origin.x, y - terrainY(origin.x, origin.z) - 0.12, z - origin.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 14]} />
        <meshStandardMaterial color="#1a1210" roughness={0.97} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[r, r * 0.88, 0.28, 14, 1, true]} />
        <meshStandardMaterial color="#4a342c" roughness={0.95} side={DoubleSide} />
      </mesh>
    </group>
  );
}