#!/usr/bin/env python3
"""Convert a source image to a WebP file for manager uploads."""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess


def convert_image_to_webp(source: Path, destination: Path, quality: int = 92) -> None:
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
    parser.add_argument("--quality", type=int, default=92)
    args = parser.parse_args()

    if not 1 <= args.quality <= 100:
        raise ValueError("Quality must be between 1 and 100.")

    convert_image_to_webp(args.source, args.destination, args.quality)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
