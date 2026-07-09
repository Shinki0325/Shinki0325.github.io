#!/usr/bin/env python3
"""Crop a manually selected square region to a WebP avatar."""

from __future__ import annotations

import argparse
from pathlib import Path


def parse_manual_crop(value: str) -> tuple[int, int, int]:
    parts = value.split(",")
    if len(parts) != 3:
        raise ValueError("Crop must be exactly x,y,size.")

    try:
        x, y, size = (int(part.strip()) for part in parts)
    except ValueError as error:
        raise ValueError("Crop values must be integers.") from error

    if size <= 0:
        raise ValueError("Crop size must be positive.")

    return x, y, size


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(value, upper))


def crop_square(
    source: Path,
    destination: Path,
    crop: tuple[int, int, int],
    output_size: int = 240,
) -> None:
    import cv2

    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Failed to read image: {source}")

    image_h, image_w = image.shape[:2]
    if image_w <= 0 or image_h <= 0:
        raise RuntimeError(f"Image has invalid dimensions: {source}")

    crop_x, crop_y, crop_size = crop
    side = min(crop_size, image_w, image_h)
    x = _clamp(crop_x, 0, image_w - side)
    y = _clamp(crop_y, 0, image_h - side)

    cropped = image[y : y + side, x : x + side]
    resized = cv2.resize(cropped, (output_size, output_size), interpolation=cv2.INTER_AREA)
    destination.parent.mkdir(parents=True, exist_ok=True)

    ok = cv2.imwrite(str(destination), resized, [cv2.IMWRITE_WEBP_QUALITY, 92])
    if not ok:
        raise RuntimeError(f"Failed to write image: {destination}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("crop")
    parser.add_argument("--output-size", type=int, default=240)
    args = parser.parse_args()

    if args.output_size <= 0:
        raise ValueError("Output size must be positive.")

    crop_square(
        source=args.source,
        destination=args.destination,
        crop=parse_manual_crop(args.crop),
        output_size=args.output_size,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
