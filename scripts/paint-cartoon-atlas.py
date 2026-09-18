#!/usr/bin/env python3
"""Paint a cartoon atlas that keeps the NASA Landsat coastline and grid.

Landsat + the heightmap are the geographic source of truth. Biome tiles are
stamped through that mask. Roads and towns are surveyed lat/lon, not invented
rivers or coastal waterfalls.
"""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
USGS = ROOT / "public/maps/hawaii-usgs.jpg"
HEIGHT = ROOT / "public/maps/hawaii-height.png"
OUT = ROOT / "public/maps/hawaii-cartoon.jpg"
TILE_DIR = ROOT / "scripts/atlas/tiles"
HIGHWAYS = ROOT / "src/lib/hawaii/highways.json"

GEO = dict(latMin=18.9108, latMax=20.268, lonMin=-156.0614, lonMax=-154.806)
ISLAND_PX = dict(x=36, y=36, w=1046, h=1208)

OCEAN, REEF, BEACH, RAINFOREST, SCRUB, GRASS, LAVA, ALPINE, SNOW = range(9)
NAMES = [
    "ocean",
    "reef",
    "beach",
    "rainforest",
    "scrub",
    "grass",
    "lava",
    "alpine",
    "snow",
]


def project(lat: float, lon: float) -> tuple[float, float]:
    nx = (lon - GEO["lonMin"]) / (GEO["lonMax"] - GEO["lonMin"])
    ny = (GEO["latMax"] - lat) / (GEO["latMax"] - GEO["latMin"])
    return ISLAND_PX["x"] + nx * ISLAND_PX["w"], ISLAND_PX["y"] + ny * ISLAND_PX["h"]


def load_tile(name: str, size: int = 320) -> np.ndarray:
    im = Image.open(TILE_DIR / f"{name}.jpg").convert("RGB")
    w, h = im.size
    m = int(min(w, h) * 0.18)
    im = im.crop((m, m, w - m, h - m)).resize((size, size), Image.Resampling.LANCZOS)
    return np.asarray(im, dtype=np.uint8)


def tile_to(map_h: int, map_w: int, tile: np.ndarray, phase: int = 0) -> np.ndarray:
    th, tw = tile.shape[:2]
    rolled = np.roll(np.roll(tile, phase % th, 0), (phase * 3) % tw, 1)
    reps = (map_h // th + 2, map_w // tw + 2, 1)
    big = np.tile(rolled, reps)
    return big[:map_h, :map_w]


def ocean_mask(rgb: np.ndarray) -> np.ndarray:
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    veg = (g > r + 8) & (g > 45)
    lava = (r > g + 16) & (r > 70) & (g < 115)
    waterish = (b >= r - 8) & ~veg & ~lava
    h, w = r.shape
    seen = np.zeros((h, w), dtype=bool)
    ocean = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h or seen[y, x]:
            return
        if not waterish[y, x]:
            return
        seen[y, x] = True
        ocean[y, x] = True
        q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)
    while q:
        x, y = q.popleft()
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)
    return ocean


def dist_to_ocean(ocean: np.ndarray, cap: int = 16) -> np.ndarray:
    """L1 distance from ocean, capped at the reef band."""
    h, w = ocean.shape
    land = ~ocean
    dist = np.full((h, w), cap, dtype=np.int16)
    dist[ocean] = 0
    touch = np.zeros_like(ocean)
    touch[1:-1, 1:-1] = land[1:-1, 1:-1] & (
        ocean[1:-1, 2:] | ocean[1:-1, :-2] | ocean[2:, 1:-1] | ocean[:-2, 1:-1]
    )
    dist[touch] = 1
    q: deque[tuple[int, int]] = deque((int(x), int(y)) for y, x in zip(*np.nonzero(touch)))
    while q:
        x, y = q.popleft()
        d = int(dist[y, x])
        if d >= cap - 1:
            continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= w or ny >= h:
                continue
            if ocean[ny, nx]:
                continue
            nd = d + 1
            if dist[ny, nx] > nd:
                dist[ny, nx] = nd
                q.append((nx, ny))
    return dist


