import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { HIGHWAYS } from "@/lib/hawaii/highways";
import { hu, latLonToWorld, terrainY } from "@/lib/hawaii/world";

export function Roads() {
  const paths = useMemo(() => {
    return HIGHWAYS.map((h) => ({
      id: h.id,
      width: h.w,
      points: h.pts.map(([lat, lon]) => {
        const { x, z } = latLonToWorld(lat, lon);
        return new Vector3(x, terrainY(x, z) + hu(0.07), z);
      }),
    }));
  }, []);

  return (
    <group>
      {paths.map((p) => (
        <Line key={p.id} points={p.points} color="#f0ddb0" lineWidth={Math.max(1.2, p.width * 0.7)} />
      ))}
    </group>
  );
}
