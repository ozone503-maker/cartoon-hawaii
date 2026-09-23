# Handoff — Fly Hawaiʻi Island

**Repo:** https://github.com/ozone503-maker/cartoon-hawaii  
**Branch:** `main`  
**Do not restart this project.** The flying mechanism works. Improve in place.

Crew so far: Claude built the original flight; Grok owns the Landsat island, chase camera, MDP, FlashTown, and phone boot; ChatGPT is building another chunk; Bro Boss is the next pair of eyes.

**Full scenery makeover list (towns, beaches, cliffs, falls, volcanoes):** [`MAKEOVER.md`](MAKEOVER.md). Next Grok bot should work from maps/Landsat against that list, then the user comes back.

---

## What this is

A cartoon 3D flight over the **real Big Island**. MDP (grey-blue alien) pilots a silver bubble saucer. Locked third-person chase camera. Geography is NASA Landsat + surveyed lat/lon — not invented Hawaiʻi.

Home spawn: **FlashTown**, Mountain View, Puna — `19.5397°N, 155.1417°W`.

---

## Frozen — do not rewrite

| What | File | Lock |
|---|---|---|
| Flight physics | `src/lib/flight/craft.ts` | Thrust, yaw, lift/drop, boost ×2.15. **Jessie 22 Sep:** `maxSpeed` **56**, accel **48** at `WORLD.w=960` (~12 s FlashTown↔Ka Lae). 30 s still felt slow on the phone. Retune only — do not rewrite the stepper. |
| Input | `src/lib/flight/input.ts` | Keyboard + analog stick axes. |
| Chase camera | `src/components/flight/ChaseCam.tsx` | `LEN = 3.5` (was 2.55), `DEG = 22`. Behind and above, UFO in the lower third. No cockpit. No zoom into MDP’s head. |
| WebGL boot | `src/components/flight/FlightScene.tsx` | `createRoot` + `await configure` + explicit canvas size. Samsung died on R3F `<Canvas>` / 0×0 / context loss. |
| World / height | `src/lib/hawaii/world.ts` | `WORLD.w = 960` (4× base 240), `HEIGHT_SCALE = (24×3.75)/4205`, `UFO_LENGTH = 8.8`. Summits = dark cinder — **NO snow**. |
| Grid | `src/lib/hawaii/geo.ts` | AABB: Upolu N, Ka Lae S, Keahole W, Kumukahi E. |
| Pins | `src/lib/hawaii/places.ts` | Published coordinates only. |
| Roads | `src/lib/hawaii/highways.json` | Real belt / saddle / Kohala / Puna. |
| Rivers (positions) | `src/lib/hawaii/rivers.ts` | Real windward streams. Mouths meet the bay — they are not waterfalls. |
| MDP + saucer | `src/components/flight/Craft.tsx` | Glossy candy-blue alien (`#3ec8e8`, metalness ~0.8), giant cranium, thin neck, black almond eyes, chrome saucer, cyan ring, bubble dome. Portrait ref: standing blue MDP. Chase cam still sees the **back** of the head. **Not** Minecraft boxes. **Not** a cream robot. |
| Analog stick | `src/components/flight/TouchPad.tsx` | One circle, 4 quarters, diagonals work. Lightning = **boost**, not eject. Up = lift, down = drop. |
| Cartoon atlas | `public/maps/hawaii-cartoon.jpg` | Ground texture. Coastline from Landsat, not freehand. |

Camera reference (user-locked): UFO in the lower third, ~3–3.5 craft lengths back (`LEN=3.5`), ~20–25° down, landscape dominates, MDP visible through the dome. Do not cockpit-zoom MDP.

---

## Island scale feel (Jessie, Sep 18)

