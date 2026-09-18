import { useLayoutEffect, useMemo } from "react";
import { CircleGeometry, DoubleSide } from "three";
import {
  HALEMAUMAU_WORLD,
  KILAUEA_RX,
  KILAUEA_RZ,
  KILAUEA_WORLD,
  inVolcanoVillage,
  kilaueaSurfaceY,
} from "@/lib/hawaii/kilauea";
import { terrainY } from "@/lib/hawaii/world";

/** Oval black-cinder bowl. No rectangular atlas stamp. */
export function Caldera() {
  const bowl = useMemo(() => {
    const g = new CircleGeometry(1, 48);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    for (let i = 0; i < pos.count; i++) {
      const x = KILAUEA_WORLD.x + pos.getX(i) * KILAUEA_RX;
      const z = KILAUEA_WORLD.z + pos.getZ(i) * KILAUEA_RZ;
      pos.setXYZ(i, x, kilaueaSurfaceY(x, z) + 0.03, z);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  const apron = useMemo(() => {
    const g = new CircleGeometry(2.35, 48);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position!;
    for (let i = 0; i < pos.count; i++) {
      const x = KILAUEA_WORLD.x + pos.getX(i) * KILAUEA_RX;
      const z = KILAUEA_WORLD.z + pos.getZ(i) * KILAUEA_RZ;
      if (inVolcanoVillage(x, z)) pos.setXYZ(i, x, -40, z);
      else pos.setXYZ(i, x, terrainY(x, z) + 0.04, z);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  useLayoutEffect(() => {
    return () => {
      bowl.dispose();
      apron.dispose();
    };
  }, [bowl, apron]);

  const pit = HALEMAUMAU_WORLD;
  const py = kilaueaSurfaceY(pit.x, pit.z);

  return (
    <group>
      <mesh geometry={apron}>
        <meshStandardMaterial color="#1c1814" roughness={0.98} />
      </mesh>
      <mesh geometry={bowl}>
        <meshStandardMaterial color="#14110f" roughness={0.97} />
      </mesh>
      <mesh position={[pit.x, py + 0.05, pit.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 16]} />
        <meshStandardMaterial color="#c45a22" emissive="#ff6a20" emissiveIntensity={0.75} roughness={0.5} />
      </mesh>
      <pointLight position={[pit.x, py + 0.25, pit.z]} color="#ff7a28" intensity={1.35} distance={7} />
      <mesh position={[pit.x, py + 0.65, pit.z]}>
        <coneGeometry args={[0.2, 1.05, 6]} />
        <meshStandardMaterial color="#e8eef2" transparent opacity={0.2} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  );
}