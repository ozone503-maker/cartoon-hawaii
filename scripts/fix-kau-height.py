#!/usr/bin/env python3
"""Kaʻū + South Kona heights.

Ocean View's long lava slope is the model for the whole west side down to
Puʻuhonua. Cliffs belong at Ka Lae, not at the City of Refuge.
Puʻuhonua is back-access: highway on the slope, sanctuary on the lava flat.
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
KAU_LAT = 19.28

# Surveyed pins. Captain Cook is the highway town, not the bay.
CONTROLS = [
    (19.1358, -155.5044, 8, 2.2),  # Punaluʻu
    (19.062, -155.588, 200, 3.0),  # Nāʻālehu
    (19.202, -155.47, 280, 2.6),  # Pāhala
    (18.9108, -155.6813, 12, 2.4),  # Ka Lae
    (18.9364, -155.6464, 18, 1.6),  # Papakōlea
    (19.6399, -155.9969, 8, 2.8),  # Kona waterfront
    (19.7388, -156.0456, 14, 2.4),  # KOA
    (19.102, -155.767, 640, 3.2),  # Ocean View
    (19.20, -155.84, 420, 2.8),  # Hwy 11
    (19.30, -155.88, 360, 2.6),
    (19.38, -155.89, 340, 2.4),
    (19.498, -155.904, 350, 2.2),  # Captain Cook on Mamalahoa
    (19.4217, -155.9106, 8, 1.0),  # Puʻuhonua lava flat only
    (19.186, -155.908, 8, 1.4),  # Miloliʻi
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
    lon = np.linspace(GEO["lonMin"], GEO["lonMax"], w)[None, :]

    # Kaʻū south of 19.28: keep Punaluʻu / Nāʻālehu terrace.
    kau = (lat < KAU_LAT) & ~ocean
    meters = np.where(kau & (dist_km < 12.0), np.minimum(meters, 8.0 + dist_km * 36.0), meters)

    # West side Ocean View → Puʻuhonua: SAME long lava slope, not a palis.
    # ~52 m/km matches Ocean View (640 m / ~12 km). City of Refuge sits at the bottom.
    west = (lon < -155.78) & (lat > 19.04) & (lat < 19.58) & ~ocean
    target = 8.0 + dist_km * 52.0
    meters = np.where(west, np.minimum(meters, target), meters)

    yy, xx = np.indices(meters.shape)
    for clat, clon, elev, radius_km in CONTROLS:
        px, py = project(clat, clon)
        dkm = np.hypot(xx - px, yy - py) * (M_PER_PX / 1000.0)
        wt = np.exp(-0.5 * (dkm / (radius_km * 0.55)) ** 2)
        wt = np.where(dkm < radius_km * 2.2, wt, 0)
        meters = meters * (1 - wt) + elev * wt

    # Re-apply the west slope AFTER pins so Captain Cook cannot rebuild a cliff.
    meters = np.where(west, np.minimum(meters, target), meters)

    meters[ocean] = 0
    meters = np.clip(meters, 0, 4205)
    Image.fromarray(np.round(meters / 4205.0 * 255.0).astype(np.uint8), mode="L").save(HEIGHT)

    print(f"{'place':22} {'m':>7} {'dist':>6}")
    for name, clat, clon in [
        ("Ocean View", 19.102, -155.767),
        ("Hi11 19.30", 19.30, -155.88),
        ("Captain Cook hwy", 19.498, -155.904),
        ("upslope refuge", 19.43, -155.88),
        ("Puuhonua", 19.4217, -155.9106),
        ("Kealakekua", 19.4786, -155.927),
        ("Ka Lae", 18.9108, -155.6813),
        ("Hualalai", 19.6869, -155.8586),
        ("Mauna Loa", 19.4756, -155.6081),
    ]:
        px, py = project(clat, clon)
        yi, xi = int(round(py)), int(round(px))
        print(f"{name:22} {meters[yi, xi]:7.0f} {dist_km[yi, xi]:6.1f}")


if __name__ == "__main__":
    main()