def dist_to_land(ocean: np.ndarray, cap: int = 16) -> np.ndarray:
    """L1 distance from land into ocean, capped at the reef band."""
    h, w = ocean.shape
    land = ~ocean
    dist = np.full((h, w), cap, dtype=np.int16)
    dist[land] = 0
    touch = np.zeros_like(ocean)
    touch[1:-1, 1:-1] = ocean[1:-1, 1:-1] & (
        land[1:-1, 2:] | land[1:-1, :-2] | land[2:, 1:-1] | land[:-2, 1:-1]
    )
    dist[touch] = 1
    q: deque[tuple[int, int]] = deque((int(x), int(y)) for y, x in zip(*np.nonzero(touch)))
    while q:
        x, y = q.popleft()
        d = int(dist[y, x])
        if d >= cap - 1:
            continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= w or ny >= h:
                continue
            if land[ny, nx]:
                continue
            nd = d + 1
            if dist[ny, nx] > nd:
                dist[ny, nx] = nd
                q.append((nx, ny))
    return dist


def classify(
    rgb: np.ndarray,
    height01: np.ndarray,
    ocean: np.ndarray,
    inland: np.ndarray,
    offshore: np.ndarray,
) -> np.ndarray:
    h, w = height01.shape
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    luma = 0.3 * r + 0.59 * g + 0.11 * b
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    cloudy = (luma > 188) & (sat < 30)
    meters = height01 * 4205.0

    yy, xx = np.mgrid[0:h, 0:w]
    lon = GEO["lonMin"] + ((xx - ISLAND_PX["x"]) / ISLAND_PX["w"]) * (GEO["lonMax"] - GEO["lonMin"])
    lat = GEO["latMax"] - ((yy - ISLAND_PX["y"]) / ISLAND_PX["h"]) * (GEO["latMax"] - GEO["latMin"])
    west = lon < -155.72
    kona_lava = (lon < -155.88) & (meters < 500)

    biome = np.full((h, w), OCEAN, dtype=np.uint8)
    land = ~ocean
    biome[land] = RAINFOREST

    lava = land & ~cloudy & (r > g + 14) & (r > 68) & (g < 105)
    lava |= land & kona_lava & (r >= g) & (g < 90)
    grass = land & west & (meters > 400) & (meters < 1800) & ~lava
    scrub = land & west & (meters <= 900) & ~lava
    alpine = land & (meters > 2500)
    snow = land & (meters > 3550)
    beach = land & (inland <= 4) & (meters < 80) & (luma > 90) & ~lava

    biome[scrub] = SCRUB
    biome[grass] = GRASS
    biome[land & ~west & (meters < 2200)] = RAINFOREST
    biome[lava] = LAVA
    # Kaʻū desert is brown. Caldera floor is painted in kilauea(). Forest N/E of the rim.
    kau = land & (lat > 19.20) & (lat < 19.43) & (lon > -155.50) & (lon < -155.20) & (meters > 500)
    rift = land & (lat > 19.34) & (lat < 19.52) & (lon > -155.22) & (lon < -154.82) & (luma < 100) & (g < 90)
    biome[kau] = SCRUB
    biome[rift] = LAVA
    np_forest = land & (lat > 19.40) & (lat < 19.52) & (lon > -155.27) & (lon < -155.16)
    np_north = land & (lat > 19.428) & (lat < 19.50) & (lon > -155.34) & (lon < -155.18)
    biome[np_forest | np_north] = RAINFOREST
    biome[alpine] = ALPINE
    biome[snow] = SNOW
    biome[beach] = BEACH
    biome[ocean] = np.where(offshore[ocean] <= 6, REEF, OCEAN)

    cloud_west = land & cloudy & (meters < 2800) & west
    biome[cloud_west] = np.where(meters[cloud_west] < 700, SCRUB, GRASS)
    return biome


