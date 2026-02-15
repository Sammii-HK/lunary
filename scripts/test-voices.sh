#!/bin/bash
# Test all Kokoro TTS voices via the voiceover API
# Usage: bash scripts/test-voices.sh

TEXT="Venus enters Pisces today, opening your heart to deeper connections. Take a moment to breathe... and let the cosmos guide you."
URL="http://localhost:3000/api/social/voiceover"
OUT_DIR="voice-samples"

mkdir -p "$OUT_DIR"

voices=("af_heart" "af_bella" "bf_isabella" "am_michael")

echo "Generating voice samples into ${OUT_DIR}/..."
echo ""

for voice in "${voices[@]}"; do
  file="${OUT_DIR}/${voice}.wav"
  echo "→ ${voice}..."
  code=$(curl -s -w "%{http_code}" -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$TEXT\", \"voice\": \"$voice\"}" \
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
echo "Play one: open ${OUT_DIR}/af_heart.wav"
