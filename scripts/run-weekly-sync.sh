#!/bin/bash

# Weekly Subscription Sync Runner
# This script is called by cron to run the weekly sync

# Change to the project directory
cd "$(dirname "$0")/.." || exit 1

# Run the sync script
/usr/local/bin/npx ts-node scripts/weekly-sync-cron.ts >> logs/weekly-sync.log 2>&1

# Exit with the same code as the sync script
exit $?
