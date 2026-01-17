# Deploy Scripts

Convention-over-configuration scripts for building and deploying.

## Scripts

### build.sh
Builds the container image. Works locally (docker) and in Tekton (kaniko).

**Conventions:**
- Dockerfile: `deploy/docker/Dockerfile`
- Context: `frontend/`
- Image: `registry.rotaris.ch/{internal|release}/portfolio-website:{VERSION}`
  - SNAPSHOT in VERSION → internal project
  - Otherwise → release project

**Usage:**
```bash
./build.sh
# Outputs: registry.rotaris.ch/release/portfolio-website:1.0.0
```

### update-deployment.sh
Updates ArgoCD deployment manifest with new image.

**Conventions:**
- Deployment file: `argocd-platform/applications/manifests/dev-website/deployment.yaml`
- Git user: cicd@rotaris.ch

**Required env vars:**
- `IMAGE_REFERENCE`: Full image reference
- `ARGOCD_WORKSPACE`: Path to ArgoCD repo

**Usage:**
```bash
IMAGE_REFERENCE="registry.rotaris.ch/release/portfolio-website:1.0.0" \
ARGOCD_WORKSPACE="/tmp/argocd-repo" \
./update-deployment.sh
```

## How Tekton Uses These

1. Clone repo
2. Call `deploy/build.sh` → builds and outputs image reference
3. If deploy enabled: Call `deploy/update-deployment.sh` → updates GitOps repo

That's it!
