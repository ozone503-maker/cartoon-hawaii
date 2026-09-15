import { useEffect } from "react";
import { project } from "@/lib/hawaii/geo";
import { navManifest, type HawaiiMapBridge } from "@/lib/hawaii/nav";
import { useHawaii } from "@/lib/hawaii/store";

/** Handoff for Claude flight mechanics + MDP cockpit. */
export function MapBridge() {
  const select = useHawaii((s) => s.select);

  useEffect(() => {
    const manifest = navManifest();
    const bridge: HawaiiMapBridge = {
      ...manifest,
      project,
      flyTo: (id: string) => {
        select(id);
      },
      fit: () => {
        window.dispatchEvent(new Event("cartoon-hawaii-reset"));
      },
    };
    window.__hawaiiMap = bridge;
    return () => {
      if (window.__hawaiiMap === bridge) delete window.__hawaiiMap;
    };
  }, [select]);

  return null;
}
