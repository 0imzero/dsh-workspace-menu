#!/bin/bash
# Build dsh-workspace-menu: host half is plain ESM (verified), client half is
# bundled by `npm run build:client` (tsdown). No DSH source checkout needed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f lib/index.js ]; then
  echo "build: lib/index.js missing" >&2
  exit 1
fi

node --check lib/index.js
echo "=== Host lib verified (${PWD}) ==="
