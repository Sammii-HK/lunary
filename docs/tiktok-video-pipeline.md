# TikTok Video Pipeline — Architecture & Learnings

## What We're Building

Automated TikTok video production for Lunary (astrology app). 16 feature demo videos showing the app in action, with voiceover, subtitles, text overlays, and background music. The pipeline is fully automated: script definition → Playwright screen recording → TTS voiceover → Remotion composition → ready-to-post MP4.

## Pipeline Flow

```
TikTok Script (tiktok-scripts.ts)
  ↓ defines scenes, voiceover, timing, overlays
Recording Config (app-feature-recordings.ts)
  ↓ auto-generates Playwright steps from scenes
Playwright Recording (record-app-features.ts)
  ↓ captures screen at 360×640, upscales to 1080×1920
TTS Generation (compose-tiktok.ts → generateVoiceover)
  ↓ OpenAI TTS shimmer voice at 1.05x
Props Transform (tiktok-to-remotion.ts)
  ↓ converts script → AppDemoVideoProps
Remotion Render (remotion-renderer.ts → AppDemoVideo.tsx)
  ↓ composites video + overlays + subtitles + audio
Final MP4 (public/app-demos/final/)
```

## Key Files

| File                                            | Purpose                                                     |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `src/lib/video/tiktok-scripts.ts`               | 16 script definitions (scenes, timing, voiceover, overlays) |
| `src/lib/video/tiktok-script-generators.ts`     | 6 dynamic generators that use live sky data                 |
| `src/lib/video/app-feature-recordings.ts`       | Converts scripts → Playwright recording configs             |
| `src/lib/video/tiktok-to-remotion.ts`           | Converts scripts → Remotion composition props               |
| `src/lib/video/remotion-renderer.ts`            | Remotion rendering engine (bundles + renders)               |
| `scripts/compose-tiktok.ts`                     | CLI orchestrator: TTS → props → render                      |
| `scripts/record-app-features.ts`                | Playwright screen recorder                                  |
| `src/remotion/compositions/AppDemoVideo.tsx`    | Main Remotion composition for TikTok videos                 |
| `src/remotion/components/AnimatedSubtitles.tsx` | Word-level karaoke subtitle component                       |
| `src/remotion/components/HookIntro.tsx`         | Animated hook text overlay                                  |
| `src/remotion/components/TextOverlays.tsx`      | Mid-video + CTA text overlays                               |
| `src/remotion/styles/theme.ts`                  | Brand colors, fonts, dimensions                             |
| `public/audio/series/lunary-bed-v1.mp3`         | Background music track                                      |

## All 16 Scripts

### Tier 1: Core Features (6 videos)

| ID                   | Title                                     | Duration | Auth |
| -------------------- | ----------------------------------------- | -------- | ---- |
| `dashboard-overview` | POV: Your Morning Cosmic Check-In         | 20s      | Yes  |
| `horoscope-deepdive` | Your Horoscope: 600M People vs 1          | 23s      | Yes  |
| `tarot-patterns`     | Same Card Every Pluto Transit             | 24s      | Yes  |
| `astral-guide`       | Every Answer From 2,000+ Articles         | 27s      | Yes  |
| `birth-chart`        | Your App Shows 10 Planets, This Shows 24+ | 25s      | Yes  |
| `profile-circle`     | 84% Compatible But the Timing Tab...      | 24s      | Yes  |

### Tier 2: Deep Dives (7 videos)

| ID                        | Title                                | Duration | Auth |
| ------------------------- | ------------------------------------ | -------- | ---- |
| `sky-now-deepdive`        | Every Planet Mapped to YOUR Houses   | 22s\*    | Yes  |
| `numerology-deepdive`     | Your Number ≠ Universal Number       | 21s\*    | Yes  |
| `pattern-timeline`        | 7 Days vs 30 vs 90 of Tracking       | 23s      | Yes  |
| `ritual-system`           | Today's Ritual Changes With the Moon | 18s      | Yes  |
| `transit-wisdom-deepdive` | This Transit, 12 Meanings            | 22s\*    | Yes  |
| `streaks-progress`        | 3 Life Themes I Didn't Choose        | 23s      | Yes  |
| `tarot-spreads`           | Tarot With Your Birth Chart          | 23s      | Yes  |

### Tier 3: Grimoire (3 videos, no auth)

| ID                  | Title                                 | Duration | Auth |
| ------------------- | ------------------------------------- | -------- | ---- |
| `crystals-overview` | Name a Crystal, Full Guide, Free      | 21s      | No   |
| `spells-overview`   | 112 Spells Filtered by Tonight's Moon | 20s      | No   |
| `grimoire-search`   | Any Placement? Full Article. Here.    | 20s\*    | No   |

\*Dynamic scripts — duration/content adapts to live sky data via generators.

### Dynamic Script Generators

6 scripts have generators in `tiktok-script-generators.ts` that replace hardcoded astro data with real positions:

