import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import { CLEARING_R, flashtownWorld, mountainViewWorld } from "@/lib/hawaii/puna";
import { isCanopy, terrainY, wu } from "@/lib/hawaii/world";

const dummy = new Object3D();
const MAX = { albizia: 160, ohia: 200, lehua: 50 } as const;

function hash(ix: number, iz: number) {
  let n = (ix * 374761393 + iz * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

type Tree = { x: number; y: number; z: number; s: number; h: number; albizia: boolean };

function layout(): Tree[] {
  const ft = flashtownWorld();
  const po = mountainViewWorld();
  const trees: Tree[] = [];
  const span = 18;
  const cell = wu(0.62);
  for (let iz = -span; iz <= span && trees.length < 360; iz++) {
    for (let ix = -span; ix <= span && trees.length < 360; ix++) {
      const x = ft.x + ix * cell;
      const z = ft.z + iz * cell;
      const h = hash(ix + 40, iz + 7);
      if (h < 0.16) continue;
      const jx = x + (h - 0.5) * wu(0.45);
      const jz = z + (hash(ix + 3, iz + 11) - 0.5) * wu(0.45);
      const dx = jx - ft.x;
      const dz = jz - ft.z;
      if (dx * dx + dz * dz < (CLEARING_R + wu(0.15)) ** 2) continue;
      const px = jx - po.x;
      const pz = jz - po.z;
      if (px * px + pz * pz < wu(1.35) * wu(1.35)) continue;
      if (dx * dx + dz * dz > wu(17) * wu(17)) continue;
      if (!isCanopy(jx, jz)) continue;
      trees.push({
        x: jx,
        y: terrainY(jx, jz),
        z: jz,
        s: wu(0.24) + h * wu(0.4),
        h,
        albizia: h < 0.48,
      });
    }
  }
  return trees;
}

export function PunaGrove() {
  const albizia = useRef<InstancedMesh>(null);
  const ohia = useRef<InstancedMesh>(null);
  const trunk = useRef<InstancedMesh>(null);
  const lehua = useRef<InstancedMesh>(null);
  const trees = useMemo(() => layout(), []);
  const albiziaGreen = useMemo(() => [new Color("#9ee08a"), new Color("#b4eb9c")], []);
  const ohiaGreen = useMemo(() => [new Color("#2f9a3e"), new Color("#3cb14a")], []);

  useLayoutEffect(() => {
    const a = albizia.current;
    const o = ohia.current;
    const t = trunk.current;
    const l = lehua.current;
    if (!a || !o || !t || !l) return;
    let ia = 0;
    let io = 0;
    let it = 0;
    let il = 0;
    for (const tree of trees) {
      if (tree.albizia && ia < MAX.albizia) {
        dummy.position.set(tree.x, tree.y + tree.s * 1.4, tree.z);
        dummy.scale.set(tree.s * 2.4, tree.s * 0.34, tree.s * 2.4);
        dummy.rotation.set(0.03, tree.h * 5, 0.02);
        dummy.updateMatrix();
        a.setMatrixAt(ia, dummy.matrix);
        a.setColorAt(ia, albiziaGreen[ia % albiziaGreen.length]!);
        dummy.position.set(tree.x, tree.y + tree.s * 0.72, tree.z);
        dummy.scale.set(wu(0.05), tree.s * 1.4, wu(0.05));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        t.setMatrixAt(it, dummy.matrix);
        t.setColorAt(it, new Color("#c4b89a"));
        ia++;
        it++;
      } else if (io < MAX.ohia) {
        dummy.position.set(tree.x, tree.y + tree.s * 1.05, tree.z);
        dummy.scale.set(tree.s * 1.05, tree.s * 0.92, tree.s * 1.1);
        dummy.rotation.set(0, tree.h * 4, 0);
        dummy.updateMatrix();
        o.setMatrixAt(io, dummy.matrix);
        o.setColorAt(io, ohiaGreen[io % ohiaGreen.length]!);
        dummy.position.set(tree.x, tree.y + tree.s * 0.48, tree.z);
        dummy.scale.set(wu(0.065), tree.s * 0.9, wu(0.065));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        t.setMatrixAt(it, dummy.matrix);
        t.setColorAt(it, new Color("#5a3820"));
        if (tree.h > 0.6 && il < MAX.lehua) {
          dummy.position.set(tree.x + (tree.h - 0.5) * 0.2, tree.y + tree.s * 1.32, tree.z);
          dummy.scale.set(tree.s * 0.17, tree.s * 0.15, tree.s * 0.17);
          dummy.updateMatrix();
          l.setMatrixAt(il, dummy.matrix);
          il++;
        }
        io++;
        it++;
      }
    }
    const hideFrom = (mesh: InstancedMesh, from: number, cap: number) => {
      for (let i = from; i < cap; i++) {
        dummy.position.set(0, -50, 0);
        dummy.scale.set(0, 0, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    hideFrom(a, ia, MAX.albizia);
    hideFrom(o, io, MAX.ohia);
    hideFrom(t, it, MAX.albizia + MAX.ohia);
    hideFrom(l, il, MAX.lehua);
    if (a.instanceColor) a.instanceColor.needsUpdate = true;
    if (o.instanceColor) o.instanceColor.needsUpdate = true;
    if (t.instanceColor) t.instanceColor.needsUpdate = true;
    return () => {
      a.geometry.dispose();
      o.geometry.dispose();
      t.geometry.dispose();
      l.geometry.dispose();
    };
  }, [trees, albiziaGreen, ohiaGreen]);

  return (
    <group>
      <instancedMesh ref={albizia} args={[undefined, undefined, MAX.albizia]} frustumCulled={false}>
        <sphereGeometry args={[0.55, 10, 6]} />
        <meshStandardMaterial vertexColors roughness={0.62} />
      </instancedMesh>
      <instancedMesh ref={ohia} args={[undefined, undefined, MAX.ohia]} frustumCulled={false}>
        <sphereGeometry args={[0.52, 8, 7]} />
        <meshStandardMaterial vertexColors roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={trunk} args={[undefined, undefined, MAX.albizia + MAX.ohia]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1.2, 1, 6]} />
        <meshStandardMaterial vertexColors roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={lehua} args={[undefined, undefined, MAX.lehua]} frustumCulled={false}>
        <sphereGeometry args={[0.22, 6, 5]} />
        <meshStandardMaterial color="#e23b4a" roughness={0.55} emissive="#a01828" emissiveIntensity={0.25} />
      </instancedMesh>
    </group>
  );
}