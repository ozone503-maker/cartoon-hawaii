# Island makeover — master list

**For the next Grok bot.** Use **actual maps**: NASA Landsat (`public/maps/hawaii-usgs.jpg`), cartoon atlas (`hawaii-cartoon.jpg`), height (`hawaii-height.png`), Google Maps / USGS, and surveyed lat/lon in `src/lib/hawaii/places.ts`. Do **not** invent Hawaiʻi. Do **not** restart the project. Flight, camera, MDP, and the Landsat coastline stay.

Repo: https://github.com/ozone503-maker/cartoon-hawaii · branch `main`

User will fly it on a **Samsung phone**. No `MeshToonMaterial`, no `transmission`, no 0×0 canvas. Read `HANDOFF.md` frozen table first.

When a row is actually done, the user has to see it from the chase camera (~100–400 m AGL) and sign off. Desktop-only “looks fine” already burned us.

---

## How to work

1. Open Landsat + Google Maps for that pin. Match coastline, roads, and the drop.
2. Change **terrain** (island mesh / height) for cliffs and beaches. Props only sit **on dry land**.
3. Do **not** add a second island, dock, raft, or orange pad in the ocean. That is the Ka Lae failure.
4. Waterfalls ride the **green hillside**. They are inland unless the real fall is a valley wall (Waipiʻo, Pololū).
5. Keep `FlightScene.tsx` boot, `geo.ts` AABB, `places.ts` coordinates. `WORLD` enlarge + craft/ChaseCam retunes per Jessie (Sep 18). **No snow caps on MK/ML** — dark cinder only.

**Look target:** cartoon Brobots world on top of real geography — not Minecraft, not raw satellite, not a prop sitting in the water.

---

## Status key

| Tag | Meaning |
|---|---|
| **BLOCKED** | User rejected it. Do not repeat the failed trick. |
| **WRONG** | In the game, looks false. |
| **THIN** | Pin or blob only. Needs a real 3D place. |
| **MISSING** | Not built. Add from maps. |
| **OK-ISH** | First pass. Polish, don’t restart. |

---

## 1. Cliffs and palis — BLOCKED until terrain-native

The west-edge drop on the Landsat cape already looks like a cliff from the air. That is the look. Wrap **that**, don’t bolt a wall in the sea.

| Place | Lat / lon | Status | What “done” is |
|---|---|---|---|
| **Ka Lae / South Point** | 18.9108, -155.6813 | **NEEDS PHONE** | Terrain sculpt landed (`sculpt_ka_lae_cape` in `scripts/fix-kau-height.py` + regenerated `hawaii-height.png`): Landsat cape land raised, ocean stays 0. Jump gear via `snapToLand` on dry lip. Still needs Jessie phone sign-off at 100–400 m AGL. No raft/dock/mesa/sandbar/moat. See `HANDOFF.md` §2. |
| South Point Road + dirt tracks | Hwy 11 → Ka Lae | THIN | White road already exists; fan of dirt to the jump like Google Maps. |
| **Papakōlea approach cliffs** | 18.936, -155.646 | **NEEDS PHONE** | Heightmap sculpt raises east-cape rim + keeps cove floor low (on land). Props via `snapToLand`. Still needs Jessie phone fly-by; not DONE. |
| **Waipiʻo palis** | 20.12, -155.59 | THIN | Huge valley walls, road down a dare, black-sand mouth. Falls on the **walls**, not the ocean horizon. |
| **Pololū → Honokane → Waimanu** | 20.20, -155.73 west | THIN | Stack of Kohala valleys, black-sand coves, knife ridges. Oldest volcano. |
| **Hāmākua palis** | Honokaʻa → Hilo coast | MISSING | Thousand-foot green cliffs for miles. Towns sit **above**, ocean far below. |
| **Kealakekua cliffs** | 19.48, -155.93 | THIN | Sheer wall over the bay, Cook monument across the water, Hikiau. Not Ka Lae. |
| **Hilina / Hōlei Pali** | Chain of Craters | MISSING | Fault palis in HVNP, Holei sea cliffs, Hōlei Sea Arch. |
| Puʻuhonua shore | 19.4217, -155.9106 | OK-ISH | Low lava flat, **back access**, slope like Ocean View. Must **not** steal the south-point cliff. |