- `dashboard-overview` — minimal (static)
- `sky-now-deepdive` — adapts for retrograde planets (hook, VO, caption)
- `numerology-deepdive` — uses real personal/universal day numbers
- `ritual-system` — uses moon sign → theme mapping
- `transit-wisdom-deepdive` — picks notable fast-moving planet (Venus/Mars/Mercury)
- `grimoire-search` — uses current Venus/Mars signs for search example

## Recording Architecture

### Recording Dead Time

Every recording has dead time at the start before visible content:

- **Hook wait:** 800ms (all scripts) — hook text is a Remotion overlay, not recorded
- **DISMISS_MODALS:** 600ms extra (3 scripts: `dashboard-overview`, `sky-now-deepdive`, `ritual-system`) — Escape key + wait to close modals

This dead time is handled by `audioStartOffset`:

- Scripts with DISMISS_MODALS: **1.4s** (600ms + 800ms)
- All other scripts: **0.8s** (800ms only)

### What audioStartOffset Does

1. **Delays TTS audio** — `<Sequence from={audioStartOffset * fps}>` so voiceover doesn't start during dead frames
2. **Shifts subtitle timing** — segments are offset forward to stay in sync with delayed audio
3. **Trims video dead frames** — `<Video startFrom={audioStartOffset * fps}>` skips black/modal frames

### Recording Overrides

Some scripts need special handling beyond auto-generated steps:

| Script               | Override                      | Why                       |
| -------------------- | ----------------------------- | ------------------------- |
| `dashboard-overview` | `beforeSteps: DISMISS_MODALS` | Close welcome modal       |
| `sky-now-deepdive`   | `beforeSteps: DISMISS_MODALS` | Close welcome modal       |
| `ritual-system`      | `beforeSteps: DISMISS_MODALS` | Close welcome modal       |
| `horoscope-deepdive` | `afterScene[2]: Escape`       | Close numerology modal    |
| `grimoire-search`    | `afterScene[1]: scroll -400`  | Scroll back to search bar |
| `crystals-overview`  | `requiresAuth: false`         | Public page               |
| `spells-overview`    | `requiresAuth: false`         | Public page               |
| `grimoire-search`    | `requiresAuth: false`         | Public page               |

### Scene Duration Calculation

If a scene has `voiceoverLine`, duration is calculated dynamically:

```
wordCount / 3.0 wps + actionOverhead
```

Action overheads: scroll 0.4s, navigate 0.3s, expand 0.3s.

If no `voiceoverLine`, uses hardcoded `durationSeconds`.

**Note:** `sky-now-deepdive` and `numerology-deepdive` have NO voiceoverLine on their static versions (the dynamic generators DO add them).

## TikTok-Optimized Subtitle System

### Positioning (TikTok Safe Zones)

TikTok's UI covers the bottom 300-370px (16-19% of 1920px) with captions/navigation, and the right 120px (11% of 1080px) with like/share/comment buttons.

| Setting          | Value | Why                                                                            |
| ---------------- | ----- | ------------------------------------------------------------------------------ |
| `bottomPosition` | 22%   | 422px from bottom, safely above TikTok's UI zone (was 12% = 230px, overlapped) |
| `left`           | 8%    | Small buffer from left edge                                                    |
| `right`          | 14%   | Wide buffer to avoid TikTok's right-side buttons (was 5%, text collided)       |

### Font

| Setting            | Value                | Why                                                                                                                       |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `fontFamily`       | `Roboto, sans-serif` | Sans-serif is TikTok standard. Monospace (Roboto Mono) wasted horizontal space and felt technical                         |
| Base `fontWeight`  | 600                  | Bolder for legibility on mobile (was 500)                                                                                 |
| Active word weight | 800                  | Bolder pop for karaoke highlight (was 700)                                                                                |
| Keyword weight     | 700                  | Emphasis for astro terms (was 600)                                                                                        |
| `fontSize`         | 46px                 | Optimized for sans-serif at TikTok resolution. Theme default was 56px (too large), AppDemoVideo was 44px (slightly small) |

### Background & Contrast

- Background opacity: 0.6 (passed from AppDemoVideo, default 0.45)
- Text shadow: 1px outline in rgba(0,0,0,0.3) for edge contrast
- Border radius: 8px on background pill

### Word-Level Karaoke

`AnimatedSubtitles` splits each segment into words with timing, highlights the active word in the category accent color, and highlights astro keyword terms. Uses `splitTextWithTiming()` from `src/remotion/utils/timing.ts`.

## Background Music

- Track: `public/audio/series/lunary-bed-v1.mp3`
- Volume: 0.15 (~16dB below voiceover)
- Plays for full video duration (no Sequence offset)
- Added to all 16 videos via `tiktok-to-remotion.ts`

## Props Pipeline (The Full Chain)

Props must flow through 4 files to reach the Remotion composition:

