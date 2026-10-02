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

`MAKEOVER.md` is an older punch list (more trees, more cones, more stamps). Following it again will produce another week of the same picture. Ignore it as an art plan.

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
- Waterfalls are real streams falling off real lips (Akaka, Rainbow Falls, Boiling Pots, Umauma, Waiʻaleale is Kauaʻi — do not put it here). The Wailuku runs from the saddle side down through Boiling Pots and Rainbow Falls to Hilo Bay.
- FlashTown is the home lot at Mountain View (19.5397, -155.1417), not a second island.
- Do not grow `WORLD.w` again and do not scale the UFO with it.
- Do not restart the repo. Do not replace React Three Fiber with a new engine unless the tile ground cannot be sampled in the current mesh. If you must change the renderer, keep `latLonToWorld` and the heightmap.

## How to know you failed

- You added a mesh and did not change `hawaii-cartoon.jpg` or the sampler in `src/components/flight/Island.tsx`.
- A screenshot from saucer height still shows flat color regions bigger than a house.
- The coast in the new picture does not match `hawaii-usgs.jpg` at Ka Lae, Hilo Bay, and Kailua.
- The human cannot tell your screenshot from last month's.

## How to know you are done

From the chase camera, over Kīlauea, Ka Lae, Hilo, and the saddle, a person who knows the island can name the place without reading the HUD. The craft, the stick, and the lat/lon readout still behave as they do on `main` today.
