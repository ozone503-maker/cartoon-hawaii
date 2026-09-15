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
      "A one-acre jungle lot in Mountain View — ʻōhiʻa, ferns, fruit trees, and a cabin on catchment and solar, perched at 1,800 feet in the Kīlauea foothills. Thirty minutes to Hilo or Pāhoa, twenty to the caldera. The highway village sits east on Volcano Road. This is the map’s home.",
  },
  {
    id: "mountain-view",
    name: "Mountain View",
    also: "Volcano Road",
    lat: 19.54925,
    lon: -155.10907,
    elevFt: 1434,
    kind: "place",
    region: "Puna",
    image: "/scenes/mountain-view.jpg",
    kicker: "Hwy 11 village",
    story:
      "The real strip is on Volcano Road — post office, a couple of shops, jungle crowding the pavement. Homes hide on country lanes in the ʻōhiʻa. FlashTown is the lot west of here, not a downtown.",
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
      "The Wailuku River pours over a lava lip into a pool behind a cave, inland of Hilo town. Morning sun turns the mist into the rainbow the Hawaiian name already promised. Upstream are Boiling Pots, Waiʻale, and Narnia. The river meets the bay farther east — the falls do not.",
  },
  {
    id: "boiling-pots",
    name: "Boiling Pots",
    also: "Peʻepeʻe",
    lat: 19.7153,
    lon: -155.1306,
    kind: "place",
    region: "Hilo",
    image: "/scenes/akaka.jpg",
    kicker: "Wailuku River State Park",
    story:
      "Potholes in the lava where the Wailuku churns after rain. Peʻepeʻe Falls hides just upstream. One and a half miles above Rainbow Falls — still inland, still the same river.",
  },
  {
    id: "narnia",
    name: "Narnia",
    also: "Hoʻokelekele",
    lat: 19.7108,
    lon: -155.155,
    kind: "place",
    region: "Hilo",
    image: "/scenes/akaka.jpg",
    kicker: "Seven streams in the forest",
    story:
      "Local name for the confluence in the Hilo Forest Reserve where Lauiole, Pukamaui, Kauwehu and the rest drop into Hoʻokelekele Stream, then join the Wailuku. Seven waterfalls, one lookout — above Boiling Pots, not a coastal plunge.",
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
    kicker: "Observatories above the clouds",
    story:
      "From the seafloor it is the tallest mountain on Earth. The true peak, Puʻu Wēkiu, is alpine cinder and snow — a sacred realm, with no dome on it. The telescopes sit on the ridge to the north: Keck, Subaru, Gemini, CFHT, and the rest, from an IFA survey of the summit.",
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
    kicker: "The southernmost cliffs",
    story:
      "Wind, grass, and a sheer drop into deep water — the southernmost point in the United States. People fish and jump from the west lip. The current below is no joke. Canoe mooring holes in the rock are older than the flag.",
  },
  {
    id: "puuhonua",
    name: "Puʻuhonua o Hōnaunau",
    lat: 19.4217,
    lon: -155.9106,
    kind: "place",
    region: "Kona",
    image: "/scenes/puuhonua.jpg",
    kicker: "Place of refuge, back access",
    story:
      "A walled sanctuary on a lava shore at the bottom of the South Kona slope. You come in from the highway above — back access, not a sea cliff. In the old kapu system, reaching this ground meant the chase ended. Kiʻi still watch the cove.",
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
  {
    id: "volcano",
    name: "Volcano",
    also: "Volcano Village",
    lat: 19.43,
    lon: -155.238,
    elevFt: 3750,
    kind: "place",
    region: "Volcanoes",
    image: "/scenes/kilauea.jpg",
    kicker: "Rainforest at the park gate",
    story:
      "A small village in the ʻōhiʻa on the rim of Kīlauea. The national park entrance is just up the road. Cool nights, coqui, and steam on the caldera.",
  },
  {
    id: "keaau",
    name: "Keaʻau",
    lat: 19.621,
    lon: -155.037,
    kind: "place",
    region: "Puna",
    image: "/scenes/hilo.jpg",
    kicker: "Hwy 11 junction",
    story:
      "Where Volcano Road meets the Puna grid. Keaʻau sits between Hilo and Mountain View — papaya country and a real town, not a cartoon one.",
  },
  {
    id: "captain-cook",
    name: "Captain Cook",
    lat: 19.498,
    lon: -155.904,
    kind: "place",
    region: "Kona",
    image: "/scenes/kona.jpg",
    kicker: "South Kona coffee belt",
    story:
      "A town on the slopes above Kealakekua. Coffee, mac nut, and the road down to the bay where Cook came ashore.",
  },
  {
    id: "waikoloa",
    name: "Waikoloa",
    lat: 19.94,
    lon: -155.79,
    kind: "place",
    region: "Kohala",
    image: "/scenes/hapuna.jpg",
    kicker: "Lava-field resort town",
    story:
      "A planned town on the South Kohala lava. Golf, kiawe, and the Kohala Coast resorts a few miles west on the water.",
  },
  {
    id: "hawi",
    name: "Hawi",
    lat: 20.237,
    lon: -155.83,
    kind: "place",
    region: "Kohala",
    image: "/scenes/pololu.jpg",
    kicker: "North Kohala’s town",
    story:
      "The old plantation town at the island’s north tip. Wind, galleries, and the road to Pololū.",
  },
  {
    id: "kapaau",
    name: "Kapaʻau",
    lat: 20.231,
    lon: -155.801,
    kind: "place",
    region: "Kohala",
    image: "/scenes/pololu.jpg",
    kicker: "King Kamehameha’s statue",
    story:
      "Next town east of Hawi. The original Kamehameha statue stands here — the king was born in nearby North Kohala.",
  },
  {
    id: "naalehu",
    name: "Nāʻālehu",
    lat: 19.062,
    lon: -155.588,
    elevFt: 650,
    kind: "place",
    region: "Kaʻū",
    image: "/scenes/south-point.jpg",
    kicker: "Southernmost town, upslope",
    story:
      "The southernmost town in the United States. It sits a few hundred feet above the Kaʻū coast — not on the sand. Punaluʻu is the black-sand beach downslope. The turn for South Point is west.",
  },
  {
    id: "pahala",
    name: "Pāhala",
    lat: 19.202,
    lon: -155.47,
    kind: "place",
    region: "Kaʻū",
    image: "/scenes/punaluu.jpg",
    kicker: "Kaʻū plantation town",
    story:
      "A quiet former sugar town above Punaluʻu. Macadamia orchards and the long Kaʻū coast below.",
  },
  {
    id: "ocean-view",
    name: "Ocean View",
    lat: 19.102,
    lon: -155.767,
    kind: "place",
    region: "Kaʻū",
    image: "/scenes/south-point.jpg",
    kicker: "Lots on the 1950 flow",
    story:
      "A huge subdivision on Mauna Loa’s southwest rift. Lava, catchment, and a view all the way to South Point.",
  },
];

export const TOUR_IDS = [
  "flashtown",
  "mountain-view",
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
  "volcano",
  "waimea",
  "hawi",
  "naalehu",
] as const;

export function placeById(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}
