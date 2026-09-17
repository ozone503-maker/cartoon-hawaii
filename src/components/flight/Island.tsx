import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { BufferAttribute, Color, PlaneGeometry, SRGBColorSpace, Texture, TextureLoader } from "three";
import { terrainY, WORLD, worldToLatLon } from "@/lib/hawaii/world";
import { southOfKaLae } from "@/lib/hawaii/coast";

export function Island() {
  const [map, setMap] = useState<Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    const t = loader.load(
      "/maps/hawaii-cartoon.jpg?v=atlas3",
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = 1;
        setMap(tex);
      },
      undefined,
      () => {
        /* keep vertex-color fallback */
      },
    );
    return () => t.dispose();
  }, []);

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(WORLD.w, WORLD.d, 96, 110);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    const col = new Float32Array(pos.count * 3);
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const y0 = terrainY(pos.getX(i), pos.getZ(i));
      const ll = worldToLatLon(pos.getX(i), pos.getZ(i));
      const ocean = southOfKaLae(ll.lat, ll.lon);
      const y = ocean ? -0.65 : y0;
      pos.setY(i, y);
      if (ocean || y < 0.02) c.set("#1a8ab8");
      else if (y < 1.6) c.set("#3cb14a");
      else if (y < 4.0) c.set("#6a9a3c");
      else if (y < 7.2) c.set("#8a5340");
      else c.set("#e4e0d6");
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    pos.needsUpdate = true;
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  useLayoutEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          map={map ?? undefined}
          vertexColors={!map}
          color={map ? "#ffffff" : "#3d8a4a"}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <planeGeometry args={[WORLD.w * 3, WORLD.d * 3]} />
        <meshStandardMaterial color="#1a8ab8" roughness={0.28} metalness={0.04} />
      </mesh>
    </group>
  );
}