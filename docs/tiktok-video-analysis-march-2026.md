# TikTok Video Analysis & Improvement Plan

**Date**: March 2026
**Account**: @lunary.app (600 followers)
**Period analysed**: Last 7 days (late Feb / early Mar 2026)

---

## Part 1: Current Performance Data

### Overview Metrics (7 days)

| Metric            | Value                              |
| ----------------- | ---------------------------------- |
| Views             | 15,000                             |
| Profile views     | 45                                 |
| Likes             | 809                                |
| Comments          | 298                                |
| Shares            | 40                                 |
| Followers gained  | +46 net                            |
| Total followers   | 600                                |
| Like rate         | 5.4%                               |
| Follow conversion | 0.4% (46 from ~11K unique viewers) |

### Traffic Sources

| Source       | %     |
| ------------ | ----- |
| For You page | 96.3% |
| Search       | 3.4%  |
| Other        | 0.3%  |

### Audience Demographics

**Viewers** (people who saw videos):

- 72% female, 27% male
- Top age: 25-34
- Top country: UK 17.9%

**Followers** (people who followed):

- 52% male, 48% female
- Top country: Nigeria 13.3%, UK only 3.3%
- Disconnect: viewer demographics don't match follower demographics

### Top Performing Content

| Content Type    | Example                      | Avg Views | Like Rate | Notes                   |
| --------------- | ---------------------------- | --------- | --------- | ----------------------- |
| Angel numbers   | 111                          | 9,900     | 16.4%     | S-tier, breakout format |
| Angel numbers   | 222                          | 2,370     | 19.8%     | Highest like rate       |
| Zodiac callouts | "Capricorn: feeling drained" | ~500      | ~5%       | Identity-driven         |
| Educational     | Tarot structure              | ~200      | ~3%       | Lowest reach            |

### Peak Activity Times

- **Viewers most active**: 3-4pm UK time (15:00-16:00 UTC)
- **Followers most active**: 3pm UK time (15:00 UTC)
- **Best day**: Friday-Saturday

---

## Part 2: Current Video Pipeline Analysis

### What the pipeline does well

Lunary's Remotion pipeline is production-grade with features most creators don't have:

1. **7 animated backgrounds**: starfield, aurora, floating-orbs, candle-flames, sacred-geometry, mist-wisps, ember-particles
2. **Category-to-visual mapping**: Each content category gets a distinct background animation, gradient palette, highlight colour, and particle tint
3. **Whisper-synced subtitles**: Word-level timing from OpenAI Whisper, not character estimation
4. **Adaptive subtitle opacity**: Background brightness detection adjusts contrast automatically
5. **Zodiac symbol overlays**: Detected from subtitle text in real-time
6. **Mid-video micro-CTAs**: "Save this", "Wait for it" at 60% duration for retention
7. **End CTA rotation**: 70% engagement / 30% brand, deterministically rotated
8. **SFX pattern interrupts**: whoosh, pop, chime sound effects
9. **Persistent watermark**: "lunary.app" at bottom-centre
10. **Progress indicator**: Thin progress bar showing video position

### Current posting schedule

3 videos/day across 3 time slots (UTC):

| Slot         | Time (UTC) | UK Time | US Eastern | Content                     |
| ------------ | ---------- | ------- | ---------- | --------------------------- |
| Primary      | 12:00      | 12pm    | 7am        | Educational grimoire themes |
| Engagement A | 17:00      | 5pm     | 12pm       | Deep dives, numerology      |
| Engagement B | 21:00      | 9pm     | 4pm        | Engagement formats          |

**Built-in A/B**: Times rotate deterministically through windows per audience tier:

- Discovery: 11, 12, 13, 14 UTC (+1hr weekends)
- Consideration: 16, 17, 18 UTC (-1hr weekends)
- Conversion: 19, 20, 21 UTC (stable)

### Content type distribution

- Angel numbers: max 2x/week (scarcity strategy)
- Sign-specific content: at least 1x/day
- Never same content type in both engagement slots same day
- Per-type weekly caps (default 4)

