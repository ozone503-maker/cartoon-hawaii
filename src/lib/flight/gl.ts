import { WebGLRenderer } from "three";

export function createFlightRenderer(props: { canvas: HTMLCanvasElement | OffscreenCanvas }) {
  const renderer = new WebGLRenderer({
    canvas: props.canvas,
    antialias: false,
    alpha: false,
    depth: true,
    stencil: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setClearColor(0x7ec8ee, 1);
  renderer.setPixelRatio(1);
  return renderer;
}