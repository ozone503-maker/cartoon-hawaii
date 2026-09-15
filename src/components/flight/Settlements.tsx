import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import { MAP_SIZE } from "@/lib/hawaii/geo";
import { TOWNS } from "@/lib/hawaii/highways";
import { latLonToWorld, terrainY, WORLD } from "@/lib/hawaii/world";

const dummy = new Object3D();
const PX = WORLD.w / MAP_SIZE.w;

const PALETTE: Record<string, string[]> = {
  wet: ["#e8d6b0", "#c45c4a", "#5a7a68", "#d8c49a"],
  dry: ["#ecc896", "#d67a46", "#a85440", "#c9a06a"],
  lava: ["#d2ba96", "#785850", "#464648"],
  home: ["#f4ecd6", "#d76a4d", "#288c78"],
};

function hash(i: number) {
  let n = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

type Building = {
  px: number;
  py: number;
  pz: number;
  sx: number;
  sy: number;
  sz: number;
  ry: number;
  color: string;
};

function layout(): Building[] {
  const list: Building[] = [];
  let n = 0;
  for (const t of TOWNS) {
    const { x, z } = latLonToWorld(t.lat, t.lon);
    const rad = Math.max(0.35, t.r * PX * 0.9);
    const buildings = t.kind === "home" ? 12 : Math.max(6, Math.round(t.r * t.r * 0.22));
    const pal = PALETTE[t.kind]!;
    for (let i = 0; i < buildings; i++) {
      const h = hash(n + 17);
      const a = h * Math.PI * 2;
      const r = Math.pow(hash(n + 3), 0.55) * rad;
      const bx = x + Math.cos(a) * r;
      const bz = z + Math.sin(a) * r * 0.85;
      const bh = 0.14 + hash(n + 9) * (t.kind === "home" ? 0.26 : 0.38);
      list.push({
        px: bx,
        py: terrainY(bx, bz) + bh / 2,
        pz: bz,
        sx: 0.12 + h * 0.22,
        sy: bh,
        sz: 0.1 + hash(n + 5) * 0.18,
        ry: h * 6.2,
        color: pal[i % pal.length]!,
      });
      n++;
    }
  }
  return list;
}

export function Settlements() {
  const mesh = useRef<InstancedMesh>(null);
  const buildings = useMemo(() => layout(), []);
  const colors = useMemo(() => buildings.map((b) => new Color(b.color)), [buildings]);

  useLayoutEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    buildings.forEach((b, i) => {
      dummy.position.set(b.px, b.py, b.pz);
      dummy.scale.set(b.sx, b.sy, b.sz);
      dummy.rotation.set(0, b.ry, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, colors[i]!);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    return () => {
      inst.geometry.dispose();
      const mat = inst.material;
      if (mat && !Array.isArray(mat)) mat.dispose();
    };
  }, [buildings, colors]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, buildings.length]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.72} metalness={0.04} />
    </instancedMesh>
  );
}
