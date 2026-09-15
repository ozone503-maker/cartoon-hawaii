import { createFileRoute } from "@tanstack/react-router";
import { FlightCanvas } from "@/components/flight/FlightScene";
import { FlyGate } from "@/components/flight/FlyGate";
import { FlightHud } from "@/components/flight/FlightHud";
import { MiniMap } from "@/components/flight/MiniMap";
import { TouchPad } from "@/components/flight/TouchPad";
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

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ocean">
      <div className="flight-stage relative size-full overflow-hidden">
        <MapBridge />
        <FlyGate>
          <FlightCanvas />
        </FlyGate>
        <FlightHud />
        <MiniMap />
        <TouchPad />
        {mapOpen && started ? (
          <div className="absolute inset-0 z-40">
            <MapView />
            <Hud />
            <PlacePanel />
            <StampBook />
          </div>
        ) : null}
        <StartScreen />
      </div>
    </main>
  );
}
