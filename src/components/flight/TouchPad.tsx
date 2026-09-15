import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { clearStick, hold, setStick } from "@/lib/flight/input";
import { useHawaii } from "@/lib/hawaii/store";
import { cn } from "@/lib/utils";

const SIZE = 112;
const KNOB = 44;
const DEAD = 0.14;

export function TouchPad() {
  const started = useHawaii((s) => s.started);
  const mapOpen = useHawaii((s) => s.mapOpen);
  if (!started || mapOpen) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5">
      <Stick />
      <div className="pointer-events-auto flex flex-col gap-2">
        <RoundBtn code="Space" label="Lift">
          <ChevronUp />
        </RoundBtn>
        <RoundBtn code="KeyB" label="Boost">
          <Zap />
        </RoundBtn>
        <RoundBtn code="KeyF" label="Drop">
          <ChevronDown />
        </RoundBtn>
      </div>
    </div>
  );
}

function Stick() {
  const wrap = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const apply = (e: PointerEvent<HTMLDivElement>) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width / 2 - KNOB / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    const nx = dx / max;
    const ny = dy / max;
    setKnob({ x: dx, y: dy });
    const throttle = -ny;
    const steer = -nx;
    const mag = Math.hypot(nx, ny);
    if (mag < DEAD) {
      setStick(0, 0);
      setKnob({ x: 0, y: 0 });
      return;
    }
    setStick(Math.max(-1, Math.min(1, throttle)), Math.max(-1, Math.min(1, steer)));
  };

  const end = () => {
    setKnob({ x: 0, y: 0 });
    clearStick();
  };

  return (
    <div
      ref={wrap}
      className="pointer-events-auto relative size-28 shrink-0 rounded-full bg-ink/55 shadow-lg ring-1 ring-cream/20 backdrop-blur-md"
      style={{ width: SIZE, height: SIZE }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        apply(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) apply(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      role="slider"
      aria-label="Fly"
    >
      <div
        className="absolute left-1/2 top-1/2 size-11 rounded-full bg-cream/90 shadow-md"
        style={{
          width: KNOB,
          height: KNOB,
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  );
}

function RoundBtn({
  code,
  label,
  children,
}: {
  code: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid size-12 place-items-center rounded-full bg-ink/70 text-cream shadow-md backdrop-blur-md",
        "active:bg-coral",
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
        hold(code, true);
      }}
      onPointerUp={() => hold(code, false)}
      onPointerCancel={() => hold(code, false)}
    >
      {children}
    </button>
  );
}
