export const REGIONS = [
  "Kohala",
  "Hāmākua",
  "Hilo",
  "Puna",
  "Kaʻū",
  "Kona",
  "Volcanoes",
] as const;

export type Region = (typeof REGIONS)[number];
export type PlaceKind = "place" | "home" | "airport";

export type Place = {
  id: string;
  name: string;
  also?: string;
  lat: number;
  lon: number;
  elevFt?: number;
  icao?: string;
  kind: PlaceKind;
  region: Region;
  image: string;
  kicker: string;
  story: string;
};

export const HOME_ID = "flashtown";

export const PLACES: Place[] = [
  {
    id: "flashtown",
    name: "FlashTown",
    also: "Mountain View",
    lat: 19.5397,
    lon: -155.1417,
    elevFt: 1800,
    kind: "home",
    region: "Puna",
    image: "/scenes/flashtown.jpg",
    kicker: "Home base",
    story:
      "A one-acre jungle lot in Mountain View — ʻōhiʻa, ferns, fruit trees, and a cabin on catchment and solar, perched at 1,800 feet in the Kīlauea foothills. Thirty minutes to Hilo or Pāhoa, twenty to the caldera. This is the map’s home.",
  },
  {
    id: "pololu",
    name: "Pololū Valley",
    lat: 20.2042,
    lon: -155.733,
    kind: "place",
    region: "Kohala",
    image: "/scenes/pololu.jpg",
    kicker: "The island’s wild north end",
    story:
      "A steep trail drops from the Kohala palis to a black-sand cove framed by ironwoods. Valley after valley stacks west along the oldest volcano on the island.",
  },
  {
    id: "hapuna",
    name: "Hāpuna Beach",
    lat: 19.9919,
    lon: -155.8244,
    kind: "place",
    region: "Kohala",
    image: "/scenes/hapuna.jpg",
    kicker: "White sand, leeward light",
    story:
      "The Big Island’s wide white-sand crescent. Kiawe trees, dry gold hills, and water so clear the reef looks painted on the sand.",
  },
  {
    id: "waimea",
    name: "Waimea",
    also: "Kamuela",
    lat: 20.023,
    lon: -155.6716,
    elevFt: 2670,
    kind: "place",
    region: "Kohala",
    image: "/scenes/waimea.jpg",
    kicker: "Paniolo country",
    story:
      "High ranchland between the volcanoes. Tradewind pastures, cattle, and a cowboy town that still belongs to Parker Ranch more than to the beach.",
  },
  {
    id: "waipio",
    name: "Waipiʻo Valley",
    lat: 20.1185,
    lon: -155.5908,
    kind: "place",
    region: "Hāmākua",
    image: "/scenes/waipio.jpg",
    kicker: "Valley of the kings",
    story:
      "A deep notch in the Hāmākua palis: taro patches, a black-sand mouth, and waterfalls down the walls. Aliʻi once lived here; the road down is still a dare.",
  },
  {
    id: "honokaa",
    name: "Honokaʻa",
    lat: 20.0794,
    lon: -155.4675,
    kind: "place",
    region: "Hāmākua",
    image: "/scenes/waipio.jpg",
    kicker: "Plantation town on the palis",
    story:
      "A wooden main street above the Hāmākua coast, leftover from sugar days. The ocean is a thousand feet down, and the cliffs run for miles.",
  },
  {
    id: "akaka",
    name: "ʻAkaka Falls",
    lat: 19.8539,
    lon: -155.1522,
    kind: "place",
    region: "Hāmākua",
    image: "/scenes/akaka.jpg",
    kicker: "A 442-foot plunge",
    story:
      "A thin white ribbon through a rainforest amphitheater of ferns, bamboo, and ʻōhiʻa. The falls sit inland on Kolekole Stream — the water reaches the Hāmākua coast miles below, not as a sea-cliff plunge.",
  },
  {
    id: "hilo",
    name: "Hilo",
    lat: 19.7074,
    lon: -155.0817,
    kind: "place",
    region: "Hilo",
    image: "/scenes/hilo.jpg",
    kicker: "Rain town, east side",
    story:
      "The island’s largest town sits on a crescent bay under almost-daily rain. Banyans, farmers’ markets, and a harbor that has survived more than one tsunami.",
  },
  {
    id: "rainbow-falls",
    name: "Rainbow Falls",
    also: "Waiānuenue",
    lat: 19.7194,
    lon: -155.1094,
    kind: "place",
    region: "Hilo",
    image: "/scenes/akaka.jpg",
    kicker: "Hilo’s backyard waterfall",
    story:
      "The Wailuku River pours over a lava lip into a pool behind a cave, inland of Hilo town. Morning sun turns the mist into the rainbow the Hawaiian name already promised. The river meets the bay farther east — the falls do not.",
  },
  {
    id: "ito",
    name: "Hilo Airport",
    also: "ITO / PHTO",
    lat: 19.7214,
    lon: -155.0485,
    elevFt: 38,
    icao: "PHTO",
    kind: "airport",
    region: "Hilo",
    image: "/scenes/hilo.jpg",
    kicker: "East-side field",
    story:
      "Hilo International. Tradewind approaches over the bay, rain more often than not. The wet-side runway for the cartoon island.",
  },
  {
    id: "pahoa",
    name: "Pāhoa",
    lat: 19.4944,
    lon: -154.9508,
    kind: "place",
    region: "Puna",
    image: "/scenes/hilo.jpg",
    kicker: "The wild east rift",
    story:
      "A wooden town at the edge of Kīlauea’s east rift. Lava has rewritten the map here more than once — new black sand, buried gardens, a coastline that still moves.",
  },
  {
    id: "kumukahi",
    name: "Cape Kumukahi",
    lat: 19.516,
    lon: -154.806,
    kind: "place",
    region: "Puna",
    image: "/scenes/punaluu.jpg",
    kicker: "The easternmost point",
    story:
      "The first place in the Hawaiian Islands to see the sun. A lighthouse, a raw lava point, and the farthest east you can stand in the state.",
  },
  {
    id: "kilauea",
    name: "Kīlauea",
    lat: 19.4069,
    lon: -155.2834,
    elevFt: 4091,
    kind: "place",
    region: "Volcanoes",
    image: "/scenes/kilauea.jpg",
    kicker: "The living caldera",
    story:
      "Pele’s home. A steaming summit caldera, a glowing lake when she is home, and miles of black pāhoehoe in Hawaiʻi Volcanoes National Park.",
  },
  {
    id: "mauna-loa",
    name: "Mauna Loa",
    lat: 19.4756,
    lon: -155.6081,
    elevFt: 13679,
    kind: "place",
    region: "Volcanoes",
    image: "/scenes/kilauea.jpg",
    kicker: "The world’s largest volcano",
    story:
      "A shield so broad it barely looks like a mountain until you are on it. Its 2022 flow reminded the island that “inactive” is not a word Mauna Loa knows.",
  },
  {
    id: "mauna-kea",
    name: "Mauna Kea",
    also: "Mauna a Wākea",
    lat: 19.8207,
    lon: -155.4681,
    elevFt: 13796,
    kind: "place",
    region: "Volcanoes",
    image: "/scenes/mauna-kea.jpg",
    kicker: "Highest point in the Pacific",
    story:
      "From the seafloor it is the tallest mountain on Earth. The summit is alpine cinder, snow in winter, a sacred realm, and a ring of observatories above the clouds.",
  },
  {
    id: "punaluu",
    name: "Punaluʻu",
    lat: 19.1358,
    lon: -155.5044,
    kind: "place",
    region: "Kaʻū",
    image: "/scenes/punaluu.jpg",
    kicker: "Black sand, honu",
    story:
      "Jet-black olivine-and-lava sand on the Kaʻū coast. Green sea turtles haul out here between the coconut trees and the surf.",
  },
  {
    id: "papakolea",
    name: "Papakōlea",
    also: "Green Sand Beach",
    lat: 18.9364,
    lon: -155.6464,
    kind: "place",
    region: "Kaʻū",
    image: "/scenes/papakolea.jpg",
    kicker: "Olivine in the crater",
    story:
      "One of the few green-sand beaches on Earth. A hike across the Kaʻū desert ends in a broken cinder cone whose olivine grains color the cove.",
  },
  {
    id: "south-point",
    name: "Ka Lae",
    also: "South Point",
    lat: 18.9108,
    lon: -155.6813,
    kind: "place",
    region: "Kaʻū",
    image: "/scenes/south-point.jpg",
    kicker: "The southernmost place",
    story:
      "Wind, grass, and a cliff into deep water — the southernmost point in the United States. Canoe mooring holes in the rock are older than the flag.",
  },
  {
    id: "puuhonua",
    name: "Puʻuhonua o Hōnaunau",
    lat: 19.4217,
    lon: -155.9106,
    kind: "place",
    region: "Kona",
    image: "/scenes/puuhonua.jpg",
    kicker: "Place of refuge",
    story:
      "A walled sanctuary on a lava shore. In the old kapu system, reaching this ground meant the chase ended. Kiʻi still watch the cove.",
  },
  {
    id: "kealakekua",
    name: "Kealakekua Bay",
    lat: 19.4786,
    lon: -155.927,
    kind: "place",
    region: "Kona",
    image: "/scenes/puuhonua.jpg",
    kicker: "A protected, deep-blue bay",
    story:
      "Spinner dolphins, a drowned lava slope of coral, and the monument to Cook across the water. The cliffs hold the heiau of Hikiau.",
  },
  {
    id: "kona",
    name: "Kailua-Kona",
    lat: 19.6399,
    lon: -155.9969,
    kind: "place",
    region: "Kona",
    image: "/scenes/kona.jpg",
    kicker: "The sunny west side",
    story:
      "A lava-rock waterfront town in the rain shadow. Huliheʻe Palace, Aliʻi Drive, and coffee country rising toward Hualālai behind it.",
  },
  {
    id: "koa",
    name: "Kona Airport",
    also: "KOA / PHKO",
    lat: 19.7388,
    lon: -156.0456,
    elevFt: 47,
    icao: "PHKO",
    kind: "airport",
    region: "Kona",
    image: "/scenes/kona.jpg",
    kicker: "West-side field",
    story:
      "Ellison Onizuka Kona International, built on Hualālai’s 1801 flow. The dry-side runway — long final over black lava and turquoise water.",
  },
  {
    id: "hualalai",
    name: "Hualālai",
    lat: 19.6869,
    lon: -155.8586,
    elevFt: 8271,
    kind: "place",
    region: "Kona",
    image: "/scenes/kona.jpg",
    kicker: "Kona’s home volcano",
    story:
      "The rounded mountain above the Kona coast. Its 1801 flow built the flats that the airport sits on. From town it looks gentle. It is not extinct.",
  },
  {
    id: "mue",
    name: "Waimea-Kohala Airport",
    also: "MUE / PHMU",
    lat: 20.0013,
    lon: -155.6681,
    elevFt: 2671,
    icao: "PHMU",
    kind: "airport",
    region: "Kohala",
    image: "/scenes/waimea.jpg",
    kicker: "High-saddle strip",
    story:
      "A short high-country field between the volcanoes. Useful as a divert and as a waypoint on the saddle.",
  },
];

export const TOUR_IDS = [
  "flashtown",
  "hilo",
  "akaka",
  "waipio",
  "pololu",
  "hapuna",
  "kona",
  "puuhonua",
  "south-point",
  "papakolea",
  "punaluu",
  "kilauea",
  "mauna-kea",
] as const;

export function placeById(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}
