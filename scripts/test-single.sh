#!/bin/bash

# Script to run a single Playwright test for quick debugging
# Usage:
#   yarn test:single <test-file-path>
#   yarn test:single e2e/journeys/06-grimoire.spec.ts
#   yarn test:single e2e/journeys/06-grimoire.spec.ts --grep "should display grimoire"
#   yarn test:single 06-grimoire  (shortcut - will find the file)

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the test file argument
TEST_ARG="${1:-}"

if [ -z "$TEST_ARG" ]; then
  echo -e "${YELLOW}Usage:${NC}"
  echo "  yarn test:single <test-file> [--grep \"test name\"]"
  echo ""
  echo "Examples:"
  echo "  yarn test:single e2e/journeys/06-grimoire.spec.ts"
  echo "  yarn test:single 06-grimoire"
  echo "  yarn test:single 06-grimoire --grep \"should display grimoire\""
  echo ""
  echo "Available test files:"
  ls -1 e2e/journeys/*.spec.ts | sed 's|e2e/journeys/||' | sed 's|\.spec\.ts||' | nl
  exit 1
fi

# Build the test file path
TEST_FILE=""

# If it's already a full path, use it
if [[ "$TEST_ARG" == e2e/* ]]; then
  TEST_FILE="$TEST_ARG"
# If it's just a number or name, try to find it
else
  # Try exact match first
  if [ -f "e2e/journeys/${TEST_ARG}.spec.ts" ]; then
    TEST_FILE="e2e/journeys/${TEST_ARG}.spec.ts"
  # Try with leading zero
  elif [ -f "e2e/journeys/0${TEST_ARG}.spec.ts" ]; then
    TEST_FILE="e2e/journeys/0${TEST_ARG}.spec.ts"
  # Try to find by pattern
  else
    FOUND=$(find e2e/journeys -name "*${TEST_ARG}*.spec.ts" | head -1)
    if [ -n "$FOUND" ]; then
      TEST_FILE="$FOUND"
    else
      echo -e "${YELLOW}Error:${NC} Could not find test file matching '${TEST_ARG}'"
      echo ""
      echo "Available test files:"
      ls -1 e2e/journeys/*.spec.ts | sed 's|e2e/journeys/||' | sed 's|\.spec\.ts||' | nl
      exit 1
    fi
  fi
fi

# Check if file exists
if [ ! -f "$TEST_FILE" ]; then
  echo -e "${YELLOW}Error:${NC} Test file not found: ${TEST_FILE}"
  exit 1
fi

echo -e "${GREEN}Running single test:${NC} ${TEST_FILE}"
echo ""

# Shift to get remaining arguments (like --grep)
shift
REMAINING_ARGS="$@"

# Run the test with remaining arguments
npx playwright test "$TEST_FILE" $REMAINING_ARGS --reporter=list,line




