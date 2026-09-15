# Hawaiʻi Island Atlas

The island on this map is a **NASA Landsat photograph**, not a drawing. Coastline, palis, lava, and volcanoes are the satellite. We did not generate the geography.

A lat/lon grid is locked to four surveyed extrema: Upolu (N), Ka Lae (S), Keahole (W), Kumukahi (E). Pins use published coordinates.

Repo: [ozone503-maker/cartoon-hawaii](https://github.com/ozone503-maker/cartoon-hawaii)

Home base is **FlashTown** (Mountain View). Flight mechanics and cockpit plug in through the nav contract below.

## Run

```bash
git clone https://github.com/ozone503-maker/cartoon-hawaii.git
cd cartoon-hawaii
npm install
npm run dev
```

Drag to pan, pinch/scroll to zoom, tap pins. **Enter at FlashTown** starts at home. Grid toggles lat/lon.

## Source

| | |
|---|---|
| Imagery | NASA Landsat / USGS (`public/maps/hawaii-usgs.jpg`) |
| Grid | Equirectangular, island AABB → Upolu / Ka Lae / Keahole / Kumukahi |
| Pins | Surveyed lat/lon in `src/lib/hawaii/places.ts` |

Place cards are labeled illustrations. They are not the map.

## FlashTown

| | |
|---|---|
| Where | Mountain View, Puna, Kīlauea foothills |
| Lat / lon | 19.5397°N, 155.1417°W |
| Elevation | 1,800 ft |
| Map id | `flashtown` |
| Kind | `home` |

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
