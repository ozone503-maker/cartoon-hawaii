import { createFileRoute } from "@tanstack/react-router";
import { Hud } from "@/components/world/Hud";
import { MapBridge } from "@/components/world/MapBridge";
import { MapView } from "@/components/world/MapView";
import { PlacePanel } from "@/components/world/PlacePanel";
import { StampBook } from "@/components/world/StampBook";
import { StartScreen } from "@/components/world/StartScreen";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ocean">
      <MapBridge />
      <MapView />
      <Hud />
      <PlacePanel />
      <StampBook />
      <StartScreen />
    </main>
  );
}
