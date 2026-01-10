# CI/CD Pipeline Setup Guide

This guide will help you set up the automated CI/CD pipeline for ken.rotaris.ch using Dagger.io and Tekton.

## Architecture Overview

```
Bitbucket Push → Tekton EventListener → Pipeline → Dagger
                                                      ↓
                                               Build Images
                                                      ↓
                                           Push to Registry
                                                      ↓
                                         [IF main branch]
                                                      ↓
                                      Update ArgoCD Manifests
                                                      ↓
                                          Send Email Notification
```

## Prerequisites

- Kubernetes cluster with Tekton installed
- ArgoCD installed and configured
- Bitbucket repository access
- Registry credentials (registry.rotaris.ch)
- SMTP credentials for email notifications
- SSH key for git operations

## Step 1: Create Kubernetes Secrets

Run these commands in your cluster:

### 1.1 Registry Credentials

```bash
kubectl create secret generic registry-credentials \
  -n tekton-pipelines \
  --from-literal=username=<your-registry-username> \
  --from-literal=password=<your-registry-password>
```

### 1.2 Git SSH Key

First, generate an SSH key if you don't have one:

```bash
ssh-keygen -t ed25519 -C "tekton-ci@rotaris.ch" -f ~/.ssh/tekton_ci
```

Add the public key (`~/.ssh/tekton_ci.pub`) to your Bitbucket account as a read/write deployment key.

Then create the secret:

```bash
kubectl create secret generic git-ssh-key \
  -n tekton-pipelines \
  --from-file=private-key=$HOME/.ssh/tekton_ci
```

### 1.3 SMTP Credentials

```bash
kubectl create secret generic smtp-credentials \
  -n tekton-pipelines \
  --from-literal=host=<smtp-host> \
  --from-literal=port=<smtp-port> \
  --from-literal=username=<smtp-username> \
  --from-literal=password=<smtp-password>
```

**Example for Gmail:**
```bash
kubectl create secret generic smtp-credentials \
  -n tekton-pipelines \
  --from-literal=host=smtp.gmail.com \
  --from-literal=port=587 \
  --from-literal=username=your-email@gmail.com \
  --from-literal=password=your-app-password
```

## Step 2: Deploy Tekton Resources

Apply the Tekton pipeline configurations:

```bash
cd /home/ken/projects/ken.rotaris.ch
kubectl apply -f .tekton/
```

This will create:
- ServiceAccount and RBAC for Tekton Triggers
- EventListener for Bitbucket webhooks
- TriggerBinding to extract branch name
- TriggerTemplate to create PipelineRuns
- Pipeline definition
- Dagger task

Verify the resources:

```bash
kubectl get eventlisteners -n tekton-pipelines
kubectl get triggers -n tekton-pipelines
kubectl get pipelines -n tekton-pipelines
kubectl get tasks -n tekton-pipelines
```

## Step 3: Deploy EventListener Ingress

Apply the ingress configuration from the ArgoCD repo:

```bash
cd /home/ken/projects/argocd
kubectl apply -f argocd-platform/infrastructure/tekton/eventlistener-ingress.yaml
```

Or commit and let ArgoCD sync it automatically.

Verify the ingress:

```bash
kubectl get ingress -n tekton-pipelines
```

## Step 4: Configure Bitbucket Webhook

1. Go to your Bitbucket repository settings
2. Navigate to **Webhooks** section
3. Click **Add webhook**
4. Configure:
   - **Title**: Tekton CI/CD Pipeline
   - **URL**: `https://tekton.rotaris.ch/bitbucket-listener`
   - **Status**: Active
   - **Triggers**: Check "Repository push"
   - **SSL/TLS**: Leave enabled (certificate verification)
5. Click **Save**

## Step 5: Test the Pipeline

### 5.1 Test Locally (Optional)

You can test the Dagger pipeline locally before pushing:

```bash
cd /home/ken/projects/ken.rotaris.ch

# Install Dagger CLI
curl -L https://dl.dagger.io/dagger/install.sh | sh

# Test building frontend
dagger call build-frontend \
  --source=. \
  --tag=test \
  --registry-username=<username> \
  --registry-password=env:REGISTRY_PASSWORD

# Test full pipeline (won't update manifests for non-main branch)
dagger call pipeline \
  --source=. \
  --branch=test-branch \
  --registry-username=<username> \
  --registry-password=env:REGISTRY_PASSWORD \
  --git-ssh-key=file:$HOME/.ssh/tekton_ci \
  --smtp-host=smtp.gmail.com \
  --smtp-port=587 \
  --smtp-username=your-email@gmail.com \
  --smtp-password=env:SMTP_PASSWORD
```

### 5.2 Test via Webhook

1. Make a small change to your code
2. Commit and push to a feature branch:
   ```bash
   git checkout -b test-pipeline
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test CI/CD pipeline"
   git push origin test-pipeline
   ```

3. Check the pipeline execution:
   ```bash
   # Watch for new PipelineRuns
   kubectl get pipelineruns -n tekton-pipelines -w

   # View logs of the latest run
   tkn pipelinerun logs -n tekton-pipelines -f
   ```

4. Check your email for build notification

