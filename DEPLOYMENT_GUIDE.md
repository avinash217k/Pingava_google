# Pingava — Production Deployment Runbook & Operational Guide

This document is a complete, self-contained guide for deploying and operating the **Pingava** Uptime & Observability platform on **Google Cloud Run**. It is designed for developers, SREs, and AI coding assistants (such as OpenAI Codex, Anthropic Claude, or Antigravity) to reproduce and execute deployments reliably.

---

## 1. Architecture & Infrastructure Overview

- **Compute**: Google Cloud Run (Fully managed serverless container runtime)
  - **Service Name**: `pingava`
  - **Project ID**: `project-f5f8108d-d38c-4d2e-97f` (Project Number: `120461786326`)
  - **Region**: `asia-southeast1` (Singapore)
  - **Runtime**: Node.js 22 LTS on Debian Slim
  - **Port**: Dynamic via `PORT` environment variable (Cloud Run defaults to `3000` or `8080`)
- **Container Registry**: Google Artifact Registry
  - **Repository**: `cloud-run-source-deploy`
  - **Image Path**: `asia-southeast1-docker.pkg.dev/project-f5f8108d-d38c-4d2e-97f/cloud-run-source-deploy/pingava:<tag>`
- **Database / State Persistence**: Google Cloud Firestore (Serverless Document Database)
  - **Mode**: Native Firestore
  - **Collection / Document**: `pingava_settings/global_state`
  - **Managed By**: `firestoreClient.ts` and `firestoreService.ts`
- **Email Notifications**: Brevo (Sendinblue) SMTP Relay
  - **Relay Host**: `smtp-relay.brevo.com:587`
- **AI Diagnostics**: Google Gemini API via `@google/genai`

---

## 2. Prerequisites & Local Environment Setup

### 2.1 Required Tools
- **Node.js**: v20 or v22 LTS
- **npm**: v10+
- **Google Cloud SDK (`gcloud`)**: Installed and authenticated
  - On macOS (Apple Silicon), default installation path: `~/google-cloud-sdk/bin`
  - Ensure `gcloud` is in your `$PATH`:
    ```bash
    export PATH="$HOME/google-cloud-sdk/bin:$PATH"
    ```

### 2.2 Authenticating with Google Cloud
Ensure your local terminal or agent is logged into Google Cloud with the correct project:
```bash
gcloud auth login
gcloud config set project project-f5f8108d-d38c-4d2e-97f
gcloud auth application-default login
```

---

## 3. Pre-Deployment Verification (Local Build)

Before deploying any code changes to Google Cloud, always compile and bundle the frontend and backend locally to catch TypeScript and packaging errors early:

```bash
cd "/Users/avinashsingh/Documents/Pingava Google"

# 1. Install dependencies (if packages were added/updated)
npm install

# 2. Build Vite frontend and compile server.ts with esbuild
npm run build
```

The build command compiles:
- `dist/index.html` and assets (`dist/assets/`)
- `dist/server.cjs` (compiled Express server)

> [!IMPORTANT]
> **Vite Production Bundling Rule**:
> `server.ts` uses dynamic imports for `vite` in dev mode:
> ```ts
> if (process.env.NODE_ENV !== "production") {
>   const { createServer } = await import("vite");
> }
> ```
> Never statically import `vite` at the top of `server.ts`, as `vite` is a development dependency and will fail in the lean production container.

---

## 4. End-to-End Deployment Workflow

### Step 1: Submit Cloud Build to Artifact Registry

Build the container image remotely on Google Cloud Build and push it to Artifact Registry:

```bash
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

# Choose a descriptive tag (e.g. v18-feature-name or git commit hash)
IMAGE_TAG="v18-update"
PROJECT_ID="project-f5f8108d-d38c-4d2e-97f"
REGION="asia-southeast1"

gcloud builds submit \
  --tag "${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/pingava:${IMAGE_TAG}" \
  --project "${PROJECT_ID}"
```

When Cloud Build finishes, it will print the image digest:
```
asia-southeast1-docker.pkg.dev/project-f5f8108d-d38c-4d2e-97f/cloud-run-source-deploy/pingava@sha256:<IMAGE_SHA>
```

---

### Step 2: Update `service.yaml`

Open `service.yaml` and update the revision label and image reference:

1. **Update the client nonce** (Line ~29):
   Change `client.knative.dev/nonce` to your new revision name:
   ```yaml
   labels:
     client.knative.dev/nonce: pingava-v18-update
   ```

2. **Update the container image** (Line ~130):
   Replace the `image:` value with the newly built image tag or digest:
   ```yaml
   image: asia-southeast1-docker.pkg.dev/project-f5f8108d-d38c-4d2e-97f/cloud-run-source-deploy/pingava@sha256:<IMAGE_SHA>
   ```

---

### Step 3: Deploy to Cloud Run

Apply the declarative configuration:

