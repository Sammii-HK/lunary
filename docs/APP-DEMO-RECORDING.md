# App Demo Recording System

Automatically record your app features for demo videos using Playwright.

## 🎯 Overview

This system captures your app in action, creating demo videos that stay up-to-date as you change the app. No manual screen recording needed!

## 📋 Prerequisites

1. **ffmpeg** (for video conversion)

   ```bash
   brew install ffmpeg
   ```

2. **Dev server running**
   ```bash
   pnpm dev
   ```

## 🎬 Usage

### Record All Features (6 videos)

```bash
pnpm record:app-features
```

This will record all 6 app features:

- Daily Transits (15s)
- Synastry Comparison (18s)
- Pattern Recognition (16s)
- Birth Chart Walkthrough (20s)
- Aspect Analysis (14s)
- Moon Phase Guidance (16s)

Output: `public/app-demos/*.webm`

### Record Single Feature

```bash
pnpm record:app-features:one daily-transits
```

### Convert to MP4

```bash
pnpm convert:app-demos
```

Converts all `.webm` files to `.mp4` with TikTok-optimized settings:

- Resolution: 1080x1920 (9:16)
- Codec: H.264 (web-compatible)
- Audio: AAC 192kbps
- Quality: CRF 20 (high quality)

Output: `public/app-demos/*.mp4`

## ⚙️ Customization

### 1. Adjust Recording Steps

Edit `src/lib/video/app-feature-recordings.ts`:

```typescript
{
  id: 'daily-transits',
  name: 'Daily Transits',
  startUrl: '/cosmic-weather',
  durationSeconds: 15,
  steps: [
    {
      type: 'click',
      selector: '[data-transit-card]',
      description: 'Click first transit',
    },
    {
      type: 'wait',
      duration: 2000,
      description: 'Show details',
    },
    // Add more steps...
  ],
}
```

### 2. Update Selectors

If the recording fails, update selectors to match your current app:

- `[data-transit-card]` → your actual selector
- Check browser DevTools to find correct selectors

### 3. Adjust Timing

- `durationSeconds`: Total video length
- `wait.duration`: How long to pause between actions
- Increase if animations need more time

## 🐛 Troubleshooting

### Recording fails with "Element not found"

**Problem:** Selector doesn't match current app
**Solution:** Update selector in `app-feature-recordings.ts`

```typescript
// Find the correct selector in DevTools
selector: '[data-my-element]'; // Update this
```

### Video is too fast/slow

**Problem:** Steps execute too quickly or slowly
**Solution:** Adjust `wait` durations

```typescript
{ type: 'wait', duration: 3000 } // Increase to 3 seconds
```

### App requires authentication

**Problem:** Recording can't access protected pages
**Solution:** Add auth bypass for test environment

In your middleware or auth config:

```typescript
if (process.env.NODE_ENV === 'test') {
  // Skip auth
}
```

Or use a test account:

```typescript
// In record-app-features.ts, add login steps:
steps: [
  {
    type: 'navigate',
    url: '/login',
  },
  {
    type: 'type',
    selector: '[name="email"]',
    text: 'demo@lunary.app',
  },
  // ... continue with feature recording
];
```

## 📊 Quality Settings

Videos are optimized for TikTok/social media:

| Setting      | Value     | Why                           |
| ------------ | --------- | ----------------------------- |
| Resolution   | 1080x1920 | 9:16 aspect ratio (vertical)  |
| Codec        | H.264     | Universal compatibility       |
| CRF          | 20        | High quality, reasonable size |
| Pixel Format | yuv420p   | Web-compatible                |
| Faststart    | Enabled   | Streams while downloading     |

## 🔄 Workflow

1. **Make changes to your app**

   ```bash
   # Update features, UI, etc.
   ```

2. **Record fresh demos**

   ```bash
   pnpm record:app-features
   ```

3. **Convert to MP4**

   ```bash
   pnpm convert:app-demos
   ```

4. **Use in video generation**
   ```typescript
   const props = {
     format: 'ShortFormVideo',
     backgroundImage: '/app-demos/daily-transits.mp4',
     // ... other props
   };
   ```

## 💡 Tips

- **Run weekly**: Keep demos fresh as app evolves
- **Test first**: Record one feature to verify selectors
- **Watch recording**: Set `headless: false` to debug
- **Clean output**: Delete old `.webm` files after conversion
- **Version control**: Consider gitignoring `public/app-demos/*.webm` (large files)

## 🚀 Next Steps

After recording demos:

1. Generate AI scripts for each feature
2. Combine script + demo in Remotion
3. Add voiceover with TTS
4. Render final video

See: `docs/VIDEO-GENERATION-PIPELINE.md` (coming next!)