5. Verify images in registry:
   ```bash
   curl https://registry.rotaris.ch/v2/dev-website-frontend/tags/list
   curl https://registry.rotaris.ch/v2/dev-website-backend/tags/list
   ```

### 5.3 Test Main Branch Deployment

1. Merge your test branch to main:
   ```bash
   git checkout main
   git merge test-pipeline
   git push origin main
   ```

2. Watch the pipeline:
   ```bash
   tkn pipelinerun logs -n tekton-pipelines -f
   ```

3. Verify ArgoCD manifest update:
   ```bash
   cd /home/ken/projects/argocd
   git pull origin main
   cat argocd-platform/applications/dev-website/frontend.yaml | grep image:
   cat argocd-platform/applications/dev-website/backend.yaml | grep image:
   ```

4. Check ArgoCD sync status:
   ```bash
   kubectl get application kenrotaris -n argocd
   ```

5. Verify deployment:
   ```bash
   kubectl get pods -n kenrotaris
   curl https://ken.rotaris.ch
   ```

6. Check email for deployment success notification

## Troubleshooting

### Pipeline Fails Immediately

Check EventListener logs:
```bash
kubectl logs -n tekton-pipelines -l eventlistener=bitbucket-listener -f
```

### Dagger Build Fails

Check the PipelineRun logs:
```bash
tkn pipelinerun logs -n tekton-pipelines <pipelinerun-name>
```

### Git Push Fails

Verify SSH key permissions:
```bash
kubectl get secret git-ssh-key -n tekton-pipelines -o jsonpath='{.data.private-key}' | base64 -d | ssh-keygen -y -f /dev/stdin
```

Ensure the public key is added to Bitbucket with write access.

### Email Not Sent

Check SMTP credentials:
```bash
kubectl get secret smtp-credentials -n tekton-pipelines -o yaml
```

Test SMTP connectivity from a pod:
```bash
kubectl run -n tekton-pipelines smtp-test --rm -it --image=alpine -- sh
apk add curl
curl -v --url 'smtp://smtp.gmail.com:587' --mail-from 'your-email@gmail.com' --mail-rcpt 'ken@rotaris.ch' --upload-file - <<< 'Subject: Test'
```

### ArgoCD Not Syncing

Check ArgoCD application status:
```bash
kubectl get application kenrotaris -n argocd -o yaml
```

Verify auto-sync is enabled in the application manifest.

## Email Notifications

You will receive emails in these scenarios:

### Build Failure (Any Branch)

```
Subject: [FAILED] Build for branch feature-xyz

Build failed for ken.rotaris.ch
Branch: feature-xyz

Errors:
frontend: failed to build frontend: ...

View logs: https://tekton.rotaris.ch
```

### Successful Deployment (Main Branch Only)

```
Subject: [SUCCESS] Deployed ken.rotaris.ch

Successfully deployed ken.rotaris.ch
Branch: main

Images:
- registry.rotaris.ch/dev-website-frontend:main
- registry.rotaris.ch/dev-website-backend:main

Site: https://ken.rotaris.ch
ArgoCD: https://argocd.rotaris.ch
```

## Maintenance

### Update Dagger Version

Edit `.tekton/task-dagger.yaml` and update the Dagger version in the download URL.

### Change SMTP Provider

Update the SMTP secret:
```bash
kubectl delete secret smtp-credentials -n tekton-pipelines
kubectl create secret generic smtp-credentials \
  -n tekton-pipelines \
  --from-literal=host=<new-smtp-host> \
  --from-literal=port=<new-smtp-port> \
  --from-literal=username=<new-username> \
  --from-literal=password=<new-password>
```

### Rotate SSH Keys

1. Generate new SSH key
2. Add public key to Bitbucket
3. Update secret:
   ```bash
   kubectl delete secret git-ssh-key -n tekton-pipelines
   kubectl create secret generic git-ssh-key \
     -n tekton-pipelines \
     --from-file=private-key=$HOME/.ssh/new_key
   ```

## How It Works

1. **Push to Bitbucket** → Webhook sends payload to `https://tekton.rotaris.ch/bitbucket-listener`

2. **EventListener** → Receives webhook, validates it's a push event using Bitbucket interceptor

3. **TriggerBinding** → Extracts branch name and git URL from webhook payload

4. **TriggerTemplate** → Creates a new PipelineRun with extracted parameters

5. **Pipeline** → Clones repository and runs Dagger task

6. **Dagger Task** → Installs Dagger CLI and executes pipeline function

7. **Dagger Pipeline** →
   - Builds frontend and backend Docker images in parallel
   - Pushes images to registry.rotaris.ch with branch name as tag
   - If main branch: Updates ArgoCD manifests with new image tags
   - Sends email notification

8. **ArgoCD** → Detects manifest changes and auto-syncs deployment

9. **Result** → New version deployed to https://ken.rotaris.ch

## Security Notes

- All secrets are stored in Kubernetes Secrets
- SSH keys are only used within Tekton pods
- Registry credentials are passed as environment variables
- SMTP password is only read when sending emails
- Dagger runs in isolated containers

## Additional Resources

- Dagger Documentation: https://docs.dagger.io
- Tekton Documentation: https://tekton.dev
- ArgoCD Documentation: https://argo-cd.readthedocs.io
