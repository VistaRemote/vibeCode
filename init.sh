#!/usr/bin/env bash
# Clone all child repositories listed in .meta/manifest.json
# Usage: ./init.sh
#        ./init.sh --only shared,server,web
#        ./init.sh --required-only

set -euo pipefail
cd "$(dirname "$0")"
node tooling/scripts/init-repos.mjs "$@"