---

## 2. Beaches — sand has to match the real one

| Beach | Kind | Lat / lon | Status | Notes |
|---|---|---|---|---|
| **Punaluʻu** | Black | 19.1358, -155.5044 | **NEEDS PHONE** | Height pass pins beach ~water + Nāʻālehu upslope. Black sand props remain thin. Terrain sculpt landed; Jessie phone sign-off still required — not DONE. |
| **Papakōlea** | Green (olivine) | 18.9364, -155.6464 | **NEEDS PHONE** | Cape sculpt + green-sand props on dry land via `snapToLand`. Still needs Jessie phone verify — not DONE. |
| **Hāpuna** | White | 19.9919, -155.8244 | THIN | Wide white crescent, kiawe, gold hills. The Big Island’s famous white sand. |
| **Waipiʻo mouth** | Black | 20.12, -155.59 | THIN | Black sand between the palis. |
| **Pololū cove** | Black | 20.204, -155.733 | THIN | Black sand, ironwoods. |
| **Kehena** | Black | 19.41, -154.93 | MISSING | Puna clothes-optional black sand, cliff trail. |
| **Pohoiki / Isaac Hale** | Black (new) | 19.46, -154.84 | MISSING | 2018 lava rebuilt the shore. Warm ponds gone; new black beach. |
| **Kaimū** | Buried black | 19.37, -154.93 | MISSING | Old coconut black sand **buried 1990**. New lava coast. Don’t draw the old beach as if it’s still there. |
| **Richardson’s / Leleiwi** | Black-ish / tide pools | 19.735, -155.015 | MISSING | Hilo’s local swim shore. |
| **Honoliʻi** | River mouth | 19.76, -155.09 | MISSING | Hilo surf beach, river to the bay. |
| **Magic Sands / Laʻaloa** | White, seasonal | 19.59, -155.97 | MISSING | Kona; sand comes and goes. |
| **Kahaluʻu** | Reef | 19.58, -155.97 | MISSING | Snorkel bay, Kona. |
| **Two Step** | Lava steps | 19.42, -155.91 | MISSING | Next to Puʻuhonua. |
| **Kiholo** | Lava + pocket sand | 19.85, -155.93 | MISSING | Fishpond, turtles, 1801/1859 flows. |
| **Kekaha Kai / Kua Bay** | White | 19.81, -156.00 | MISSING | Mahaiʻula → Maniniʻowali. |
| **Spencer / Kaunaʻoa** | White | ~20.02, -155.82 | MISSING | Mauna Kea Beach / Spencer. |
| **Miloliʻi / Hōokena** | Black / pebble | South Kona | MISSING | Fishing villages on the lava. |
| **Whittington / Honuʻapo** | Black | Kaʻū | MISSING | Near Punaluʻu, old landing. |

---

## 3. Towns and settlements — still boxes

`Settlements.tsx` is low tin-roof rectangles. User: *not a single building looks like these islands.* Plantation houses, spread out. Hilo ≠ Kona ≠ Pāhoa.

