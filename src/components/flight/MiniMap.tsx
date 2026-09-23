import { project } from "@/lib/hawaii/geo";
import { MAP_SIZE } from "@/lib/hawaii/geo";
import { useHawaii } from "@/lib/hawaii/store";

export function MiniMap() {
  const started = useHawaii((s) => s.started);
  const mapOpen = useHawaii((s) => s.mapOpen);
  const hud = useHawaii((s) => s.flightHud);
  const setMapOpen = useHawaii((s) => s.setMapOpen);
  if (!started || mapOpen) return null;

  const p = project(hud.lat, hud.lon);
  const left = (p.x / MAP_SIZE.w) * 100;
  const top = (p.y / MAP_SIZE.h) * 100;

  return (
    <button
      type="button"
      aria-label="Expand island map"
      onClick={() => setMapOpen(true)}
      className="absolute right-3 top-24 z-30 hidden overflow-hidden rounded-lg border border-cream/30 shadow-lg sm:block"
      style={{ width: 132, height: 152 }}
    >
      <img src="/maps/hawaii-cartoon.jpg?v=atlas8" alt="" className="size-full object-cover" />
      <span
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral ring-2 ring-cream"
        style={{ left: `${left}%`, top: `${top}%` }}
      />
    </button>
  );
}
