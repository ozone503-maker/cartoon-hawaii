import { create } from "zustand";
import { PLACES, TOUR_IDS } from "./places";

const STORAGE_KEY = "cartoon-hawaii-stamps-v1";

function loadVisited(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    const ids = new Set(PLACES.map((p) => p.id));
    return parsed.filter((id): id is string => typeof id === "string" && ids.has(id));
  } catch {
    return [];
  }
}

export type FlightHud = {
  lat: number;
  lon: number;
  altM: number;
  speed: number;
  yaw: number;
};

type HawaiiState = {
  started: boolean;
  selectedId: string | null;
  visited: string[];
  region: string | "all";
  stampsOpen: boolean;
  touring: boolean;
  tourIndex: number;
  grid: boolean;
  basemap: "atlas" | "usgs";
  mapOpen: boolean;
  heightReady: boolean;
  flightHud: FlightHud;
  start: () => void;
  select: (id: string | null) => void;
  visit: (id: string) => void;
  setRegion: (region: string | "all") => void;
  setStampsOpen: (open: boolean) => void;
  startTour: () => void;
  nextTourStop: () => void;
  stopTour: () => void;
  toggleGrid: () => void;
  toggleBasemap: () => void;
  setMapOpen: (open: boolean) => void;
  setHeightReady: (ready: boolean) => void;
  setFlightHud: (hud: FlightHud) => void;
};

export const useHawaii = create<HawaiiState>((set, get) => ({
  started: true,
  selectedId: null,
  visited: [],
  region: "all",
  stampsOpen: false,
  touring: false,
  tourIndex: 0,
  grid: true,
  basemap: "atlas",
  mapOpen: false,
  heightReady: false,
  flightHud: { lat: 19.5397, lon: -155.1417, altM: 0, speed: 0, yaw: 0 },
  start: () => {
    const visited = loadVisited();
    set({ started: true, visited, mapOpen: false });
  },
  select: (id) => {
    if (id) get().visit(id);
    set({ selectedId: id });
  },
  visit: (id) => {
    const { visited } = get();
    if (visited.includes(id)) return;
    const next = [...visited, id];
    set({ visited: next });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  },
  setRegion: (region) => set({ region, selectedId: null }),
  setStampsOpen: (stampsOpen) => set({ stampsOpen }),
  startTour: () => {
    const id = TOUR_IDS[0];
    set({ touring: true, tourIndex: 0, selectedId: id, region: "all" });
    if (id) get().visit(id);
  },
  nextTourStop: () => {
    const { tourIndex } = get();
    const next = tourIndex + 1;
    if (next >= TOUR_IDS.length) {
      set({ touring: false, tourIndex: 0 });
      return;
    }
    const id = TOUR_IDS[next];
    set({ tourIndex: next, selectedId: id });
    if (id) get().visit(id);
  },
  stopTour: () => set({ touring: false }),
  toggleGrid: () => set((s) => ({ grid: !s.grid })),
  toggleBasemap: () => set((s) => ({ basemap: s.basemap === "atlas" ? "usgs" : "atlas" })),
  setMapOpen: (mapOpen) => set({ mapOpen }),
  setHeightReady: (heightReady) => set({ heightReady }),
  setFlightHud: (flightHud) => set({ flightHud }),
}));
