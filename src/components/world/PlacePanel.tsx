import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { placeById, TOUR_IDS } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";

export function PlacePanel() {
  const selectedId = useHawaii((s) => s.selectedId);
  const select = useHawaii((s) => s.select);
  const touring = useHawaii((s) => s.touring);
  const tourIndex = useHawaii((s) => s.tourIndex);
  const nextTourStop = useHawaii((s) => s.nextTourStop);
  const stopTour = useHawaii((s) => s.stopTour);
  const place = selectedId ? placeById(selectedId) : undefined;

  if (!place) return null;

  const isLast = touring && tourIndex >= TOUR_IDS.length - 1;

  return (
    <aside
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-24 sm:w-[min(100%,24rem)] sm:p-0"
    >
      <article className="pointer-events-auto overflow-hidden rounded-xl bg-paper text-ink shadow-xl" data-place-panel={place.id}>
        <div className="relative aspect-16/9 overflow-hidden bg-ink">
          <img
            src={place.image}
            alt=""
            className="size-full object-cover"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              stopTour();
              select(null);
            }}
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-ink/70 text-cream"
          >
            <X className="size-4" />
          </button>
          <Badge variant="cream" className="absolute left-3 top-3">
            {place.kind === "home"
              ? "Home"
              : place.kind === "airport"
                ? place.icao ?? "Airport"
                : place.region}
          </Badge>
          <p className="absolute bottom-2 left-3 text-[10px] uppercase tracking-[0.14em] text-cream/80">
            Illustration — not the map
          </p>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {place.kicker}
            </p>
            <h2 className="mt-1 font-display text-2xl leading-tight tracking-tight text-balance">
              {place.name}
            </h2>
            {place.also ? (
              <p className="mt-0.5 text-sm text-muted">{place.also}</p>
            ) : null}
            <p className="mt-1 font-mono text-[11px] tabular-nums text-muted">
              {place.lat.toFixed(4)}°N {Math.abs(place.lon).toFixed(4)}°W
              {place.elevFt ? ` · ${place.elevFt.toLocaleString()} ft` : ""}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-pretty text-ink/80">{place.story}</p>
          {touring ? (
            <Button
              className="w-full"
              onClick={() => {
                if (isLast) {
                  stopTour();
                  select(null);
                } else {
                  nextTourStop();
                }
              }}
            >
              {isLast ? "Finish tour" : "Next stop"}
              <ChevronRight />
            </Button>
          ) : null}
        </div>
      </article>
    </aside>
  );
}
