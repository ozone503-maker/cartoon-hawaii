import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { hu, isCanopy, terrainY, wu } from "@/lib/hawaii/world";
import { inFlashTownClearing } from "@/lib/hawaii/puna";
import { inMaunaKeaSummit } from "@/lib/hawaii/maunakea";
import { inOpenCoast } from "@/lib/hawaii/coast";
import { inKilaueaCinder } from "@/lib/hawaii/kilauea";
import { inRiver } from "@/lib/hawaii/rivers";

const CELL = wu(1.25);
const RADIUS = wu(24);
const MAX = { albizia: 120, ohia: 240, koa: 110, lehua: 70 } as const;
const dummy = new Object3D();

function hash(ix: number, iz: number) {
  let n = (ix * 374761393 + iz * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** 0 albizia (lowland umbrella) · 1 ʻōhiʻa · 2 koa (higher slopes) */
function pickKind(elev: number, h: number): 0 | 1 | 2 {
  if (elev >= hu(5.5)) return h < 0.45 ? 2 : 1;
  if (elev <= hu(3.55)) return h < 0.42 ? 0 : 1;
  if (h < 0.16) return 2;
  if (h > 0.84 && elev < hu(4.3)) return 0;
  return 1;
}

type Spot = { x: number; y: number; z: number; s: number; h: number; kind: 0 | 1 | 2 };

function hide(mesh: InstancedMesh, from: number, cap: number) {
  for (let i = from; i < cap; i++) {
    dummy.position.set(0, -200, 0);
    dummy.scale.set(0, 0, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export function Forest({ craft }: { craft: CraftState }) {
  const albizia = useRef<InstancedMesh>(null);
  const ohia = useRef<InstancedMesh>(null);
  const koa = useRef<InstancedMesh>(null);
  const trunk = useRef<InstancedMesh>(null);
  const lehua = useRef<InstancedMesh>(null);
  const last = useRef("");
  const albiziaGreen = useMemo(() => [new Color("#9ee08a"), new Color("#b4eb9c"), new Color("#86d478")], []);
  const ohiaGreen = useMemo(() => [new Color("#2f9a3e"), new Color("#3cb14a"), new Color("#4cbf5c")], []);
  const koaGreen = useMemo(() => [new Color("#8aaa4a"), new Color("#9bb85c"), new Color("#7a9a40")], []);
  const wood = useMemo(() => [new Color("#c4b89a"), new Color("#5a3820"), new Color("#6a4a28")], []);

  useLayoutEffect(() => {
    return () => {
      for (const r of [albizia, ohia, koa, trunk, lehua]) {
        r.current?.geometry.dispose();
        const m = r.current?.material;
        if (m && !Array.isArray(m)) m.dispose();
      }
    };
  }, []);

  useFrame(() => {
    const a = albizia.current;
    const o = ohia.current;
    const k = koa.current;
    const w = trunk.current;
    const l = lehua.current;
    if (!a || !o || !k || !w || !l) return;
    const gx = Math.round(craft.x / CELL);
    const gz = Math.round(craft.z / CELL);
    const key = `${gx},${gz}`;
    if (key === last.current) return;
    last.current = key;

    const spots: Spot[] = [];
    const span = Math.ceil(RADIUS / CELL);
    for (let iz = -span; iz <= span && spots.length < 420; iz++) {
      for (let ix = -span; ix <= span && spots.length < 420; ix++) {
        const cx = (gx + ix) * CELL;
        const cz = (gz + iz) * CELL;
        const dx = cx - craft.x;
        const dz = cz - craft.z;
        const d2 = dx * dx + dz * dz;
        if (d2 > RADIUS * RADIUS || d2 < wu(6.5) ** 2) continue;
        const hv = hash(gx + ix, gz + iz);
        if (hv < 0.2) continue;
        const jx = cx + (hv - 0.5) * wu(0.7);
        const jz = cz + (hash(gx + ix + 19, gz + iz + 7) - 0.5) * wu(0.7);
        if (!isCanopy(jx, jz) || inFlashTownClearing(jx, jz) || inMaunaKeaSummit(jx, jz) || inOpenCoast(jx, jz) || inRiver(jx, jz) || inKilaueaCinder(jx, jz)) continue;
        const y = terrainY(jx, jz);
        spots.push({ x: jx, y, z: jz, s: wu(0.3) + hv * wu(0.4), h: hv, kind: pickKind(y, hv) });
      }
    }

    let ia = 0;
    let io = 0;
    let ik = 0;
    let it = 0;
    let il = 0;

    for (const t of spots) {
      if (t.kind === 0 && ia < MAX.albizia) {
        dummy.position.set(t.x, t.y + t.s * 1.35, t.z);
        dummy.scale.set(t.s * 2.35, t.s * 0.34, t.s * 2.35);
        dummy.rotation.set(0.04, t.h * 5, 0.03);
        dummy.updateMatrix();
        a.setMatrixAt(ia, dummy.matrix);
        a.setColorAt(ia, albiziaGreen[Math.floor(t.h * albiziaGreen.length)]!);
        dummy.position.set(t.x, t.y + t.s * 0.7, t.z);
        dummy.scale.set(wu(0.055), t.s * 1.35, wu(0.055));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        w.setMatrixAt(it, dummy.matrix);
        w.setColorAt(it, wood[0]!);
        ia++;
        it++;
      } else if (t.kind === 2 && ik < MAX.koa) {
        dummy.position.set(t.x, t.y + t.s * 1.45, t.z);
        dummy.scale.set(t.s * 0.78, t.s * 1.35, t.s * 0.62);
        dummy.rotation.set(0, t.h * 3, 0.05);
        dummy.updateMatrix();
        k.setMatrixAt(ik, dummy.matrix);
        k.setColorAt(ik, koaGreen[Math.floor(t.h * koaGreen.length)]!);
        dummy.position.set(t.x, t.y + t.s * 0.72, t.z);
        dummy.scale.set(wu(0.065), t.s * 1.4, wu(0.065));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        w.setMatrixAt(it, dummy.matrix);
        w.setColorAt(it, wood[2]!);
        ik++;
        it++;
      } else if (io < MAX.ohia) {
        dummy.position.set(t.x, t.y + t.s * 1.05, t.z);
        dummy.scale.set(t.s * 1.05, t.s * 0.92, t.s * 1.12);
        dummy.rotation.set(0, t.h * 4.2, 0);
        dummy.updateMatrix();
        o.setMatrixAt(io, dummy.matrix);
        o.setColorAt(io, ohiaGreen[Math.floor(t.h * ohiaGreen.length)]!);
        dummy.position.set(t.x, t.y + t.s * 0.48, t.z);
        dummy.scale.set(wu(0.07), t.s * 0.9, wu(0.07));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        w.setMatrixAt(it, dummy.matrix);
        w.setColorAt(it, wood[1]!);
        if (t.h > 0.62 && il < MAX.lehua) {
          dummy.position.set(t.x + (t.h - 0.5) * wu(0.22), t.y + t.s * 1.35, t.z + (t.h - 0.4) * wu(0.18));
          dummy.scale.set(t.s * 0.18, t.s * 0.16, t.s * 0.18);
          dummy.updateMatrix();
          l.setMatrixAt(il, dummy.matrix);
          il++;
        }
        io++;
        it++;
      }
    }

    hide(a, ia, MAX.albizia);
    hide(o, io, MAX.ohia);
    hide(k, ik, MAX.koa);
    hide(w, it, MAX.albizia + MAX.ohia + MAX.koa);
    hide(l, il, MAX.lehua);
    if (a.instanceColor) a.instanceColor.needsUpdate = true;
    if (o.instanceColor) o.instanceColor.needsUpdate = true;
    if (k.instanceColor) k.instanceColor.needsUpdate = true;
    if (w.instanceColor) w.instanceColor.needsUpdate = true;
  });

  const trunkMax = MAX.albizia + MAX.ohia + MAX.koa;

  return (
    <group>
      <instancedMesh ref={albizia} args={[undefined, undefined, MAX.albizia]} frustumCulled={false}>
        <sphereGeometry args={[0.55, 10, 6]} />
        <meshStandardMaterial vertexColors roughness={0.48} />
      </instancedMesh>
      <instancedMesh ref={ohia} args={[undefined, undefined, MAX.ohia]} frustumCulled={false}>
        <sphereGeometry args={[0.52, 8, 7]} />
        <meshStandardMaterial vertexColors roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={koa} args={[undefined, undefined, MAX.koa]} frustumCulled={false}>
        <sphereGeometry args={[0.48, 8, 8]} />
        <meshStandardMaterial vertexColors roughness={0.66} />
      </instancedMesh>
      <instancedMesh ref={trunk} args={[undefined, undefined, trunkMax]} frustumCulled={false}>
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