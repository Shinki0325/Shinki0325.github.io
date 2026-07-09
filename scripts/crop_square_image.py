#!/usr/bin/env python3
"""Crop a manually selected square region to a WebP avatar."""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess


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
    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "csv=s=x:p=0",
            str(source),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    try:
        image_w, image_h = (int(part) for part in probe.stdout.strip().split("x", 1))
    except ValueError as error:
        raise RuntimeError(f"Failed to read image dimensions: {source}") from error

    if image_w <= 0 or image_h <= 0:
        raise RuntimeError(f"Image has invalid dimensions: {source}")

    crop_x, crop_y, crop_size = crop
    side = min(crop_size, image_w, image_h)
    x = _clamp(crop_x, 0, image_w - side)
    y = _clamp(crop_y, 0, image_h - side)

    destination.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(source),
            "-vf",
            f"crop={side}:{side}:{x}:{y},scale={output_size}:{output_size}:flags=lanczos",
            "-frames:v",
            "1",
            "-c:v",
            "libwebp",
            "-quality",
            "92",
            "-compression_level",
            "6",
            str(destination),
        ],
        check=True,
    )


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
