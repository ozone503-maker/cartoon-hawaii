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
  start: () => void;
  select: (id: string | null) => void;
  visit: (id: string) => void;
  setRegion: (region: string | "all") => void;
  setStampsOpen: (open: boolean) => void;
  startTour: () => void;
  nextTourStop: () => void;
  stopTour: () => void;
  toggleGrid: () => void;
  setBasemap: (basemap: "atlas" | "usgs") => void;
};

export const useHawaii = create<HawaiiState>((set, get) => ({
  started: false,
  selectedId: null,
  visited: [],
  region: "all",
  stampsOpen: false,
  touring: false,
  tourIndex: 0,
  grid: true,
  basemap: "atlas",
  start: () => {
    const visited = loadVisited();
    set({ started: true, visited });
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
  setBasemap: (basemap) => set({ basemap }),
}));
