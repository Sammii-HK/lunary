#!/bin/bash
# Convert recorded .webm files to .mp4 for better compatibility

INPUT_DIR="public/app-demos"
OUTPUT_DIR="public/app-demos"

echo "🎬 Converting app demo videos to MP4..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "   Install with: brew install ffmpeg"
    exit 1
fi

# Count webm files
webm_count=$(ls -1 "$INPUT_DIR"/*.webm 2>/dev/null | wc -l)

if [ "$webm_count" -eq 0 ]; then
    echo "⚠️  No .webm files found in $INPUT_DIR"
    echo "   Run: pnpm record:app-features first"
    exit 1
fi

echo "Found $webm_count video(s) to convert"
echo ""

success_count=0
fail_count=0

# Convert each .webm file to .mp4
for webm_file in "$INPUT_DIR"/*.webm; do
    if [ -f "$webm_file" ]; then
        filename=$(basename "$webm_file" .webm)
        mp4_file="$OUTPUT_DIR/${filename}.mp4"

        echo "▸ Converting: $filename.webm → $filename.mp4"

        # Convert with good quality settings for TikTok (9:16, H.264, AAC)
        if ffmpeg -i "$webm_file" \
            -c:v libx264 \
            -preset slow \
            -crf 20 \
            -pix_fmt yuv420p \
            -c:a aac \
            -b:a 192k \
            -movflags +faststart \
            -y \
            "$mp4_file" \
            -loglevel error; then

            echo "  ✓ Saved: $mp4_file"

            # Get file sizes
            webm_size=$(du -h "$webm_file" | cut -f1)
            mp4_size=$(du -h "$mp4_file" | cut -f1)
            echo "  Size: $webm_size (webm) → $mp4_size (mp4)"

            success_count=$((success_count + 1))

            # Optional: Remove .webm file after successful conversion
            # rm "$webm_file"
        else
            echo "  ✗ Failed to convert $filename"
            fail_count=$((fail_count + 1))
        fi

        echo ""
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Conversion Summary:"
echo "   ✓ Success: $success_count"
echo "   ✗ Failed: $fail_count"

if [ $success_count -gt 0 ]; then
    echo ""
    echo "✅ Conversion complete!"
    echo "📹 MP4 files are in: $OUTPUT_DIR"
fi

if [ $fail_count -gt 0 ]; then
    exit 1
fi
