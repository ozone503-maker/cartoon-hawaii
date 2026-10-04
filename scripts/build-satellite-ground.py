#!/usr/bin/env python3
"""Build the satellite ground picture the flight scene drapes over the island.

  python3 scripts/build-satellite-ground.py DIR

DIR holds true-colour exports of Hawaiʻi Island, named full.*, south.*, north.*,
east.*, west.* (any image extension). `full` shows the whole island; the four
pieces are sharper crops of the same source. The pieces are lined up to `full`,
and `full` is lined up to public/maps/hawaii-usgs.jpg, so the result sits in the
exact frame the game already uses (geo.ts, latLonToWorld). Nothing about the
flight, world size, or pin positions changes.

Writes public/maps/hawaii-satellite.jpg (3578x4096) and hawaii-satellite-2k.jpg.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parents[1]
MAPS = ROOT / "public/maps"
FRAME = (1118, 1280)  # MAP_SIZE in src/lib/hawaii/geo.ts
SCALE = 3.2  # texels per game-map pixel. 4096 tall is the safe phone limit.
FEATHER = 90.0  # texels of cross-fade at the edge of each sharper piece
SEA_TARGET = np.array([6.0, 32.0, 82.0])  # the game's sea colour (old atlas)
SATURATION = 1.15

PIECES = ["south", "west", "east", "north"]


def find(folder: Path, stem: str) -> Path:
    for p in sorted(folder.iterdir()):
        if p.stem.lower() == stem and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}:
            return p
    raise SystemExit(f"missing {stem}.* in {folder}")


def load(p: Path) -> np.ndarray:
    return np.array(Image.open(p).convert("RGB"))


def register(a: np.ndarray, b: np.ndarray, sa: float, sb: float, name: str) -> np.ndarray:
    """Affine that maps pixels of a onto pixels of b (SIFT + RANSAC)."""
    clahe = cv2.createCLAHE(3.0, (8, 8))

    def prep(im: np.ndarray, s: float) -> np.ndarray:
        g = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)
        return clahe.apply(cv2.resize(g, None, fx=s, fy=s, interpolation=cv2.INTER_AREA))

    sift = cv2.SIFT_create(nfeatures=30000)
    ka, da = sift.detectAndCompute(prep(a, sa), None)
    kb, db = sift.detectAndCompute(prep(b, sb), None)
    good = [m for m, n in cv2.BFMatcher().knnMatch(da, db, k=2) if m.distance < 0.8 * n.distance]
    pa = np.float32([ka[m.queryIdx].pt for m in good]) / sa
    pb = np.float32([kb[m.trainIdx].pt for m in good]) / sb
    M, inl = cv2.estimateAffine2D(pa, pb, ransacReprojThreshold=4.0, maxIters=10000, confidence=0.9999)
    if M is None or inl.sum() < 50:
        raise SystemExit(f"{name}: could not line up ({len(good)} matches)")
    err = np.linalg.norm(pa[inl.ravel() == 1] @ M[:, :2].T + M[:, 2] - pb[inl.ravel() == 1], axis=1)
    print(f"  {name}: {int(inl.sum())} matches, median error {np.median(err):.2f} px")
    return np.vstack([M, [0, 0, 1]])


def water(im: np.ndarray) -> np.ndarray:
    r, g, b = (im[..., i].astype(np.int16) for i in range(3))
    return (b > r + 12) & (b > g - 5)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    folder = Path(sys.argv[1])
    full = load(find(folder, "full"))
    game = load(MAPS / "hawaii-usgs.jpg")

    print("lining up")
    to_game = register(full, game, 0.5, 1.0, "full -> game map")
    sm = np.diag([SCALE, SCALE, 1.0])
    tw, th = round(FRAME[0] * SCALE), round(FRAME[1] * SCALE)

    layers = [("full", full, to_game)]
    for k in PIECES:
        img = load(find(folder, k))
        layers.append((k, img, to_game @ register(img, full, 0.5, 0.5, f"{k} -> full")))

    def warp(img: np.ndarray, m: np.ndarray):
        a = sm @ m
        f = math.sqrt(abs(np.linalg.det(a[:2, :2])))
        if f < 0.95:  # shrinking: average first so the warp does not alias
            img = cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
            a = a @ np.diag([1 / f, 1 / f, 1])
        out = cv2.warpAffine(img, a[:2], (tw, th), flags=cv2.INTER_CUBIC)
        ok = cv2.warpAffine(np.full(img.shape[:2], 255, np.uint8), a[:2], (tw, th)) > 250
        return out, ok, f

    base, base_ok, f0 = warp(full, to_game)
    ocean = np.median(base[:200, -300:].reshape(-1, 3), axis=0)
    out = base.astype(np.float32)
    out[~base_ok] = ocean
    print(f"compositing at {tw}x{th} (about {125.0 / SCALE:.0f} m per texel)")
    pieces = []
    for k, img, m in layers[1:]:
        o, ok, f = warp(img, m)
        pieces.append((f, k, o, ok))
    for f, k, o, ok in sorted(pieces, key=lambda t: -t[0]):  # sharpest last
        d = cv2.distanceTransform(ok.astype(np.uint8), cv2.DIST_L2, 5)
        w = np.clip(d / FEATHER, 0, 1)[..., None]
        out = out * (1 - w) + o.astype(np.float32) * w
        print(f"  {k}: native detail x{1 / f:.2f} of the frame")
    res = np.clip(out + 0.5, 0, 255).astype(np.uint8)

    # Grade: sea toward the game's own water, land a touch more colourful.
    wm = water(res).astype(np.uint8)
    n, lab = cv2.connectedComponents(wm)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    sea = np.isin(lab, edge[edge > 0]).astype(np.float32)
    soft = cv2.GaussianBlur(sea, (0, 0), 6)[..., None]
    far_sea = np.median(res[sea > 0.5].reshape(-1, 3)[::97], axis=0)
    graded = res.astype(np.float32)
    gray = graded.mean(-1, keepdims=True)
    graded = np.where(soft > 0.001, graded, gray + (graded - gray) * SATURATION)
    graded = graded + (SEA_TARGET - far_sea) * soft
    final = np.clip(graded + 0.5, 0, 255).astype(np.uint8)

    Image.fromarray(final).save(MAPS / "hawaii-satellite.jpg", quality=90, optimize=True, progressive=True)
    small = cv2.resize(final, (tw // 2, th // 2), interpolation=cv2.INTER_AREA)
    Image.fromarray(small).save(MAPS / "hawaii-satellite-2k.jpg", quality=90, optimize=True, progressive=True)
    for name in ("hawaii-satellite.jpg", "hawaii-satellite-2k.jpg"):
        print(f"wrote {name}: {(MAPS / name).stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
