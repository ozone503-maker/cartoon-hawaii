import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Fog, PerspectiveCamera } from "three";
import { Vector3 } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { terrainY, UFO_LENGTH } from "@/lib/hawaii/world";

const _desired = new Vector3();
const _look = new Vector3();

/**
 * Locked chase cam. Does not touch flight physics.
 *
 * Landscape: 1½ lengths, 23° down, saucer in the lower third.
 * Portrait: pulls back so the island fills the frame — never MDP’s skull.
 * Climb eases toward a high diagonal atlas. No cuts, no side-swing.
 */
const CRUISE_DEG = 23;
const HIGH_DEG = 56;

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

    const wide = Math.max(1, 1.55 / Math.max(0.42, cam.aspect));
    const cruiseLen = 1.55 * wide;
    const highLen = 7.2 * Math.min(wide, 1.55);
    const minLen = cruiseLen * 0.92;

    let dist = UFO_LENGTH * (cruiseLen + ease * (highLen - cruiseLen));
    dist = Math.max(UFO_LENGTH * minLen, dist);
    const deg = CRUISE_DEG + ease * (HIGH_DEG - CRUISE_DEG);
    let height = dist * Math.tan((deg * Math.PI) / 180);
    if (agl < 2.6) height += (1 - agl / 2.6) * 0.55;

    _desired.set(craft.x - fx * dist, craft.y + height, craft.z - fz * dist);
    if (!primed.current) {
      cam.position.copy(_desired);
      primed.current = true;
    } else {
      cam.position.lerp(_desired, 1 - Math.exp(-7.4 * dt));
    }

    const ahead = dist * (0.38 + ease * 0.35);
    _look.set(craft.x + fx * ahead, craft.y - height * 0.08, craft.z + fz * ahead);
    cam.lookAt(_look);
    cam.fov = (wide > 1.3 ? 58 : 52) + ease * 6;
    cam.updateProjectionMatrix();

    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = 18 + ease * 36;
      fog.far = 95 + ease * 150;
    }
  });

  return null;
}
