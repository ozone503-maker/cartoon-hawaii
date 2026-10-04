import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { PlaneGeometry, SRGBColorSpace, Texture, TextureLoader } from "three";
import type { CraftState } from "@/lib/flight/craft";
import { decodeHeightPng } from "@/lib/hawaii/height-png";
import { setTileHeight, terrainY, WORLD } from "@/lib/hawaii/world";

const FRAME_W = 11180;
const FRAME_H = 12800;
const TILE = 4096;
const COLS = 3;
const ROWS = 4;
const COL_W = [4096, 4096, 2988];
const ROW_H = [4096, 4096, 4096, 512];

type Key = `${number}-${number}`;

function tileKey(row: number, col: number): Key {
  return `${row}-${col}`;
}

function worldBox(row: number, col: number) {
  const cw = COL_W[col]!;
  const ch = ROW_H[row]!;
  const x0 = ((col * TILE) / FRAME_W) * WORLD.w - WORLD.w / 2;
  const x1 = ((col * TILE + cw) / FRAME_W) * WORLD.w - WORLD.w / 2;
  const z0 = ((row * TILE) / FRAME_H) * WORLD.d - WORLD.d / 2;
  const z1 = ((row * TILE + ch) / FRAME_H) * WORLD.d - WORLD.d / 2;
  return { x0, x1, z0, z1, u: cw / TILE, v: ch / TILE };
}

function tileAt(x: number, z: number) {
  const fx = ((x + WORLD.w / 2) / WORLD.w) * FRAME_W;
  const fy = ((z + WORLD.d / 2) / WORLD.d) * FRAME_H;
  const col = Math.max(0, Math.min(COLS - 1, Math.floor(fx / TILE)));
  const row = Math.max(0, Math.min(ROWS - 1, Math.floor(fy / TILE)));
  return { row, col };
}

function wanted(x: number, z: number) {
  const here = tileAt(x, z);
  return new Set<Key>([tileKey(here.row, here.col)]);
}

function TileMesh({ row, col, map }: { row: number; col: number; map: Texture }) {
  const box = worldBox(row, col);
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(box.x1 - box.x0, box.z1 - box.z0, 64, 64);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    const uv = g.attributes.uv!;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const lz = pos.getZ(i);
      const x = lx + (box.x0 + box.x1) / 2;
      const z = lz + (box.z0 + box.z1) / 2;
      pos.setX(i, x);
      pos.setZ(i, z);
      pos.setY(i, terrainY(x, z) + 0.35);
      uv.setXY(i, ((x - box.x0) / (box.x1 - box.x0)) * box.u, (1 - (z - box.z0) / (box.z1 - box.z0)) * box.v);
    }
    pos.needsUpdate = true;
    uv.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [box.x0, box.x1, box.z0, box.z1, box.u, box.v]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={map} roughness={0.86} metalness={0} />
    </mesh>
  );
}

export function GroundTiles({ craft }: { craft: CraftState }) {
  const gl = useThree((s) => s.gl);
  const [live, setLive] = useState<Map<Key, Texture>>(new Map());
  const [heightTick, setHeightTick] = useState(0);

  useEffect(() => {
    const loader = new TextureLoader();
    const cache = new Map<Key, Texture>();
    let dead = false;
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());

    const load = (key: Key) => {
      if (cache.has(key)) return;
      const [row, col] = key.split("-").map(Number);
      loader.load(`/maps/tiles/sat-r${row}-c${col}.jpg`, (tex) => {
        if (dead) {
          tex.dispose();
          return;
        }
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = aniso;
        cache.set(key, tex);
        setLive(new Map(cache));
      });
      void fetch(`/maps/tiles/h-r${row}-c${col}.png`)
        .then((r) => r.arrayBuffer())
        .then((buf) => decodeHeightPng(buf, row!, col!, WORLD.w, WORLD.d))
        .then((tile) => {
          if (!dead) {
            setTileHeight(tile);
            setHeightTick((n) => n + 1);
          }
        })
        .catch(() => setTileHeight(null));
    };

    const drop = (key: Key) => {
      const tex = cache.get(key);
      if (!tex) return;
      tex.dispose();
      cache.delete(key);
      setLive(new Map(cache));
    };

    const sync = () => {
      const need = wanted(craft.x, craft.z);
      for (const key of need) load(key);
      for (const key of cache.keys()) if (!need.has(key)) drop(key);
    };

    sync();
    const id = window.setInterval(sync, 400);
    return () => {
      dead = true;
      window.clearInterval(id);
      setTileHeight(null);
      for (const tex of cache.values()) tex.dispose();
    };
  }, [craft, gl]);

  return (
    <group>
      {[...live.entries()].map(([key, map]) => {
        const [row, col] = key.split("-").map(Number);
        return <TileMesh key={`${key}-${heightTick}`} row={row!} col={col!} map={map} />;
      })}
    </group>
  );
}
