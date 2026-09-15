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
import { Clouds } from "./Clouds";
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
      <color attach="background" args={["#7eb7d4"]} />
      <fog attach="fog" args={["#8ec4d8", 22, 110]} />
      <hemisphereLight args={["#fff6e8", "#0e4a62", 0.82]} />
      <directionalLight position={[48, 62, 22]} intensity={1.55} color="#fff6e0" />
      <directionalLight position={[-28, 10, -16]} intensity={0.32} color="#7eb7d4" />
      <Sky sunPosition={[48, 30, 20]} turbidity={5.4} rayleigh={1.25} mieCoefficient={0.0036} />
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
          <Pads />
          <Clouds craft={craft} />
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
      camera={{ fov: 54, near: 0.12, far: 520, position: [0, 8, 12] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Scene />
    </Canvas>
  );
}
