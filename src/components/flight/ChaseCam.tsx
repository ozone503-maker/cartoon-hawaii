import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Fog, PerspectiveCamera } from "three";
import { Vector3 } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { UFO_LENGTH, WORLD_SCALE, GROUND_SCALE } from "@/lib/hawaii/world";

const _desired = new Vector3();
const _look = new Vector3();

/** Locked chase — behind and above, UFO in the lower third, forest ahead. */
const LEN = 3.5;
const DEG = 22;

export function ChaseCam({ craft }: { craft: CraftState }) {
  const { camera, scene } = useThree();
  const primed = useRef(false);

  useFrame((_, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const cam = camera as PerspectiveCamera;
    const fx = -Math.sin(craft.yaw);
    const fz = -Math.cos(craft.yaw);
    // UFO_LENGTH already × WORLD_SCALE → chase pulls back with craft.
    const dist = UFO_LENGTH * LEN;
    const height = dist * Math.tan((DEG * Math.PI) / 180);

    _desired.set(craft.x - fx * dist, craft.y + height, craft.z - fz * dist);
    if (!primed.current) {
      cam.position.copy(_desired);
      primed.current = true;
    } else {
      cam.position.lerp(_desired, 1 - Math.exp(-4.8 * dt));
    }

    const lookY = UFO_LENGTH * 0.1;
    _look.set(craft.x + fx * UFO_LENGTH * 0.85, craft.y + lookY, craft.z + fz * UFO_LENGTH * 0.85);
    cam.lookAt(_look);

    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = 160 * WORLD_SCALE * GROUND_SCALE;
      fog.far = 480 * WORLD_SCALE * GROUND_SCALE;
    }
  });

  return null;
}