def majority(ids: np.ndarray, land: np.ndarray, k: int = 5) -> np.ndarray:
    pad = k // 2
    padded = np.pad(ids, pad, mode="edge")
    h, w = ids.shape
    counts = np.zeros((h, w, 9), dtype=np.int16)
    for dy in range(k):
        for dx in range(k):
            sl = padded[dy : dy + h, dx : dx + w]
            for i in range(9):
                counts[:, :, i] += sl == i
    mode = counts.argmax(axis=2).astype(np.uint8)
    # Coastline is Landsat — never let ocean/reef majority eat land, or land eat ocean.
    counts[:, :, OCEAN] = 0
    counts[:, :, REEF] = 0
    land_mode = counts.argmax(axis=2).astype(np.uint8)
    out = ids.copy()
    out[land] = land_mode[land]
    out[~land] = ids[~land]
    return out


def hillshade(height01: np.ndarray) -> np.ndarray:
    gy, gx = np.gradient(height01.astype(np.float32) * 3.4)
    lx, ly, lz = -0.45, -0.75, 1.0
    ln = (lx * lx + ly * ly + lz * lz) ** 0.5
    nz = 1.0
    nlen = np.sqrt(gx * gx + gy * gy + nz * nz)
    shade = np.clip((-gx * lx - gy * ly + nz * lz) / (nlen * ln), 0.42, 1.18)
    return shade.astype(np.float32)


def paint_towns(img: Image.Image, data: dict, land: np.ndarray) -> None:
    pal = {
        "wet": [(232, 214, 176), (196, 92, 74), (90, 122, 104)],
        "dry": [(236, 210, 150), (214, 122, 70), (168, 84, 64)],
        "lava": [(210, 186, 150), (120, 88, 80), (70, 70, 72)],
        "home": [(244, 236, 214), (215, 106, 77), (40, 140, 120)],
    }
    rng = np.random.default_rng(42)
    arr = np.array(img)
    h, w = arr.shape[:2]
    for t in data["towns"]:
        x, y = project(t["lat"], t["lon"])
        cols = pal[t["kind"]]
        radius = float(t["r"])
        for _ in range(int(radius * radius * 1.15)):
            a = rng.random() * 2 * np.pi
            rad = (rng.random() ** 0.55) * radius
            px = int(round(x + np.cos(a) * rad))
            py = int(round(y + np.sin(a) * rad * 0.85))
            if px < 1 or py < 1 or px >= w - 1 or py >= h - 1:
                continue
            if not land[py, px]:
                continue
            c = cols[int(rng.integers(0, len(cols)))]
            s = 1 + int(t["r"] >= 8 and rng.random() < 0.4)
            arr[py : py + s, px : px + s] = c
        if t["kind"] == "home":
            cx, cy = int(round(x)), int(round(y))
            for dy in range(-3, 4):
                for dx in range(-3, 4):
                    if dx * dx + dy * dy > 9:
                        continue
                    px, py = cx + dx, cy + dy
                    if 0 <= py < h and 0 <= px < w and land[py, px]:
                        arr[py, px] = (215, 106, 77) if dx * dx + dy * dy > 2 else (244, 236, 214)
    img.paste(Image.fromarray(arr))


def paint_roads_airports(img: Image.Image, data: dict) -> None:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    cream = (244, 228, 186, 230)
    edge = (92, 64, 48, 160)
    for hwy in data["highways"]:
        pts = [project(lat, lon) for lat, lon in hwy["pts"]]
        width = hwy["w"]
        d.line(pts, fill=edge, width=int(round(width + 1.6)))
        d.line(pts, fill=cream, width=max(1, int(round(width))))
    for ap in data["airports"]:
        x, y = project(ap["lat"], ap["lon"])
        rad = np.deg2rad(ap["heading"])
        dx, dy = np.cos(rad) * ap["len"] / 2, np.sin(rad) * ap["len"] / 2
        d.line([(x - dx, y - dy), (x + dx, y + dy)], fill=(210, 205, 190, 240), width=3)
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))


