#!/bin/sh
# Local build script - Tekton uses different approach
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

IMAGE="$(sh "$SCRIPT_DIR/image-ref.sh")"

docker build \
  -f "$ROOT_DIR/deploy/docker/Dockerfile" \
  -t "$IMAGE" \
  "$ROOT_DIR/frontend"

echo "$IMAGE"
