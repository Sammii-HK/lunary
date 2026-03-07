#!/bin/sh

# Xcode Cloud post-clone script
# Installs Node dependencies and syncs Capacitor so Swift Package Manager
# can resolve the native plugin paths in CapApp-SPM/Package.swift

set -e

echo "=== Installing Node (via Homebrew) ==="
brew install node@20 || true
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

echo "=== Installing pnpm ==="
npm install -g pnpm

echo "=== Installing project dependencies ==="
# Move to repo root (ci_scripts is at ios/App/ci_scripts)
cd "$CI_PRIMARY_REPOSITORY_PATH"
pnpm install --frozen-lockfile

echo "=== Syncing Capacitor ==="
pnpm exec cap sync ios

echo "=== Done ==="
