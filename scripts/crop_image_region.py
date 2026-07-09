#!/usr/bin/env python3
"""Crop a rectangular image region to WebP for manager visual editors."""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess


def _positive_int(value: str) -> int:
    parsed = int(value)
    if parsed <= 0:
        raise ValueError("Value must be positive.")
    return parsed


def parse_crop(value: str) -> tuple[int, int, int, int]:
    parts = value.split(",")
    if len(parts) != 4:
        raise ValueError("Crop must be exactly x,y,width,height.")
    x, y, width, height = (int(part.strip()) for part in parts)
    if width <= 0 or height <= 0:
        raise ValueError("Crop width and height must be positive.")
    return x, y, width, height


def probe_size(source: Path) -> tuple[int, int]:
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
        width, height = (int(part) for part in probe.stdout.strip().split("x", 1))
    except ValueError as error:
        raise RuntimeError(f"Failed to read image dimensions: {source}") from error
    if width <= 0 or height <= 0:
        raise RuntimeError(f"Image has invalid dimensions: {source}")
    return width, height


def crop_region(
    source: Path,
    destination: Path,
    crop: tuple[int, int, int, int],
    output_width: int,
    output_height: int,
    quality: int = 92,
) -> None:
    image_width, image_height = probe_size(source)
    x, y, width, height = crop
    width = min(width, image_width)
    height = min(height, image_height)
    x = max(0, min(x, image_width - width))
    y = max(0, min(y, image_height - height))

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
            f"crop={width}:{height}:{x}:{y},scale={output_width}:{output_height}:flags=lanczos",
            "-frames:v",
            "1",
            "-c:v",
            "libwebp",
            "-quality",
            str(quality),
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
    parser.add_argument("--output-width", type=_positive_int, default=1200)
    parser.add_argument("--output-height", type=_positive_int, default=800)
    parser.add_argument("--quality", type=_positive_int, default=92)
    args = parser.parse_args()

    if args.quality > 100:
        raise ValueError("Quality must be between 1 and 100.")

    crop_region(
        source=args.source,
        destination=args.destination,
        crop=parse_crop(args.crop),
        output_width=args.output_width,
        output_height=args.output_height,
        quality=args.quality,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
