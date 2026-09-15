import { Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLatLon } from "@/lib/hawaii/geo";
import { headingDeg } from "@/lib/hawaii/world";
import { PLACES } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";

function nearestName(lat: number, lon: number) {
  let best = PLACES[0]!;
  let d = Infinity;
  for (const p of PLACES) {
    const dd = (p.lat - lat) ** 2 + (p.lon - lon) ** 2;
    if (dd < d) {
      d = dd;
      best = p;
    }
  }
  return best.name;
}

export function FlightHud() {
  const hud = useHawaii((s) => s.flightHud);
  const setMapOpen = useHawaii((s) => s.setMapOpen);
  const started = useHawaii((s) => s.started);
  const mapOpen = useHawaii((s) => s.mapOpen);
  if (!started || mapOpen) return null;

  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-5">
        <div className="pointer-events-auto rounded-xl bg-ink/70 px-4 py-3 text-cream shadow-lg backdrop-blur-md">
          <p className="font-display text-lg leading-tight tracking-tight">Hawaiʻi Island</p>
          <p className="mt-0.5 text-xs text-cream/70">Chase cam · cartoon island</p>
        </div>
        <Button
          variant="cream"
          size="icon"
          className="pointer-events-auto"
          aria-label="Open island map"
          onClick={() => setMapOpen(true)}
        >
          <MapIcon />
        </Button>
      </header>
      <div className="pointer-events-none absolute left-3 top-24 z-20 hidden rounded-lg bg-ink/65 px-3 py-2 font-mono text-[11px] leading-relaxed text-cream backdrop-blur-md sm:block">
        <p>{formatLatLon(hud.lat, hud.lon)}</p>
        <p>
          {Math.max(0, hud.altM).toFixed(0)} m AGL · hd {headingDeg(hud.yaw).toFixed(0)}°
        </p>
        <p className="text-cream/70">{nearestName(hud.lat, hud.lon)}</p>
      </div>
      <p className="pointer-events-none absolute inset-x-0 top-[4.6rem] z-20 hidden text-center text-xs text-cream/80 sm:block">
        W/S thrust · A/D turn · Space lift · F drop · Shift boost
      </p>
    </>
  );
}
