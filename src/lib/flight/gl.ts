import { WebGLRenderer } from "three";

/** WebGL1 on purpose — Samsung Internet’s WebGL2 often creates a context that never paints. */
export function createFlightRenderer(props: { canvas: HTMLCanvasElement | OffscreenCanvas }) {
  const canvas = props.canvas as HTMLCanvasElement;
  const attrs: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false,
    powerPreference: "default",
  };
  const context =
    canvas.getContext("webgl", attrs) || canvas.getContext("experimental-webgl", attrs);
  if (!context) {
    throw new Error("This browser won’t run WebGL");
  }
  const renderer = new WebGLRenderer({
    canvas,
    context: context as WebGLRenderingContext,
    antialias: false,
    alpha: false,
  });
  renderer.setClearColor(0x7ec8ee, 1);
  renderer.setPixelRatio(1);
  return renderer;
}