---

## Part 3: Problems Identified

### P1: Angel numbers + zodiac share the same visual identity (aurora)

Both `angel-numbers` and `zodiac` map to the `aurora` background animation in `category-visuals.ts`. These are Lunary's two biggest content types and they look identical visually. A viewer scrolling the For You page cannot distinguish an angel number video from a zodiac callout at a glance.

**File**: `src/remotion/config/category-visuals.ts:87-91`

```
numerology: 'aurora',
'angel-numbers': 'aurora',  // <-- same as zodiac
zodiac: 'aurora',            // <-- same as angel-numbers
```

**Note**: Comment says aurora was switched from sacred-geometry because "aurora bg consistently outperforms in TikTok engagement data". But this comparison is confounded: angel number content outperforms regardless of background. The test measured content performance, not background performance.

### P1b: OG images still generated but never displayed

`buildThematicVideoComposition()` calls `getThematicImageUrl()` to generate background images for 3 segments. However, `ShortFormVideo.tsx` never renders these images visually: the `images` prop is only used for topic detection timing (extracting topic names to drive zodiac symbol overlays). The animated Remotion background (`AnimatedBackground`) is always the visible backdrop.

This means the pipeline is generating OG image URLs as wasted work. The topic could be derived directly from the script/facet data instead.

**File**: `src/lib/video/thematic-video.ts:330-347` (generates images that are never displayed)

### P2: Hook intro variants never used for topic videos

`HookIntro` supports animation variants via the `hookIntroVariant` prop, but `buildThematicVideoComposition()` in `thematic-video.ts` never sets it. Every topic video gets the default hook animation. Only app demo videos (via `tiktok-to-remotion.ts`) use variants.

**File**: `src/lib/video/thematic-video.ts` (no `hookIntroVariant` in returned props)

### P3: Identical 3-segment structure for all content types

Every video follows the same composition: hook text, 3 image segments (Context/Significance/Reflection), micro-CTA, end CTA, follow stamp. This structure works for educational content but is suboptimal for:

- **Angel numbers** (15-20s): Too much structure for a simple reveal
- **Rankings/hot takes**: Need faster pacing, list format
- **Sign callouts**: Hook-heavy, should front-load the personal hook

### P4: Single font (Roboto) everywhere

Title, subtitle, body, overlays, stamps, CTAs: all Roboto. No typographic variety to create visual hierarchy or differentiate content types.

### P5: Primary slot (12:00 UTC) is the weakest time for global reach

Most discovery content posts at 12:00 UTC (12pm UK, 7am ET, 4am PT). TikTok Studio shows UK peak at 15:00-16:00 UTC, but more importantly, 96.3% of views come from the global For You algorithm: only 17.9% of viewers are UK-based. The 12:00 UTC slot misses both the UK afternoon peak AND the entire US audience (still sleeping on the west coast). Meanwhile, the 21:00 UTC slot (9pm UK = 4pm ET) has shown strong results because it catches US prime time. Videos at 10pm UK have also performed well (5pm ET). The primary slot should shift later to catch the UK-US overlap window.

### P6: Single TTS voice for all content

`TTS_PRESETS.medium` is hardcoded in `process-video-jobs/route.ts:382`. Same voice, same pacing for every video regardless of content type. Angel numbers could benefit from slower, more mystical delivery. Rankings could use faster, more energetic pacing.

### P7: Follow conversion rate is very low (0.4%)

11,000 unique viewers but only 46 new followers. The CTA "Follow for more cosmic updates" at the end of videos isn't compelling enough, or viewers are leaving before reaching it.

### P8: No posting time analytics tracking

The deterministic rotation provides A/B data, but there's no system to analyse which posting hours actually correlate with better performance. The rotation data goes to waste without a feedback loop.

---

## Part 4: Improvement Plan

### Phase 1: Quick Wins (config changes, no new features)

#### 1.1 Adjust primary posting slot + A/B test timing

