#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STATE_FILE=".release-state.previous"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "No previous release tag found"
  exit 1
fi

ROLLBACK_TAG="$(cat "$STATE_FILE")"

if [[ "$ROLLBACK_TAG" == "none" || -z "$ROLLBACK_TAG" ]]; then
  echo "Rollback tag is not available"
  exit 1
fi

echo "Rolling back to $ROLLBACK_TAG"
export APP_IMAGE_TAG="$ROLLBACK_TAG"
docker compose up -d
bash ./scripts/healthcheck.sh
echo "$ROLLBACK_TAG" > .release-state
echo "Rollback completed"

