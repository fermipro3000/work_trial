#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# run.sh — one-shot launcher for the NFT Airdrop Platform demo
# ----------------------------------------------------------------------------
# What it does:
#   1. Installs deps (idempotent — only runs if node_modules is missing)
#   2. Initializes data.json (creates it if missing)
#   3. Starts the API on :4000 and the Next.js dev server on :3000
#   4. Keeps both alive; Ctrl-C cleanly stops both
#
# VPS-friendly: caps node memory so the build doesn't OOM on 1-2GB plans,
# disables Next.js telemetry, and uses dev mode (lighter than `next build`).
# ----------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")"

# --- config -----------------------------------------------------------------
PORT_API="${PORT:-4000}"
PORT_WEB="${PORT_WEB:-3000}"
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export NODE_OPTIONS
export NEXT_TELEMETRY_DISABLED=1
export PORT="$PORT_API"

# --- preflight --------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "✗ node is not installed. Install Node.js 18+ first." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "✗ Node 18+ required (you have $(node -v))." >&2
  exit 1
fi

install_deps() {
  echo "→ Installing dependencies (this can take a minute on first run)..."
  # Retry loop: some VPS / NAS mounts (CIFS, NFS, FUSE) return ENOTEMPTY
  # during concurrent access. Retry with a clean slate up to 3 times.
  for attempt in 1 2 3; do
    rm -rf node_modules frontend/node_modules package-lock.json frontend/package-lock.json
    if npm install --no-audit --no-fund --prefer-offline; then
      return 0
    fi
    echo "  install attempt $attempt failed, retrying in 3s..."
    sleep 3
  done
  echo "✗ npm install failed after 3 attempts" >&2
  return 1
}

if [ ! -d node_modules ] || [ ! -d frontend/node_modules ]; then
  install_deps
else
  echo "→ node_modules present, skipping install"
fi

if [ ! -f .env ]; then
  echo "→ Creating .env from .env.example"
  cp .env.example .env
fi

# --- data store -------------------------------------------------------------
if [ ! -f data.json ]; then
  echo "→ Seeding data.json with sample campaigns"
  npm run db:seed --silent || true
fi

# --- start ------------------------------------------------------------------
echo "→ Starting API on :$PORT_API and Next.js on :$PORT_WEB"
echo "  Open http://localhost:$PORT_WEB in your browser"
echo "  API health: http://localhost:$PORT_API/health"
echo "  Press Ctrl-C to stop."

cleanup() {
  echo ""
  echo "→ Shutting down..."
  [ -n "${API_PID:-}" ] && kill "$API_PID" 2>/dev/null || true
  [ -n "${WEB_PID:-}" ] && kill "$WEB_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# Start API
node server.js &
API_PID=$!

# Start Next dev (from frontend/)
( cd frontend && npx next dev -p "$PORT_WEB" ) &
WEB_PID=$!

# Wait for either to exit
wait -n $API_PID $WEB_PID 2>/dev/null || true
cleanup