| Town | Lat / lon | Status | From the air |
|---|---|---|---|
| **Hilo** | 19.707, -155.082 | WRONG | Crescent bay, banyans, harbor, downtown grid, tsunami zone, Wailuku mouth. Biggest town. |
| **Kailua-Kona** | 19.640, -155.997 | WRONG | Aliʻi Drive on lava, pier, Huliheʻe, dry gold hills, Hualālai behind. |
| **Pāhoa** | 19.494, -154.951 | THIN | Wooden false-front, jungle, east-rift town. |
| **Mountain View village** | 19.549, -155.109 | THIN | Hwy 11 strip, post office. **Not** FlashTown. |
| **FlashTown** | 19.540, -155.142 | OK-ISH | Home lot in the ʻōhiʻa. Keep. |
| **Volcano Village** | 19.43, -155.238 | **NEEDS PHONE** | Cheap canopy grove at park gate coords. |
| **Keaʻau** | 19.621, -155.037 | THIN | Junction, papaya. |
| **Kurtistown / Glenwood** | Hwy 11 | MISSING | Between Keaʻau and Mountain View. |
| **Hawaiian Paradise Park / Orchidland / Ainaloa** | Puna grid | MISSING | Huge lot subdivisions in the canopy. |
| **Hawaiian Ocean View / HOVE** | 19.11, -155.77 | MISSING | User called this slope out. High lava lots, dry, long run to the sea. Same slope language as Captain Cook / Puʻuhonua. |
| **Nāʻālehu** | 19.062, -155.588 | THIN | Southernmost **town**, a few hundred feet up. Not on the beach. |
| **Pāhala** | 19.202, -155.47 | THIN | Mac nut, above Punaluʻu. |
| **Captain Cook / Nāpoʻopoʻo** | 19.50, -155.90 | THIN | Coffee belt; Nāpoʻopoʻo is **down** at the bay. |
| **Hōlualoa / Keauhou** | Kona slopes | MISSING | Coffee, galleries, Kahaluʻu. |
| **Waimea / Kamuela** | 20.023, -155.672 | THIN | Paniolo, pastures, Parker Ranch, mist. |
| **Honokaʻa** | 20.079, -155.468 | THIN | Wooden main street **above** the palis. |
| **Hawi / Kapaʻau** | 20.23, -155.83 | THIN | North tip plantation towns, Kamehameha statue. |
| **Waikoloa Village** | 19.94, -155.79 | THIN | Planned town on lava; resorts are **on the water**, not in the village. |
| **Kawaihae** | 20.04, -155.83 | MISSING | Harbor, dry Kohala. |
| **Laupāhoehoe / Pepeʻekeo / Honomū / Papaikou** | Hāmākua belt | MISSING | Sugar towns on the palis. Honomū is the ʻAkaka turn. |
| **Miloliʻi** | 19.19, -155.90 | MISSING | Last fishing village. |
| **Kalapana / Vacationland** | 2018 / 1990 | MISSING | Mostly lava now. Don’t fake a living downtown on buried lots. |

Airports (pins exist, fields don’t): **ITO** Hilo, **KOA** on the 1801 flow, **MUE** Waimea high saddle. Need runways on the lava/grass that match the real strips.

---

## 4. Waterfalls and rivers — broboss/waterfalls-kilauea pass

Do not pour them off the ocean except valley walls.

| Fall | Kind | Lat / lon | Status |
|---|---|---|---|
| **Rainbow Falls / Waiānuenue** | Cave + curtain + pool | 19.7194, -155.1094 | **NEEDS PHONE** — hillside curtain + cave + pool; inland Wailuku. |
| **Boiling Pots / Peʻepeʻe** | Potholes | 19.7153, -155.1306 | **NEEDS PHONE** — stepped pots + short sheets, not chimney. |
| **Waiʻale** | Cascade | upstream Rainbow | **NEEDS PHONE** — mid/upper Wailuku cascade profiles. |
| **Narnia / 7 streams / Hoʻokelekele** | Threads | ~19.711, -155.155 | **NEEDS PHONE** — unique thread profiles above the pots. |
| **ʻAkaka** | 442 ft plunge | 19.8539, -155.1522 | **NEEDS PHONE** — narrow gorge plunge (no brown tower). |
| **Kahuna Falls** | Twin near ʻAkaka | ~19.85, -155.15 | MISSING |
| **Umauma** | Cascades | 19.892, -155.141 | **NEEDS PHONE** — three-tier cascade. |
| **Kolekole (hwy)** | Stream at the beach park | 19.88, -155.12 | MISSING — mouth is not the fall. |
| **Hiʻilawe (Waipiʻo)** | Huge valley wall | 20.11, -155.60 | **NEEDS PHONE** — thin horsetail on valley wall. |
| **Onomea / HSBG gulches** | Many small | 19.81, -155.10 | MISSING |
| **Nanue / Hakalau** | Hāmākua gulches | belt road | MISSING |

