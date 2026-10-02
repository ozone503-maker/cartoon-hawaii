# Handoff — why the island still looks like Intellivision

Read this before touching art. The flight sim is real. The picture is not.
Do not "improve" it by adding another mesh.

Repo: https://github.com/ozone503-maker/cartoon-hawaii · branch `main`
App name: Fly Hawaiʻi Island. Pilot is MDP, a glossy cyan alien, in a saucer.

## What the human actually asked for

A continuous 3D cartoon of the real Big Island. Accurate coast, roads, towns, volcanoes, cliffs, and beaches, so a local would not laugh. Not a satellite screenshot as the final look. Not a painting invented by an image model. The cartoon has to sit on the real geography.

They supplied Landsat, aerials, and photos of the real places. Those were treated as descriptions. The code then built boxes, spheres, and discs. That is the whole failure.

## What already works — do not restart it

- Chase camera, stick, lift, boost, drop. Files: `src/lib/flight/craft.ts`, `src/lib/flight/input.ts`, `src/components/flight/ChaseCam.tsx`, `src/components/flight/TouchPad.tsx`, `src/components/flight/Craft.tsx`.
- Lat/lon locked to one frame. `src/lib/hawaii/geo.ts`:
  - lat 18.9108 to 20.268 (Ka Lae to Upolu)
  - lon -156.0614 to -154.806 (Keahole to Kumukahi)
  - island pixels inside the 1118×1280 frame: x 36, y 36, w 1046, h 1208
- Height comes from `public/maps/hawaii-height.png` (uint8, 4205 m = white). Sampled in `src/lib/hawaii/world.ts`.
- Places with surveyed coordinates: `src/lib/hawaii/places.ts`.
- Saddle Road (Daniel K. Inouye Highway) is a real polyline in `src/lib/hawaii/highways.json`, drawn in `src/components/flight/Roads.tsx`.
- World size is `WORLD.w = 3840`. Craft scale is frozen at `WORLD_SCALE = 4`. Do not tie them together. Last time that happened, the ship grew with the island and the island still felt like a table.

## Why every "improvement" still looks like a children's game

The ground the camera sees is one JPEG:

`public/maps/hawaii-cartoon.jpg` — **1118×1280** for the whole island.

The island is about 150 km across. That image is roughly **130 meters per pixel**. The chase camera is a few saucer-lengths off the ground. At that distance a 130 m texel is a block. Intellivision is not a style choice. It is the resolution.

On top of that JPEG the code instances toys:

| File | What it actually is |
|---|---|
| `src/components/flight/Forest.tsx` | spheres and cones |
| `src/components/flight/Settlements.tsx` | boxes |
| `src/components/flight/Waterfalls.tsx` | ribbons and discs |
| `src/components/flight/KauCoast.tsx` | a rock ribbon at South Point, plus ladders and trucks |
| `src/components/flight/Caldera.tsx` | flat orange circles in the pit |
| `src/components/flight/MaunaKea.tsx` | cone field |

A photograph of a cliff was turned into a wall of quads. A waterfall photo was turned into a white strip. The human saw the same game every time, because it is the same game.

`public/maps/hawaii-aerial.jpg` (about 3578×4096) exists and is **not** wired to the flight mesh. Even that file is only about 40 m per pixel. From altitude it would finally read as Hawaiʻi. On the ground it would still be soft. One bigger JPG is not the fix.

`MAKEOVER.md` is an older punch list (more trees, more cones, more stamps). Following it again will produce another week of the same picture. Use it for place names only.

## The job

Replace the ground picture. Leave the flight, the coordinate frame, and the heightmap.

The delivered ground must be a **texture in the existing geographic frame**, not a new island and not a pile of props.

Minimum that stops the Atari look from the air: imagery at **10 m per pixel or better** across the island, sampled on the mesh that already exists. At ~150 km that is on the order of **15,000 pixels** on the long side. A single 15k texture will choke a phone. The working approach is a **tile pyramid** (XYZ / slippy tiles, or a clipmap) addressed by the same `latLonToWorld` used everywhere else, with coarse tiles far away and fine tiles under the craft.

Two acceptable looks, in order:

1. **Painted tiles locked to the real frame.** Trace the coast, roads, lava, forest, and towns from `public/maps/hawaii-usgs.jpg` and `public/maps/hawaii-aerial.jpg`. Repaint those pixels in the Brobots cartoon palette. Do not move the coast to make a prettier shape. This is what the human asked for.
2. **If you cannot paint at that resolution, drape the real aerial and delete the toys.** Say so in writing. Do not call a satellite photo a cartoon. The human rejected raw satellite as the final art, but they also rejected fake geography. A labeled aerial is more honest than another box town.

