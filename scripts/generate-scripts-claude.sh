#!/bin/bash
# Generate video scripts using Claude CLI and insert into production DB
# Usage: ./scripts/generate-scripts-claude.sh [date] [count]
# Example: ./scripts/generate-scripts-claude.sh 2026-03-21 4

set -euo pipefail

DATE="${1:-$(date -u -v+1d '+%Y-%m-%d')}"
COUNT="${2:-4}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load just POSTGRES_URL from production env (full source breaks on multiline JSON values)
POSTGRES_URL=$(grep '^POSTGRES_URL=' "$PROJECT_DIR/.env.production.local" | head -1 | sed 's/^POSTGRES_URL="//' | sed 's/"$//')
export POSTGRES_URL

echo "Generating $COUNT TikTok scripts for $DATE..."

# Content types to cycle through
TYPES=("sign-check" "hot-take" "did-you-know" "ranking" "angel-number" "sign-identity" "myth" "quiz")
HOURS=(10 14 17 21)

# Signs and topics for variety
SIGNS=("Aries" "Taurus" "Gemini" "Cancer" "Leo" "Virgo" "Libra" "Scorpio" "Sagittarius" "Capricorn" "Aquarius" "Pisces")

# Get day of week for topic selection
DOW=$(date -j -f "%Y-%m-%d" "$DATE" "+%u" 2>/dev/null || date -d "$DATE" "+%u")
SIGN_IDX=$(( (DOW + RANDOM) % 12 ))

for i in $(seq 0 $((COUNT - 1))); do
  TYPE_IDX=$(( i % ${#TYPES[@]} ))
  CONTENT_TYPE="${TYPES[$TYPE_IDX]}"
  HOUR="${HOURS[$i]}"
  SIGN="${SIGNS[$(( (SIGN_IDX + i) % 12 ))]}"

  echo ""
  echo "=== Script $((i+1))/$COUNT: $CONTENT_TYPE ($SIGN) at ${HOUR}:00 UTC ==="

  PROMPT="You are writing a TikTok video script for @lunary.app, an astrology app.

Content type: $CONTENT_TYPE
Sign/topic: $SIGN
Date: $DATE

RULES:
- Hook: Single sentence, 8-14 words, must include the topic/sign name EXACTLY ONCE, end with punctuation
- Body: 3-10 lines, 35-80 words total, conversational TikTok tone
- NO em dashes (— or --)
- NO phrases: 'gentle nudge', 'cosmic wink', 'journey of self-discovery', 'cosmic dance', 'your growth awaits', 'unlock your potential'
- NO deterministic language like 'will cause', 'guarantees', 'always means'
- Use 'tends to', 'often', 'can' instead
- Last line should be short (3-8 words), observational or a question
- Vary sentence openings (don't start 3+ lines with the same word)
- UK English spelling

Output ONLY valid JSON, no markdown, no backticks:
{
  \"hook\": \"the hook line here.\",
  \"body\": \"Line 1.\\nLine 2.\\nLine 3.\\nLine 4.\",
  \"facetTitle\": \"Short title for this script\",
  \"topic\": \"$SIGN\",
  \"contentType\": \"$CONTENT_TYPE\"
}"

  # Generate with Claude CLI
  RESULT=$(claude --print --model claude-sonnet-4-20250514 "$PROMPT" 2>/dev/null)

  if [ -z "$RESULT" ]; then
    echo "ERROR: Empty response from Claude"
    continue
  fi

  # Parse JSON
  HOOK=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['hook'])" 2>/dev/null)
  BODY=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['body'])" 2>/dev/null)
  FACET=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['facetTitle'])" 2>/dev/null)
  TOPIC=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('topic',''))" 2>/dev/null)

  if [ -z "$HOOK" ] || [ -z "$BODY" ]; then
    echo "ERROR: Failed to parse response"
    echo "Raw: $RESULT"
    continue
  fi

  FULL_SCRIPT="$HOOK
