import { HOME_ID, placeById } from "@/lib/hawaii/places";
import { HEIGHT_SCALE, hu, latLonToWorld, terrainY, UFO_LENGTH, WORLD_SCALE, GROUND_SCALE } from "@/lib/hawaii/world";
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
 * Same cruise as the 960-wide island (~12 s FlashTown↔Ka Lae, boost ~6 s).
 * Ground grew ×4 without the ship. Leaving speed behind made it a crawl.
 */
export function stepCraft(c: CraftState, dt: number) {
  const axes = readAxes();
  const steer = steerOverride ?? axes.steer;
  c.steer = steer;
  const boost = axes.boost ? 2.15 : 1;
  const pace = WORLD_SCALE * GROUND_SCALE;
  const maxSpeed = 14 * pace * boost;
  const accel = 12 * pace * boost;

  c.speed += axes.throttle * accel * dt;
  if (axes.throttle === 0) c.speed *= Math.exp(-2.4 * dt);
  c.speed = Math.max(-2.2 * pace, Math.min(maxSpeed, c.speed));

  const turnRef = 1.6 * pace;
  const turn = 4.0 * (0.4 + Math.min(1, Math.abs(c.speed) / turnRef));
  c.yaw += steer * turn * dt;

  const fx = -Math.sin(c.yaw);
  const fz = -Math.cos(c.yaw);
  c.x += fx * c.speed * dt;
  c.z += fz * c.speed * dt;

  const liftAccel = 3.0 * pace;
  c.vy += axes.lift * liftAccel * dt;
  if (axes.lift === 0) c.vy *= Math.exp(-3.2 * dt);
  c.vy = Math.max(-2.5 * pace, Math.min(2.5 * pace, c.vy));
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
