import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { clearStick, hold, setStick } from "@/lib/flight/input";
import { useHawaii } from "@/lib/hawaii/store";
import { cn } from "@/lib/utils";

const SIZE = 148;
const DEAD = 0.12;

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
  const [axes, setAxes] = useState({ t: 0, s: 0 });

  const applyPoint = (clientX: number, clientY: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    const nx = dx / max;
    const ny = dy / max;
    const mag = Math.hypot(nx, ny);
    if (mag < DEAD) {
      setStick(0, 0);
      setAxes({ t: 0, s: 0 });
      return;
    }
    const t = Math.max(-1, Math.min(1, -ny));
    const s = Math.max(-1, Math.min(1, -nx));
    setAxes({ t, s });
    setStick(t, s);
  };

  const end = () => {
    setAxes({ t: 0, s: 0 });
    clearStick();
  };

  return (
    <div
      ref={wrap}
      className="pointer-events-auto relative shrink-0 overflow-hidden rounded-full shadow-lg"
      style={{ width: SIZE, height: SIZE, touchAction: "none" }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        applyPoint(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) applyPoint(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onTouchStart={(e) => {
        e.preventDefault();
        const t = e.touches[0];
        if (t) applyPoint(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const t = e.touches[0];
        if (t) applyPoint(t.clientX, t.clientY);
      }}
      onTouchEnd={end}
      onTouchCancel={end}
      role="slider"
      aria-label="Fly"
    >
      <svg viewBox="0 0 100 100" className="size-full">
        <Quarter d="M50 50 L17.5 17.5 A46 46 0 0 1 82.5 17.5 Z" on={axes.t > 0.18} />
        <Quarter d="M50 50 L82.5 17.5 A46 46 0 0 1 82.5 82.5 Z" on={axes.s < -0.18} />
        <Quarter d="M50 50 L82.5 82.5 A46 46 0 0 1 17.5 82.5 Z" on={axes.t < -0.18} />
        <Quarter d="M50 50 L17.5 82.5 A46 46 0 0 1 17.5 17.5 Z" on={axes.s > 0.18} />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#f4ecd6" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="50" cy="50" r="12" fill="#f4ecd6" />
      </svg>
    </div>
  );
}

function Quarter({ d, on }: { d: string; on: boolean }) {
  return <path d={d} fill={on ? "#d76a4d" : "#1c1916"} fillOpacity={on ? 0.92 : 0.62} />;
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
        "grid size-12 place-items-center rounded-full bg-ink/70 text-cream shadow-md",
        "active:bg-coral",
      )}
      style={{ touchAction: "manipulation" }}
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