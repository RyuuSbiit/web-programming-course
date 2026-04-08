#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-http://127.0.0.1:3000/health}"

echo "Checking ${TARGET_URL}"
curl --fail --silent --show-error "${TARGET_URL}" >/dev/null
echo "Healthcheck passed"