Island felt tiny because volcanoes sat on top of each other in a 240-wide frame. Craft slowdown alone (`broboss/island-scale-feel` / PR #4, `maxSpeed` 28→1.0) was **insufficient** — WORLD had to get bigger.

**`broboss/world-scale-snow` (world enlarge only — no snow):**
- `WORLD.w` **240 → 960** (exactly 4×; aspect via `MAP_SIZE`)
- `HEIGHT_SCALE` **24/4205 → (24×3.75)/4205** (slightly under linear ×4 so peaks don’t eat the sky)
- `UFO_LENGTH` **2.2 → 8.8**; ChaseCam still `LEN=3.5` / `DEG=22` (pulls back with UFO)
- Craft bases later ×3 for zippy sightseeing: `maxSpeed` **12**, accel **7.8** (bases 3.0 / 1.95 × WORLD_SCALE) so FlashTown↔Ka Lae / Hilo↔Kona ~**1 min** cruise
- Absolute world-unit props (Kīlauea bowls, Kaʻū coast, falls, forest radii) scaled via `wu()` / `hu()` / `WORLD_SCALE`
- Summit look: **dark alpine cinder / bare rock** — Jessie override **NO snow** on Mauna Kea / Mauna Loa
- places lat/lon + Landsat shore unchanged. **Phone verify required.**

---

## Still broken — this is the work

These have burned hours and still fail the “they will eat us alive” accuracy bar.

### 1. Waterfalls (highest)

**Problem:** They do not look like waterfalls. User photos showed ice cubes, brown chimneys, fence posts, and a laser-blue river punching through boxes.

**Need:** Water that rides the **green hillside** — a thin white/cyan sheet going down a palis into a pool. River must **drop** at the fall, not stay a flat laser. No brown towers.

| Fall | Kind | Lat / lon | Notes |
|---|---|---|---|
| Rainbow Falls | `rainbow` | 19.7194, -155.1094 | Cave behind the curtain, pool, Wailuku. Inland — not the coast. |
| Boiling Pots | `pots` | 19.7153, -155.1306 | Potholes in the lava, same river, upstream of Rainbow. |
| ʻAkaka Falls | `plunge` | 19.8539, -155.1522 | 442 ft Kolekole drop in jungle. Must look like a gorge, not a chimney. |
| Umauma | `cascade` | 19.8917, -155.1408 | |
| Waipiʻo | `plunge` | 20.114, -155.611 | Valley walls. |
| 7 Sacred Pools / Narnia threads | `thread` | see `hookelekele` in `rivers.ts` | Above Boiling Pots, not a coastal plunge. |

Code: `src/components/flight/Waterfalls.tsx`, `src/components/flight/Rivers.tsx`.  
Last attempt: slope-draped sheets + river Y dip at falls (`5dab030`). **User has not signed off.**

### 2. Ka Lae (South Point) — **Grok failed this. Do not repeat the raft.**

**User sign-off: none.** After many passes it is still wrong. Latest phone shots (Sep 17):

- High altitude: a **brown Minecraft palisade floating in the ocean**, disconnected from the green island by a moat. User circled the **real Landsat cape** (west-edge drop + South Point Road) and drew arrows: *that* cliff look must wrap the whole cape; the box wall must go.
- Low altitude (`18.875°N 155.677°W`, 172 m AGL): jump kit (green hoist, trucks, orange pad) sitting on a **cyan sandbar**, not on the tan/green lip.

**What “done” looks like (user photos + Google Maps):**

- The **island mesh itself** is the cliff. One continuous cape from the west lip around to Papakōlea (green sand). No second island, no dock, no raft.
- West lip jump: rusty lava deck, green hoist, two ladders into an undercut cave, trucks on dirt, deep water. People jump and fish here. User almost drowned in that current.
- Papakōlea is on the east-side green coast, not a brown donut in the water.
- Punaluʻu / Nāʻālehu stay at **beach level**.

**Failed approaches — do not do these again:**

1. Extra `boxGeometry` palisade in `KauCoast.tsx` `KaLae()` placed at geographic `18.91, -155.68` → sits in the ocean because the visible Landsat land edge is further north.
2. `southOfKaLae` / `kauCliffY` dumping a lat band to `y = -0.55` → moat between pancake and fake wall.
3. Orange deck plane + `snapToLand` on `terrainY > 0.12` → sandbar in the shallows (cyan shelf counts as “land”).
4. Raising a plateau so the prop wall looks tall → mesa in the sea next to a gentle green slope.

**What actually looks right:** the **west-edge heightmap drop** already in the Landsat plane (user circled it). Next editor should **steepen that same terrain** around the cape, then put **only** hoist/ladders/trucks on the dry lip. Skip cyan albedo (`b > r`). No volume mesh in the water.

Code: `src/components/flight/KauCoast.tsx`, `src/lib/hawaii/coast.ts` (`snapToLand`, `kauCliffY`), `src/components/flight/Island.tsx` (plane now 128×148). Jump target: `18.9119, -155.6864` then snap to **dry** land. Point: `18.9108°N, 155.6813°W`. Papakōlea: `18.9364, -155.6464`.

Grok should **stop iterating Ka Lae props**. This needs a terrain-edge solution, not another dock.

### 3. Close-up terrain still Minecraft

Cartoon Landsat texture is back on the island (`Island.tsx`). From the chase camera at ~100–300 m AGL it still reads blocky. Need more mesh density and/or better drape without killing Samsung WebGL (keep segments modest; last stable plane was 96×110).

### 4. Trees

First pass in: albizia umbrellas (Puna), ʻōhiʻa + lehua, koa on higher slopes (`Forest.tsx`, `PunaGrove.tsx`). User said “looking better.” Still not final. **No `MeshToonMaterial`.**

### 5. Towns

`Settlements.tsx` was cone huts (rejected). Now low tin-roof boxes. First pass only. Hawaiian plantation houses, spread out, not a dense medieval village. Hilo / Kona / Pahoa should not look identical.

---

## Phone / Samsung landmines (already paid for)

- R3F `<Canvas>` + `useMeasure` → 0×0 → HUD frozen at `0 m AGL · hd 0°`. Use `createRoot` + explicit size.
- `webglcontextlost` after ~8s if you resize with the URL bar or load heavy textures/toon. Lock size, `preventDefault` on context lost, `alpha: true`, `antialias: false`, `dpr: 1`.
- `useTexture` on missing FlashTown lot.jpg crashed the whole scene. TextureLoader + fallback. Do not throw.
- `MeshToonMaterial` / physical `transmission` → blank teal/blue canvas on Samsung. Stick to `meshStandardMaterial`.
- Island green must not depend on the jpg alone — vertex colors exist as fallback if the atlas fails to load.

If the HUD reads **`0 m AGL · hd 0°`** and never changes, the loop is dead. Spawn is ~`19.540°N 155.142°W`, heading ~313°, a few hundred m AGL when healthy.

---

## Controls (current)

Phone: circular analog stick (diagonals work). Right side: **lift** (up chevron), **boost** (lightning), **drop** (down chevron). Lightning is boost, not eject.

Keyboard: W/S thrust · A/D turn · Space lift · F drop · Shift boost.

---

## Geography rules (user will reject invented Hawaiʻi)

- Coastline comes from Landsat. Do not redraw it.
- Waterfalls are **inland**. They do not pour off the ocean cliff except where that is actually true (Waipiʻo / Pololū walls).
- Wailuku goes past Rainbow Falls and Boiling Pots up toward the 7 sacred streams — not a short coastal trickle.
- Ka Lae = South Point cliffs. Puʻuhonua o Hōnaunau = City of Refuge, Kona, back access, slope like Ocean View’s slope — **not** the south-point cliff.
- FlashTown ≠ Mountain View village. Village is Hwy 11 / Volcano Road (`mountain-view`). FlashTown is the jungle lot west of it.

---

## Run

```bash
git clone https://github.com/ozone503-maker/cartoon-hawaii.git
cd cartoon-hawaii
npm install
npm run dev
```

Atlas rebuild (does not move coastline):

```bash
python3 scripts/paint-cartoon-atlas.py
```

---

## How to help without wrecking it

1. Keep `FlightScene.tsx` boot, `geo.ts` / `places.ts` coordinates. `world.ts` scale + craft/ChaseCam retunes only per Jessie world-enlarge notes. **No snow on MK/ML.**
2. **Ka Lae is blocked.** Do not add another box wall in the ocean. Sculpt the Landsat mesh edge; props only on dry ground.
3. Waterfalls still need a look the user accepts (`Waterfalls.tsx` / `Rivers.tsx`).
4. Then towns, close terrain, tree polish.
4. Test on a phone if you can. Desktop-only “it works” already burned us.
5. If you add geometry, budget Samsung: no toon ramps, no giant textures in `useTexture`, no 0×0 canvas.
