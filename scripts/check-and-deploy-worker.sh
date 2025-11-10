#!/bin/bash

# Check if cloudflare-worker has changes and deploy if needed
# This is used in git hooks to auto-deploy worker changes

set -e

# Check if we're being called from pre-push hook (has stdin) or directly
if [ -t 0 ]; then
  # Running interactively (no stdin), check current branch against remote
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  REMOTE_BRANCH="origin/$CURRENT_BRANCH"
  
  # Check if remote branch exists
  if git rev-parse "$REMOTE_BRANCH" >/dev/null 2>&1; then
    CHANGED_FILES=$(git diff --name-only "$REMOTE_BRANCH" HEAD | grep "^cloudflare-worker/" || true)
  else
    # No remote branch, check staged/uncommitted changes
    CHANGED_FILES=$(git diff --name-only HEAD | grep "^cloudflare-worker/" || true)
  fi
  
  if [ -z "$CHANGED_FILES" ]; then
    echo "ℹ️  No changes in cloudflare-worker/, skipping deployment"
    exit 0
  fi
  
  echo "📦 Detected changes in cloudflare-worker/:"
  echo "$CHANGED_FILES"
  echo ""
  read -p "🚀 Deploy Cloudflare Worker? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏭️  Skipping deployment"
    exit 0
  fi
  
  cd cloudflare-worker
  
  # Check if wrangler is available
  if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm install -g wrangler
  fi
  
  # Deploy the worker
  npx wrangler deploy
  
  echo "✅ Worker deployed successfully!"
else
  # Running from pre-push hook (has stdin with refs)
  while read local_ref local_sha remote_ref remote_sha; do
    # Skip if no refs
    [ -z "$local_ref" ] && continue
    
    # Get the branch name
    BRANCH=$(echo "$local_ref" | sed 's|refs/heads/||')
    
    # Check if cloudflare-worker files changed in commits being pushed
    if [ "$remote_sha" = "0000000000000000000000000000000000000000" ]; then
      # New branch, check all commits
      CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r "$local_sha" | grep "^cloudflare-worker/" || true)
    else
      # Existing branch, check commits between remote and local
      CHANGED_FILES=$(git diff --name-only "$remote_sha" "$local_sha" | grep "^cloudflare-worker/" || true)
    fi
    
    if [ -n "$CHANGED_FILES" ]; then
      echo "📦 Detected changes in cloudflare-worker/ for branch $BRANCH:"
      echo "$CHANGED_FILES"
      echo ""
      read -p "🚀 Deploy Cloudflare Worker? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "⏭️  Skipping deployment"
        continue
      fi
      
      cd cloudflare-worker
      
      # Check if wrangler is available
      if ! command -v wrangler &> /dev/null; then
        echo "⚠️  Wrangler CLI not found. Installing..."
        npm install -g wrangler
      fi
      
      # Deploy the worker
      npx wrangler deploy
      
      echo "✅ Worker deployed successfully!"
      cd ..
    fi
  done
fi

exit 0

