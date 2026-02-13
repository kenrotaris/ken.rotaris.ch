#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DOCKERFILE="deploy/docker/Dockerfile"
CONTEXT="frontend"

VERSION=$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")
if echo "$VERSION" | grep -q "SNAPSHOT"; then
  PROJECT="internal"
else
  PROJECT="release"
fi

IMAGE_REF="registry.rotaris.ch/$PROJECT/portfolio-website:$VERSION"

if command -v /kaniko/executor >/dev/null 2>&1; then
  echo "Building with kaniko: $IMAGE_REF" >&2
  /kaniko/executor \
    --dockerfile="$ROOT_DIR/$DOCKERFILE" \
    --context="$ROOT_DIR/$CONTEXT" \
    --destination="$IMAGE_REF"
else
  echo "Building with docker: $IMAGE_REF" >&2
  docker build \
    -f "$ROOT_DIR/$DOCKERFILE" \
    -t "$IMAGE_REF" \
    "$ROOT_DIR/$CONTEXT"
fi

echo "$IMAGE_REF"
