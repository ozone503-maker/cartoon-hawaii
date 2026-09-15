import { Button } from "@/components/ui/button";
import { useHawaii } from "@/lib/hawaii/store";

export function StartScreen() {
  const started = useHawaii((s) => s.started);
  const start = useHawaii((s) => s.start);

  if (started) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center">
      <div className="w-full max-w-lg rounded-xl bg-paper p-6 text-ink shadow-xl sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Cartoon world · Landsat geography
        </p>
        <h1 className="mt-2 font-display text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
          Fly Hawaiʻi Island
        </h1>
        <p className="mt-3 text-base leading-relaxed text-pretty text-ink/80">
          MDP’s UFO over the real island. The coastline is NASA Landsat. Forests,
          lava, towns, roads, and FlashTown are the cartoon world built on top.
          You start on the lot in Mountain View. Climb and the camera eases
          toward the overhead atlas.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          W/S thrust · A/D turn left/right · Space lift · F drop · Shift boost.
          Open the map anytime for the lat/lon grid.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={start}>
          Fly from FlashTown
        </Button>
      </div>
    </div>
  );
}
