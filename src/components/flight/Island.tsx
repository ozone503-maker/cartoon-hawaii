import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { PlaneGeometry, SRGBColorSpace, Texture, TextureLoader } from "three";
import { terrainY, WORLD } from "@/lib/hawaii/world";

export function Island() {
  const [map, setMap] = useState<Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    const t = loader.load("/maps/hawaii-cartoon.jpg?v=atlas3", (tex) => {
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = 8;
      setMap(tex);
    });
    return () => t.dispose();
  }, []);

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(WORLD.w, WORLD.d, 180, 206);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, terrainY(pos.getX(i), pos.getZ(i)));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  useLayoutEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial map={map} color={map ? "#ffffff" : "#3d8a4a"} roughness={0.92} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <planeGeometry args={[WORLD.w * 3, WORLD.d * 3]} />
        <meshStandardMaterial color="#1a8ab8" roughness={0.28} metalness={0.04} />
      </mesh>
    </group>
  );
}