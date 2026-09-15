import raw from "./highways.json";

export type TownKind = "wet" | "dry" | "lava" | "home";

export type TownFootprint = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  r: number;
  kind: TownKind;
};

export type AirportStrip = {
  id: string;
  lat: number;
  lon: number;
  len: number;
  heading: number;
};

export type Highway = {
  id: string;
  w: number;
  pts: [number, number][];
};

export const TOWNS = raw.towns as TownFootprint[];
export const AIRPORTS = raw.airports as AirportStrip[];
export const HIGHWAYS = raw.highways as Highway[];