```bash
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

gcloud run services replace service.yaml \
  --region asia-southeast1 \
  --project project-f5f8108d-d38c-4d2e-97f
```

Cloud Run will create a new revision, run startup health probes, and automatically shift 100% of live traffic to the new revision with zero downtime.

---

### Alternative: One-Command Direct Deployment (Without modifying `service.yaml`)

If you prefer deploying directly via the CLI without editing `service.yaml`:

```bash
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

gcloud run deploy pingava \
  --image "asia-southeast1-docker.pkg.dev/project-f5f8108d-d38c-4d2e-97f/cloud-run-source-deploy/pingava:${IMAGE_TAG}" \
  --region asia-southeast1 \
  --project project-f5f8108d-d38c-4d2e-97f
```

---

## 5. Post-Deployment Smoke Testing & Verification

Run these verification commands to ensure the live service is functioning normally:

```bash
# 1. Health Check
curl -sI "https://pingava-120461786326.asia-southeast1.run.app/health"

# 2. Authenticated Dashboard Query (Verifies Firestore & State Integrity)
curl -s -c /tmp/cookies.txt -X POST "https://pingava-120461786326.asia-southeast1.run.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"avinash217k@gmail.com","password":"test"}'

curl -s -b /tmp/cookies.txt "https://pingava-120461786326.asia-southeast1.run.app/api/dashboard" | grep -o '"monitors":\[[^]]*\]'

# 3. Clean up test cookies
rm -f /tmp/cookies.txt
```

---

## 6. Environment Variables Reference Table

The following environment variables are maintained in `service.yaml`:

| Variable Name | Example / Production Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations and disables Vite dev middleware. |
| `PORT` | `3000` | Injected by Cloud Run. App listens on `process.env.PORT \|\| 3000`. |
| `APP_URL` | `https://pingava-120461786326.asia-southeast1.run.app` | Canonical public URL used in alert emails and webhook payloads. |
| `GEMINI_API_KEY` | `AQ.Ab8...` | API key for Gemini Root Cause Analysis and Post-Mortem generator. |
| `SMTP_HOST` | `smtp-relay.brevo.com` | Brevo SMTP server host. |
| `SMTP_PORT` | `587` | Brevo SMTP TLS port. |
| `SMTP_USER` | `b827c6001@smtp-brevo.com` | Brevo account login. |
| `SMTP_PASS` | `xsmtpsib-...` | Brevo SMTP API relay key. |
| `SMTP_FROM` | `avinash217k@gmail.com` | Sender address authorized in Brevo. |
| `ALERT_RETENTION_DAYS` | `90` | Number of days to retain incident logs and check histories. |

---

## 7. Troubleshooting & Operational Guide

### 7.1 "Permission Denied" on Cloud Build
- **Cause**: Cloud Build service account lacks permissions to write to Artifact Registry.
- **Fix**:
  ```bash
  PROJECT_NUM="120461786326"
  gcloud projects add-iam-policy-binding project-f5f8108d-d38c-4d2e-97f \
    --member="serviceAccount:${PROJECT_NUM}@cloudbuild.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"
  ```

### 7.2 Container Fails Startup Probe (`Container failed to start`)
- **Cause**: Server did not listen on `process.env.PORT` or crashed on missing file/dependency.
- **Check Logs**:
  ```bash
  gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="pingava"' \
    --limit=30 --format="value(textPayload)" --project project-f5f8108d-d38c-4d2e-97f
  ```

### 7.3 Custom Domain Setup (`www.pingava.com`)
To route custom domains to this Cloud Run service:
1. Map the domain in Cloud Run:
   ```bash
   gcloud beta run domain-mappings create \
     --service pingava \
     --domain www.pingava.com \
     --region asia-southeast1 \
     --project project-f5f8108d-d38c-4d2e-97f
   ```
2. Update DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains) with the DNS resource records printed by Google Cloud (`CNAME` pointing to `ghs.googlehosted.com` or `A`/`AAAA` VIPs).
3. Google Cloud will automatically provision and renew a managed SSL/TLS certificate.

---

## 8. Checklist for AI Assistants (Codex, Claude, Antigravity)

When instructing an automated agent to deploy changes to Pingava:
1. `npm run build` succeeds locally without errors.
2. Verify all `import` statements in `server.ts` do not bundle development-only tools.
3. Submit build using `gcloud builds submit --tag asia-southeast1-docker.pkg.dev/project-f5f8108d-d38c-4d2e-97f/cloud-run-source-deploy/pingava:<tag> --project project-f5f8108d-d38c-4d2e-97f`.
4. Update `client.knative.dev/nonce` and `image` in `service.yaml`.
5. Deploy using `gcloud run services replace service.yaml --region asia-southeast1 --project project-f5f8108d-d38c-4d2e-97f`.
6. Verify live HTTP response from `https://pingava-120461786326.asia-southeast1.run.app/health`.
