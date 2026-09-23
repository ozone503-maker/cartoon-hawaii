import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  BufferAttribute,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
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

function drape(g: PlaneGeometry, yOf: (x: number, z: number) => number) {
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

function loadMap(url: string, set: (t: Texture) => void) {
  const loader = new TextureLoader();
  const t = loader.load(url, (tex) => {
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 1;
    set(tex);
  });
  return t;
}

/** Cartoon colors, Landsat ridges. Not a raw satellite dump. */
function usePhotoGround(cartoon: Texture | null, usgs: Texture | null) {
  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      map: cartoon ?? undefined,
      vertexColors: !cartoon,
      color: cartoon ? "#ffffff" : "#4ea84a",
      roughness: 0.78,
      metalness: 0,
    });
    if (cartoon && usgs) {
      m.onBeforeCompile = (shader) => {
        shader.uniforms.usgsMap = { value: usgs };
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nuniform sampler2D usgsMap;")
          .replace(
            "#include <map_fragment>",
            `#include <map_fragment>
             vec3 real = texture2D(usgsMap, vMapUv).rgb;
             float luma = dot(real, vec3(0.22, 0.62, 0.16));
             diffuseColor.rgb *= mix(0.95, 1.12, luma);
             diffuseColor.rgb = mix(diffuseColor.rgb, real * vec3(1.05, 1.08, 0.95), 0.1);
            `,
          );
      };
      m.needsUpdate = true;
    }
    return m;
  }, [cartoon, usgs]);

  useLayoutEffect(() => () => material.dispose(), [material]);
  return material;
}

export function Island() {
  const [map, setMap] = useState<Texture | null>(null);
  const [usgs, setUsgs] = useState<Texture | null>(null);

  useEffect(() => {
    const a = loadMap("/maps/hawaii-cartoon.jpg?v=atlas7", setMap);
    const b = loadMap("/maps/hawaii-usgs.jpg", setUsgs);
    return () => {
      a.dispose();
      b.dispose();
    };
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
    drape(g, (x, z) => terrainY(x, z) + 0.06);
    return g;
  }, []);

  const ground = usePhotoGround(map, usgs);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
      cape.dispose();
    };
  }, [geometry, cape]);

  return (
    <group>
      <mesh geometry={geometry} material={ground} receiveShadow />
      <mesh geometry={cape} material={ground} receiveShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, hu(-0.25), 0]}>
        <planeGeometry args={[WORLD.w * 3, WORLD.d * 3]} />
        <meshStandardMaterial color="#176894" roughness={0.18} metalness={0.12} />
      </mesh>
    </group>
  );
}