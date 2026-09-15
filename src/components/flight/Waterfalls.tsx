import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, ShaderMaterial, Vector3 } from "three";
import type { Fall } from "@/lib/hawaii/rivers";
import { latLonToWorld, terrainY } from "@/lib/hawaii/world";

const waterMat = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      float x = fract(vUv.x * 9.0 + sin(vUv.y * 28.0 + uTime) * 0.08);
      float streak = smoothstep(0.42, 0.08, abs(x - 0.5));
      float flow = fract(vUv.y * 7.0 - uTime * 1.6);
      vec3 deep = vec3(0.42, 0.78, 0.92);
      vec3 foam = vec3(0.95, 0.98, 1.0);
      vec3 col = mix(deep, foam, streak * 0.75 + flow * 0.22);
      float alpha = 0.62 + streak * 0.35;
      gl_FragColor = vec4(col, alpha);
    }
  `,
});

export function WaterTick() {
  useFrame((_, dt) => {
    waterMat.uniforms.uTime.value += dt;
  });
  return null;
}

export function Waterfall({ fall, points }: { fall: Fall; points: Vector3[] }) {
  const { x, z } = latLonToWorld(fall.lat, fall.lon);
  const y = terrainY(x, z);
  const yaw = useMemo(() => {
    let best = 0;
    let d = Infinity;
    points.forEach((p, i) => {
      const dd = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (dd < d) {
        d = dd;
        best = i;
      }
    });
    const nxt = points[Math.min(points.length - 1, best + 1)] ?? points[best]!;
    const prv = points[Math.max(0, best - 1)]!;
    return Math.atan2(nxt.x - prv.x, nxt.z - prv.z);
  }, [points, x, z]);

  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      {fall.kind === "rainbow" && <RainbowFall h={fall.h} w={fall.w} />}
      {fall.kind === "plunge" && <PlungeFall h={fall.h} w={fall.w} />}
      {fall.kind === "cascade" && <CascadeFall h={fall.h} w={fall.w} />}
      {fall.kind === "pots" && <PotsFall w={fall.w} />}
      {fall.kind === "thread" && <ThreadFall h={fall.h} w={fall.w} />}
    </group>
  );
}

function Sheet({ w, h, y, z }: { w: number; h: number; y: number; z: number }) {
  return (
    <mesh position={[0, y, z]} material={waterMat}>
      <boxGeometry args={[w, h, 0.14]} />
    </mesh>
  );
}

function Veil({ w, h }: { w: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h + 0.05, -0.04]}>
        <boxGeometry args={[w * 1.5, 0.1, 0.28]} />
        <meshStandardMaterial color="#6a6358" roughness={0.95} />
      </mesh>
      <Sheet w={w} h={h} y={h / 2} z={0.06} />
      <Sheet w={w * 0.62} h={h} y={h / 2} z={0.12} />
      <Sheet w={w * 0.35} h={h * 0.92} y={h / 2} z={0.18} />
      <Mist y={h * 0.12} z={0.16} s={w * 0.7} />
      <Mist y={h * 0.08} z={0.22} s={w * 0.45} />
    </group>
  );
}

function Pool({ r, z, dark }: { r: number; z: number; dark?: boolean }) {
  return (
    <mesh position={[0, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 16]} />
      <meshStandardMaterial color={dark ? "#163a4a" : "#1f6a88"} roughness={0.22} metalness={0.12} />
    </mesh>
  );
}

function Mist({ y, z, s }: { y: number; z: number; s: number }) {
  return (
    <mesh position={[0, y, z]}>
      <sphereGeometry args={[s, 8, 6]} />
      <meshStandardMaterial color="#e8f6ff" transparent opacity={0.32} depthWrite={false} />
    </mesh>
  );
}

function RainbowFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Veil w={w} h={h} />
      <mesh position={[-0.28, h * 0.28, -0.08]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      <Pool r={0.65} z={0.32} />
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c} position={[0, 0.28, 0.38]} rotation={[0.25, 0, 0]}>
          <torusGeometry args={[0.42 + i * 0.028, 0.012, 6, 18, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function PlungeFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Veil w={w} h={h} />
      <Pool r={w * 1.6} z={0.2} dark />
    </group>
  );
}

function CascadeFall({ h, w }: { h: number; w: number }) {
  const n = 3;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const th = h / n;
        return (
          <group key={i} position={[0, 0, i * 0.1]}>
            <Veil w={w * (1 - i * 0.1)} h={th} />
            <group position={[0, i * th, 0]}>
              <Pool r={w * 0.45} z={0.14} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

function PotsFall({ w }: { w: number }) {
  const pots = [-0.45, -0.15, 0.15, 0.45];
  return (
    <group>
      {pots.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * 0.32, 12]} />
            <meshStandardMaterial color="#1a4a5c" roughness={0.25} emissive="#0a3040" emissiveIntensity={0.35} />
          </mesh>
          {i < pots.length - 1 ? (
            <Sheet w={w * 0.22} h={0.16} y={0.1} z={(z + pots[i + 1]!) / 2} />
          ) : null}
        </group>
      ))}
    </group>
  );
}

function ThreadFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Veil w={w} h={h} />
      <Pool r={w * 1.05} z={0.14} />
    </group>
  );
}
