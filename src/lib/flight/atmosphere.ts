import { Color, ShaderMaterial, SRGBColorSpace, Vector2, Vector3, DoubleSide } from "three";
import type { Material } from "three";
import { HEIGHT_SCALE, WORLD_SCALE } from "@/lib/hawaii/world";

/**
 * Air, light and cloud. Nothing here touches the flight, the camera rig,
 * latLonToWorld, or the ground pictures. It only changes how the ground is lit
 * and how far things fade, so the island reads as a big place with depth.
 */

/** Haze starts about 17 km out and swallows the far coast about 120 km out. */
export const FOG_NEAR = 520;
export const FOG_FAR = 3600;

export const HAZE_COLOR = "#b4d3e6";
export const ZENITH_COLOR = "#4f95cf";

/** Sun from the east-southeast, 30 degrees up. Same direction the game always had. */
export const SUN_POSITION: [number, number, number] = [140 * WORLD_SCALE, 80 * WORLD_SCALE, 40 * WORLD_SCALE];

/** Trade-wind cumulus base. About 1700 m. */
export const CLOUD_ALT = 1700 * HEIGHT_SCALE;
/** One cloud blob is about this wide, in world units (about 17 km). */
const CLOUD_SCALE = 520;
/** How dark a cloud shadow gets on the ground. */
const SHADOW_STRENGTH = 0.24;
/** Strength of the close-range ground grain. 0 turns it off. */
const GRAIN = 0.28;

/** Shared clock for cloud drift. Advanced once per frame by <Atmosphere />. */
export const cloudClock = { value: 0 };

const sunLen = Math.hypot(...SUN_POSITION);
const SUN_DIR = new Vector3(...SUN_POSITION).divideScalar(sunLen);
/** Ground shift of a shadow per unit of height between cloud and ground. */
const SHADOW_SHIFT = new Vector2(-SUN_POSITION[0] / SUN_POSITION[1], -SUN_POSITION[2] / SUN_POSITION[1]);

const CLOUD_GLSL = /* glsl */ `
float cHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float cNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(cHash(i), cHash(i + vec2(1.0, 0.0)), f.x),
             mix(cHash(i + vec2(0.0, 1.0)), cHash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float cFbm(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * cNoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return s;
}
float cloudDensity(vec2 xz, float t, float scale) {
  vec2 p = xz / scale + vec2(t * 0.0006, t * 0.0002);
  return smoothstep(0.54, 0.74, cFbm(p));
}
`;

function srgb(hex: string) {
  const out = { r: 0, g: 0, b: 0 };
  new Color(hex).getRGB(out, SRGBColorSpace);
  return new Vector3(out.r, out.g, out.b);
}

type CompileParams = Parameters<Material["onBeforeCompile"]>[0];

/**
 * Adds cloud shadows and a small grade to any MeshStandardMaterial that draws
 * the ground. Safe to call after the material already has its own
 * onBeforeCompile (Island's crater shading): it runs that first.
 * `key` must differ for ground materials whose shaders differ, because three
 * shares compiled programs between materials with the same key.
 */
export function applyAtmosphere<M extends Material>(material: M, key: string): M {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader: CompileParams, renderer) => {
    prev?.call(material, shader, renderer);
    shader.uniforms.uCloudT = cloudClock;
    shader.uniforms.uCloudScale = { value: CLOUD_SCALE };
    shader.uniforms.uCloudAlt = { value: CLOUD_ALT };
    shader.uniforms.uShadowShift = { value: SHADOW_SHIFT };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vAtmoPos;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvAtmoPos = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vAtmoPos;
         uniform float uCloudT;
         uniform float uCloudScale;
         uniform float uCloudAlt;
         uniform vec2 uShadowShift;
         ${CLOUD_GLSL}`,
      )
      .replace(
        "#include <opaque_fragment>",
        `{
           float up = max(uCloudAlt - vAtmoPos.y, 0.0);
           float shade = cloudDensity(vAtmoPos.xz + uShadowShift * up, uCloudT, uCloudScale);
           outgoingLight *= 1.0 - ${SHADOW_STRENGTH.toFixed(3)} * shade;
           // The satellite picture is about 12 m per texel, so up close it goes soft.
           // A fine grain, strongest near the camera, brings back the feel of rock and field.
           float nearK = 1.0 - smoothstep(25.0, 260.0, length(vViewPosition));
           float grain = cNoise(vAtmoPos.xz / 0.9) * 0.6 + cNoise(vAtmoPos.xz / 0.3) * 0.4;
           outgoingLight *= 1.0 + (grain - 0.5) * ${GRAIN.toFixed(3)} * nearK;
           float l = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
           outgoingLight = mix(vec3(l), outgoingLight, 0.94);
         }
         #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => key;
  material.needsUpdate = true;
  return material;
}

/** Sky dome. Horizon color equals the fog color so the far coast melts into it. */
export function createSkyMaterial() {
  return new ShaderMaterial({
    side: DoubleSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    uniforms: {
      uHorizon: { value: srgb(HAZE_COLOR) },
      uZenith: { value: srgb(ZENITH_COLOR) },
      uSunDir: { value: SUN_DIR.clone() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      uniform vec3 uHorizon;
      uniform vec3 uZenith;
      uniform vec3 uSunDir;
      void main() {
        float h = clamp(vDir.y, 0.0, 1.0);
        vec3 col = mix(uHorizon, uZenith, pow(h, 0.55));
        float sun = pow(max(dot(normalize(vDir), uSunDir), 0.0), 18.0);
        col += vec3(1.0, 0.92, 0.75) * sun * 0.22;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

/** One big sheet of cumulus. It follows the camera; the noise is in world space. */
export function createCloudMaterial() {
  return new ShaderMaterial({
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: {
      uCloudT: cloudClock,
      uCloudScale: { value: CLOUD_SCALE },
      uAlt: { value: CLOUD_ALT },
      uNear: { value: FOG_NEAR },
      uFar: { value: FOG_FAR },
      uHaze: { value: srgb(HAZE_COLOR) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vPos = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vPos;
      uniform float uCloudT;
      uniform float uCloudScale;
      uniform float uAlt;
      uniform float uNear;
      uniform float uFar;
      uniform vec3 uHaze;
      ${CLOUD_GLSL}
      void main() {
        float d = cloudDensity(vPos.xz, uCloudT, uCloudScale);
        float dist = distance(vPos, cameraPosition);
        float far = 1.0 - smoothstep(uFar * 0.9, uFar * 1.45, dist);
        float near = smoothstep(2.0, 9.0, abs(cameraPosition.y - uAlt));
        vec3 col = mix(vec3(0.74, 0.81, 0.90), vec3(1.0), smoothstep(0.25, 1.0, d));
        col = mix(col, uHaze, 0.55 * smoothstep(uNear, uFar, dist));
        gl_FragColor = vec4(col, d * 0.85 * far * near);
      }`,
  });
}

export const DOME_RADIUS = 5500;
export const CLOUD_SHEET = 11000;
