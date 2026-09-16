#!/usr/bin/env bash
# ==============================================================================
# Pingava - Production Secret Rotation Script
# Updates Gemini API key, Brevo SMTP key, and JWT secret on Google Cloud Run
# without committing or saving secrets to repository files.
# ==============================================================================
set -e

PROJECT_ID="${PROJECT_ID:-project-f5f8108d-d38c-4d2e-97f}"
REGION="${REGION:-asia-southeast1}"
SERVICE_NAME="${SERVICE_NAME:-pingava}"

# Ensure gcloud is on PATH
export CLOUDSDK_PYTHON="/Library/Frameworks/Python.framework/Versions/3.11/bin/python3"
if [ -d "$HOME/google-cloud-sdk/bin" ]; then
  export PATH="$HOME/google-cloud-sdk/bin:$PATH"
fi

if ! command -v gcloud &>/dev/null; then
  echo "❌ Error: gcloud CLI not found. Please ensure Google Cloud SDK is installed."
  exit 1
fi

echo "=================================================="
echo " Pingava Secret Rotation (Google Cloud Run)"
echo " Project: $PROJECT_ID"
echo " Region:  $REGION"
echo " Service: $SERVICE_NAME"
echo "=================================================="

# Parse flags if provided
NEW_GEMINI_KEY=""
NEW_BREVO_KEY=""
NEW_JWT_SECRET=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --gemini-key) NEW_GEMINI_KEY="$2"; shift ;;
    --brevo-key) NEW_BREVO_KEY="$2"; shift ;;
    --jwt-secret) NEW_JWT_SECRET="$2"; shift ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --gemini-key <KEY>    New Google Gemini API key"
      echo "  --brevo-key <KEY>     New Brevo SMTP password (xsmtpsib-...)"
      echo "  --jwt-secret <SECRET> New JWT secret (optional, auto-generated if empty)"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

# Prompt interactively if not provided via flags
if [ -z "$NEW_GEMINI_KEY" ]; then
  read -s -p "Enter new GEMINI_API_KEY (leave blank to keep current): " NEW_GEMINI_KEY
  echo ""
fi

if [ -z "$NEW_BREVO_KEY" ]; then
  read -s -p "Enter new Brevo SMTP key / SMTP_PASS (leave blank to keep current): " NEW_BREVO_KEY
  echo ""
fi

# Build array of env updates
UPDATES=()

if [ -n "$NEW_GEMINI_KEY" ]; then
  UPDATES+=("GEMINI_API_KEY=${NEW_GEMINI_KEY}")
  echo "✔ Will update GEMINI_API_KEY"
fi

if [ -n "$NEW_BREVO_KEY" ]; then
  UPDATES+=("SMTP_PASS=${NEW_BREVO_KEY}")
  echo "✔ Will update SMTP_PASS"
fi

if [ -n "$NEW_JWT_SECRET" ]; then
  UPDATES+=("JWT_SECRET=${NEW_JWT_SECRET}")
  echo "✔ Will update JWT_SECRET"
fi

if [ ${#UPDATES[@]} -eq 0 ]; then
  echo "⚠ No new secrets provided. Nothing to update."
  exit 0
fi

# Join array with comma
IFS="," ENV_VARS_STR="${UPDATES[*]}"

echo ""
echo "Updating Cloud Run service '${SERVICE_NAME}' with new secrets..."
gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --update-env-vars "$ENV_VARS_STR"

echo ""
echo "=================================================="
echo "🎉 Cloud Run secrets updated successfully!"
echo "New revision is now live with rotated credentials."
echo "=================================================="
