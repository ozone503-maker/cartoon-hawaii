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
import { AIRPORTS } from "@/lib/hawaii/highways";
import { MAP_SIZE } from "@/lib/hawaii/geo";
import { latLonToWorld, loadAlbedo, loadHeightmap, terrainY, worldToLatLon, HEIGHT_SCALE, UFO_LENGTH, WORLD } from "@/lib/hawaii/world";
import { HOME_ID, PLACES, placeById } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";

function chaseStart(c: CraftState) {
  const fx = -Math.sin(c.yaw);
  const fz = -Math.cos(c.yaw);
  const dist = UFO_LENGTH * 2.55;
  const height = dist * Math.tan((22 * Math.PI) / 180);
  return {
    cam: [c.x - fx * dist, c.y + height, c.z - fz * dist] as [number, number, number],
    look: [c.x + fx * UFO_LENGTH * 0.85, c.y + 0.22, c.z + fz * UFO_LENGTH * 0.85] as [number, number, number],
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
  const strips = useMemo(() => {
    const px = WORLD.w / MAP_SIZE.w;
    return AIRPORTS.map((a) => {
      const { x, z } = latLonToWorld(a.lat, a.lon);
      const rad = (a.heading * Math.PI) / 180;
      return {
        id: a.id,
        x,
        z,
        y: terrainY(x, z) + 0.04,
        len: a.len * px * 1.4,
        yaw: rad + Math.PI / 2,
      };
    });
  }, []);
  return (
    <group>
      {strips.map((s) => (
        <group key={s.id} position={[s.x, s.y, s.z]} rotation={[0, s.yaw, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[s.len, 0.28]} />
            <meshStandardMaterial color="#c8c2b4" roughness={0.88} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[s.len * 0.92, 0.03]} />
            <meshStandardMaterial color="#ece6d4" roughness={0.7} />
          </mesh>
        </group>
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
      <color attach="background" args={["#7ec8ee"]} />
      <hemisphereLight args={["#fff8ee", "#7ec8a8", 1.05]} />
      <directionalLight position={[60, 80, 28]} intensity={1.85} color="#fff4d0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[WORLD.w * 4, WORLD.d * 4]} />
        <meshBasicMaterial color="#1a8ab8" />
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
        camera: { fov: 48, near: 0.12, far: 520, position: look.cam },
        gl: {
          antialias: false,
          alpha: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        },
        onCreated: (state) => {
          state.gl.setClearColor(0x7ec8ee, 1);
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