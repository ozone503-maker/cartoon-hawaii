import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { FlightCanvas } from "@/components/flight/FlightScene";
import { FlightHud } from "@/components/flight/FlightHud";
import { MiniMap } from "@/components/flight/MiniMap";
import { TouchPad } from "@/components/flight/TouchPad";
import { Button } from "@/components/ui/button";
import { Hud } from "@/components/world/Hud";
import { MapBridge } from "@/components/world/MapBridge";
import { MapView } from "@/components/world/MapView";
import { PlacePanel } from "@/components/world/PlacePanel";
import { StampBook } from "@/components/world/StampBook";
import { StartScreen } from "@/components/world/StartScreen";
import { useHawaii } from "@/lib/hawaii/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const mapOpen = useHawaii((s) => s.mapOpen);
  const started = useHawaii((s) => s.started);
  const setMapOpen = useHawaii((s) => s.setMapOpen);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ocean">
      <MapBridge />
      <FlightCanvas />
      <FlightHud />
      <MiniMap />
      <TouchPad />
      {mapOpen && started ? (
        <div className="absolute inset-0 z-40">
          <MapView />
          <Hud />
          <PlacePanel />
          <StampBook />
          <Button
            variant="cream"
            className="absolute right-3 top-3 z-50"
            aria-label="Back to flight"
            onClick={() => setMapOpen(false)}
          >
            <X />
            Back to flight
          </Button>
        </div>
      ) : null}
      <StartScreen />
    </main>
  );
}
