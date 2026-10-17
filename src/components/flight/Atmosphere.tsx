import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Mesh } from "three";
import {
  CLOUD_ALT,
  CLOUD_SHEET,
  DOME_RADIUS,
  cloudClock,
  createCloudMaterial,
  createSkyMaterial,
} from "@/lib/flight/atmosphere";

/** Sky dome and cloud sheet. Both ride along with the camera. */
export function Atmosphere() {
  const camera = useThree((s) => s.camera);
  const dome = useRef<Mesh>(null);
  const clouds = useRef<Mesh>(null);
  const sky = useMemo(createSkyMaterial, []);
  const cloud = useMemo(createCloudMaterial, []);

  useFrame((_, dt) => {
    cloudClock.value += Math.min(dt, 0.05);
    dome.current?.position.copy(camera.position);
    clouds.current?.position.set(camera.position.x, CLOUD_ALT, camera.position.z);
  });

  return (
    <>
      <mesh ref={dome} material={sky} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[DOME_RADIUS, 24, 12]} />
      </mesh>
      <mesh ref={clouds} material={cloud} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5} frustumCulled={false}>
        <planeGeometry args={[CLOUD_SHEET, CLOUD_SHEET, 1, 1]} />
      </mesh>
    </>
  );
}
