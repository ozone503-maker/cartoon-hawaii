# Handoff — Fly Hawaiʻi Island

**Repo:** https://github.com/ozone503-maker/cartoon-hawaii  
**Branch:** `main`  
**Do not restart this project.** The flying mechanism works. Improve in place.

Crew so far: Claude built the original flight; Grok owns the Landsat island, chase camera, MDP, FlashTown, and phone boot; ChatGPT is building another chunk; Bro Boss is the next pair of eyes.

---

## What this is

A cartoon 3D flight over the **real Big Island**. MDP (grey-blue alien) pilots a silver bubble saucer. Locked third-person chase camera. Geography is NASA Landsat + surveyed lat/lon — not invented Hawaiʻi.

Home spawn: **FlashTown**, Mountain View, Puna — `19.5397°N, 155.1417°W`.

---

## Frozen — do not rewrite

| What | File | Lock |
|---|---|---|
| Flight physics | `src/lib/flight/craft.ts` | Thrust, yaw, lift/drop, boost ×2.15. Do not replace. |
| Input | `src/lib/flight/input.ts` | Keyboard + analog stick axes. |
| Chase camera | `src/components/flight/ChaseCam.tsx` | `LEN = 2.55`, `DEG = 22`. Behind and above, UFO in the lower third. No cockpit. No zoom into MDP’s head. |
| WebGL boot | `src/components/flight/FlightScene.tsx` | `createRoot` + `await configure` + explicit canvas size. Samsung died on R3F `<Canvas>` / 0×0 / context loss. |
| World / height | `src/lib/hawaii/world.ts` | `WORLD.w = 240`, `HEIGHT_SCALE = 24/4205`. |
| Grid | `src/lib/hawaii/geo.ts` | AABB: Upolu N, Ka Lae S, Keahole W, Kumukahi E. |
| Pins | `src/lib/hawaii/places.ts` | Published coordinates only. |
| Roads | `src/lib/hawaii/highways.json` | Real belt / saddle / Kohala / Puna. |
| Rivers (positions) | `src/lib/hawaii/rivers.ts` | Real windward streams. Mouths meet the bay — they are not waterfalls. |
| MDP + saucer | `src/components/flight/Craft.tsx` | Grey-blue alien (`#6aaec8`), large cranium, thin neck, silver saucer, cyan ring, bubble dome. **Not** a cream robot. **Not** a teal blob filling the dome. |
| Analog stick | `src/components/flight/TouchPad.tsx` | One circle, 4 quarters, diagonals work. Lightning = **boost**, not eject. Up = lift, down = drop. |
| Cartoon atlas | `public/maps/hawaii-cartoon.jpg` | Ground texture. Coastline from Landsat, not freehand. |

Camera reference (user-locked): UFO in the lower third, ~1½–2.5 craft lengths back, ~20–25° down, landscape dominates, MDP visible through the dome.

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

### 2. Ka Lae (South Point)

**Problem:** Looked like a tan raft floating in the ocean. User: huge cliff people jump and fish off. They almost drowned there.

**Need:** Grass on top, sheer rock face down to deep water, west lip for jumping/fishing. Not a pancake. Not a dock.

Code: `src/components/flight/KauCoast.tsx` → `KaLae()`. Coords: `18.9108°N, 155.6813°W` (point); mesh currently stood slightly inland at `18.9148, -155.6815`. **User has not signed off.**

Punaluʻu = black sand **at beach level**. Nāʻālehu too. Do not put them on a bluff.

### 3. Close-up terrain still Minecraft

Cartoon Landsat texture is back on the island (`Island.tsx`). From the chase camera at ~100–300 m AGL it still reads blocky. Need more mesh density and/or better drape without killing Samsung WebGL (keep segments modest; last stable plane was 96×110).

### 4. Trees are blobs

`Forest.tsx` / `PunaGrove.tsx` — dark spheres on sticks. Need cartoon canopy that still reads as ʻōhiʻa / jungle from the chase cam. **No `MeshToonMaterial` / `gradientMap`** — that crashed Samsung.

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

1. Keep `craft.ts`, `ChaseCam.tsx`, `FlightScene.tsx` boot, `world.ts` / `geo.ts` / `places.ts` coordinates.
2. Work the waterfall look and Ka Lae cliff first — those are the user-facing failures.
3. Then trees, towns, close terrain.
4. Test on a phone if you can. Desktop-only “it works” already burned us.
5. If you add geometry, budget Samsung: no toon ramps, no giant textures in `useTexture`, no 0×0 canvas.
