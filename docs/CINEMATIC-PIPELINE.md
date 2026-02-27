# Cinematic Marketing Video Pipeline

Reference for the `PhoneMockup`-based video and static image pipeline introduced Feb 2026.

---

## Overview

The cinematic pipeline adds a new tier of production quality above the existing TikTok pipeline. Screen recordings are shown inside a floating CSS phone mockup on a cosmic background, rather than full-screen raw recordings.

**Formats produced:**

| Format                | Composition                | Dimensions | Use                        |
| --------------------- | -------------------------- | ---------- | -------------------------- |
| YouTube / X landscape | `LandscapeShowcase`        | 1920×1080  | Native video on X, YouTube |
| Multi-phone hero      | `MultiPhoneShowcase`       | 1920×1080  | Website hero, social image |
| Cinematic TikTok      | `CinematicPhoneDemo`       | 1080×1920  | Upgraded TikTok / Reels    |
| Square showcase       | `LandscapeShowcaseSquare`  | 1080×1080  | Instagram square           |
| Square multi-phone    | `MultiPhoneShowcaseSquare` | 1080×1080  | Instagram square           |

---

## Commands

```bash
# Preview compositions in Remotion Studio
npx remotion studio

# Render landscape / multiphone videos (CRF 18 production quality)
pnpm compose:cinematic

# Single video
pnpm compose:cinematic app-tour

# Quick preview (CRF 28)
pnpm compose:cinematic app-tour --preview

# Landscape only
pnpm compose:cinematic --format landscape

# Export static PNG marketing shots (renderStill at frame 0)
pnpm compose:static

# Single static shot
pnpm compose:static multi-phone-hero
```

**Outputs:**

- Videos: `public/marketing/final/*.mp4`
- Static shots: `public/marketing/*.png`

---

## Screen Recordings Reference

All recordings are in `public/app-demos/*.webm`. Aspect ratio: 9:19.5 (iPhone portrait).

### Best seek times for cinematic use

| File                           | Size   | Best seek | What's visible at that point                        |
| ------------------------------ | ------ | --------- | --------------------------------------------------- |
| `dashboard-overview.webm`      | 16 MB  | **1s**    | Dashboard: cosmic score, horoscope card, Sky Now    |
| `dashboard-overview.webm`      | —      | **6s**    | Sky Now expanded: all planets + house positions     |
| `birth-chart.webm`             | 4.9 MB | **1s**    | Birth chart wheel: full planetary wheel             |
| `birth-chart.webm`             | —      | **5s**    | Planet list with house positions                    |
| `horoscope-deepdive.webm`      | 1.7 MB | **2s**    | Daily horoscope intro                               |
| `horoscope-deepdive.webm`      | —      | **8s**    | Transit Wisdom: personalised interpretation section |
| `tarot-patterns.webm`          | 3.5 MB | **5s**    | 30-day pattern view: card frequency grid            |
| `tarot-spreads.webm`           | 4.6 MB | **2s**    | Spread selection screen                             |
| `astral-guide.webm`            | 1.3 MB | **4s**    | AI response streaming with grimoire citations       |
| `profile-circle.webm`          | 2.9 MB | **4s**    | Synastry circle with compatibility score            |
| `sky-now-deepdive.webm`        | 2.7 MB | **3s**    | Sky Now: expanded planet table                      |
| `numerology-deepdive.webm`     | 1.5 MB | **2s**    | Numerology: life path + personal year               |
| `pattern-timeline.webm`        | 2.0 MB | **3s**    | Pattern timeline: transit history graph             |
| `ritual-system.webm`           | 1.5 MB | **2s**    | Daily ritual checklist                              |
| `transit-wisdom-deepdive.webm` | 4.3 MB | **4s**    | Transit detail: full interpretation                 |
| `streaks-progress.webm`        | 3.3 MB | **3s**    | Streak tracker + progress charts                    |
| `crystals-overview.webm`       | 4.9 MB | **3s**    | Crystal grid: current cosmic recommendations        |
| `spells-overview.webm`         | 3.5 MB | **3s**    | Spell library: categories + featured                |
| `grimoire-search.webm`         | 3.5 MB | **3s**    | Grimoire search results                             |