Rivers: continuous terrain-hugging ribbon; **Y drops at falls** (no laser flat). Identities from ChatGPT PR #1 kept; ice-cube boxes / heavy dash animation rewritten. Code: `Waterfalls.tsx`, `Rivers.tsx`, `rivers.ts`. **Await Jessie phone sign-off.**

---

## 5. Mountain tops and volcanoes

| Feature | Lat / lon | Status | What “done” is |
|---|---|---|---|
| **Mauna Kea summit** | 19.8207, -155.4681 | OK-ISH | Puʻu Wēkiu = cinder, **no dome**. Telescopes on the **north ridge** (Keck, Subaru, Gemini, CFHT, IFA pins in `maunakea.ts`). Access road. Lake Waiau. Visitor center ~9k ft. Sacred — don’t cartoon-trash the peak. |
| MK cinder cones | summit plateau | THIN | Real puʻu field, not one fake disc. |
| **Mauna Loa** | 19.4756, -155.6081 | THIN | Broad shield, Mokuʻāweoweo caldera, 2022 flow toward Saddle. Barely looks like a peak until you’re on it. |
| **Kīlauea caldera / Halemaʻumaʻu** | 19.4069, -155.2834 | **NEEDS PHONE** | Terrain nested bowl (`kilauea.ts`) + steam + small pit glow (no glowing pancake). Black floor wash; NE rim ʻōhiʻa. Park roads / Jaggar still thin. |
| **Kīlauea Iki** | 19.41, -155.25 | **NEEDS PHONE** | Bowl + black floor + thin pali lip. |
| **Chain of Craters** | park → ocean | MISSING | Pit craters, Hōlei, sea lava. |
| **East rift / 2018** | Leilani → Kapoho | **NEEDS PHONE** | Dark fissure ribbons + Kapoho shelf; no rebuilt Puʻu ʻŌʻō. |
| **Puʻu ʻŌʻō** | collapsed | MISSING | Don’t rebuild the old cone as if 2018 never happened. |
| **Hualālai** | 19.687, -155.859 | THIN | Rounded Kona mountain, 1801 flow = KOA flats. |
| **Kohala** | north | THIN | Oldest, dissected valleys. Pololū is the east end of this. |
| **Puʻu Waʻawaʻa** | 19.77, -155.84 | MISSING | Unique trachyte pumice cone, north Kona. |
| Saddle (Daniel K. Inouye) | 19.68, -155.48 | THIN | High lava between MK and ML, PTA, observatory road turn. |

---

## 6. Trees, lava, ranch, snow

| What | Status | Notes |
|---|---|---|
| **Albizia / ʻōhiʻa / koa** | OK-ISH | User: “looking better.” Puna = albizia umbrellas. ʻŌhiʻa + lehua mid. Koa higher. Keep species by elevation. |
| Hāpuʻu tree ferns | MISSING | Puna / Hilo understory. |
| Kiawe / dry forest | MISSING | Kohala / Kona gold hills. |
| Ironwood | MISSING | Pololū, some parks. |
| Coconut palms | THIN | Punaluʻu, Kona waterfront only — not Mountain View. |
| Pāhoehoe vs ʻaʻā | THIN | Texture atlas has lava color; close-up is still smooth plastic. |
| Ranch pastures | THIN | Waimea / Parker should read as grass, not jungle. |
| MK alpine / snow | THIN | Seasonal white on the true summit, not a frosting donut. |

No `MeshToonMaterial`. Instanced, modest counts, Samsung-safe.

