#!/usr/bin/env bash
set -euo pipefail

PORT=44022

pkill -f "python3 -m http.server ${PORT}" >/dev/null 2>&1 || true
pkill -f "astro preview --host 127.0.0.1 --port ${PORT}" >/dev/null 2>&1 || true

pnpm --config.minimum-release-age=0 run build
python3 -m http.server "${PORT}" --bind 127.0.0.1 -d dist
