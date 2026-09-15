# Fly Hawaiʻi Island

The island’s **coastline is NASA Landsat**. Forests, lava, ranchland, snow, towns, belt roads, and FlashTown are a cartoon world stamped through that mask — not a freehand drawing, not raw satellite.

A lat/lon grid is locked to four surveyed extrema: Upolu (N), Ka Lae (S), Keahole (W), Kumukahi (E). Pins use published coordinates. Height comes from the five real shield volcanoes (Mauna Kea, Mauna Loa, Hualālai, Kohala, Kīlauea).

Repo: [ozone503-maker/cartoon-hawaii](https://github.com/ozone503-maker/cartoon-hawaii)

Home base is **FlashTown** (Mountain View). You fly MDP’s bubble UFO in a locked third-person chase camera. Climb and the camera pulls back toward the overhead atlas. Open the map anytime for the lat/lon grid, and toggle Landsat if you want to inspect the source photograph.

## Play

W/S thrust · A/D turn left/right · Space lift · F drop · Shift boost.

On a phone: four-arrow pad, lift / drop / boost on the opposite corner.

## Run

```bash
git clone https://github.com/ozone503-maker/cartoon-hawaii.git
cd cartoon-hawaii
npm install
npm run dev
```

## Source

| | |
|---|---|
| Coastline | NASA Landsat / USGS (`public/maps/hawaii-usgs.jpg`) — flood-fill land mask |
| Atlas | Cartoon biomes + belt roads + towns (`public/maps/hawaii-cartoon.jpg`) |
| Height | Shield Gaussians at surveyed peaks (`public/maps/hawaii-height.png`) |
| Grid | Equirectangular, island AABB → Upolu / Ka Lae / Keahole / Kumukahi |
| Pins | Surveyed lat/lon in `src/lib/hawaii/places.ts` |
| Roads | Real belt / saddle / Kohala / Puna highways in `src/lib/hawaii/highways.json` |
| Forest | Instanced only where the Landsat pixel is already green |

Place cards are labeled illustrations. They are not the map.

Rebuild the atlas (does not move the coastline):

```bash
python3 scripts/paint-cartoon-atlas.py
```

## FlashTown

| | |
|---|---|
| Where | Jungle lot west of Volcano Road, Mountain View, Puna |
| Lat / lon | 19.5397°N, 155.1417°W |
| Elevation | 1,800 ft |
| Map id | `flashtown` |
| Kind | `home` |

The Hwy 11 village (post office on Volcano Road) is a separate pin at 19.54925°N, 155.10907°W — `mountain-view`. Homes in this district sit on country lanes in the ʻōhiʻa, not in a downtown.

## Mauna Kea summit

Telescopes are placed on IFA 1996 survey coordinates. The USGS peak (19.8207°N, 155.4681°W) has no dome — observatories sit on the north ridge. CSO is omitted (dismantled).

## Nav contract (flight + cockpit)

```js
window.__hawaiiMap.flyTo("flashtown")
window.__hawaiiMap.flyTo("koa")
window.__hawaiiMap.fit()
window.__hawaiiMap.project(19.54, -155.14)
window.__hawaiiMap.waypoints
```

Static copy: [`public/hawaii-nav.json`](public/hawaii-nav.json)

Airports: `ito` PHTO, `koa` PHKO, `mue` PHMU.
