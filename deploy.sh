#!/usr/bin/env bash
set -e

# Configuration (defaults can be overridden via environment variables)
PROJECT_ID="${PROJECT_ID:-project-f5f8108d-d38c-4d2e-97f}"
REGION="${REGION:-asia-southeast1}"
SERVICE_NAME="${SERVICE_NAME:-pingava}"

echo "=================================================="
echo " Deploying Pingava to Google Cloud Run"
echo " Project:      $PROJECT_ID"
echo " Region:       $REGION"
echo " Service:      $SERVICE_NAME"
echo "=================================================="

export CLOUDSDK_PYTHON="/Library/Frameworks/Python.framework/Versions/3.11/bin/python3"
if [ -d "$HOME/google-cloud-sdk/bin" ]; then
  export PATH="$HOME/google-cloud-sdk/bin:$PATH"
fi

# Check if gcloud is installed
if ! command -v gcloud &>/dev/null; then
  echo "ERROR: gcloud CLI not found at $HOME/google-cloud-sdk/bin/gcloud."
  exit 1
fi

# Ensure user is authenticated
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || true)
if [ -z "$ACTIVE_ACCOUNT" ]; then
  echo "No active Google Cloud account detected. Initiating browser login..."
  gcloud auth login
fi

echo "Setting active project: $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

echo "Ensuring required GCP services are enabled..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$PROJECT_ID"

echo "Building and deploying container to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --port 3000 \
  --allow-unauthenticated

echo "=================================================="
echo " Pingava deployed successfully!"
echo " Service URL:"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)'
echo "=================================================="