$BODY"

  WORD_COUNT=$(echo "$FULL_SCRIPT" | wc -w | tr -d ' ')

  echo "Hook: $HOOK"
  echo "Body: $(echo "$BODY" | head -2)..."
  echo "Words: $WORD_COUNT"

  SCHEDULED="${DATE}T$(printf '%02d' $HOUR):00:00.000Z"
  THEME_ID="claude-gen-${DATE}"
  THEME_NAME="Claude Generated"

  # Build metadata JSON
  METADATA=$(python3 -c "
import json
print(json.dumps({
    'contentTypeKey': '$CONTENT_TYPE',
    'scheduledHour': $HOUR,
    'slot': 'primary' if $i == 0 else 'engagement',
    'targetAudience': 'discovery'
}))
")

  # Build sections JSON
  SECTIONS=$(python3 -c "
import json
print(json.dumps([
    {'type': 'hook', 'text': $(python3 -c "import json; print(json.dumps('$HOOK'))")},
    {'type': 'body', 'text': $(python3 -c "import json; print(json.dumps('''$BODY'''[0:500]))")}
]))
" 2>/dev/null || echo '[{"type":"hook","text":""},{"type":"body","text":""}]')

  # Generate hashtags
  HASHTAGS="#astrology #${SIGN,,} #zodiac #${CONTENT_TYPE//-/} #lunaryapp"
  WRITTEN_POST="$HOOK

$HASHTAGS"

  # Insert into DB
  psql "$POSTGRES_URL" -q -c "
    INSERT INTO video_scripts (
      theme_id, theme_name, facet_title, topic, platform, sections,
      full_script, word_count, estimated_duration, scheduled_date, status,
      metadata, hook_text, hook_version, written_post_content
    ) VALUES (
      '$THEME_ID', '$THEME_NAME',
      '$(echo "$FACET" | sed "s/'/''/g")',
      '$(echo "$TOPIC" | sed "s/'/''/g")',
      'tiktok',
      '$(echo "$SECTIONS" | sed "s/'/''/g")'::jsonb,
      '$(echo "$FULL_SCRIPT" | sed "s/'/''/g")',
      $WORD_COUNT,
      '30s',
      '$SCHEDULED'::timestamptz,
      'draft',
      '$(echo "$METADATA" | sed "s/'/''/g")'::jsonb,
      '$(echo "$HOOK" | sed "s/'/''/g")',
      1,
      '$(echo "$WRITTEN_POST" | sed "s/'/''/g")'
    ) RETURNING id;
  " 2>/dev/null

  SCRIPT_ID=$(psql "$POSTGRES_URL" -t -c "SELECT id FROM video_scripts WHERE scheduled_date = '$SCHEDULED'::timestamptz AND platform = 'tiktok' ORDER BY id DESC LIMIT 1;" 2>/dev/null | tr -d ' ')

  if [ -n "$SCRIPT_ID" ]; then
    echo "Saved as script ID: $SCRIPT_ID"

    # Create video_job
    psql "$POSTGRES_URL" -q -c "
      INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
      VALUES ($SCRIPT_ID, '$DATE', '$DATE', '$(echo "$FACET" | sed "s/'/''/g")', 'pending', NOW(), NOW())
      ON CONFLICT (script_id) DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW();
    " 2>/dev/null

    # Create social_post
    psql "$POSTGRES_URL" -q -c "
      INSERT INTO social_posts (content, platform, post_type, topic, status, scheduled_date, source_type, source_id, source_title, created_at)
      SELECT '$(echo "$WRITTEN_POST" | sed "s/'/''/g")', 'tiktok', 'video',
             '$(echo "$FACET" | sed "s/'/''/g")', 'pending',
             '$SCHEDULED'::timestamptz, 'video_script', $SCRIPT_ID,
             '$(echo "$FACET" | sed "s/'/''/g")', NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM social_posts
        WHERE platform = 'tiktok' AND post_type = 'video'
          AND source_id = $SCRIPT_ID::text
      );
    " 2>/dev/null

    echo "Created video_job + social_post"
  else
    echo "ERROR: Failed to get script ID"
  fi
done

echo ""
echo "=== Done: $COUNT scripts for $DATE ==="
echo "Run process-video-jobs to render them."
