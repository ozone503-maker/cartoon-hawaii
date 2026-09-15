/** Held-state input. Keyboard, touch, and the QA probe all write here. */

export const held = new Set<string>();
let probeLock = false;

export function setKeys(codes: string[]) {
  held.clear();
  for (const c of codes) held.add(c);
  probeLock = codes.length > 0;
}

export function hold(code: string, on: boolean) {
  probeLock = false;
  if (on) held.add(code);
  else held.delete(code);
}

export function readAxes() {
  let throttle = 0;
  let steer = 0;
  let lift = 0;
  if (held.has("KeyW") || held.has("ArrowUp")) throttle += 1;
  if (held.has("KeyS") || held.has("ArrowDown")) throttle -= 1;
  if (held.has("KeyA") || held.has("ArrowLeft")) steer += 1;
  if (held.has("KeyD") || held.has("ArrowRight")) steer -= 1;
  if (held.has("Space") || held.has("KeyR")) lift += 1;
  if (held.has("ControlLeft") || held.has("KeyF") || held.has("KeyC")) lift -= 1;
  const boost = held.has("ShiftLeft") || held.has("ShiftRight") || held.has("KeyB");
  return { throttle, steer, lift, boost };
}

export function bindKeyboard() {
  const down = (e: KeyboardEvent) => {
    probeLock = false;
    if (e.repeat) return;
    if (
      e.code.startsWith("Arrow") ||
      e.code === "Space" ||
      e.code.startsWith("Key") ||
      e.code.startsWith("Shift") ||
      e.code.startsWith("Control")
    ) {
      e.preventDefault();
    }
    held.add(e.code);
  };
  const up = (e: KeyboardEvent) => {
    if (probeLock) return;
    held.delete(e.code);
  };
  const clear = () => {
    if (probeLock) return;
    held.clear();
  };
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", clear);
  };
}

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer?: (v: number | null) => void;
  setKeys: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

/** Attach once and leave it — HMR / Strict Mode must not delete the QA probe. */
export function attachControlsProbe(
  getYaw: () => number,
  getSpeed: () => number,
  setSteer?: (v: number | null) => void,
) {
  const probe: ControlsProbe = { getYaw, getSpeed, setKeys, setSteer };
  window.__controlsTest = probe;
}
