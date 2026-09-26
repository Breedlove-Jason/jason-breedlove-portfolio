#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export HUSKY=0
export DATABASE_CLIENT=sqlite
# setup.py refuses to overwrite an existing destination.
python3 keyforge/setup.py .keyforge-runtime
python3 .keyforge-runtime/keyforge/apply-render.py
cd .keyforge-runtime
npm ci --include=dev
npm run test:code-lab
npm run compile
npm run build -- --no-stats
