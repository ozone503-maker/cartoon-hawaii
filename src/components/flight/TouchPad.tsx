import type { ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { hold } from "@/lib/flight/input";
import { useHawaii } from "@/lib/hawaii/store";
import { cn } from "@/lib/utils";

export function TouchPad() {
  const started = useHawaii((s) => s.started);
  const mapOpen = useHawaii((s) => s.mapOpen);
  if (!started || mapOpen) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5">
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5">
        <span />
        <Pad code="ArrowUp" label="Forward">
          <ArrowUp />
        </Pad>
        <span />
        <Pad code="ArrowLeft" label="Turn left">
          <ArrowLeft />
        </Pad>
        <Pad code="ArrowDown" label="Reverse">
          <ArrowDown />
        </Pad>
        <Pad code="ArrowRight" label="Turn right">
          <ArrowRight />
        </Pad>
      </div>
      <div className="pointer-events-auto flex flex-col gap-1.5">
        <Pad code="Space" label="Lift">
          <ChevronUp />
        </Pad>
        <Pad code="KeyB" label="Boost">
          <Zap />
        </Pad>
        <Pad code="KeyF" label="Drop">
          <ChevronDown />
        </Pad>
      </div>
    </div>
  );
}

function Pad({
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
        "grid size-12 place-items-center rounded-lg bg-ink/70 text-cream shadow-md backdrop-blur-md",
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
