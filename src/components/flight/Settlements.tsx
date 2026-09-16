import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import { MAP_SIZE } from "@/lib/hawaii/geo";
import { TOWNS } from "@/lib/hawaii/highways";
import { latLonToWorld, terrainY, WORLD } from "@/lib/hawaii/world";

const dummy = new Object3D();
const PX = WORLD.w / MAP_SIZE.w;

const WALLS: Record<string, string[]> = {
  wet: ["#efe6d0", "#e4d4b4", "#d9c8a4", "#f2ead8"],
  dry: ["#ead9b4", "#dcc49a", "#c9b086"],
  lava: ["#d8c4a8", "#c4b49a", "#b8a090"],
  home: ["#f4ecd6"],
};

const ROOFS: Record<string, string[]> = {
  wet: ["#7a8a6a", "#c45c4a", "#8a8e92", "#6a7a58"],
  dry: ["#c45c4a", "#a85440", "#8a8e92"],
  lava: ["#785850", "#8a8e92", "#5a5048"],
  home: ["#d76a4d"],
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
  wall: string;
  roof: string;
};

function layout(): Building[] {
  const list: Building[] = [];
  let n = 0;
  for (const t of TOWNS) {
    const { x, z } = latLonToWorld(t.lat, t.lon);
    const rad = Math.max(0.4, t.r * PX * 0.95);
    const count = t.kind === "home" ? 0 : Math.max(4, Math.round(t.r * 0.55));
    const walls = WALLS[t.kind]!;
    const roofs = ROOFS[t.kind]!;
    for (let i = 0; i < count; i++) {
      const h = hash(n + 17);
      const a = h * Math.PI * 2;
      const r = Math.pow(hash(n + 3), 0.62) * rad;
      const bx = x + Math.cos(a) * r;
      const bz = z + Math.sin(a) * r * 0.9;
      const bh = 0.1 + hash(n + 9) * 0.1;
      list.push({
        px: bx,
        py: terrainY(bx, bz) + bh / 2,
        pz: bz,
        sx: 0.22 + h * 0.2,
        sy: bh,
        sz: 0.16 + hash(n + 5) * 0.14,
        ry: (hash(n + 11) * 4 | 0) * (Math.PI / 2),
        wall: walls[i % walls.length]!,
        roof: roofs[i % roofs.length]!,
      });
      n++;
    }
  }
  return list;
}

export function Settlements() {
  const mesh = useRef<InstancedMesh>(null);
  const roofs = useRef<InstancedMesh>(null);
  const buildings = useMemo(() => layout(), []);
  const wallColors = useMemo(() => buildings.map((b) => new Color(b.wall)), [buildings]);
  const roofColors = useMemo(() => buildings.map((b) => new Color(b.roof)), [buildings]);

  useLayoutEffect(() => {
    const inst = mesh.current;
    const roof = roofs.current;
    if (!inst || !roof) return;
    buildings.forEach((b, i) => {
      dummy.position.set(b.px, b.py, b.pz);
      dummy.scale.set(b.sx, b.sy, b.sz);
      dummy.rotation.set(0, b.ry, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, wallColors[i]!);
      dummy.position.set(b.px, b.py + b.sy / 2 + 0.02, b.pz);
      dummy.scale.set(b.sx * 1.12, 0.045, b.sz * 1.12);
      dummy.rotation.set(0.18, b.ry, 0);
      dummy.updateMatrix();
      roof.setMatrixAt(i, dummy.matrix);
      roof.setColorAt(i, roofColors[i]!);
    });
    inst.instanceMatrix.needsUpdate = true;
    roof.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    if (roof.instanceColor) roof.instanceColor.needsUpdate = true;
    return () => {
      inst.geometry.dispose();
      roof.geometry.dispose();
      const mat = inst.material;
      const rm = roof.material;
      if (mat && !Array.isArray(mat)) mat.dispose();
      if (rm && !Array.isArray(rm)) rm.dispose();
    };
  }, [buildings, wallColors, roofColors]);

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors roughness={0.86} />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors roughness={0.72} />
      </instancedMesh>
    </group>
  );
}
