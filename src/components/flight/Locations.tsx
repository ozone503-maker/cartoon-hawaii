import { Html } from "@react-three/drei";
import { AIRPORTS } from "@/lib/hawaii/highways";
import { MAP_SIZE } from "@/lib/hawaii/geo";
import { PLACES } from "@/lib/hawaii/places";
import { latLonToWorld, terrainY, WORLD } from "@/lib/hawaii/world";

const PX = WORLD.w / MAP_SIZE.w;

/** Real places on the island — surveyed pins, cartoon dress. */
export function Locations() {
  return (
    <group>
      {AIRPORTS.map((a) => (
        <Runway key={a.id} {...a} />
      ))}
      <Falls lat={19.8539} lon={-155.1522} h={2.4} />
      <Falls lat={19.7194} lon={-155.1094} h={1.35} />
      <Sand lat={19.1358} lon={-155.5044} color="#1a1a1c" rx={0.85} rz={0.4} />
      <Sand lat={19.9919} lon={-155.8244} color="#f3ead2" rx={0.7} rz={0.32} />
      <Sand lat={18.9364} lon={-155.6464} color="#6a8a48" rx={0.45} rz={0.28} />
      <Taro lat={20.1185} lon={-155.5908} />
      <Pier lat={19.6399} lon={-155.9969} heading={250} />
      <Pier lat={19.73} lon={-155.06} heading={20} />
      <Wall lat={19.4217} lon={-155.9106} />
      <Point lat={18.9108} lon={-155.6813} />
      {PLACES.filter((p) => p.kind !== "home").map((p) => (
        <PlaceLabel key={p.id} lat={p.lat} lon={p.lon} name={p.name} />
      ))}
    </group>
  );
}

function PlaceLabel({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  return (
    <Html position={[x, y + 1.15, z]} center distanceFactor={28} zIndexRange={[4, 8]} style={{ pointerEvents: "none" }}>
      <div className="whitespace-nowrap rounded-md bg-ink/80 px-2 py-0.5 font-display text-[11px] tracking-tight text-cream shadow-md">
        {name}
      </div>
    </Html>
  );
}

function Runway({ lat, lon, len, heading }: { lat: number; lon: number; len: number; heading: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  const w = Math.max(2.6, len * PX * 0.85);
  const rad = (heading * Math.PI) / 180;
  return (
    <group position={[x, y + 0.06, z]} rotation={[0, -rad, 0]}>
      <mesh>
        <boxGeometry args={[w, 0.04, 0.42]} />
        <meshStandardMaterial color="#3a3e44" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[w * 0.92, 0.01, 0.035]} />
        <meshStandardMaterial color="#f4ecd6" />
      </mesh>
    </group>
  );
}

function Falls({ lat, lon, h }: { lat: number; lon: number; h: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.09, h, 0.09]} />
        <meshStandardMaterial color="#dceef8" emissive="#8fd4f0" emissiveIntensity={0.7} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 12]} />
        <meshStandardMaterial color="#1f6a88" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Sand({ lat, lon, color, rx, rz }: { lat: number; lon: number; color: string; rx: number; rz: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  return (
    <mesh position={[x, y + 0.05, z]} rotation={[-Math.PI / 2, 0, 0.2]} scale={[rx, rz, 1]}>
      <circleGeometry args={[1, 16]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function Taro({ lat, lon }: { lat: number; lon: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  return (
    <group position={[x, y + 0.04, z]}>
      {[-0.35, 0, 0.35].map((ox) => (
        <mesh key={ox} position={[ox, 0, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.28, 0.7]} />
          <meshStandardMaterial color="#3d8a4a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Pier({ lat, lon, heading }: { lat: number; lon: number; heading: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  const rad = (heading * Math.PI) / 180;
  return (
    <mesh position={[x, y + 0.08, z]} rotation={[0, -rad, 0]}>
      <boxGeometry args={[0.9, 0.06, 0.18]} />
      <meshStandardMaterial color="#8a6a48" roughness={0.8} />
    </mesh>
  );
}

function Wall({ lat, lon }: { lat: number; lon: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  return (
    <mesh position={[x, y + 0.12, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.35, 0.48, 16, 1, 0, Math.PI * 1.2]} />
      <meshStandardMaterial color="#6a5a48" roughness={0.95} />
    </mesh>
  );
}

function Point({ lat, lon }: { lat: number; lon: number }) {
  const { x, z } = latLonToWorld(lat, lon);
  const y = terrainY(x, z);
  return (
    <mesh position={[x, y + 0.35, z]}>
      <cylinderGeometry args={[0.06, 0.08, 0.7, 6]} />
      <meshStandardMaterial color="#c45c4a" roughness={0.5} />
    </mesh>
  );
}
