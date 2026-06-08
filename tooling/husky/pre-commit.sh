#!/usr/bin/env sh
# VistaRemote pre-commit: staged lint + unit tests (run from sub-repo root)
set -e

echo "▶ biome (staged)..."
pnpm exec biome check --staged --files-ignore-unknown=true --no-errors-on-unmatched

echo "▶ unit tests (rstest)..."
pnpm test

echo "✓ pre-commit passed"
