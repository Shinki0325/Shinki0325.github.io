#!/usr/bin/env python3
"""Crop character birthday avatars with anime-face detection.

The approved default is the compact face crop used in
.tmp/avatar-preview/anime-face-crops/anime-face-preview.png.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class CropStyle:
    face_scale: float
    top_face_offset: float


CROP_STYLES = {
    "tight": CropStyle(face_scale=2.35, top_face_offset=0.53),
    "normal": CropStyle(face_scale=2.85, top_face_offset=0.72),
    "loose": CropStyle(face_scale=3.35, top_face_offset=0.95),
}


def clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(value, upper))


def crop_from_face(
    image_size: tuple[int, int],
    face: tuple[int, int, int, int],
    style: CropStyle = CROP_STYLES["tight"],
) -> tuple[int, int, int]:
    image_w, image_h = image_size
    face_x, face_y, face_w, face_h = face
    side = min(image_w, image_h, round(face_w * style.face_scale))
    face_center_x = face_x + face_w / 2
    x = round(face_center_x - side / 2)
    y = round(face_y - face_h * style.top_face_offset)
    return (
        clamp(x, 0, image_w - side),
        clamp(y, 0, image_h - side),
        side,
    )


def detect_anime_faces(image: np.ndarray, cascade_path: Path) -> list[tuple[int, int, int, int]]:
    import cv2

    cascade = cv2.CascadeClassifier(str(cascade_path))
    if cascade.empty():
        raise RuntimeError(f"Failed to load anime face cascade: {cascade_path}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = cascade.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=3, minSize=(24, 24))
    return [tuple(map(int, face)) for face in faces]


def choose_face(faces: Iterable[tuple[int, int, int, int]]) -> tuple[int, int, int, int] | None:
    candidates = list(faces)
    if not candidates:
        return None
    return sorted(candidates, key=lambda face: (face[2] * face[3], -face[1]), reverse=True)[0]


def crop_image(
    raw_path: Path,
    out_path: Path,
    cascade_path: Path,
    style: CropStyle = CROP_STYLES["tight"],
    output_size: int = 240,
) -> dict:
    import cv2

    image = cv2.imread(str(raw_path), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Failed to read image: {raw_path}")
    image_h, image_w = image.shape[:2]
    face = choose_face(detect_anime_faces(image, cascade_path))
    if face is None:
        return {
            "raw": str(raw_path),
            "out": str(out_path),
            "mode": "missing-face",
            "image": [image_w, image_h],
        }

    crop_x, crop_y, side = crop_from_face((image_w, image_h), face, style)
    cropped = image[crop_y : crop_y + side, crop_x : crop_x + side]
    resized = cv2.resize(cropped, (output_size, output_size), interpolation=cv2.INTER_AREA)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    ok = cv2.imwrite(str(out_path), resized, [cv2.IMWRITE_WEBP_QUALITY, 92])
    if not ok:
        raise RuntimeError(f"Failed to write image: {out_path}")
    return {
        "raw": str(raw_path),
        "out": str(out_path),
        "mode": "anime-face-tight",
        "image": [image_w, image_h],
        "face": list(face),
        "crop": [crop_x, crop_y, side],
    }


def iter_published_avatars(root: Path) -> Iterable[Path]:
    return sorted(root.glob("*/*.webp"))


def find_raw_for_avatar(avatar: Path, raw_roots: list[Path]) -> Path | None:
    stem = avatar.stem
    candidates = []
    for raw_root in raw_roots:
        candidates.extend(raw_root.glob(f"{stem}-manual.*"))
        candidates.extend(raw_root.glob(f"{stem}.*"))
        candidates.extend(raw_root.glob(f"{stem}-*.jpg"))
        candidates.extend(raw_root.glob(f"{stem}-*.png"))
        candidates.extend(raw_root.glob(f"{stem}-*.webp"))
    return sorted(candidates)[0] if candidates else None


def write_review_sheet(manifest: list[dict], review_path: Path, max_columns: int = 12) -> None:
    import cv2
    import numpy as np

    successes = [item for item in manifest if item.get("mode") == "anime-face-tight"]
    if not successes:
        return
    tile = 96
    label_h = 26
    gap = 10
    columns = min(max_columns, len(successes))
    rows = math.ceil(len(successes) / columns)
    canvas_h = rows * (tile + label_h + gap) + gap
    canvas_w = columns * (tile + gap) + gap
    canvas = np.full((canvas_h, canvas_w, 3), 246, dtype=np.uint8)
    for index, item in enumerate(successes):
        img = cv2.imread(item["out"], cv2.IMREAD_COLOR)
        if img is None:
            continue
        img = cv2.resize(img, (tile, tile), interpolation=cv2.INTER_AREA)
        row, column = divmod(index, columns)
        x = gap + column * (tile + gap)
        y = gap + row * (tile + label_h + gap)
        canvas[y : y + tile, x : x + tile] = img
        label = Path(item["out"]).stem[-12:]
        cv2.putText(canvas, label, (x, y + tile + 17), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (80, 80, 80), 1, cv2.LINE_AA)
    review_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(review_path), canvas)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--avatar-root", default="public/uploads/character-birthdays")
    parser.add_argument("--raw-root", action="append", default=[".tmp/avatar-work/new-birthday-batch/raw-avatars", ".tmp/avatar-work/raw"])
    parser.add_argument("--cascade", default=".tmp/avatar-tools/lbpcascade_animeface.xml")
    parser.add_argument("--style", choices=sorted(CROP_STYLES), default="tight")
    parser.add_argument("--manifest", default=".tmp/avatar-work/anime-face-tight-manifest.json")
    parser.add_argument("--failures", default=".tmp/avatar-work/anime-face-tight-failures.csv")
    parser.add_argument("--review", default=".tmp/avatar-work/anime-face-tight-review.png")
    args = parser.parse_args()

    avatar_root = Path(args.avatar_root)
    raw_roots = [Path(raw_root) for raw_root in args.raw_root]
    cascade_path = Path(args.cascade)
    manifest = []
    failures = []

    for avatar in iter_published_avatars(avatar_root):
        raw_path = find_raw_for_avatar(avatar, raw_roots)
        if raw_path is None:
            failures.append({"avatar": str(avatar), "reason": "missing-raw"})
            continue
        result = crop_image(raw_path, avatar, cascade_path, CROP_STYLES[args.style])
        manifest.append(result)
        if result["mode"] != "anime-face-tight":
            failures.append({"avatar": str(avatar), "raw": str(raw_path), "reason": result["mode"]})

    manifest_path = Path(args.manifest)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    failures_path = Path(args.failures)
    failures_path.parent.mkdir(parents=True, exist_ok=True)
    with failures_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["avatar", "raw", "reason"])
        writer.writeheader()
        writer.writerows(failures)

    write_review_sheet(manifest, Path(args.review))
    print(json.dumps({"processed": len(manifest), "failures": len(failures)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