def foam(img: Image.Image, ocean: np.ndarray) -> None:
    land = (~ocean).astype(np.uint8) * 255
    edge = Image.fromarray(land).filter(ImageFilter.FIND_EDGES)
    e = np.array(edge) > 40
    arr = np.array(img)
    foam_col = np.array([186, 230, 214], dtype=np.int16)
    arr[e] = np.clip(arr[e].astype(np.int16) * 0.35 + foam_col * 0.65, 0, 255).astype(np.uint8)
    img.paste(Image.fromarray(arr))


def kilauea(img: Image.Image) -> None:
    """Irregular nested caldera like the map: grey floor, black pit west, sulfur."""
    x, y = project(19.4069, -155.2834)
    d = ImageDraw.Draw(img)
    d.ellipse((x - 17, y - 12, x + 15, y + 14), fill=(108, 92, 74))
    d.ellipse((x - 14, y - 9, x + 12, y + 11), fill=(82, 72, 62))
    d.ellipse((x - 8, y - 4, x + 10, y + 8), fill=(70, 62, 54))
    px, py = project(19.405, -155.291)
    d.ellipse((px - 9, py - 7, px + 6, py + 6), fill=(32, 26, 22))
    d.ellipse((px - 5, py - 4, px + 3, py + 3), fill=(22, 18, 16))
    d.ellipse((px - 2, py - 1.5, px + 2, py + 1.5), fill=(196, 88, 36))
    d.ellipse((px + 1, py - 5, px + 5, py - 2), fill=(210, 198, 168))


def main() -> None:
    usgs = np.asarray(Image.open(USGS).convert("RGB"))
    height = np.asarray(Image.open(HEIGHT).convert("L")).astype(np.float32) / 255.0
    h, w, _ = usgs.shape
    print("mask…")
    ocean = ocean_mask(usgs)
    print("  ocean px", int(ocean.sum()), "land px", int((~ocean).sum()))
    dist_in = dist_to_ocean(ocean)
    dist_off = dist_to_land(ocean)
    land = ~ocean
    print("classify…")
    biome = classify(usgs, height, ocean, dist_in, dist_off)
    biome = majority(biome, land, 5)
    print("stamp tiles…")
    tiles = {name: load_tile(name) for name in NAMES}
    out = np.zeros((h, w, 3), dtype=np.uint8)
    for i, name in enumerate(NAMES):
        stamped = tile_to(h, w, tiles[name], phase=i * 40)
        out[biome == i] = stamped[biome == i]
        print(" ", name, int((biome == i).sum()))
    # Kill tile vignette on water — keep a hint of swell, not a grid of dots.
    ocean_flat = np.array([12, 74, 106], dtype=np.float32)
    reef_flat = np.array([38, 168, 166], dtype=np.float32)
    out = out.astype(np.float32)
    m = biome == OCEAN
    out[m] = out[m] * 0.18 + ocean_flat * 0.82
    m = biome == REEF
    out[m] = out[m] * 0.38 + reef_flat * 0.62
    forest = biome == RAINFOREST
    out[forest] = out[forest] * 0.82 + np.array([28, 92, 42], dtype=np.float32) * 0.18
    shade = hillshade(height)
    shaded = np.clip(out * shade[:, :, None], 0, 255)
    out = np.where(land[:, :, None], shaded, np.clip(out, 0, 255)).astype(np.uint8)
    img = Image.fromarray(out)
    print("features…")
    foam(img, ocean)
    kilauea(img)
    data = json.loads(HIGHWAYS.read_text())
    paint_roads_airports(img, data)
    paint_towns(img, data, land)
    img.save(OUT, quality=92, optimize=True)
    print("wrote", OUT, img.size)


if __name__ == "__main__":
    main()
