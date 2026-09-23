import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot, events, extend, unmountComponentAtNode, useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
import { KauCoast } from "./KauCoast";
import { Rivers } from "./Rivers";
import { spawnCraft, snapToGround, stepCraft, setSteerOverride, type CraftState } from "@/lib/flight/craft";
import { attachControlsProbe, bindKeyboard } from "@/lib/flight/input";
import { latLonToWorld, loadAlbedo, loadHeightmap, terrainY, worldToLatLon, HEIGHT_SCALE, UFO_LENGTH, WORLD, WORLD_SCALE, hu, wu } from "@/lib/hawaii/world";
import { HOME_ID, PLACES, placeById } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";

function chaseStart(c: CraftState) {
  const fx = -Math.sin(c.yaw);
  const fz = -Math.cos(c.yaw);
  const dist = UFO_LENGTH * 2.55;
  const height = dist * Math.tan((22 * Math.PI) / 180);
  return {
    cam: [c.x - fx * dist, c.y + height, c.z - fz * dist] as [number, number, number],
    look: [c.x + fx * UFO_LENGTH * 0.85, c.y + UFO_LENGTH * 0.1, c.z + fz * UFO_LENGTH * 0.85] as [number, number, number],
  };
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
    return PLACES.filter((p) => p.kind === "airport").map((p) => {
      const { x, z } = latLonToWorld(p.lat, p.lon);
      return { ...p, x, z, y: terrainY(x, z) + hu(0.08) };
    });
  }, []);
  return (
    <group>
      {pads.map((p) => (
        <mesh key={p.id} position={[p.x, p.y, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[wu(0.7), 20]} />
          <meshStandardMaterial color="#f4ecd6" emissive="#f4ecd6" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const craft = useMemo(() => spawnCraft(), []);
  const ready = useHawaii((s) => s.heightReady);
  const [rest, setRest] = useState(false);

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

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setRest(true), 500);
    return () => window.clearTimeout(id);
  }, [ready]);

  return (
    <>
      <color attach="background" args={["#9ec8e4"]} />
      <fog attach="fog" args={["#c5dce6", 90 * WORLD_SCALE, 320 * WORLD_SCALE]} />
      <hemisphereLight args={["#e7f4ff", "#6d9a48", 0.95]} />
      <directionalLight
        position={[150 * WORLD_SCALE, 48 * WORLD_SCALE, 36 * WORLD_SCALE]}
        intensity={2.55}
        color="#fff2d2"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, hu(-0.35), 0]}>
        <planeGeometry args={[WORLD.w * 4, WORLD.d * 4]} />
        <meshStandardMaterial color="#1e7eae" roughness={0.22} metalness={0.18} />
      </mesh>
      {ready ? (
        <Island />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[WORLD.w, WORLD.d]} />
          <meshBasicMaterial color="#3d8a4a" />
        </mesh>
      )}
      <FlashTown />
      <PunaGrove />
      <Craft craft={craft} />
      <ChaseCam craft={craft} />
      <Sim craft={craft} />
      {rest ? (
        <>
          <Forest craft={craft} />
          <Roads />
          <Rivers />
          <Settlements />
          <MountainView />
          <MaunaKea />
          <Caldera />
          <Locations />
          <KauCoast />
          <Pads />
        </>
      ) : null}
    </>
  );
}

async function waitSize(el: HTMLCanvasElement) {
  for (let i = 0; i < 45; i++) {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w > 16 && h > 16) return { w, h };
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }
  return {
    w: Math.max(320, window.innerWidth || 390),
    h: Math.max(480, window.innerHeight || 844),
  };
}

export function FlightCanvas() {
  const started = useHawaii((s) => s.started);
  const setHeightReady = useHawaii((s) => s.setHeightReady);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unbind = bindKeyboard();
    let done = false;
    const ok = () => {
      if (done) return;
      done = true;
      setHeightReady(true);
    };
    const t = window.setTimeout(ok, 2500);
    loadHeightmap()
      .then(() => {
        const home = placeById(HOME_ID)!;
        const w = latLonToWorld(home.lat, home.lon);
        terrainY(w.x, w.z);
        ok();
        void loadAlbedo();
      })
      .catch(ok)
      .finally(() => window.clearTimeout(t));
    return unbind;
  }, [setHeightReady]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !started) return;
    let dead = false;
    let root: ReturnType<typeof createRoot> | null = null;

    const boot = async () => {
      extend(THREE as never);
      const { w, h } = await waitSize(canvas);
      if (dead) return;
      const look = chaseStart(spawnCraft());
      root = createRoot(canvas);
      await root.configure({
        events,
        dpr: 1,
        frameloop: "always",
        size: { width: w, height: h, top: 0, left: 0 },
        camera: { fov: 48, near: 0.12 * WORLD_SCALE, far: 520 * WORLD_SCALE, position: look.cam },
        gl: {
          antialias: false,
          alpha: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        },
        onCreated: (state) => {
          state.gl.setClearColor(0x9ec8e4, 1);
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.12;
          state.camera.lookAt(look.look[0], look.look[1], look.look[2]);
          state.gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => e.preventDefault(),
            false,
          );
        },
      });
      if (dead) return;
      root.render(<Scene />);
    };

    void boot();
    return () => {
      dead = true;
      if (root) unmountComponentAtNode(canvas);
    };
  }, [started]);

  if (!started) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 block h-full w-full"
      style={{ background: "#3d8a4a", touchAction: "none" }}
    />
  );
}