---

## 7. Roads and water

| What | Status |
|---|---|
| Belt (11 / 19 / 190), Saddle (200), Kohala (250/270), Puna (130/132/137) | OK-ISH lines. Need to **drape** the palis and not float. |
| Chain of Craters Road | MISSING as a visible park road |
| Mauna Kea access | OK-ISH line |
| South Point Road | THIN |
| Wailuku, Kolekole, Umauma, Waipiʻo stream | WRONG look — see §4 |
| Fishponds (Kaloko, Kiholo, Honokōhau, Liliʻuokalani) | MISSING |

---

## 8. Special sites (already pinned)

| Site | Status | Don’t |
|---|---|---|
| FlashTown lot | OK-ISH | Don’t move it. 19.5397, -155.1417 |
| Puʻuhonua o Hōnaunau | OK-ISH | Not a sea cliff |
| Kealakekua Bay + Cook | THIN | Cliffs + deep blue bay + monument |
| Kumukahi lighthouse | THIN | Easternmost point |
| ITO / KOA / MUE | THIN | Need actual strips |
| Hilo harbor / Coconut Island | MISSING | |
| Place of Refuge kiʻi / Great Wall | THIN in `Puuhonua.tsx` | |

---

## Suggested order for the makeover bot

Do **one landscape system** at a time, verify on phone, then move. Don’t open five cliffs at once.

1. **Terrain edge** — Ka Lae cape + Papakōlea + Punaluʻu: heightmap sculpt landed (ocean=0); **await Jessie phone sign-off** (FlashTown spawn + fly 100–400 m AGL). Not DONE.
2. **Kīlauea** — bowl + steam + Iki + 2018 rift + Volcano Village grove landed on `broboss/waterfalls-kilauea` — **await phone**.
3. **Towns** — Hilo bay, Kona waterfront, then Pāhoa / Waimea / Honokaʻa as distinct plantation towns.
4. **Windward palis** — Waipiʻo + Pololū + Hāmākua cliff line (this is the “entire coastline” look the user wants, on the **north**, not faked at Ka Lae).
5. **Waterfalls** — hillside sheets + river Y-drop on `broboss/waterfalls-kilauea` — **await phone**.
6. **Beaches** — black / green / white as three different materials on the real coves.
7. **Mauna Loa + Hualālai + saddle** polish.
8. **Tree and ranch** pass.

---

## Frozen (do not “make over”)

- `src/lib/flight/craft.ts` flight stepper shape (spawn/snap/ceiling) — **Jessie world enlarge:** speeds retuned for `WORLD.w=960` (`maxSpeed` 4.0, accel 2.6, ~3–4 min coast-to-coast); do not bump for “fun”
- `src/components/flight/ChaseCam.tsx` (`LEN 3.5`, `DEG 22`) — no cockpit zoom
- `src/components/flight/FlightScene.tsx` Samsung boot
- MDP alien + saucer in `Craft.tsx`
- Analog stick + lightning = **boost**
- `geo.ts` AABB / `places.ts` coordinates / Landsat shore (WORLD.w locked at **960** after enlarge — don’t shrink back to 240)
- Landsat coastline in the atlas — color grade is fine, **moving the shore is not**

---

## Island scale (Jessie override)

Craft slowdown alone was not enough — volcanoes still felt stacked. **WORLD enlarged** 240→**960** (4×) with proportional height (×3.75), UFO (→8.8), ChaseCam pull-back via UFO, craft retune (`maxSpeed` 4.0) so cruise stays ~3–4 min. Absolute 240-scale props audited via `wu`/`hu`. Summit = dark cinder — **NO snow** (Jessie). Landsat / places unchanged. **Phone verify required.**

---

## Phone check

HUD healthy: `19.540°N 155.142°W`, a few hundred m AGL, heading ~313°, not `0 m AGL · hd 0°`. If it freezes, you broke the boot. Stop and fix that before any more scenery.
