#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT/.tmp"
mkdir -p "$LOG_DIR"

echo "Stopping old manager processes on 4173/4318..."
fuser -k 4173/tcp 4318/tcp >/dev/null 2>&1 || true
sleep 1

echo "Starting manager API..."
setsid bash -lc "cd '$ROOT/manager' && exec ./node_modules/.bin/tsx server/index.ts" \
  > "$LOG_DIR/manager-api.log" 2>&1 < /dev/null &
echo $! > "$LOG_DIR/manager-api.pid"

echo "Starting manager Vite..."
setsid bash -lc "cd '$ROOT/manager' && exec ./node_modules/.bin/vite --host 127.0.0.1 --port 4173" \
  > "$LOG_DIR/manager-vite.log" 2>&1 < /dev/null &
echo $! > "$LOG_DIR/manager-vite.pid"

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts=40

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$label is ready: $url"
      return 0
    fi
    sleep 0.5
  done

  echo "$label did not become ready: $url" >&2
  echo "--- API log ---" >&2
  tail -n 40 "$LOG_DIR/manager-api.log" >&2 || true
  echo "--- Vite log ---" >&2
  tail -n 40 "$LOG_DIR/manager-vite.log" >&2 || true
  return 1
}

wait_for_url "http://127.0.0.1:4318/api/system" "Manager API"
wait_for_url "http://127.0.0.1:4173/" "Manager UI"

SERVED_MODULE="$LOG_DIR/manager-appearance-served.js"
curl -fsS "http://127.0.0.1:4173/src/pages/AppearanceEditor.tsx" > "$SERVED_MODULE"

required_markers=(
  "实时整页预览"
  "preview-nav-height"
  "appearance-preview__player"
  "appearance-preview__lyric"
  "appearance-preview__profile-top"
  "updateSearchBar"
  "updateProfileCard"
  "updateNavigation"
  "updateMusicPlayer"
  "updateLyricBar"
)

for marker in "${required_markers[@]}"; do
  if ! grep -Fq "$marker" "$SERVED_MODULE"; then
    echo "Manager UI is stale; missing marker: $marker" >&2
    echo "Fetched module: $SERVED_MODULE" >&2
    exit 1
  fi
done

echo "Manager UI has the latest appearance editor markers."
echo "Open: http://127.0.0.1:4173/"