**Key insight**: 96.3% of views come from the For You page (global algorithm), not existing followers. Only 17.9% of viewers are UK-based, and 82%+ are elsewhere (US, Nigeria, etc.). Optimising purely for UK peak times would be a mistake.

**Current schedule analysis**:

| Slot  | UTC  | UK   | US Eastern |                                       US Pacific | Verdict |
| ----- | ---- | ---- | ---------: | -----------------------------------------------: | ------- |
| 12:00 | 12pm | 7am  |        4am | **Weakest**: too early for US, just lunch for UK |
| 17:00 | 5pm  | 12pm |        9am |       **Solid**: UK evening + US morning overlap |
| 21:00 | 9pm  | 4pm  |        1pm |         **Strongest US slot**: US afternoon peak |

The 21:00 slot is NOT a dropoff: it's 4pm US Eastern / 1pm US Pacific, which is prime time for the largest potential audience. Videos at 10pm UK (22:00 UTC = 5pm ET) have also performed well, confirming US viewers drive significant engagement.

**Proposed change**: Shift the weakest slot (12:00 UTC) later to catch more US viewers while keeping the 4-5 hour gap:

| Slot   | Current   | Proposed         | Gap     | Rationale                                              |
| ------ | --------- | ---------------- | ------- | ------------------------------------------------------ |
| Slot 1 | 12:00 UTC | **14:00 UTC**    | -       | 2pm UK, 9am ET, 6am PT: hits UK afternoon + US morning |
| Slot 2 | 17:00 UTC | 17:00 UTC (keep) | 3 hours | UK evening + US lunch                                  |
| Slot 3 | 21:00 UTC | 21:00 UTC (keep) | 4 hours | US afternoon peak                                      |

Gaps are 3hr and 4hr (close to 4-5hr research recommendation). Discovery window rotates through **13, 14, 15** UTC (+1hr weekends) instead of 11, 12, 13, 14.

**Files to change**:

- `src/utils/posting-times.ts`: `VIDEO_POSTING_HOURS.primary` 12 -> 14
- `src/lib/social/video-scripts/content-types.ts`: Update `idealTime` for discovery types (12 -> 14), update `POSTING_TIME_WINDOWS.discovery.windowHours` to [13, 14, 15]
- `POSTING_TIME_WINDOWS.discovery.baseHour` 12 -> 14

#### 1.2 Give angel numbers a distinct background

Switch angel-numbers back to `sacred-geometry` (or a new animation). They're the best-performing content and deserve a visually distinct identity.

**File**: `src/remotion/config/category-visuals.ts`

```
'angel-numbers': 'sacred-geometry',  // was 'aurora'
```

#### 1.3 Rotate hook intro variants

Add variant rotation to `buildThematicVideoComposition()` based on content type:

**File**: `src/lib/video/thematic-video.ts`

Map content types to hook variants for visual variety between videos.

### Phase 2: A/B Testing for Timing

#### 2.1 Track posting time vs performance

Create a lightweight analytics table to track which posting hours correlate with better TikTok performance. Use TikTok's existing analytics (scraped via Chrome MCP or manual) correlated against `social_posts.scheduled_date`.

#### 2.2 Weekend vs weekday analysis

The current system has a weekend adjustment (+1hr for discovery, -1hr for consideration). Validate whether this actually helps or hurts.

#### 2.3 Implement a proper timing A/B test

Rather than deterministic rotation across all content types, run a controlled test:

- **Control**: Current times (13, 17, 21 UTC after Phase 1 shift)
- **Variant**: Shifted to match exact peak (14, 18, 22 UTC)
- Split by week: odd weeks = control, even weeks = variant
- Measure: views, likes, follows, watch-through rate
- Duration: 4 weeks minimum for statistical significance

### Phase 3: Rendering Improvements

#### 3.1 Content-type-specific composition structures

Instead of one-size-fits-all 3-segment structure:

| Content Type  | Proposed Structure                | Duration            |
| ------------- | --------------------------------- | ------------------- |
| Angel numbers | Number reveal -> meaning -> CTA   | 15-20s, 2 segments  |
| Rankings      | Hook -> fast list -> CTA          | 20-30s, list format |
| Sign callouts | Personal hook -> body -> CTA      | 15-25s, 2 segments  |
| Educational   | Keep current 3-segment            | 25-40s              |
| Hot takes     | Bold statement -> argument -> CTA | 15-25s, 2 segments  |

#### 3.2 TTS voice variation

Add voice presets per content type:

| Content Type       | Voice Preset         | Pacing  |
| ------------------ | -------------------- | ------- |
| Angel numbers      | Slower, softer       | 2.2 wps |
| Rankings/hot takes | Faster, energetic    | 3.0 wps |
| Educational        | Current medium       | 2.6 wps |
| Sign callouts      | Conversational, warm | 2.4 wps |

#### 3.3 Font variation

Add a secondary display font for hook text (e.g., a serif or display face for angel numbers) while keeping Roboto for subtitles. Hook text is the thumbnail/first frame: making it visually distinct from subtitles improves scroll-stopping power.

#### 3.4 Stronger first frame

The first rendered frame is what TikTok shows as a static thumbnail before autoplay. Ensure the hook text (not the topic label) is what renders on frame 1 for maximum tap-through.

### Phase 4: Follow Conversion

#### 4.1 Vary CTA messaging

Current end CTA "Follow for more cosmic updates" is generic. Test alternatives:

- "Follow @lunary.app for your sign's updates"
- "More [topic] content every day" (topic-specific)
- "Part 2 drops tomorrow" (series hook)

#### 4.2 Earlier CTA placement

Don't wait until the last 6 seconds. Many viewers drop off before reaching the end CTA. Test placing a subtle "follow" stamp at 40% duration (where retention is still high) in addition to the end CTA.

---

## Part 5: Priority & Sequencing

| Priority | Change                                  | Effort                     | Impact |
| -------- | --------------------------------------- | -------------------------- | ------ |
| 1        | Shift discovery posting to 13:00 UTC    | Low (config)               | Medium |
| 2        | Angel numbers -> sacred-geometry bg     | Low (1 line)               | Medium |
| 3        | Rotate hook intro variants              | Low (thematic-video.ts)    | Medium |
| 4        | Set up timing A/B tracking              | Medium (new table + query) | High   |
| 5        | Content-specific composition structures | High (new templates)       | High   |
| 6        | TTS voice variation                     | Medium (preset mapping)    | Medium |
| 7        | Follow CTA experimentation              | Low (copy changes)         | Medium |
| 8        | Font variation for hooks                | Medium (font loading)      | Low    |

### Recommended execution order

**Week 1**: Items 1-3 (quick config wins)
**Week 2**: Item 4 (timing analytics)
**Week 3-4**: Item 5 (composition restructuring)
**Ongoing**: Items 6-8 based on data from timing A/B

---

## Appendix: Key File Paths

| File                                             | Purpose                                            |
| ------------------------------------------------ | -------------------------------------------------- |
| `src/remotion/config/category-visuals.ts`        | Background animation mapping per category          |
| `src/remotion/styles/theme.ts`                   | Brand colours, fonts, timing constants             |
| `src/remotion/compositions/ShortFormVideo.tsx`   | Main short-form video composition                  |
| `src/lib/video/thematic-video.ts`                | Builds composition props for topic videos          |
| `src/utils/posting-times.ts`                     | Posting schedule, slot hours, rotation             |
| `src/lib/social/video-scripts/content-types.ts`  | Content type configs, audience tiers, time windows |
| `src/app/api/cron/process-video-jobs/route.ts`   | Video rendering + publishing pipeline              |
| `src/remotion/components/HookIntro.tsx`          | Hook intro animation (supports variants)           |
| `src/remotion/components/AnimatedBackground.tsx` | Background animation selector                      |
| `src/lib/tts/presets.ts`                         | TTS voice presets                                  |
