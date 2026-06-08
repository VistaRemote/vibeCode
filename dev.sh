#!/usr/bin/env bash
# VistaRemote one-shot local bootstrap
# Usage: ./dev.sh
#        ./dev.sh --skip-docker
#        ./dev.sh --env dev --with-ai

set -euo pipefail
cd "$(dirname "$0")"
node tooling/scripts/dev-up.mjs "$@"
