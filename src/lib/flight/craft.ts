import { HOME_ID, placeById } from "@/lib/hawaii/places";
import { HEIGHT_SCALE, hu, latLonToWorld, terrainY, UFO_LENGTH, WORLD_SCALE } from "@/lib/hawaii/world";
import { readAxes } from "./input";

export type CraftState = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
  vy: number;
  steer: number;
};

const home = placeById(HOME_ID)!;
const maunaKea = placeById("mauna-kea")!;
const spawn = latLonToWorld(home.lat, home.lon);
const mk = latLonToWorld(maunaKea.lat, maunaKea.lon);
/** Nose toward Mauna Kea so the opening chase shot has a shield volcano ahead. */
const spawnYaw = Math.atan2(-(mk.x - spawn.x), -(mk.z - spawn.z));

const DECK = UFO_LENGTH * 0.28;

export function spawnCraft(): CraftState {
  const ground = terrainY(spawn.x, spawn.z);
  return {
    x: spawn.x,
    y: ground + DECK,
    z: spawn.z,
    yaw: spawnYaw,
    speed: 0,
    vy: 0,
    steer: 0,
  };
}

export function snapToGround(c: CraftState) {
  const ground = terrainY(c.x, c.z);
  c.y = Math.max(c.y, ground + DECK);
}

/** Optional steer override for the QA probe (−1..1, same sign as A = +). */
let steerOverride: number | null = null;

export function setSteerOverride(v: number | null) {
  steerOverride = v;
}

/**
 * WORLD.w 240→960 (×4). Speeds scale with WORLD_SCALE so FlashTown↔Ka Lae /
 * Hilo↔Kona stay ~3–4 min at full throttle (no boost). Boost still ~2.15×.
 * Spawn / ground snap / ceiling shape unchanged — speeds/accels/turn only.
 */
export function stepCraft(c: CraftState, dt: number) {
  const axes = readAxes();
  const steer = steerOverride ?? axes.steer;
  c.steer = steer;
  const boost = axes.boost ? 2.15 : 1;
  // Was maxSpeed=1.0 / accel=0.65 at WORLD.w=240; × WORLD_SCALE for new units.
  const maxSpeed = 1.0 * WORLD_SCALE * boost;
  const accel = 0.65 * WORLD_SCALE * boost;

  c.speed += axes.throttle * accel * dt;
  if (axes.throttle === 0) c.speed *= Math.exp(-2.4 * dt);
  c.speed = Math.max(-0.45 * WORLD_SCALE, Math.min(maxSpeed, c.speed));

  // Turn authority ramps with speed; reference scales with WORLD so cruise stays snappy.
  const turnRef = 0.4 * WORLD_SCALE;
  const turn = 1.55 * (0.35 + Math.min(1, Math.abs(c.speed) / turnRef));
  c.yaw += steer * turn * dt;

  const fx = -Math.sin(c.yaw);
  const fz = -Math.cos(c.yaw);
  c.x += fx * c.speed * dt;
  c.z += fz * c.speed * dt;

  const liftAccel = 0.6 * WORLD_SCALE;
  c.vy += axes.lift * liftAccel * dt;
  if (axes.lift === 0) c.vy *= Math.exp(-3.2 * dt);
  c.vy = Math.max(-0.5 * WORLD_SCALE, Math.min(0.5 * WORLD_SCALE, c.vy));
  c.y += c.vy * dt;

  const ground = terrainY(c.x, c.z);
  const deck = ground + DECK;
  if (c.y < deck) {
    c.y = deck;
    if (c.vy < 0) c.vy = 0;
  }
  const ceiling = 4205 * HEIGHT_SCALE + hu(36);
  if (c.y > ceiling) {
    c.y = ceiling;
    if (c.vy > 0) c.vy = 0;
  }
}
