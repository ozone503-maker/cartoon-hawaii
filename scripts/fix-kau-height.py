#!/usr/bin/env python3
"""Lock Kaʻū heights to the real coast: Punaluʻu at the beach, Nāʻālehu upslope.

The Gaussian shields put Punaluʻu at ~940 m. It is a black-sand beach.
Nāʻālehu is the town above it (~200 m), not at sea level.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
USGS = ROOT / "public/maps/hawaii-usgs.jpg"
HEIGHT = ROOT / "public/maps/hawaii-height.png"

GEO = dict(latMin=18.9108, latMax=20.268, lonMin=-156.0614, lonMax=-154.806)
ISLAND_PX = dict(x=36, y=36, w=1046, h=1208)
M_PER_PX = 150_000 / 1046

# Surveyed spots (m). Used to terrace the Kaʻū slope.
CONTROLS = [
    (19.1358, -155.5044, 8, 2.2),  # Punaluʻu beach
    (19.062, -155.588, 200, 3.0),  # Nāʻālehu
    (19.202, -155.47, 280, 2.6),  # Pāhala
    (18.9108, -155.6813, 12, 2.4),  # Ka Lae
    (18.9364, -155.6464, 18, 1.6),  # Papakōlea
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

    src = np.asarray(Image.open(HEIGHT).convert("L"), dtype=np.float32)
    meters = src / 255.0 * 4205.0

    # Near the water, height cannot exceed a real coastal slope.
    # 14 km inland ≈ 500 m; volcano interiors (Mauna Kea) are untouched.
    near = dist_km < 14.0
    cap = 8.0 + dist_km * 36.0
    meters = np.where(near, np.minimum(meters, cap), meters)
    meters[ocean] = 0

    yy, xx = np.indices(meters.shape)
    for lat, lon, elev, radius_km in CONTROLS:
        px, py = project(lat, lon)
        dkm = np.hypot(xx - px, yy - py) * (M_PER_PX / 1000.0)
        w = np.exp(-0.5 * (dkm / (radius_km * 0.55)) ** 2)
        w = np.where(dkm < radius_km * 2.2, w, 0)
        meters = meters * (1 - w) + elev * w

    meters[ocean] = 0
    meters = np.clip(meters, 0, 4205)
    out = np.round(meters / 4205.0 * 255.0).astype(np.uint8)
    Image.fromarray(out, mode="L").save(HEIGHT)

    print(f"{'place':20} {'dist_km':>8} {'before':>8} {'after':>8} {'real':>8}")
    samples = [
        ("Punaluu", 19.1358, -155.5044, 8),
        ("Naalehu", 19.062, -155.588, 200),
        ("Pahala", 19.202, -155.47, 280),
        ("Ka Lae", 18.9108, -155.6813, 12),
        ("Papakolea", 18.9364, -155.6464, 18),
        ("Ocean View", 19.102, -155.767, 640),
        ("Hilo", 19.7074, -155.0817, 10),
        ("Mauna Kea", 19.8207, -155.4681, 4205),
        ("FlashTown", 19.5397, -155.1417, 550),
        ("Kilauea", 19.4069, -155.2834, 1247),
    ]
    for name, lat, lon, real in samples:
        px, py = project(lat, lon)
        xi, yi = int(round(px)), int(round(py))
        before = src[yi, xi] / 255.0 * 4205
        after = meters[yi, xi]
        print(f"{name:20} {dist_km[yi, xi]:8.2f} {before:8.0f} {after:8.0f} {real:8.0f}")


if __name__ == "__main__":
    main()
