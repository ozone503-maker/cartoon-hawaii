import { X } from "lucide-react";
import { PLACES } from "@/lib/hawaii/places";
import { useHawaii } from "@/lib/hawaii/store";
import { cn } from "@/lib/utils";

export function StampBook() {
  const open = useHawaii((s) => s.stampsOpen);
  const setOpen = useHawaii((s) => s.setStampsOpen);
  const visited = useHawaii((s) => s.visited);
  const select = useHawaii((s) => s.select);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 grid place-items-center bg-ink/55 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-labelledby="stamps-title"
        className="max-h-[min(90dvh,40rem)] w-full max-w-2xl overflow-hidden rounded-xl bg-paper text-ink shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div>
            <h2 id="stamps-title" className="font-display text-xl tracking-tight">
              Island passport
            </h2>
            <p className="text-sm text-muted">
              {visited.length} of {PLACES.length} places stamped
            </p>
          </div>
          <button
            type="button"
            aria-label="Close passport"
            className="grid size-11 place-items-center rounded-md text-ink hover:bg-ink/5"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="grid max-h-[min(70dvh,32rem)] grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3">
          {PLACES.map((place) => {
            const done = visited.includes(place.id);
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  select(place.id);
                  setOpen(false);
                }}
                className="overflow-hidden rounded-lg bg-cream text-left"
              >
                <div className="relative aspect-4/3 bg-ink/10">
                  <img
                    src={place.image}
                    alt=""
                    className={cn("size-full object-cover", !done && "grayscale opacity-70")}
                  />
                  {done ? (
                    <img
                      src="/sprites/stamp.png"
                      alt=""
                      className="absolute right-1 top-1 size-10 object-contain drop-shadow"
                    />
                  ) : null}
                </div>
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-medium">{place.name}</p>
                  <p className="truncate text-xs text-muted">{place.region}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
