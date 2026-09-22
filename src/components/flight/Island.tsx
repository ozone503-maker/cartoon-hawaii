import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { BufferAttribute, Color, PlaneGeometry, SRGBColorSpace, Texture, TextureLoader } from "three";
import { hu, latLonToWorld, terrainMeters, terrainY, WORLD, worldToLatLon } from "@/lib/hawaii/world";
import { kauCliffY } from "@/lib/hawaii/coast";
import { kilaueaBowlY } from "@/lib/hawaii/kilauea";

function tintForMeters(m: number, c: Color) {
  if (m < 5) c.set("#1a8ab8");
  else if (m < 280) c.set("#3cb14a");
  else if (m < 700) c.set("#6a9a3c");
  else if (m < 2000) c.set("#8a5340");
  else if (m < 3200) c.set("#6a5248");
  else c.set("#5a5048");
}

function drape(
  g: PlaneGeometry,
  yOf: (x: number, z: number) => number,
) {
  const pos = g.attributes.position!;
  const uv = g.attributes.uv!;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, yOf(x, z));
    uv.setXY(i, (x + WORLD.w / 2) / WORLD.w, 1 - (z + WORLD.d / 2) / WORLD.d);
  }
  pos.needsUpdate = true;
  uv.needsUpdate = true;
  g.computeVertexNormals();
}

export function Island() {
  const [map, setMap] = useState<Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    const t = loader.load(
      "/maps/hawaii-cartoon.jpg?v=atlas7",
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
    const g = new PlaneGeometry(WORLD.w, WORLD.d, 160, 184);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    const col = new Float32Array(pos.count * 3);
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y0 = terrainY(x, z);
      const ll = worldToLatLon(x, z);
      const y = kilaueaBowlY(x, z, kauCliffY(ll.lat, ll.lon, y0));
      pos.setY(i, y);
      const m = terrainMeters(x, z);
      if (y < hu(0.02)) c.set("#1a8ab8");
      else tintForMeters(m, c);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    pos.needsUpdate = true;
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  const cape = useMemo(() => {
    const sw = latLonToWorld(18.885, -155.748);
    const ne = latLonToWorld(19.018, -155.608);
    const w = Math.abs(ne.x - sw.x);
    const d = Math.abs(ne.z - sw.z);
    const cx = (ne.x + sw.x) / 2;
    const cz = (ne.z + sw.z) / 2;
    const g = new PlaneGeometry(w, d, 80, 64);
    g.rotateX(-Math.PI / 2);
    g.translate(cx, 0, cz);
    drape(g, (x, z) => terrainY(x, z));
    return g;
  }, []);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
      cape.dispose();
    };
  }, [geometry, cape]);

  const mat = (
    <meshStandardMaterial
      map={map ?? undefined}
      vertexColors={!map}
      color={map ? "#ffffff" : "#3d8a4a"}
      roughness={0.92}
      metalness={0}
      polygonOffset
      polygonOffsetFactor={-1}
      polygonOffsetUnits={-2}
    />
  );

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
      <mesh geometry={cape} receiveShadow>
        {mat}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, hu(-0.25), 0]}>
        <planeGeometry args={[WORLD.w * 3, WORLD.d * 3]} />
        <meshStandardMaterial color="#1a8ab8" roughness={0.28} metalness={0.04} />
      </mesh>
    </group>
  );
}