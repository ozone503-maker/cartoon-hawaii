import { Home, Plane } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { COASTLINE } from "@/lib/hawaii/coastline";
import {
  MAP_SIZE,
  ISLAND_PX,
  clamp,
  coastlinePath,
  project,
  unproject,
  gridLines,
  formatLatLon,
} from "@/lib/hawaii/geo";
import { PLACES, type Place } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";
import { cn } from "@/lib/utils";

type Cam = { tx: number; ty: number; scale: number };

const MIN_Z = 0.35;
const MAX_Z = 5.5;

export function MapView() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<Cam>({ tx: 0, ty: 0, scale: 1 });
  const [cam, setCam] = useState<Cam>({ tx: 0, ty: 0, scale: 1 });
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(
    null,
  );
  const pinch = useRef<{ d: number; scale: number; midX: number; midY: number } | null>(
    null,
  );
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const fly = useRef<{ from: Cam; to: Cam; t: number; dur: number } | null>(null);
  const raf = useRef(0);
  const fitted = useRef(false);

  const selectedId = useHawaii((s) => s.selectedId);
  const select = useHawaii((s) => s.select);
  const started = useHawaii((s) => s.started);
  const region = useHawaii((s) => s.region);
  const visited = useHawaii((s) => s.visited);
  const gridOn = useHawaii((s) => s.grid);
  const basemap = useHawaii((s) => s.basemap);
  const [cursor, setCursor] = useState<string | null>(null);

  const path = useMemo(() => coastlinePath(COASTLINE), []);
  const grid = useMemo(() => gridLines(), []);
  const visible = region === "all" ? PLACES : PLACES.filter((p) => p.region === region);

  const publish = useCallback((next: Cam) => {
    camRef.current = next;
    setCam(next);
  }, []);

  const fitIsland = useCallback(
    (animate = false) => {
      const el = wrapRef.current;
      if (!el) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const pad = Math.min(vw, vh) * 0.07;
      const s = Math.min((vw - pad * 2) / ISLAND_PX.w, (vh - pad * 2) / ISLAND_PX.h);
      const dest: Cam = {
        scale: s,
        tx: (vw - ISLAND_PX.w * s) / 2 - ISLAND_PX.x * s,
        ty: (vh - ISLAND_PX.h * s) / 2 - ISLAND_PX.y * s,
      };
      if (animate) {
        fly.current = { from: { ...camRef.current }, to: dest, t: 0, dur: 0.7 };
      } else {
        publish(dest);
      }
    },
    [publish],
  );

  const flyToPlace = useCallback((place: Place) => {
    const el = wrapRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const p = project(place.lat, place.lon);
    const compact = vw < 720;
    const targetScale = clamp(
      camRef.current.scale < 1.6 ? (compact ? 1.85 : 2.15) : camRef.current.scale,
      compact ? 1.5 : 1.7,
      3.2,
    );
    const panelShift = compact ? 0 : vw * 0.12;
    const bottomShift = compact ? vh * 0.16 : 0;
    const dest: Cam = {
      scale: targetScale,
      tx: vw / 2 - panelShift - p.x * targetScale,
      ty: vh / 2 - bottomShift - p.y * targetScale,
    };
    fly.current = { from: { ...camRef.current }, to: dest, t: 0, dur: compact ? 0.55 : 0.85 };
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (!fitted.current) return;
      if (!useHawaii.getState().selectedId) fitIsland(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fitIsland]);

  useEffect(() => {
    const onReset = () => {
      useHawaii.getState().select(null);
      useHawaii.getState().stopTour();
      fitIsland(true);
    };
    window.addEventListener("cartoon-hawaii-reset", onReset);
    return () => window.removeEventListener("cartoon-hawaii-reset", onReset);
  }, [fitIsland]);

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = fly.current;
      if (f) {
        f.t += dt;
        const u = Math.min(1, f.t / f.dur);
        const e = 1 - (1 - u) ** 3;
        publish({
          tx: f.from.tx + (f.to.tx - f.from.tx) * e,
          ty: f.from.ty + (f.to.ty - f.from.ty) * e,
          scale: f.from.scale + (f.to.scale - f.from.scale) * e,
        });
        if (u >= 1) fly.current = null;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [publish]);

  useEffect(() => {
    if (!selectedId) return;
    const place = PLACES.find((p) => p.id === selectedId);
    if (place) flyToPlace(place);
  }, [selectedId, flyToPlace]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      fly.current = null;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { tx, ty, scale } = camRef.current;
      const worldX = (mx - tx) / scale;
      const worldY = (my - ty) / scale;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const next = clamp(scale * factor, MIN_Z, MAX_Z);
      publish({
        scale: next,
        tx: mx - worldX * next,
        ty: my - worldY * next,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [publish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const step = 80;
      if (e.key === "Escape") {
        select(null);
        return;
      }
      const el = wrapRef.current;
      if (!el) return;
      if (e.key === "+" || e.key === "=") {
        const { tx, ty, scale } = camRef.current;
        const next = clamp(scale * 1.18, MIN_Z, MAX_Z);
        const cx = el.clientWidth / 2;
        const cy = el.clientHeight / 2;
        publish({
          scale: next,
          tx: cx - ((cx - tx) / scale) * next,
          ty: cy - ((cy - ty) / scale) * next,
        });
      }
      if (e.key === "-" || e.key === "_") {
        const { tx, ty, scale } = camRef.current;
        const next = clamp(scale / 1.18, MIN_Z, MAX_Z);
        const cx = el.clientWidth / 2;
        const cy = el.clientHeight / 2;
        publish({
          scale: next,
          tx: cx - ((cx - tx) / scale) * next,
          ty: cy - ((cy - ty) / scale) * next,
        });
      }
      const c = camRef.current;
      if (e.key === "ArrowLeft") publish({ ...c, tx: c.tx + step });
      if (e.key === "ArrowRight") publish({ ...c, tx: c.tx - step });
      if (e.key === "ArrowUp") publish({ ...c, ty: c.ty + step });
      if (e.key === "ArrowDown") publish({ ...c, ty: c.ty - step });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [publish, select]);

  const onImgLoad = () => {
    if (fitted.current) return;
    fitted.current = true;
    fitIsland(false);
  };

  const clientPoint = (e: PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = clientPoint(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 1) {
      drag.current = { id: e.pointerId, x: p.x, y: p.y, moved: false };
      fly.current = null;
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const d = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
      pinch.current = {
        d,
        scale: camRef.current.scale,
        midX: (pts[0]!.x + pts[1]!.x) / 2,
        midY: (pts[0]!.y + pts[1]!.y) / 2,
      };
      drag.current = null;
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = clientPoint(e);
    pointers.current.set(e.pointerId, p);
    if (started) {
      const wx = (p.x - camRef.current.tx) / camRef.current.scale;
      const wy = (p.y - camRef.current.ty) / camRef.current.scale;
      const ll = unproject(wx, wy);
      setCursor(formatLatLon(ll.lat, ll.lon));
    }
    if (pinch.current && pointers.current.size >= 2) {
      const pts = [...pointers.current.values()];
      const d = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
      const midX = (pts[0]!.x + pts[1]!.x) / 2;
      const midY = (pts[0]!.y + pts[1]!.y) / 2;
      const { tx, ty, scale } = camRef.current;
      const worldX = (pinch.current.midX - tx) / scale;
      const worldY = (pinch.current.midY - ty) / scale;
      const next = clamp(
        pinch.current.scale * (d / Math.max(1, pinch.current.d)),
        MIN_Z,
        MAX_Z,
      );
      publish({
        scale: next,
        tx: midX - worldX * next,
        ty: midY - worldY * next,
      });
      return;
    }
    const dnd = drag.current;
    if (!dnd || dnd.id !== e.pointerId) return;
    const dx = p.x - dnd.x;
    const dy = p.y - dnd.y;
    if (Math.hypot(dx, dy) > 3) dnd.moved = true;
    const c = camRef.current;
    publish({ ...c, tx: c.tx + dx, ty: c.ty + dy });
    dnd.x = p.x;
    dnd.y = p.y;
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const dnd = drag.current;
    pointers.current.delete(e.pointerId);
    if (dnd?.id === e.pointerId) {
      const onPin = (e.target as HTMLElement | null)?.closest?.("[data-place]");
      if (!dnd.moved && started && !onPin) select(null);
      drag.current = null;
    }
    if (pointers.current.size < 2) pinch.current = null;
  };

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden touch-none bg-ocean cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => fitIsland(true)}
    >
      <div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: MAP_SIZE.w,
          height: MAP_SIZE.h,
          transform: `translate3d(${cam.tx}px, ${cam.ty}px, 0) scale(${cam.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <img
          src={basemap === "usgs" ? "/maps/hawaii-usgs.jpg?v=grid" : "/maps/hawaii-cartoon.jpg?v=grid"}
          alt="Map of Hawaiʻi Island from NASA Landsat"
          draggable={false}
          onLoad={onImgLoad}
          className="absolute inset-0 size-full select-none"
        />
        <svg
          className="absolute inset-0 size-full pointer-events-none"
          viewBox={`0 0 ${MAP_SIZE.w} ${MAP_SIZE.h}`}
          aria-hidden
        >
          {gridOn
            ? grid.map((line) => (
                <g key={`${line.kind}-${line.value}`}>
                  <line
                    x1={line.a.x}
                    y1={line.a.y}
                    x2={line.b.x}
                    y2={line.b.y}
                    stroke={line.major ? "rgba(244,236,214,0.45)" : "rgba(244,236,214,0.18)"}
                    strokeWidth={line.major ? 1.6 : 0.9}
                  />
                  {line.major && line.kind === "lat" ? (
                    <text
                      x={line.a.x + 8}
                      y={line.a.y - 6}
                      fill="rgba(244,236,214,0.85)"
                      fontSize="22"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      {line.value.toFixed(1)}°N
                    </text>
                  ) : null}
                  {line.major && line.kind === "lon" ? (
                    <text
                      x={line.b.x + 6}
                      y={line.b.y + 22}
                      fill="rgba(244,236,214,0.85)"
                      fontSize="22"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      {Math.abs(line.value).toFixed(1)}°W
                    </text>
                  ) : null}
                </g>
              ))
            : null}
          <path
            d={path}
            fill="none"
            stroke="rgba(244,236,214,0.35)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {started && cursor ? (
        <div className="pointer-events-none absolute bottom-24 left-3 z-20 hidden rounded-md bg-ink/70 px-2.5 py-1 font-mono text-[11px] tabular-nums text-cream backdrop-blur-md sm:block sm:bottom-28">
          {cursor}
        </div>
      ) : null}
      {started
        ? visible.map((place) => {
            const p = project(place.lat, place.lon);
            return (
              <Pin
                key={place.id}
                place={place}
                left={cam.tx + p.x * cam.scale}
                top={cam.ty + p.y * cam.scale}
                selected={place.id === selectedId}
                visited={visited.includes(place.id)}
                onSelect={() => select(place.id === selectedId ? null : place.id)}
              />
            );
          })
        : null}
    </div>
  );
}

function Pin({
  place,
  left,
  top,
  selected,
  visited,
  onSelect,
}: {
  place: Place;
  left: number;
  top: number;
  selected: boolean;
  visited: boolean;
  onSelect: () => void;
}) {
  const home = place.kind === "home";
  const airport = place.kind === "airport";
  const showName = selected || home;
  return (
    <button
      type="button"
      data-place={place.id}
      data-kind={place.kind}
      aria-label={place.name}
      aria-pressed={selected}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className={cn(
        "group absolute flex flex-col items-center pointer-events-auto",
        selected && "z-20",
      )}
      style={{
        left,
        top,
        transform: "translate3d(-50%, -100%, 0)",
        zIndex: selected ? 40 : home ? 16 : airport ? 8 : 10,
      }}
    >
      {selected ? (
        <img
          src="/sprites/honu.png"
          alt=""
          className="mb-1 size-11 object-contain drop-shadow-md honu-bob"
        />
      ) : null}
      <span
        className={cn(
          "grid size-11 place-items-center border-2 shadow-md",
          home
            ? "rounded-md border-cream bg-coral"
            : airport
              ? "rounded-sm border-cream/80 bg-ink/85"
              : "rounded-full border-2",
          !home &&
            !airport &&
            (selected
              ? "border-cream bg-coral"
              : visited
                ? "border-cream/80 bg-lagoon"
                : "border-cream bg-ink/80"),
          selected && airport && "bg-coral border-cream",
        )}
      >
        {home ? (
          <Home className="size-4 text-cream" />
        ) : airport ? (
          <Plane className="size-4 text-cream" />
        ) : (
          <span className="size-2.5 rounded-full bg-cream" />
        )}
      </span>
      <span
        className={cn(
          "pointer-events-none mt-1 max-w-28 truncate rounded-sm bg-ink/85 px-2 py-0.5 text-center text-[11px] font-medium text-cream",
          showName ? "block" : "hidden group-hover:block",
        )}
      >
        {place.name}
      </span>
    </button>
  );
}
