#!/bin/bash

# Deploy Cloudflare Worker
# Usage: ./scripts/deploy-worker.sh

set -e

echo "🚀 Deploying Cloudflare Worker..."

cd cloudflare-worker

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
  echo "⚠️  Wrangler CLI not found. Installing..."
  npm install -g wrangler
fi

# Deploy the worker
npx wrangler deploy

echo "✅ Worker deployed successfully!"

