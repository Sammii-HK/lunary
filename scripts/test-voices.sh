#!/bin/bash
# Test all Kokoro TTS voices via the voiceover API
# Usage: bash scripts/test-voices.sh

TEXT="Venus enters Pisces today, opening your heart to deeper connections. Take a moment to breathe... and let the cosmos guide you."
URL="http://localhost:3000/api/social/voiceover"
OUT_DIR="voice-samples"

mkdir -p "$OUT_DIR"

voices=("shimmer:heart:A" "nova:bella:A-" "alloy:nicole:B-" "onyx:emma:B-" "echo:fenrir:C+" "fable:puck:C+")

echo "Generating voice samples into ${OUT_DIR}/..."
echo ""

for entry in "${voices[@]}"; do
  IFS=: read -r voice_key label grade <<< "$entry"
  file="${OUT_DIR}/${label}.wav"
  echo "→ ${label} [${grade}] (voice=${voice_key})..."
  code=$(curl -s -w "%{http_code}" -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$TEXT\", \"voice\": \"$voice_key\"}" \
    --output "$file")
  size=$(wc -c < "$file" 2>/dev/null | tr -d ' ')
  if [ "$code" = "200" ] && [ "$size" -gt 1000 ]; then
    echo "  ✓ ${file} (${size} bytes)"
  else
    echo "  ✗ Failed (HTTP ${code}, ${size} bytes)"
    cat "$file" 2>/dev/null
    echo ""
  fi
  echo ""
done

echo "Done! Files:"
ls -lh "$OUT_DIR"/*.wav 2>/dev/null
echo ""
echo "Play all: open ${OUT_DIR}/*.wav"
echo "Play one: open ${OUT_DIR}/heart.wav"
