#!/usr/bin/env bash
set -e

PROC_PATTERN='postgrest_test\.conf|dispatcher/main\.js test|mailhog_test_auth'

cleanup_backend() {
  pkill -f "$PROC_PATTERN" 2>/dev/null || true
}

cleanup_backend
sleep 1

trap cleanup_backend EXIT INT TERM

npm run --prefix ../server build
npm run --prefix ../server test_playwright &

wait-on tcp:localhost:3000 -t 60000
playwright install
playwright test --config src/playwright.config.ts -j1 "$@"
