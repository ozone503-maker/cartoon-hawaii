#!/usr/bin/env python3
"""Kaʻū-only height lock. Do not terrace the Kona / Hualālai shield.

Punaluʻu = beach. Nāʻālehu = town upslope. West side stays a volcano slope,
not a fake palis at the old 14 km clamp.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
USGS = ROOT / "public/maps/hawaii-usgs.jpg"
BASE = ROOT / "public/maps/hawaii-height-shields.png"
HEIGHT = ROOT / "public/maps/hawaii-height.png"

GEO = dict(latMin=18.9108, latMax=20.268, lonMin=-156.0614, lonMax=-154.806)
ISLAND_PX = dict(x=36, y=36, w=1046, h=1208)
M_PER_PX = 150_000 / 1046
KAU_LAT = 19.28  # south of this: Kaʻū terrace only

CONTROLS = [
    (19.1358, -155.5044, 8, 2.2),
    (19.062, -155.588, 200, 3.0),
    (19.202, -155.47, 280, 2.6),
    (18.9108, -155.6813, 12, 2.4),
    (18.9364, -155.6464, 18, 1.6),
    (19.6399, -155.9969, 8, 2.8),  # Kailua-Kona waterfront
    (19.7388, -156.0456, 14, 2.4),  # KOA
    (19.4217, -155.9106, 6, 1.8),  # Puʻuhonua shore
    (19.102, -155.767, 640, 3.2),  # Ocean View
    (19.20, -155.84, 380, 2.6),  # Hwy 11
    (19.30, -155.88, 290, 2.8),  # Hwy 11 — kills the fake 1300 m wall
    (19.38, -155.90, 240, 2.4),
    (19.43, -155.88, 380, 2.2),  # coffee-belt above the refuge
    (19.499, -155.921, 430, 2.4),  # Captain Cook
    (19.4786, -155.927, 6, 1.5),  # Kealakekua Bay
    (19.186, -155.908, 8, 1.6),  # Miloliʻi
]


def project(lat: float, lon: float) -> tuple[float, float]:
    nx = (lon - GEO["lonMin"]) / (GEO["lonMax"] - GEO["lonMin"])
    ny = (GEO["latMax"] - lat) / (GEO["latMax"] - GEO["latMin"])
    return ISLAND_PX["x"] + nx * ISLAND_PX["w"], ISLAND_PX["y"] + ny * ISLAND_PX["h"]


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


def dist_px(ocean: np.ndarray) -> np.ndarray:
    h, w = ocean.shape
    d = np.where(ocean, 0.0, 1e6).astype(np.float32)
    for y in range(h):
        row = d[y]
        prev = d[y - 1] if y else None
        for x in range(w):
            v = row[x]
            if prev is not None:
                v = min(v, prev[x] + 1)
            if x:
                v = min(v, row[x - 1] + 1)
            row[x] = v
    for y in range(h - 1, -1, -1):
        row = d[y]
        nxt = d[y + 1] if y + 1 < h else None
        for x in range(w - 1, -1, -1):
            v = row[x]
            if nxt is not None:
                v = min(v, nxt[x] + 1)
            if x + 1 < w:
                v = min(v, row[x + 1] + 1)
            row[x] = v
    return d


def main() -> None:
    rgb = np.asarray(Image.open(USGS).convert("RGB"))
    ocean = ocean_mask(rgb)
    dist = dist_px(ocean)
    dist_km = dist.astype(np.float32) * (M_PER_PX / 1000.0)

    src = np.asarray(Image.open(BASE).convert("L"), dtype=np.float32)
    meters = src / 255.0 * 4205.0

    h, w = meters.shape
    lat = np.linspace(GEO["latMax"], GEO["latMin"], h)[:, None]
    kau = (lat < KAU_LAT) & ~ocean
    cap = 8.0 + dist_km * 36.0
    meters = np.where(kau & (dist_km < 12.0), np.minimum(meters, cap), meters)

    yy, xx = np.indices(meters.shape)
    for clat, clon, elev, radius_km in CONTROLS:
        px, py = project(clat, clon)
        dkm = np.hypot(xx - px, yy - py) * (M_PER_PX / 1000.0)
        wt = np.exp(-0.5 * (dkm / (radius_km * 0.55)) ** 2)
        wt = np.where(dkm < radius_km * 2.2, wt, 0)
        meters = meters * (1 - wt) + elev * wt

    meters[ocean] = 0
    meters = np.clip(meters, 0, 4205)
    out = np.round(meters / 4205.0 * 255.0).astype(np.uint8)
    Image.fromarray(out, mode="L").save(HEIGHT)

    print(f"{'place':20} {'after':>8} {'real':>8}")
    for name, clat, clon, real in [
        ("Punaluu", 19.1358, -155.5044, 8),
        ("Naalehu", 19.062, -155.588, 200),
        ("Ka Lae", 18.9108, -155.6813, 12),
        ("Kona", 19.6399, -155.9969, 5),
        ("Hualalai", 19.6869, -155.8586, 2521),
        ("Ocean View", 19.102, -155.767, 640),
        ("Mauna Kea", 19.8207, -155.4681, 4205),
    ]:
        px, py = project(clat, clon)
        print(f"{name:20} {meters[int(round(py)), int(round(px))]:8.0f} {real:8.0f}")


if __name__ == "__main__":
    main()
