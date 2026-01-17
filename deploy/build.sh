#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Conventions
DOCKERFILE="$ROOT_DIR/deploy/docker/Dockerfile"
CONTEXT="$ROOT_DIR/frontend"

# Determine image reference from VERSION file
VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")"
if echo "$VERSION" | grep -q SNAPSHOT; then
  PROJECT="internal"
else
  PROJECT="release"
fi
IMAGE="registry.rotaris.ch/$PROJECT/portfolio-website:$VERSION"

# Build with kaniko (Tekton) or docker (local)
if [ -n "$KANIKO_EXECUTOR" ]; then
  /kaniko/executor \
    --dockerfile="$DOCKERFILE" \
    --context="$CONTEXT" \
    --destination="$IMAGE"
else
  docker build -f "$DOCKERFILE" -t "$IMAGE" "$CONTEXT"
fi

echo -n "$IMAGE"