Then **delete or hide** the sphere trees, box towns, disc waterfalls, and cone summits wherever the new ground already shows that thing. Props may remain only where the ground cannot carry them (the saucer, MDP, a road stripe if the texture has no road).

## Hard rules from the person who lives with this map

- Do not invent the coastline, the saddle, or the towns. Locals will see a fake island immediately, and they are hostile to AI slop of this place.
- No snow on Mauna Kea or Mauna Loa. The summits are cinder and stone. Mauna Kea has telescopes.
- Kīlauea is a shield with a caldera about 4 km by 3 km, black lava, Halemaʻumaʻu on the west side of the floor. Not a brown tube, not a green hole, not one orange pixel.
- Ka Lae / South Point is a cliff along the south shore, not a rounded green cape and not a cliff at Puʻuhonua. The jump and the green hoist are on the lip. Papakōlea (green sand) is the cove just east of the tip. Punaluʻu is black sand at sea level. Nāʻālehu is up the slope, not on the beach.
- Puʻuhonua o Hōnaunau is a low lava flat. The long slope from Ocean View through Captain Cook is the same kind of slope, not a sea cliff.
- Waterfalls are real streams falling off real lips (ʻAkaka, Rainbow Falls, Boiling Pots, Umauma). The Wailuku runs from the saddle side down through Boiling Pots and Rainbow Falls to Hilo Bay. A river mouth is not a waterfall.
- FlashTown is the home lot at Mountain View (19.5397, -155.1417), not a second island and not the highway village.
- Do not grow `WORLD.w` again and do not scale the UFO with it.
- Do not restart the repo. Do not replace React Three Fiber unless a tile ground cannot be sampled on the current mesh. If you change the renderer, keep `latLonToWorld` and the heightmap.

## How to know you failed

- You added a mesh and did not change `hawaii-cartoon.jpg` or the sampler in `src/components/flight/Island.tsx`.
- A screenshot from saucer height still shows flat color regions bigger than a house.
- The coast in the new picture does not match `hawaii-usgs.jpg` at Ka Lae, Hilo Bay, and Kailua.
- The human cannot tell your screenshot from last month's.

## How to know you are done

From the chase camera, over Kīlauea, Ka Lae, Hilo, and the saddle, a person who knows the island can name the place without reading the HUD. The craft, the stick, and the lat/lon readout still behave as they do on `main` today.

## Locks that are still true

Home spawn is FlashTown, the jungle lot at Mountain View: 19.5397, -155.1417. The highway village is a different pin.

| What | File | Lock |
|---|---|---|
| Camera | `ChaseCam.tsx` | Behind and above. About 3.5 craft lengths back, about 22° down. UFO in the lower third. No cockpit. Do not zoom into MDP’s head. |
| MDP | `Craft.tsx` | Glossy cyan `#3ec8e8`, big cranium, thin neck, black eyes, chrome saucer, bubble. The camera sees the back of the head. |
| Stick | `TouchPad.tsx` | One circle, four quarters, diagonals work. Lightning is **boost**, not eject. |
| Phone boot | `FlightScene.tsx` | Samsung died on a 0×0 canvas and on `MeshToonMaterial`. Keep `createRoot`, a real canvas size, `antialias: false`, `dpr: 1`, `meshStandardMaterial` only. |
| Summits | height + mesh | Dark cinder. **No snow.** |

`WORLD.w` is **3840** now, not 960. `HEIGHT_MULT` is **5.5**. `UFO_LENGTH` is still 8.8. Older notes that say 960 are stale. Do not "restore" 960.

## Approaches that already failed

Do not do these again. The human has seen each one.

- A box wall, raft, or second mesh in the ocean at Ka Lae. The cliff has to be the island’s own south edge. The Landsat cape is the land. Props (green hoist, ladders, trucks) go on the dry lip only. Jump pin 18.9119, -155.6864. Papakōlea 18.9364, -155.6464.
- Digging a trench so a fake wall looks separated from the island. That made a moat.
- A waterfall built as a brown tower, an ice cube, a fence, or a laser-blue line. Real falls: Rainbow 19.7194, -155.1094; Boiling Pots 19.7153, -155.1306; ʻAkaka 19.8539, -155.1522; Umauma 19.8917, -155.1408. They sit on the hillside. Mouths of rivers are not waterfalls.
- Slowing the ship to make the island feel bigger.
- Raising `WORLD.w` while also scaling the ship, the camera, and the speed. The island stays the same size in the window.
- Another coat of sphere trees and tin-roof boxes. The human already called that Minecraft.

## Phone check

If the HUD sticks at `0 m AGL · hd 0°`, the render loop is dead. A healthy spawn is about 19.540°N, 155.142°W, heading near 313°, a few hundred meters up. Desktop-only "it works" has already burned a week.
