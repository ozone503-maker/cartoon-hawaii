import type { ReactNode } from "react";
import { BookOpen, Compass, Grid3x3, Home, Layers, Map as MapIcon, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOME_ID, PLACES, REGIONS, TOUR_IDS } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";
import { cn } from "@/lib/utils";

export function Hud() {
  const visited = useHawaii((s) => s.visited);
  const region = useHawaii((s) => s.region);
  const setRegion = useHawaii((s) => s.setRegion);
  const setStampsOpen = useHawaii((s) => s.setStampsOpen);
  const touring = useHawaii((s) => s.touring);
  const startTour = useHawaii((s) => s.startTour);
  const stopTour = useHawaii((s) => s.stopTour);
  const tourIndex = useHawaii((s) => s.tourIndex);
  const started = useHawaii((s) => s.started);
  const selectedId = useHawaii((s) => s.selectedId);
  const select = useHawaii((s) => s.select);
  const grid = useHawaii((s) => s.grid);
  const toggleGrid = useHawaii((s) => s.toggleGrid);
  const basemap = useHawaii((s) => s.basemap);
  const toggleBasemap = useHawaii((s) => s.toggleBasemap);
  const setMapOpen = useHawaii((s) => s.setMapOpen);

  if (!started) return null;

  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-5">
        <div className="pointer-events-auto rounded-xl bg-ink/70 px-4 py-3 text-cream shadow-lg backdrop-blur-md">
          <p className="font-display text-lg leading-tight tracking-tight sm:text-xl">
            Hawaiʻi Island Atlas
          </p>
          <p className="mt-0.5 text-xs text-cream/70">Landsat coastline · cartoon world</p>
        </div>
        <div className="pointer-events-auto flex max-w-[62%] flex-wrap items-center justify-end gap-2">
          <Button variant="cream" aria-label="Back to flight" onClick={() => setMapOpen(false)}>
            <X />
            <span className="hidden sm:inline">Flight</span>
          </Button>
          <div className="hidden items-center gap-2 rounded-xl bg-ink/70 px-3 py-2 text-cream backdrop-blur-md sm:flex">
            <Compass className="size-4 text-coral" />
            <span className="text-sm tabular-nums">
              {visited.length}
              <span className="text-cream/60"> / {PLACES.length}</span>
            </span>
          </div>
          <Button
            variant={grid ? "cream" : "outline"}
            size="icon"
            aria-label={grid ? "Hide lat/lon grid" : "Show lat/lon grid"}
            onClick={toggleGrid}
          >
            <Grid3x3 />
          </Button>
          <Button
            variant={basemap === "usgs" ? "cream" : "outline"}
            size="icon"
            aria-label={basemap === "usgs" ? "Show cartoon atlas" : "Show NASA Landsat"}
            onClick={toggleBasemap}
          >
            <Layers />
          </Button>
          <Button
            variant="cream"
            size="icon"
            aria-label="Go to FlashTown"
            onClick={() => select(HOME_ID)}
          >
            <Home />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Passport stamps"
            onClick={() => setStampsOpen(true)}
          >
            <BookOpen />
          </Button>
          {touring ? (
            <Button variant="outline" size="icon" aria-label="Stop tour" onClick={stopTour}>
              <X />
            </Button>
          ) : (
            <Button variant="outline" size="icon" aria-label="Start island tour" onClick={startTour}>
              <Play />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            aria-label="Reset view"
            onClick={() => window.dispatchEvent(new Event("cartoon-hawaii-reset"))}
          >
            <RotateCcw />
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5",
          selectedId && "max-sm:hidden",
        )}
      >
        <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-2">
          {touring ? (
            <p className="rounded-lg bg-ink/70 px-3 py-2 text-center text-sm text-cream backdrop-blur-md">
              Grand tour {tourIndex + 1} / {TOUR_IDS.length}
            </p>
          ) : (
            <p className="hidden text-center text-xs text-cream/80 sm:block">
              Drag to wander · pinch to zoom · FlashTown is home
            </p>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip
              active={region === "all"}
              onClick={() => setRegion("all")}
              icon={<MapIcon className="size-3.5" />}
            >
              Whole island
            </FilterChip>
            {REGIONS.map((r) => (
              <FilterChip key={r} active={region === r} onClick={() => setRegion(r)}>
                {r}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium",
        "transition-colors duration-200",
        active ? "bg-cream text-ink" : "bg-ink/65 text-cream backdrop-blur-md hover:bg-ink/80",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
