import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { terrainY } from "@/lib/hawaii/world";

const dummy = new Object3D();
const MAX = 48;
const CELL = 7.5;
const DECK = 9.2;

function hash(ix: number, iz: number) {
  let n = (ix * 374761393 + iz * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Trade-wind puffs. Sit below Mauna Kea’s peak so the summit sticks out. */
export function Clouds({ craft }: { craft: CraftState }) {
  const mesh = useRef<InstancedMesh>(null);
  const last = useRef("");
  const tint = useMemo(() => new Color("#f4f7fb"), []);

  useLayoutEffect(() => {
    return () => {
      mesh.current?.geometry.dispose();
      const mat = mesh.current?.material;
      if (mat && !Array.isArray(mat)) mat.dispose();
    };
  }, []);

  useFrame(() => {
    const inst = mesh.current;
    if (!inst) return;
    const gx = Math.round(craft.x / CELL);
    const gz = Math.round(craft.z / CELL);
    const key = `${gx},${gz}`;
    if (key === last.current) return;
    last.current = key;

    let n = 0;
    for (let iz = -5; iz <= 5 && n < MAX; iz++) {
      for (let ix = -5; ix <= 5 && n < MAX; ix++) {
        const h = hash(gx + ix, gz + iz);
        if (h < 0.42) continue;
        const x = (gx + ix) * CELL + (h - 0.5) * 4;
        const z = (gz + iz) * CELL + (hash(gx + ix + 3, gz + iz + 5) - 0.5) * 4;
        if (terrainY(x, z) > DECK - 1.4) continue;
        const s = 1.6 + h * 2.4;
        dummy.position.set(x, DECK + h * 1.1, z);
        dummy.scale.set(s * 1.6, s * 0.45, s);
        dummy.rotation.set(0, h * 6, 0);
        dummy.updateMatrix();
        inst.setMatrixAt(n, dummy.matrix);
        n++;
      }
    }
    for (let i = n; i < MAX; i++) {
      dummy.position.set(0, -40, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color={tint} roughness={1} transparent opacity={0.78} depthWrite={false} />
    </instancedMesh>
  );
}
