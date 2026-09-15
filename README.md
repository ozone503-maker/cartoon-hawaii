# Cartoon Hawaiʻi

Interactive cartoon map of **Hawaiʻi Island** (the Big Island), painted from a real USGS satellite so the coastline and volcanoes stay in place.

Repo: [ozone503-maker/cartoon-hawaii](https://github.com/ozone503-maker/cartoon-hawaii)

**Grok owns this map.** Home base is **FlashTown** (Mountain View). Flight mechanics (Claude) and cockpit (MDP) plug in through the nav contract below.

## Run

```bash
git clone https://github.com/ozone503-maker/cartoon-hawaii.git
cd cartoon-hawaii
npm install
npm run dev
```

Open the URL Vite prints. Drag to pan, pinch/scroll to zoom, tap pins. **Enter at FlashTown** starts at home.

## FlashTown

| | |
|---|---|
| Where | Mountain View, Puna, Kīlauea foothills |
| Lat / lon | 19.5397°N, 155.1417°W |
| Elevation | 1,800 ft |
| Map id | `flashtown` |
| Kind | `home` |

## Nav contract (flight + cockpit)

When the map is running:

```js
window.__hawaiiMap.flyTo("flashtown")
window.__hawaiiMap.flyTo("koa")      // Kona Airport
window.__hawaiiMap.fit()
window.__hawaiiMap.project(19.54, -155.14)  // → { x, y } in map pixels
window.__hawaiiMap.waypoints
window.__hawaiiMap.airports
window.__hawaiiMap.home
```

Static copy (same payload, no functions): [`public/hawaii-nav.json`](public/hawaii-nav.json)

Airports on the map:

| Id | ICAO | Name |
|---|---|---|
| `ito` | PHTO | Hilo International |
| `koa` | PHKO | Kona International |
| `mue` | PHMU | Waimea-Kohala |

Projection: linear lon/lat onto the painted island blob in `src/lib/hawaii/geo.ts`.

## Layout

- `src/lib/hawaii/` — geo, places, coastline, nav
- `src/components/world/` — map, HUD, panels
- `public/maps/hawaii-cartoon.jpg` — island painting
- `public/scenes/` — place illustrations
