#!/usr/bin/env bash
# Format JS/TS sources with Prettier (skips android/ios native dirs).
set -euo pipefail
cd "$(dirname "$0")"
npx --yes prettier@3.3.3 --write \
  '**/*.{ts,tsx,js,jsx,json}' \
  --ignore-path .gitignore \
  --ignore-path <(printf 'android/\nios/\n')
