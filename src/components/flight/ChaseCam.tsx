import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Fog, PerspectiveCamera } from "three";
import { Vector3 } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { UFO_LENGTH } from "@/lib/hawaii/world";

const _desired = new Vector3();
const _look = new Vector3();

/** Locked chase — 1½ lengths back, 23° down, always behind MDP. */
const LEN = 1.5;
const DEG = 23;

export function ChaseCam({ craft }: { craft: CraftState }) {
  const { camera, scene } = useThree();
  const primed = useRef(false);

  useFrame((_, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const cam = camera as PerspectiveCamera;
    const fx = -Math.sin(craft.yaw);
    const fz = -Math.cos(craft.yaw);
    const dist = UFO_LENGTH * LEN;
    const height = dist * Math.tan((DEG * Math.PI) / 180);

    _desired.set(craft.x - fx * dist, craft.y + height, craft.z - fz * dist);
    if (!primed.current) {
      cam.position.copy(_desired);
      primed.current = true;
    } else {
      cam.position.lerp(_desired, 1 - Math.exp(-4.8 * dt));
    }

    _look.set(craft.x + fx * UFO_LENGTH * 0.85, craft.y + 0.22, craft.z + fz * UFO_LENGTH * 0.85);
    cam.lookAt(_look);

    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = 36;
      fog.far = 160;
    }
  });

  return null;
}
