#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TAG="${1:-local-$(date +%Y%m%d%H%M%S)}"
STATE_FILE=".release-state"
PREVIOUS_TAG="none"

if [[ -f "$STATE_FILE" ]]; then
  PREVIOUS_TAG="$(cat "$STATE_FILE")"
fi

echo "Previous tag: $PREVIOUS_TAG"
echo "Building image tag: $TAG"

export APP_IMAGE_TAG="$TAG"
docker build -t "quiz-backend:$TAG" .
docker compose up -d
bash ./scripts/healthcheck.sh

echo "$PREVIOUS_TAG" > "${STATE_FILE}.previous"
echo "$TAG" > "$STATE_FILE"
echo "Release completed with tag $TAG"

