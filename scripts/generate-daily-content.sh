#!/usr/bin/env bash
#
# Run all 4 daily content crons in sequence for a given date.
#
# Usage:
#   ./scripts/generate-daily-content.sh 2026-03-19
#   ./scripts/generate-daily-content.sh 2026-03-19 --local
#
# Requires CRON_SECRET env var or .env.local in the project root.

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No colour

# ── Args ─────────────────────────────────────────────────────────────────────
DATE=""
BASE_URL="https://lunary.app"

for arg in "$@"; do
  case "$arg" in
    --local)
      BASE_URL="http://localhost:3000"
      ;;
    *)
      if [[ "$arg" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        DATE="$arg"
      else
        echo -e "${RED}Error: unrecognised argument '$arg'${NC}" >&2
        echo "Usage: $0 YYYY-MM-DD [--local]" >&2
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$DATE" ]]; then
  echo -e "${RED}Error: date argument required (YYYY-MM-DD)${NC}" >&2
  echo "Usage: $0 YYYY-MM-DD [--local]" >&2
  exit 1
fi

# ── CRON_SECRET ──────────────────────────────────────────────────────────────
if [[ -z "${CRON_SECRET:-}" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

  for envfile in "$PROJECT_ROOT/.env.local" "$PROJECT_ROOT/.env"; do
    if [[ -f "$envfile" ]]; then
      secret=$(grep -E '^CRON_SECRET=' "$envfile" | head -1 | sed 's/^CRON_SECRET=//' | tr -d '"' | tr -d "'")
      if [[ -n "$secret" ]]; then
        CRON_SECRET="$secret"
        break
      fi
    fi
  done

  if [[ -z "${CRON_SECRET:-}" ]]; then
    echo -e "${RED}Error: CRON_SECRET not found in env or .env.local / .env${NC}" >&2
    exit 1
  fi
fi

# ── Cron steps ───────────────────────────────────────────────────────────────
CRONS=(
  "daily-content-generate"
  "daily-threads"
  "daily-posts"
  "daily-stories"
)

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Daily content catchup for ${YELLOW}${DATE}${NC}"
echo -e "${CYAN}  Target: ${BASE_URL}${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

STEP=0
TOTAL=${#CRONS[@]}

for cron in "${CRONS[@]}"; do
  STEP=$((STEP + 1))
  URL="${BASE_URL}/api/cron/${cron}?date=${DATE}&force=true"

  echo -e "${YELLOW}[${STEP}/${TOTAL}]${NC} Running ${CYAN}${cron}${NC} ..."

  HTTP_CODE=$(curl -s -o /tmp/cron-response.txt -w "%{http_code}" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    "${URL}")

  if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
    echo -e "       ${GREEN}OK${NC} (HTTP ${HTTP_CODE})"
  else
    BODY=$(cat /tmp/cron-response.txt 2>/dev/null || echo "(no body)")
    echo -e "       ${RED}FAILED${NC} (HTTP ${HTTP_CODE})"
    echo -e "       ${RED}Response: ${BODY}${NC}"
    rm -f /tmp/cron-response.txt
    exit 1
  fi

  echo ""
done

rm -f /tmp/cron-response.txt

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  All 4 crons completed successfully for ${DATE}${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
