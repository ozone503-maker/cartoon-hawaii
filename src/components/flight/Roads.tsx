import { useLayoutEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, MeshStandardMaterial } from "three";
import { HIGHWAYS } from "@/lib/hawaii/highways";
import { hu, latLonToWorld, terrainY, wu } from "@/lib/hawaii/world";

const ASPHALT = new MeshStandardMaterial({ color: "#2a2a2a", roughness: 0.92 });
const STRIPE = new MeshStandardMaterial({ color: "#e6c84a", roughness: 0.6 });
const OTHER = new MeshStandardMaterial({ color: "#d9c7a4", roughness: 0.9 });

function ribbon(latlon: [number, number][], half: number, lift: number) {
  const center = latlon.map(([lat, lon]) => {
    const { x, z } = latLonToWorld(lat, lon);
    return { x, y: terrainY(x, z) + lift, z };
  });
  const positions: number[] = [];
  const index: number[] = [];
  const n = center.length;
  for (let i = 0; i < n; i++) {
    const a = center[Math.max(0, i - 1)]!;
    const b = center[Math.min(n - 1, i + 1)]!;
    let dx = b.x - a.x;
    let dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    dx /= len;
    dz /= len;
    const p = center[i]!;
    positions.push(p.x - dz * half, p.y, p.z + dx * half);
    positions.push(p.x + dz * half, p.y, p.z - dx * half);
  }
  for (let i = 0; i < n - 1; i++) {
    const o = i * 2;
    index.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

export function Roads() {
  const meshes = useMemo(() => {
    return HIGHWAYS.map((h) => {
      const saddle = h.id === "hi200";
      return {
        id: h.id,
        road: ribbon(h.pts, wu(saddle ? 0.28 : 0.14), hu(0.1)),
        stripe: saddle ? ribbon(h.pts, wu(0.035), hu(0.16)) : null,
        saddle,
      };
    });
  }, []);

  useLayoutEffect(() => {
    return () => {
      for (const m of meshes) {
        m.road.dispose();
        m.stripe?.dispose();
      }
    };
  }, [meshes]);

  return (
    <group>
      {meshes.map((m) => (
        <group key={m.id}>
          <mesh geometry={m.road} material={m.saddle ? ASPHALT : OTHER} />
          {m.stripe ? <mesh geometry={m.stripe} material={STRIPE} /> : null}
        </group>
      ))}
    </group>
  );
}
