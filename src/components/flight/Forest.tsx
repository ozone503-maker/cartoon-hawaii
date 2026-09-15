import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { isCanopy, terrainY } from "@/lib/hawaii/world";
import { inFlashTownClearing } from "@/lib/hawaii/puna";

const CELL = 1.15;
const RADIUS = 24;
const MAX = 700;
const dummy = new Object3D();

function hash(ix: number, iz: number) {
  let n = (ix * 374761393 + iz * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/**
 * Canopy clumps only where the Landsat pixel is already green and the
 * heightmap is land. These are forest *mass* at game scale, not invented trees.
 */
export function Forest({ craft }: { craft: CraftState }) {
  const mesh = useRef<InstancedMesh>(null);
  const last = useRef("");

  const palette = useMemo(
    () => [new Color("#14522a"), new Color("#1d6a34"), new Color("#2a7a3c"), new Color("#3a8c48")],
    [],
  );

  useLayoutEffect(() => {
    const inst = mesh.current;
    if (inst) {
      for (let i = 0; i < MAX; i++) {
        dummy.position.set(0, -40, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    }
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

    const span = Math.ceil(RADIUS / CELL);
    let n = 0;
    for (let iz = -span; iz <= span && n < MAX; iz++) {
      for (let ix = -span; ix <= span && n < MAX; ix++) {
        const cx = (gx + ix) * CELL;
        const cz = (gz + iz) * CELL;
        const dx = cx - craft.x;
        const dz = cz - craft.z;
        const d2 = dx * dx + dz * dz;
        if (d2 > RADIUS * RADIUS || d2 < 5.5) continue;
        const h = hash(gx + ix, gz + iz);
        if (h < 0.12) continue;
        const jx = cx + (h - 0.5) * 0.9;
        const jz = cz + (hash(gx + ix + 19, gz + iz + 7) - 0.5) * 0.9;
        if (!isCanopy(jx, jz) || inFlashTownClearing(jx, jz)) continue;
        const y = terrainY(jx, jz);
        const s = 0.28 + h * 0.42;
        dummy.position.set(jx, y + s * 0.45, jz);
        dummy.scale.set(s * (0.9 + h * 0.3), s, s * (0.9 + (1 - h) * 0.3));
        dummy.rotation.set(h * 0.15, h * 6.2, (1 - h) * 0.12);
        dummy.updateMatrix();
        inst.setMatrixAt(n, dummy.matrix);
        inst.setColorAt(n, palette[Math.floor(h * palette.length)]!);
        n++;
      }
    }
    for (let i = n; i < MAX; i++) {
      dummy.position.set(0, -20, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.count = MAX;
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <icosahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial roughness={0.9} metalness={0.02} />
    </instancedMesh>
  );
}
