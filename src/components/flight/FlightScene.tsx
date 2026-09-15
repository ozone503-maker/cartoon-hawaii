import { useEffect, useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import type { Fog, PerspectiveCamera } from "three";
import { Vector3 } from "three";
import { Island } from "./Island";
import { Craft } from "./Craft";
import { Forest } from "./Forest";
import { spawnCraft, snapToGround, stepCraft, setSteerOverride, type CraftState } from "@/lib/flight/craft";
import { attachControlsProbe, bindKeyboard } from "@/lib/flight/input";
import { latLonToWorld, loadHeightmap, terrainY, UFO_LENGTH, worldToLatLon, HEIGHT_SCALE } from "@/lib/hawaii/world";
import { HOME_ID, PLACES, placeById } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";

const _desired = new Vector3();
const _look = new Vector3();

/** Cruise: 1½ lengths behind, 23° down. Climb eases toward a high diagonal atlas. */
const CRUISE_LEN = 1.5;
const CRUISE_DEG = 23;
const HIGH_LEN = 19;
const HIGH_DEG = 72;

function CameraRig({ craft }: { craft: CraftState }) {
  const { camera, scene } = useThree();
  const primed = useRef(false);

  useFrame((_, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const cam = camera as PerspectiveCamera;
    const fx = -Math.sin(craft.yaw);
    const fz = -Math.cos(craft.yaw);
    const ground = terrainY(craft.x, craft.z);
    const agl = Math.max(0.2, craft.y - ground);
    const t = Math.min(1, Math.max(0, (agl - 2.2) / 46));
    const ease = t * t * (3 - 2 * t);

    let dist = UFO_LENGTH * (CRUISE_LEN + ease * (HIGH_LEN - CRUISE_LEN));
    const deg = CRUISE_DEG + ease * (HIGH_DEG - CRUISE_DEG);
    let height = dist * Math.tan((deg * Math.PI) / 180);

    if (agl < 2.8) {
      const land = 1 - agl / 2.8;
      height += land * 0.7;
      dist *= 1 - land * 0.1;
    }

    _desired.set(craft.x - fx * dist, craft.y + height, craft.z - fz * dist);
    if (!primed.current) {
      cam.position.copy(_desired);
      primed.current = true;
    } else {
      const k = 1 - Math.exp(-4.8 * dt);
      cam.position.lerp(_desired, k);
    }

    const ahead = UFO_LENGTH * (0.85 + ease * 4);
    _look.set(craft.x + fx * ahead, craft.y + 0.22 * (1 - ease), craft.z + fz * ahead);
    cam.lookAt(_look);

    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = 28 + ease * 70;
      fog.far = 130 + ease * 220;
    }
  });

  return null;
}

function Sim({ craft }: { craft: CraftState }) {
  const paused = useHawaii((s) => s.mapOpen);
  const setHud = useHawaii((s) => s.setFlightHud);
  const acc = useRef(0);

  useFrame((_, rawDt) => {
    if (paused) return;
    const dt = Math.min(0.05, rawDt);
    stepCraft(craft, dt);
    acc.current += dt;
    if (acc.current < 0.12) return;
    acc.current = 0;
    const ll = worldToLatLon(craft.x, craft.z);
    const agl = craft.y - terrainY(craft.x, craft.z);
    setHud({
      lat: ll.lat,
      lon: ll.lon,
      altM: agl / HEIGHT_SCALE,
      speed: craft.speed,
      yaw: craft.yaw,
    });
  });
  return null;
}

function Pads() {
  const pads = useMemo(() => {
    return PLACES.filter((p) => p.kind === "home" || p.kind === "airport").map((p) => {
      const { x, z } = latLonToWorld(p.lat, p.lon);
      return { ...p, x, z, y: terrainY(x, z) + 0.08 };
    });
  }, []);
  return (
    <group>
      {pads.map((p) => (
        <mesh key={p.id} position={[p.x, p.y, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.kind === "home" ? 1.1 : 0.7, 20]} />
          <meshStandardMaterial
            color={p.kind === "home" ? "#d76a4d" : "#f4ecd6"}
            emissive={p.kind === "home" ? "#d76a4d" : "#f4ecd6"}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const craft = useMemo(() => spawnCraft(), []);
  const ready = useHawaii((s) => s.heightReady);

  useEffect(() => {
    attachControlsProbe(
      () => craft.yaw,
      () => craft.speed,
      setSteerOverride,
    );
  }, [craft]);

  useEffect(() => {
    if (ready) snapToGround(craft);
  }, [ready, craft]);

  return (
    <>
      <color attach="background" args={["#7eb7d4"]} />
      <fog attach="fog" args={["#8ec4d8", 28, 130]} />
      <hemisphereLight args={["#fff4e0", "#0e4a62", 0.72]} />
      <directionalLight position={[40, 60, 20]} intensity={1.4} color="#fff3d4" />
      <Sky sunPosition={[40, 28, 18]} turbidity={6} rayleigh={1.4} mieCoefficient={0.004} />
      {ready ? (
        <Suspense fallback={null}>
          <Island />
          <Forest craft={craft} />
          <Pads />
        </Suspense>
      ) : null}
      <Craft craft={craft} />
      <CameraRig craft={craft} />
      <Sim craft={craft} />
    </>
  );
}

export function FlightCanvas() {
  const started = useHawaii((s) => s.started);
  const setHeightReady = useHawaii((s) => s.setHeightReady);

  useEffect(() => {
    const unbind = bindKeyboard();
    loadHeightmap()
      .then(() => {
        const home = placeById(HOME_ID)!;
        const w = latLonToWorld(home.lat, home.lon);
        terrainY(w.x, w.z);
        setHeightReady(true);
      })
      .catch(() => setHeightReady(true));
    return unbind;
  }, [setHeightReady]);

  if (!started) return null;

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      dpr={[1, 1.5]}
      camera={{ fov: 48, near: 0.12, far: 480, position: [0, 8, 12] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Scene />
    </Canvas>
  );
}
