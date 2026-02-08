#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")"

if echo "$VERSION" | grep -q SNAPSHOT; then
  PROJECT="internal"
else
  PROJECT="release"
fi

echo -n "registry.rotaris.ch/$PROJECT/portfolio-website:$VERSION"
