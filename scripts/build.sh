#!/bin/bash
# Build dsh-workspace-menu:
#   1. compile the Host half (src/index.ts -> lib/index.js + lib/types)
#   2. bundle the Client half (src/client/index.ts -> lib/client.js via tsdown)
# No DSH source checkout needed; tsc/tsdown come from devDependencies.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Building Host half (tsc) ==="
./node_modules/.bin/tsc -p tsconfig.host.json

echo "=== Building Client half (tsdown) ==="
./node_modules/.bin/tsdown

echo "=== Verifying Host lib ==="
node --check lib/index.js
echo "=== Build complete (${PWD}) ==="
