import { useEffect, useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { Island } from "./Island";
import { Craft } from "./Craft";
import { Forest } from "./Forest";
import { Settlements } from "./Settlements";
import { FlashTown } from "./FlashTown";
import { MountainView } from "./MountainView";
import { PunaGrove } from "./PunaGrove";
import { Roads } from "./Roads";
import { Caldera } from "./Caldera";
import { MaunaKea } from "./MaunaKea";
import { ChaseCam } from "./ChaseCam";
import { Locations } from "./Locations";
import { spawnCraft, snapToGround, stepCraft, setSteerOverride, type CraftState } from "@/lib/flight/craft";
import { attachControlsProbe, bindKeyboard } from "@/lib/flight/input";
import { latLonToWorld, loadHeightmap, terrainY, worldToLatLon, HEIGHT_SCALE } from "@/lib/hawaii/world";
import { HOME_ID, PLACES, placeById } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";

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
    return PLACES.filter((p) => p.kind === "airport").map((p) => {
      const { x, z } = latLonToWorld(p.lat, p.lon);
      return { ...p, x, z, y: terrainY(x, z) + 0.08 };
    });
  }, []);
  return (
    <group>
      {pads.map((p) => (
        <mesh key={p.id} position={[p.x, p.y, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 20]} />
          <meshStandardMaterial color="#f4ecd6" emissive="#f4ecd6" emissiveIntensity={0.35} />
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
      <color attach="background" args={["#7ec8ee"]} />
      <fog attach="fog" args={["#c5e6f6", 48, 190]} />
      <hemisphereLight args={["#fff8ee", "#7ec8a8", 1.05]} />
      <directionalLight position={[60, 80, 28]} intensity={1.85} color="#fff4d0" />
      <Sky sunPosition={[60, 48, 22]} turbidity={1.6} rayleigh={0.85} mieCoefficient={0.002} />
      {ready ? (
        <Suspense fallback={null}>
          <Island />
          <Forest craft={craft} />
          <PunaGrove />
          <Roads />
          <Settlements />
          <FlashTown />
          <MountainView />
          <MaunaKea />
          <Caldera />
          <Locations />
          <Pads />
        </Suspense>
      ) : null}
      <Craft craft={craft} />
      <ChaseCam craft={craft} />
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
      camera={{ fov: 48, near: 0.12, far: 520, position: [0, 8, 12] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Scene />
    </Canvas>
  );
}