### Notes on `dashboard-overview.webm` (the most versatile)

- `seek=1s` → shows the full dashboard with cosmic score panel and today's horoscope card — best for "dashboard" hero shots
- `seek=6s` → Sky Now section is expanded, showing all 17 planets with house positions — best for "17 celestial bodies" messaging
- `seek=12s` → Usually scrolled further down showing additional sections

### Notes on `birth-chart.webm`

- `seek=1s` → Full wheel with planets placed — the iconic visual
- `seek=5s` → Scrolled to planet list table

---

## Showcase Scripts

Defined in `src/lib/video/showcase-scripts.ts`.

### Landscape scripts

| ID                  | Title                                   | Duration | Scenes                                                        |
| ------------------- | --------------------------------------- | -------- | ------------------------------------------------------------- |
| `app-tour`          | Everything astrology, in one place      | 45s      | 6 (Dashboard → Sky Now → Birth Chart → Transits → Tarot → AI) |
| `birth-chart-depth` | Your chart. Not your sign.              | 30s      | 4 (Wheel → Planets → Natal → Grimoire)                        |
| `synastry-reveal`   | 84% compatible. But look at the timing. | 30s      | 4 (Circle → Aspects → Timing → Add anyone)                    |
| `morning-ritual`    | Your morning cosmic check-in            | 30s      | 4 (Dashboard → Horoscope → Tarot → Streak)                    |

### Multiphone scripts

| ID                 | Phones                                           | Layout | Use                        |
| ------------------ | ------------------------------------------------ | ------ | -------------------------- |
| `multi-phone-hero` | 5 (Dashboard, Birth chart, Horoscope, Tarot, AI) | arc    | Website hero, social image |
| `multi-phone-deep` | 7 (all major features)                           | row    | Animated promo video       |

---

## New Components

### `PhoneMockup` (`src/remotion/components/PhoneMockup.tsx`)

CSS-based iPhone mockup using `perspective` + `rotateX/Y` for 3D depth. No Three.js.

```tsx
<PhoneMockup
  width={320} // chassis width px (height auto-calculated at 19.5:9)
  scale={1} // overall multiplier
  tiltX={4} // forward lean degrees
  tiltY={-10} // left/right lean degrees
  floatAmplitude={8} // vertical float px
  floatPeriod={4} // float cycle seconds
  glowColor='#8458D8' // screen edge glow
>
  <Video src={staticFile('app-demos/dashboard-overview.webm')} />
</PhoneMockup>
```

### `FeatureCallout` (`src/remotion/components/FeatureCallout.tsx`)

Floating pill label with optional connector line. Position normalised 0–1 relative to composition.

```tsx
<FeatureCallout
  text='Your chart. Today.'
  frameIn={30}
  frameOut={180}
  position={{ x: 0.84, y: 0.5, side: 'right' }}
  color='#8458D8'
  icon='✦'
/>
```

---

## Architecture Notes

- **No new npm dependencies** — `perspective` + `rotateX/Y` in CSS gives convincing 3D
- **PhoneMockup is pure CSS** — dynamic island, buttons, glow all CSS divs
- **renderStill() for static export** — `@remotion/renderer` is already installed; `compose-static.ts` calls it directly
- **Bundle caching** — `cinematic-renderer.ts` caches the Webpack bundle in module scope so multiple renders in one process don't re-bundle
- **Seek via `startFrom`** — `<Video startFrom={seekFrame}>` lets each phone slot show the right moment without trimming the recording

---

## Adding a New Showcase Script

1. Add to `LANDSCAPE_SCRIPTS` or `MULTI_PHONE_SCRIPTS` in `src/lib/video/showcase-scripts.ts`
2. For multiphone: reference the best seek times from the table above
3. For landscape: plan scenes with 6–8s each, one recording per scene
4. Run `pnpm compose:cinematic <id>` or `pnpm compose:static <id>`
