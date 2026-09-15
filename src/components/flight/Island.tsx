import { useLayoutEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { PlaneGeometry, SRGBColorSpace } from "three";
import { terrainY, WORLD } from "@/lib/hawaii/world";

export function Island() {
  const color = useTexture("/maps/hawaii-cartoon.jpg?v=atlas3");
  color.colorSpace = SRGBColorSpace;
  color.anisotropy = 16;

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(WORLD.w, WORLD.d, 256, 292);
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
        <meshStandardMaterial map={color} roughness={0.92} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <planeGeometry args={[WORLD.w * 3, WORLD.d * 3]} />
        <meshStandardMaterial color="#1a8ab8" roughness={0.28} metalness={0.04} />
      </mesh>
    </group>
  );
}
