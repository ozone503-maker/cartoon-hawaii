import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { isCanopy, terrainY } from "@/lib/hawaii/world";
import { inFlashTownClearing } from "@/lib/hawaii/puna";
import { inMaunaKeaSummit } from "@/lib/hawaii/maunakea";
import { inOpenCoast } from "@/lib/hawaii/coast";
import { toonRamp } from "@/lib/hawaii/toon";

const CELL = 1.2;
const RADIUS = 22;
const MAX = 520;
const dummy = new Object3D();

function hash(ix: number, iz: number) {
  let n = (ix * 374761393 + iz * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

type Spot = { x: number; y: number; z: number; s: number; h: number };

/**
 * Cartoon ʻōhiʻa mass — round canopies + trunks, only on Landsat-green land.
 */
export function Forest({ craft }: { craft: CraftState }) {
  const canopy = useRef<InstancedMesh>(null);
  const trunk = useRef<InstancedMesh>(null);
  const last = useRef("");
  const palette = useMemo(
    () => [new Color("#1a8a38"), new Color("#2dad48"), new Color("#3fbf55"), new Color("#58c96a")],
    [],
  );
  const ramp = useMemo(() => toonRamp(), []);

  useLayoutEffect(() => {
    return () => {
      canopy.current?.geometry.dispose();
      trunk.current?.geometry.dispose();
      const cm = canopy.current?.material;
      const tm = trunk.current?.material;
      if (cm && !Array.isArray(cm)) cm.dispose();
      if (tm && !Array.isArray(tm)) tm.dispose();
    };
  }, []);

  useFrame(() => {
    const leaves = canopy.current;
    const wood = trunk.current;
    if (!leaves || !wood) return;
    const gx = Math.round(craft.x / CELL);
    const gz = Math.round(craft.z / CELL);
    const key = `${gx},${gz}`;
    if (key === last.current) return;
    last.current = key;

    const spots: Spot[] = [];
    const span = Math.ceil(RADIUS / CELL);
    for (let iz = -span; iz <= span && spots.length < MAX; iz++) {
      for (let ix = -span; ix <= span && spots.length < MAX; ix++) {
        const cx = (gx + ix) * CELL;
        const cz = (gz + iz) * CELL;
        const dx = cx - craft.x;
        const dz = cz - craft.z;
        const d2 = dx * dx + dz * dz;
        if (d2 > RADIUS * RADIUS || d2 < 6.5) continue;
        const h = hash(gx + ix, gz + iz);
        if (h < 0.22) continue;
        const jx = cx + (h - 0.5) * 0.7;
        const jz = cz + (hash(gx + ix + 19, gz + iz + 7) - 0.5) * 0.7;
        if (!isCanopy(jx, jz) || inFlashTownClearing(jx, jz) || inMaunaKeaSummit(jx, jz) || inOpenCoast(jx, jz)) continue;
        const y = terrainY(jx, jz);
        spots.push({ x: jx, y, z: jz, s: 0.32 + h * 0.38, h });
      }
    }

    spots.forEach((t, i) => {
      dummy.position.set(t.x, t.y + t.s * 0.95, t.z);
      dummy.scale.set(t.s * 1.15, t.s * 0.95, t.s * 1.15);
      dummy.rotation.set(0, t.h * 4, 0);
      dummy.updateMatrix();
      leaves.setMatrixAt(i, dummy.matrix);
      leaves.setColorAt(i, palette[Math.floor(t.h * palette.length)]!);
      dummy.position.set(t.x, t.y + t.s * 0.38, t.z);
      dummy.scale.set(0.07, t.s * 0.7, 0.07);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      wood.setMatrixAt(i, dummy.matrix);
    });
    for (let i = spots.length; i < MAX; i++) {
      dummy.position.set(0, -40, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      leaves.setMatrixAt(i, dummy.matrix);
      wood.setMatrixAt(i, dummy.matrix);
    }
    leaves.instanceMatrix.needsUpdate = true;
    wood.instanceMatrix.needsUpdate = true;
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={canopy} args={[undefined, undefined, MAX]} frustumCulled={false}>
        <sphereGeometry args={[0.55, 10, 8]} />
        <meshToonMaterial gradientMap={ramp} />
      </instancedMesh>
      <instancedMesh ref={trunk} args={[undefined, undefined, MAX]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1.15, 1, 6]} />
        <meshToonMaterial color="#6a3e24" gradientMap={ramp} />
      </instancedMesh>
    </group>
  );
}
