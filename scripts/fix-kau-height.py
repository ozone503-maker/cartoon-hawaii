#!/usr/bin/env python3
"""Kaʻū + South Kona heights.

Ocean View's long lava slope is the model for the whole west side down to
Puʻuhonua. Cliffs belong at Ka Lae, not at the City of Refuge.
Puʻuhonua is back-access: highway on the slope, sanctuary on the lava flat.

Ka Lae / South Point: the Landsat cape is land, but shields leave it flat.
Sculpt a terrain-native cliff around the cape (west lip → tip → Papakōlea).
No second island, dock, raft, or mesa in the ocean — ocean stays 0.
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
    (19.1358, -155.5044, 8, 2.2),  # Punaluʻu — beach level
    (19.062, -155.588, 200, 3.0),  # Nāʻālehu — upslope
    (19.202, -155.47, 280, 2.6),  # Pāhala
    (18.9108, -155.6813, 52, 1.6),  # Ka Lae tip lip (pre-sculpt floor)
    (18.9364, -155.6464, 18, 1.0),  # Papakōlea cove floor
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


def sculpt_ka_lae_cape(
    meters: np.ndarray,
    ocean: np.ndarray,
    dist_km: np.ndarray,
    lat: np.ndarray,
    lon: np.ndarray,
) -> np.ndarray:
    """Raise the real Landsat cape into a cliff. Ocean pixels stay 0.

    Real cliffs drop vertically: the *first* land pixel is already the lip.
    Do not smoothstep from 0 at the shore (that left the lip at one gray
    level after PNG quantization). Targets are set so gray ≥ 3–4
    (~50–70 m) survives uint8 height encoding.
    """
    cape = (lat < 19.02) & (lon > -155.745) & (lon < -155.615) & ~ocean

    west = cape & (lon < -155.668)
    tip = cape & (lon >= -155.668) & (lon < -155.655)
    east = cape & (lon >= -155.655)

    # Lip floors (meters). West jump tallest; tip medium; east lower until rim.
    lip = np.where(west, 72.0, np.where(tip, 52.0, 40.0))
    # Within ~0.9 km of ocean: land IS the cliff top (not a ramp from sea level).
    coastal = cape & (dist_km < 0.9)
    # Inland Kaʻū terrace beyond the lip band.
    terrace = 28.0 + dist_km * 26.0
    far = np.clip((dist_km - 0.7) / 2.2, 0.0, 1.0)
    target = np.where(coastal, lip * (1.0 - far) + terrace * far, terrace)

    # Papakōlea: low green-sand cove floor; broken cone rim on landward side.
    px, py = project(18.9364, -155.6464)
    yy, xx = np.indices(meters.shape)
    d_cove = np.hypot(xx - px, yy - py) * (M_PER_PX / 1000.0)
    cove = east & (d_cove < 0.45)
    rim = east & (d_cove >= 0.30) & (d_cove < 1.05)
    target = np.where(cove, np.minimum(target, 18.0), target)
    target = np.where(rim, np.maximum(target, 55.0), target)

    need = cape & ((meters < target * 0.9) | (meters < 20.0))
    meters = np.where(need, np.maximum(meters, target), meters)

    # Punaluʻu: black sand at water (keep low; ≥1 gray so beach ≠ missing).
    p_px, p_py = project(19.1358, -155.5044)
    d_pun = np.hypot(xx - p_px, yy - p_py) * (M_PER_PX / 1000.0)
    pun = (d_pun < 1.6) & ~ocean & (lat < 19.16)
    meters = np.where(pun, np.minimum(np.maximum(meters, 16.5), 16.5 + dist_km * 8.0), meters)

    meters[ocean] = 0
    return meters


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

    # Terrain-native Ka Lae cape (must run after the Kau flatten wiped it).
    meters = sculpt_ka_lae_cape(meters, ocean, dist_km, lat, lon)

    # Re-assert Nāʻālehu upslope vs Punaluʻu beach after cape sculpt.
    for clat, clon, elev, radius_km in [
        (19.062, -155.588, 200, 2.4),
        (19.1358, -155.5044, 8, 1.4),
    ]:
        px, py = project(clat, clon)
        dkm = np.hypot(xx - px, yy - py) * (M_PER_PX / 1000.0)
        wt = np.exp(-0.5 * (dkm / (radius_km * 0.55)) ** 2)
        wt = np.where(dkm < radius_km * 2.0, wt, 0)
        land = ~ocean
        meters = np.where(land, meters * (1 - wt) + elev * wt, meters)

    meters[ocean] = 0
    meters = np.clip(meters, 0, 4205)
    Image.fromarray(np.round(meters / 4205.0 * 255.0).astype(np.uint8), mode="L").save(HEIGHT)

    print(f"{'place':22} {'m':>7} {'dist':>6} {'y':>6}")
    for name, clat, clon in [
        ("Ocean View", 19.102, -155.767),
        ("Hi11 19.30", 19.30, -155.88),
        ("Captain Cook hwy", 19.498, -155.904),
        ("upslope refuge", 19.43, -155.88),
        ("Puuhonua", 19.4217, -155.9106),
        ("Kealakekua", 19.4786, -155.927),
        ("Ka Lae tip", 18.9108, -155.6813),
        ("Jump target", 18.9119, -155.6864),
        ("West lip dry", 18.920, -155.686),
        ("Papakolea", 18.9364, -155.6464),
        ("Punaluu", 19.1358, -155.5044),
        ("Naalehu", 19.062, -155.588),
        ("Hualalai", 19.6869, -155.8586),
        ("Mauna Loa", 19.4756, -155.6081),
    ]:
        px, py = project(clat, clon)
        yi, xi = int(round(py)), int(round(px))
        m = float(meters[yi, xi])
        print(f"{name:22} {m:7.0f} {dist_km[yi, xi]:6.1f} {m * 24 / 4205:6.3f}")

    # Sanity: cape land must have height; ocean must stay 0.
    cape = (lat < 19.0) & (lon > -155.74) & (lon < -155.62)
    land_cape = cape & ~ocean
    print(
        f"cape land mean m={meters[land_cape].mean():.1f} "
        f"zero_frac={(meters[land_cape] < 1).mean():.3f} "
        f"ocean_nonzero={(meters[cape & ocean] > 0).sum()}"
    )


if __name__ == "__main__":
    main()
