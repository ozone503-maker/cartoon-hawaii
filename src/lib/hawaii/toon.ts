import { DataTexture, NearestFilter, RGBAFormat } from "three";

let ramp: DataTexture | null = null;

/** 4-stop ramp so meshes read as painted cartoon, not faceted cubes. */
export function toonRamp() {
  if (ramp) return ramp;
  const stops = [88, 150, 210, 255];
  const data = new Uint8Array(stops.length * 4);
  stops.forEach((v, i) => {
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  });
  ramp = new DataTexture(data, stops.length, 1, RGBAFormat);
  ramp.minFilter = NearestFilter;
  ramp.magFilter = NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}
