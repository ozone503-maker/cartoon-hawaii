import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Fog, PerspectiveCamera } from "three";
import { Vector3 } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { terrainY, UFO_LENGTH } from "@/lib/hawaii/world";

const _desired = new Vector3();
const _look = new Vector3();

/** Original close chase: 1½ lengths, 23° down. Climb eases to a high atlas. */
const CRUISE_LEN = 1.5;
const CRUISE_DEG = 23;
const HIGH_LEN = 19;
const HIGH_DEG = 72;

export function ChaseCam({ craft }: { craft: CraftState }) {
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
      cam.position.lerp(_desired, 1 - Math.exp(-4.8 * dt));
    }

    const ahead = UFO_LENGTH * (0.85 + ease * 4);
    _look.set(craft.x + fx * ahead, craft.y + 0.22 * (1 - ease), craft.z + fz * ahead);
    cam.lookAt(_look);

    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = 36 + ease * 50;
      fog.far = 160 + ease * 180;
    }
  });

  return null;
}
