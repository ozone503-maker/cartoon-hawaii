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
      float alpha = 0.52 + streak * 0.4;
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
      <planeGeometry args={[w, h]} />
    </mesh>
  );
}

function Pool({ r, z, dark }: { r: number; z: number; dark?: boolean }) {
  return (
    <mesh position={[0, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 18]} />
      <meshStandardMaterial color={dark ? "#163a4a" : "#1f6a88"} roughness={0.22} metalness={0.12} />
    </mesh>
  );
}

function Mist({ y, z, s }: { y: number; z: number; s: number }) {
  return (
    <mesh position={[0, y, z]}>
      <sphereGeometry args={[s, 8, 6]} />
      <meshStandardMaterial color="#e8f6ff" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}

function Bowl({ r, h }: { r: number; h: number }) {
  return (
    <group>
      <mesh position={[0, h / 2, -r * 0.12]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[r, r * 0.92, h, 18, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#3a4634" roughness={0.96} side={DoubleSide} />
      </mesh>
      <mesh position={[0, h + 0.03, -r * 0.08]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <ringGeometry args={[r * 0.55, r * 1.08, 16, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#3d8a4a" roughness={0.9} side={DoubleSide} />
      </mesh>
    </group>
  );
}

/** Waiānuenue — cave in the lava, plunge into a round pool, rainbow in the mist. */
function RainbowFall({ h, w }: { h: number; w: number }) {
  const r = 1.15;
  return (
    <group>
      <Bowl r={r} h={h * 0.95} />
      <mesh position={[-0.42, h * 0.38, -0.08]}>
        <sphereGeometry args={[0.32, 12, 10, 0, Math.PI]} />
        <meshStandardMaterial color="#0e0c0a" roughness={1} />
      </mesh>
      <Sheet w={w} h={h} y={h / 2} z={0.06} />
      <Sheet w={w * 0.45} h={h} y={h / 2} z={0.09} />
      <Pool r={0.95} z={0.42} />
      <Mist y={0.28} z={0.38} s={0.42} />
      <Mist y={0.45} z={0.32} s={0.28} />
      {["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"].map((c, i) => (
        <mesh key={c} position={[0, 0.42, 0.5]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.62 + i * 0.035, 0.016, 6, 22, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  );
}

/** ʻAkaka / Hiʻilawe — tall thin ribbon in a rainforest gorge. */
function PlungeFall({ h, w }: { h: number; w: number }) {
  const r = Math.max(0.85, h * 0.32);
  return (
    <group>
      <Bowl r={r} h={h} />
      <Sheet w={w} h={h} y={h / 2} z={0.05} />
      <Sheet w={w * 0.4} h={h} y={h / 2} z={0.08} />
      <Pool r={w * 2.4} z={0.22} dark />
      <Mist y={0.35} z={0.2} s={w * 1.6} />
      <Mist y={h * 0.22} z={0.12} s={w * 1.1} />
    </group>
  );
}

function CascadeFall({ h, w }: { h: number; w: number }) {
  const n = 3;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const th = h / n;
        const y = th * (i + 0.5);
        const z = 0.04 + i * 0.14;
        return (
          <group key={i}>
            <Sheet w={w * (1 - i * 0.08)} h={th} y={y} z={z} />
            <Pool r={w * 0.55} z={z + 0.08} />
          </group>
        );
      })}
      <Mist y={0.2} z={0.28} s={w * 0.7} />
    </group>
  );
}

function PotsFall({ w }: { w: number }) {
  const pots = [-0.55, -0.18, 0.18, 0.55];
  return (
    <group>
      {pots.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * 0.38, 12]} />
            <meshStandardMaterial color="#1a4a5c" roughness={0.25} emissive="#0a3040" emissiveIntensity={0.35} />
          </mesh>
          {i < pots.length - 1 ? <Sheet w={w * 0.22} h={0.22} y={0.16} z={(z + pots[i + 1]!) / 2} /> : null}
        </group>
      ))}
    </group>
  );
}

function ThreadFall({ h, w }: { h: number; w: number }) {
  return (
    <group>
      <Sheet w={w} h={h} y={h / 2} z={0.04} />
      <Pool r={w * 1.3} z={0.14} />
      <Mist y={0.16} z={0.12} s={w * 0.9} />
    </group>
  );
}
