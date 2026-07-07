from __future__ import annotations

import argparse
import sys
from pathlib import Path

from lib.web_archive_text_extract import extract_text_from_file


def rewrite_archive_texts(root: Path) -> tuple[int, int]:
    rewritten = 0
    skipped = 0

    for html_path in sorted(root.glob("*.html")):
        txt_path = html_path.with_suffix(".txt")
        text = extract_text_from_file(html_path)
        if not text:
            skipped += 1
            continue
        txt_path.write_text(text, encoding="utf-8-sig")
        rewritten += 1

    return rewritten, skipped


def main() -> None:
    parser = argparse.ArgumentParser(description="Re-extract web archive text files from archived HTML pages.")
    parser.add_argument(
        "--root",
        default="D:/blog/.worktrees/reference-wiki-phase1/public/uploads/galgame-90s-web-archive",
        help="Directory containing flattened .html archive files.",
    )
    parser.add_argument("--input", help="Single HTML file to extract.")
    parser.add_argument("--output", help="Optional output path for single-file extraction.")
    args = parser.parse_args()

    if args.input:
        input_path = Path(args.input)
        text = extract_text_from_file(input_path)
        if args.output:
            Path(args.output).write_text(text, encoding="utf-8-sig")
        else:
            sys.stdout.buffer.write(text.encode("utf-8"))
        return

    rewritten, skipped = rewrite_archive_texts(Path(args.root))
    print(f"rewritten={rewritten} skipped={skipped}")


if __name__ == "__main__":
    main()