```
tiktok-to-remotion.ts (scriptToAppDemoProps)
  → returns AppDemoVideoProps including audioStartOffset, backgroundMusicUrl, etc.

compose-tiktok.ts (composeVideo)
  → cherry-picks props and passes to renderRemotionVideo()
  → MUST explicitly pass each prop (no spread)

remotion-renderer.ts (renderRemotionVideo)
  → builds inputProps for the AppDemoVideo composition
  → MUST forward props in the AppDemoVideo branch (line ~355)

AppDemoVideo.tsx (React component)
  → receives props and renders layers
```

**Critical lesson:** If you add a new prop to `AppDemoVideoProps`, you must also:

1. Add it to `scriptToAppDemoProps` return value
2. Add it to `compose-tiktok.ts` renderRemotionVideo call
3. Add it to `remotion-renderer.ts` RenderVideoProps interface
4. Add it to the AppDemoVideo branch in `remotion-renderer.ts`

Missing any step = prop silently defaults to undefined.

## Composition Layer Order (AppDemoVideo.tsx)

1. `<Video>` — screen recording (z-index 1), trimmed via `startFrom`
2. `<HookIntro>` — animated word-by-word hook text (z-index 16)
3. `<TextOverlays>` — mid-video overlays + outro CTA
4. `<AnimatedSubtitles>` — word-level karaoke (z-index 15)
5. `<Audio>` — TTS voiceover (delayed by `audioStartOffset`)
6. `<Audio>` — background music (full duration, 15% volume)
7. `<ProgressIndicator>` — thin bar at bottom
8. `<TransitionEffect>` — 0.8s fade to black at end

## Category Visuals

Each script maps to a category for accent colors/highlights:

```ts
const TIKTOK_CATEGORY_MAP = {
  'dashboard-overview': 'transits',
  'horoscope-deepdive': 'zodiac',
  'tarot-patterns': 'tarot',
  'astral-guide': 'divination',
  'birth-chart': 'birth-chart',
  'profile-circle': 'zodiac',
  'sky-now-deepdive': 'transits',
  'numerology-deepdive': 'numerology',
  'pattern-timeline': 'tarot',
  'ritual-system': 'spells',
  'transit-wisdom-deepdive': 'transits',
  'streaks-progress': 'lunar',
  'tarot-spreads': 'tarot',
  'crystals-overview': 'crystals',
  'spells-overview': 'spells',
  'grimoire-search': 'divination',
};
```

Category visuals config: `src/remotion/config/category-visuals.ts`

## CLI Commands

```bash
# Render one video
pnpm compose:tiktok dashboard-overview

# Render all 16
pnpm compose:tiktok

# Quick preview (lower quality, faster render)
pnpm compose:tiktok --preview

# Show captions/hashtags for posting
pnpm compose:tiktok --info

# Force regenerate TTS (e.g., after voiceover text change)
pnpm compose:tiktok --force-tts

# Skip TTS (render without voiceover)
pnpm compose:tiktok --no-tts

# Record a screen recording
pnpm record:app-features dashboard-overview

# Record all
pnpm record:app-features
```

## Known Issues & Edge Cases

1. **TTS duration > script duration:** The pipeline auto-extends the Remotion composition to fit. Check "Duration: extended" in compose output.

2. **2 scripts lack static voiceoverLine:** `sky-now-deepdive` and `numerology-deepdive` static versions have no voiceoverLine on scenes (relies on hardcoded durationSeconds). Their dynamic generators DO add voiceoverLine.

3. **Fragile selectors:** Some click targets use CSS class selectors (`.max-h-80 a`) or `:has-text()` pseudo-selectors that may break if DOM changes. Prefer `data-testid` attributes.

4. **Video source exhaustion:** If the Remotion composition duration exceeds the recording length, the `<Video>` component will show the last frame (frozen). This can happen when TTS is significantly longer than the script.

5. **Background music loop:** The current `<Audio>` component does NOT loop. If a video exceeds the music track length, there will be silence. For videos under ~60s this is fine.

## Fixes Applied (Feb 2025 Session)

### Subtitle Legibility

- Moved subtitles from 12% → 22% bottom (above TikTok UI zone)
- Widened right padding from 5% → 14% (avoids like/share buttons)
- Switched font from Roboto Mono → Roboto sans-serif
- Bumped all font weights (500→600, 600→700, 700→800)
- Font size 44px → 46px

### Audio

- Added background music (`lunary-bed-v1.mp3` at 15% volume) to all videos
- Fixed backgroundMusic props not piping through renderer (was in tiktok-to-remotion but not forwarded through compose-tiktok.ts and remotion-renderer.ts)

### Timing

- Fixed audioStartOffset: was hardcoded 1.4s for all 16 scripts, now per-script (1.4s for 3 with DISMISS_MODALS, 0.8s for 13 others)
- Fixed audioStartOffset not piping through renderer at all (computed in tiktok-to-remotion.ts but never reached AppDemoVideo.tsx)
- Added `startFrom` to `<Video>` component to skip recording dead frames (eliminated black at start)

### Theme

- Updated theme defaults (FONTS.subtitle, STYLES.subtitle.fontSize) to match TikTok-optimized values
