import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { BufferAttribute, PlaneGeometry, SRGBColorSpace, Texture, TextureLoader } from "three";
import { WORLD } from "@/lib/hawaii/world";
import { HALEMAUMAU_WORLD, KILAUEA_WORLD, kilaueaSurfaceY } from "@/lib/hawaii/kilauea";

/** Dense crater mesh so the bowl reads; the island plane is also depressed. */
export function Caldera() {
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    const loader = new TextureLoader();
    const t = loader.load("/maps/hawaii-cartoon.jpg?v=atlas3", (tex) => {
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = 1;
      setMap(tex);
    });
    return () => t.dispose();
  }, []);

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(7.6, 5.6, 40, 30);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    const uv = g.attributes.uv!;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + KILAUEA_WORLD.x;
      const z = pos.getZ(i) + KILAUEA_WORLD.z;
      pos.setXYZ(i, x, kilaueaSurfaceY(x, z), z);
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
        <meshStandardMaterial
          map={map ?? undefined}
          color={map ? "#ffffff" : "#3a2a22"}
          roughness={0.94}
        />
      </mesh>
      <mesh position={[pit.x, py + 0.04, pit.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 16]} />
        <meshStandardMaterial color="#c45a22" emissive="#ff6a20" emissiveIntensity={0.7} roughness={0.5} />
      </mesh>
      <pointLight position={[pit.x, py + 0.3, pit.z]} color="#ff7a28" intensity={1.4} distance={7} />
      <mesh position={[pit.x + 0.15, py + 0.7, pit.z]}>
        <coneGeometry args={[0.22, 1.2, 6]} />
        <meshStandardMaterial color="#e8eef2" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh position={[pit.x - 0.2, py + 0.55, pit.z + 0.15]}>
        <coneGeometry args={[0.16, 0.9, 6]} />
        <meshStandardMaterial color="#e8eef2" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}