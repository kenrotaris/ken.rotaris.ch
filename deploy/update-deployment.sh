#!/bin/sh
set -e

# Convention: deployment file path
DEPLOYMENT_FILE="argocd-platform/applications/manifests/dev-website/deployment.yaml"

if [ -z "$IMAGE_REFERENCE" ]; then
  echo "Error: IMAGE_REFERENCE environment variable required"
  exit 1
fi

if [ -z "$ARGOCD_WORKSPACE" ]; then
  echo "Error: ARGOCD_WORKSPACE environment variable required"
  exit 1
fi

cd "$ARGOCD_WORKSPACE"

echo "Updating $DEPLOYMENT_FILE with image: $IMAGE_REFERENCE"

yq e -i ".spec.template.spec.containers[0].image = \"$IMAGE_REFERENCE\"" "$DEPLOYMENT_FILE"

git config user.email "cicd@rotaris.ch"
git config user.name "CICD"
git add "$DEPLOYMENT_FILE"

# Commit only if there are changes
if git diff --cached --quiet; then
  echo "No changes to deployment file (already at $IMAGE_REFERENCE)"
else
  git commit -m "Update deployment image to $(echo "$IMAGE_REFERENCE" | cut -d: -f2)"
  git push origin main
  echo "Deployment updated and pushed"
fi
