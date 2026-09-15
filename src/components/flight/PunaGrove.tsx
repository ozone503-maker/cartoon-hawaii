import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import { CLEARING_R, flashtownWorld, mountainViewWorld } from "@/lib/hawaii/puna";
import { isCanopy, terrainY } from "@/lib/hawaii/world";

const dummy = new Object3D();
const MAX = 520;
const CELL = 0.62;

function hash(ix: number, iz: number) {
  let n = (ix * 374761393 + iz * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

type Tree = { x: number; y: number; z: number; s: number; fern: boolean };

function layout(): Tree[] {
  const ft = flashtownWorld();
  const po = mountainViewWorld();
  const trees: Tree[] = [];
  const span = 18;
  for (let iz = -span; iz <= span && trees.length < MAX; iz++) {
    for (let ix = -span; ix <= span && trees.length < MAX; ix++) {
      const x = ft.x + ix * CELL;
      const z = ft.z + iz * CELL;
      const h = hash(ix + 40, iz + 7);
      if (h < 0.18) continue;
      const jx = x + (h - 0.5) * 0.45;
      const jz = z + (hash(ix + 3, iz + 11) - 0.5) * 0.45;
      const dx = jx - ft.x;
      const dz = jz - ft.z;
      if (dx * dx + dz * dz < (CLEARING_R + 0.15) ** 2) continue;
      const px = jx - po.x;
      const pz = jz - po.z;
      if (px * px + pz * pz < 1.35 * 1.35) continue;
      if (dx * dx + dz * dz > 17 * 17) continue;
      if (!isCanopy(jx, jz)) continue;
      const y = terrainY(jx, jz);
      trees.push({
        x: jx,
        y,
        z: jz,
        s: 0.22 + h * 0.38,
        fern: h > 0.72,
      });
    }
  }
  return trees;
}

export function PunaGrove() {
  const canopy = useRef<InstancedMesh>(null);
  const trunk = useRef<InstancedMesh>(null);
  const trees = useMemo(() => layout(), []);
  const colors = useMemo(
    () => [new Color("#14522a"), new Color("#1d6a34"), new Color("#2a7a3c"), new Color("#17824a")],
    [],
  );

  useLayoutEffect(() => {
    const c = canopy.current;
    const t = trunk.current;
    if (!c || !t) return;
    trees.forEach((tree, i) => {
      dummy.position.set(tree.x, tree.y + tree.s * (tree.fern ? 0.7 : 0.85), tree.z);
      dummy.scale.set(tree.s * (tree.fern ? 1.35 : 0.95), tree.s * (tree.fern ? 0.55 : 1), tree.s);
      dummy.rotation.set(0, i * 0.7, 0);
      dummy.updateMatrix();
      c.setMatrixAt(i, dummy.matrix);
      c.setColorAt(i, colors[i % colors.length]!);
      dummy.position.set(tree.x, tree.y + tree.s * 0.35, tree.z);
      dummy.scale.set(tree.fern ? 0.045 : 0.07, tree.s * 0.7, tree.fern ? 0.045 : 0.07);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      t.setMatrixAt(i, dummy.matrix);
    });
    for (let i = trees.length; i < MAX; i++) {
      dummy.position.set(0, -40, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      c.setMatrixAt(i, dummy.matrix);
      t.setMatrixAt(i, dummy.matrix);
    }
    c.instanceMatrix.needsUpdate = true;
    t.instanceMatrix.needsUpdate = true;
    if (c.instanceColor) c.instanceColor.needsUpdate = true;
    return () => {
      c.geometry.dispose();
      t.geometry.dispose();
      const cm = c.material;
      const tm = t.material;
      if (cm && !Array.isArray(cm)) cm.dispose();
      if (tm && !Array.isArray(tm)) tm.dispose();
    };
  }, [trees, colors]);

  return (
    <group>
      <instancedMesh ref={canopy} args={[undefined, undefined, MAX]} frustumCulled={false}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={trunk} args={[undefined, undefined, MAX]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 1, 5]} />
        <meshStandardMaterial color="#5a3a28" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
