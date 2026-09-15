import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Fog, PerspectiveCamera } from "three";
import { Vector3 } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { terrainY, UFO_LENGTH } from "@/lib/hawaii/world";

const _desired = new Vector3();
const _look = new Vector3();

/**
 * Locked chase cam — does not touch flight physics.
 * Cruise: 1½ lengths back, 23° down, saucer in the lower third.
 * Climb eases toward a high diagonal atlas. Never into MDP’s head,
 * never beside the craft, never a hard cut.
 */
const CRUISE_LEN = 1.5;
const CRUISE_DEG = 23;
const HIGH_LEN = 7.4;
const HIGH_DEG = 56;
const MIN_LEN = 1.42;
const MAX_LEN = 8.0;

export function ChaseCam({ craft }: { craft: CraftState }) {
  const { camera, scene } = useThree();
  const primed = useRef(false);

  useFrame((_, rawDt) => {
    const dt = Math.min(0.033, rawDt);
    const cam = camera as PerspectiveCamera;
    const fx = -Math.sin(craft.yaw);
    const fz = -Math.cos(craft.yaw);
    const ground = terrainY(craft.x, craft.z);
    const agl = Math.max(0.2, craft.y - ground);
    const t = Math.min(1, Math.max(0, (agl - 2.4) / 38));
    const ease = t * t * (3 - 2 * t);

    let dist = UFO_LENGTH * (CRUISE_LEN + ease * (HIGH_LEN - CRUISE_LEN));
    dist = Math.min(UFO_LENGTH * MAX_LEN, Math.max(UFO_LENGTH * MIN_LEN, dist));
    const deg = CRUISE_DEG + ease * (HIGH_DEG - CRUISE_DEG);
    let height = dist * Math.tan((deg * Math.PI) / 180);

    if (agl < 2.6) {
      const land = 1 - agl / 2.6;
      height += land * 0.55;
    }

    _desired.set(craft.x - fx * dist, craft.y + height, craft.z - fz * dist);
    if (!primed.current) {
      cam.position.copy(_desired);
      primed.current = true;
    } else {
      const k = 1 - Math.exp(-7.4 * dt);
      cam.position.lerp(_desired, k);
    }

    const ahead = UFO_LENGTH * (0.5 + ease * 1.8);
    _look.set(craft.x + fx * ahead, craft.y + 0.05, craft.z + fz * ahead);
    cam.lookAt(_look);
    cam.fov = 54 + ease * 6;
    cam.updateProjectionMatrix();

    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = 22 + ease * 40;
      fog.far = 110 + ease * 160;
    }
  });

  return null;
}
