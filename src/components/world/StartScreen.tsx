import { Button } from "@/components/ui/button";
import { HOME_ID } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";

export function StartScreen() {
  const started = useHawaii((s) => s.started);
  const start = useHawaii((s) => s.start);
  const select = useHawaii((s) => s.select);

  if (started) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center">
      <div className="w-full max-w-lg rounded-xl bg-paper p-6 text-ink shadow-xl sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          NASA Landsat · USGS
        </p>
        <h1 className="mt-2 font-display text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
          Hawaiʻi Island Atlas
        </h1>
        <p className="mt-3 text-base leading-relaxed text-pretty text-ink/80">
          The island is the photograph — NASA Landsat of Hawaiʻi Island. We did
          not draw the coastline, the palis, or the volcanoes.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Lat/lon grid locked to Upolu, Ka Lae, Keahole, and Kumukahi. Pins sit
          on surveyed coordinates. FlashTown is home.
        </p>
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            start();
            select(HOME_ID);
          }}
        >
          Enter at FlashTown
        </Button>
      </div>
    </div>
  );
}
