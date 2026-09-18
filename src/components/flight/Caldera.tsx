import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { CircleGeometry, SRGBColorSpace, Texture, TextureLoader } from "three";
import {
  HALEMAUMAU_WORLD,
  KILAUEA_RX,
  KILAUEA_RZ,
  KILAUEA_WORLD,
  kilaueaSurfaceY,
} from "@/lib/hawaii/kilauea";
import { WORLD } from "@/lib/hawaii/world";

/** Hole in the shield with the atlas on it. No plastic dish, no cylinder. */
export function Caldera() {
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    const t = new TextureLoader().load("/maps/hawaii-cartoon.jpg?v=atlas6", (tex) => {
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = 1;
      setMap(tex);
    });
    return () => t.dispose();
  }, []);

  const geometry = useMemo(() => {
    const g = new CircleGeometry(1, 48);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    const uv = g.attributes.uv!;
    for (let i = 0; i < pos.count; i++) {
      const x = KILAUEA_WORLD.x + pos.getX(i) * KILAUEA_RX;
      const z = KILAUEA_WORLD.z + pos.getZ(i) * KILAUEA_RZ;
      pos.setXYZ(i, x, kilaueaSurfaceY(x, z) + 0.02, z);
      uv.setXY(i, (x + WORLD.w / 2) / WORLD.w, 1 - (z + WORLD.d / 2) / WORLD.d);
    }
    pos.needsUpdate = true;
    uv.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  const pit = HALEMAUMAU_WORLD;
  const py = kilaueaSurfaceY(pit.x, pit.z);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial map={map ?? undefined} color={map ? "#ffffff" : "#5c5248"} roughness={0.96} />
      </mesh>
      <mesh position={[pit.x, py + 0.05, pit.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 12]} />
        <meshStandardMaterial color="#c45a22" emissive="#ff6a20" emissiveIntensity={0.45} roughness={0.6} />
      </mesh>
    </group>
  );
}