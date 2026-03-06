/**
 * Showcase Video Scripts
 *
 * Defines content for the cinematic marketing video pipeline:
 *   - LandscapeShowcase (1920×1080, YouTube / X)
 *   - MultiPhoneShowcase (1920×1080 static hero)
 *
 * All recordings live in public/app-demos/web/ (H.264 Constrained Baseline,
 * transcoded from iPhone 6.5" captures for Remotion compatibility).
 *
 * Seek times were verified by frame extraction — each seekToSeconds value
 * points to a moment where the stated UI feature is clearly visible.
 *
 * Key timestamps per recording:
 *   birth-chart.mp4:            10s = full SVG wheel, 20s = 12 Houses grid
 *   horoscope-deepdive.mp4:      5s = personalised header + numerology, 10s = Transit Wisdom
 *   tarot-patterns.mp4:          5s = 30-day selector + Dominant Themes
 *   astral-guide.mp4:            8s = AI chat conversation in progress
 *   grimoire-search.mp4:         0s = Grimoire landing with search bar, 5s = guide list
 *   sky-now-deepdive.mp4:        3s = all planets with sign/degree/house/time-remaining
 *   transit-wisdom-deepdive.mp4: 0s = Universal Day + Personal Day numerology cards, 8s = Transit Wisdom section
 *   ritual-system.mp4:           0s = home dashboard with Cosmic Score + Today's Ritual
 */

import type { ShowcaseScene } from '@/remotion/compositions/LandscapeShowcase';
import type { PhoneSlot } from '@/remotion/compositions/MultiPhoneShowcase';

export type ShowcaseFormat = 'landscape' | 'multiphone' | 'cinematic-tiktok';

export interface LandscapeScript {
  id: string;
  format: 'landscape';
  title: string;
  totalSeconds: number;
  backgroundType?:
    | 'starfield'
    | 'aurora'
    | 'floating-orbs'
    | 'candle-flames'
    | 'sacred-geometry'
    | 'mist-wisps'
    | 'ember-particles';
  scenes: ShowcaseScene[];
  /** Social caption for posting alongside the video */
  caption?: string;
}

export interface MultiPhoneScript {
  id: string;
  format: 'multiphone';
  title: string;
  phones: PhoneSlot[];
  layout?: 'arc' | 'row' | 'fan';
  backgroundType?:
    | 'starfield'
    | 'aurora'
    | 'floating-orbs'
    | 'candle-flames'
    | 'sacred-geometry'
    | 'mist-wisps'
    | 'ember-particles';
  heading?: string;
  subheading?: string;
  /** When true, renders as animated video. When false, intended for renderStill(). */
  animate?: boolean;
}

export type ShowcaseScript = LandscapeScript | MultiPhoneScript;

// ============================================================================
// Landscape Scripts — 1920×1080 for YouTube / X
// ============================================================================

export const LANDSCAPE_SCRIPTS: LandscapeScript[] = [
  {
    id: 'app-tour',
    format: 'landscape',
    title: 'Everything astrology, in one place',
    totalSeconds: 45,
    backgroundType: 'starfield',
    caption:
      'Most astrology apps give you generic horoscopes. Lunary gives you yours: every planet in your exact houses, a personalised daily ritual, and 2,000+ articles linked to your chart.',
    scenes: [
      {
        // birth-chart at 10s: full SVG wheel visible with all planetary symbols
        headline: 'Your birth chart.\nNot just your sign.',
        subline: '17 celestial bodies. Real astronomical data.',
        callout: 'Birth chart wheel',
        videoSrc: 'app-demos/web/birth-chart.mp4',
        seekToSeconds: 10,
        startTime: 0,
        endTime: 8,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
      {
        // horoscope-deepdive at 5s: "Celeste's Horoscope — Guidance written just for you"
        headline: 'Your horoscope.\nWritten just for you.',
        subline: 'Unique to your chart, not your sign.',
        callout: 'Daily horoscope',
        videoSrc: 'app-demos/web/horoscope-deepdive.mp4',
        seekToSeconds: 5,
        startTime: 8,
        endTime: 16,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        // sky-now-deepdive at 3s: every planet with exact sign/degree/house + time remaining
        // Shows real-time sky mapped to your natal chart — strongest personalisation USP
        headline: 'Every planet.\nIn your sky.\nRight now.',
        subline: 'Each one mapped to your houses.',
        callout: 'Live sky map',
        videoSrc: 'app-demos/web/sky-now-deepdive.mp4',
        seekToSeconds: 3,
        startTime: 16,
        endTime: 24,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        // tarot-patterns at 5s: "30-Day Patterns" selector + "Dominant Themes: abundance"
        headline: '30 days of tarot.\nThe patterns emerge.',
        subline: 'See which themes keep showing up.',
        callout: '30-day analysis',
        videoSrc: 'app-demos/web/tarot-patterns.mp4',
        seekToSeconds: 5,
        startTime: 24,
        endTime: 32,
        calloutSide: 'right',
        highlightColor: '#e91e63',
      },
      {
        // grimoire-search at 0s: "Welcome to the Grimoire" + search bar — clean, striking
        headline: '2,000+ articles.\nSearchable.\nLinked to your chart.',
        subline: 'Tarot, crystals, astrology, ritual.',
        callout: 'Grimoire',
        videoSrc: 'app-demos/web/grimoire-search.mp4',
        seekToSeconds: 0,
        startTime: 32,
        endTime: 39,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        // ritual-system at 0s: "Good morning, Celeste" home screen with Cosmic Score (75 Creative)
        // + personalised reading + TODAY'S RITUAL tailored to chart + moon phase
        headline: 'Your day.\nCosmically mapped.',
        subline: 'Cosmic Score, ritual, and sky reading.',
        callout: "Today's ritual",
        videoSrc: 'app-demos/web/ritual-system.mp4',
        seekToSeconds: 0,
        startTime: 39,
        endTime: 45,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
    ],
  },

  {
    id: 'birth-chart-depth',
    format: 'landscape',
    title: 'Your chart. Not your sign.',
    totalSeconds: 30,
    backgroundType: 'sacred-geometry',
    caption:
      'Sun sign astrology gives 12 possible readings. Your birth chart gives one. Explore what 17 planets in your exact houses actually means.',
    scenes: [
      {
        // birth-chart at 8s: SVG wheel just coming into view, chart legend visible above
        headline: 'Not your sun sign.\nYour entire chart.',
        subline: '17 planets. 12 houses. One person.',
        callout: 'Birth chart wheel',
        videoSrc: 'app-demos/web/birth-chart.mp4',
        seekToSeconds: 8,
        startTime: 0,
        endTime: 8,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
      {
        // birth-chart at 10s: full wheel clearly visible
        headline: 'Every planet.\nIn its exact degree.',
        subline: 'Placidus house system. VSOP87 precision.',
        callout: 'Natal positions',
        videoSrc: 'app-demos/web/birth-chart.mp4',
        seekToSeconds: 10,
        startTime: 8,
        endTime: 16,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        // birth-chart at 20s: "Your 12 Houses" grid — 1st house Taurus, 2nd Gemini etc.
        headline: '12 houses.\nEvery one has a meaning.',
        subline: 'Sign, ruling planet, and interpretation.',
        callout: 'Your 12 houses',
        videoSrc: 'app-demos/web/birth-chart.mp4',
        seekToSeconds: 20,
        startTime: 16,
        endTime: 24,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        // grimoire-search at 0s: Grimoire landing — every placement links to an article
        headline: 'Every placement\nhas a meaning.',
        subline: 'Sourced from 2,000+ grimoire articles.',
        callout: 'Grimoire linked',
        videoSrc: 'app-demos/web/grimoire-search.mp4',
        seekToSeconds: 0,
        startTime: 24,
        endTime: 30,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
    ],
  },

  {
    id: 'daily-depth',
    format: 'landscape',
    title: 'What the sky is doing to your chart today',
    totalSeconds: 30,
    backgroundType: 'aurora',
    caption:
      "Generic horoscopes give you one of 12 readings. Lunary generates yours from your actual natal chart and today's transits.",
    scenes: [
      {
        // horoscope-deepdive at 5s: personalised header "Celeste's Horoscope, Guidance written just for you"
        // + Mercury in Pisces interpretation + Universal Day 1, Personal Day 8
        headline: "Your horoscope.\nNot 600 million people's.",
        subline: 'Written from your chart, not your sign.',
        callout: 'Personalised reading',
        videoSrc: 'app-demos/web/horoscope-deepdive.mp4',
        seekToSeconds: 5,
        startTime: 0,
        endTime: 8,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        // horoscope-deepdive at 10s: scrolled to show Universal Day + Personal Day cards + Transit Wisdom
        headline: "Today's transits.\nYour interpretation.",
        subline: 'Every planet movement mapped to your chart.',
        callout: 'Transit Wisdom',
        videoSrc: 'app-demos/web/horoscope-deepdive.mp4',
        seekToSeconds: 10,
        startTime: 8,
        endTime: 16,
        calloutSide: 'right',
        highlightColor: '#9b59b6',
      },
      {
        // transit-wisdom-deepdive at 8s: Universal Day + Personal Day numerology cards
        // + Transit Wisdom section with "Ask the Astral Guide" CTA — clear, visually strong
        headline: 'Ask the Astral Guide.\nGet a real answer.',
        subline: "Grounded in your chart and today's sky.",
        callout: 'AI guide',
        videoSrc: 'app-demos/web/transit-wisdom-deepdive.mp4',
        seekToSeconds: 8,
        startTime: 16,
        endTime: 24,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        // tarot-patterns at 5s: dominant themes from last 30 days
        headline: 'What keeps coming up\nin your tarot.',
        subline: '30 days of readings. The pattern is clear.',
        callout: 'Pattern analysis',
        videoSrc: 'app-demos/web/tarot-patterns.mp4',
        seekToSeconds: 5,
        startTime: 24,
        endTime: 30,
        calloutSide: 'right',
        highlightColor: '#e91e63',
      },
    ],
  },

  {
    id: 'morning-ritual',
    format: 'landscape',
    title: 'Your morning cosmic check-in',
    totalSeconds: 30,
    backgroundType: 'floating-orbs',
    caption:
      'Start every day knowing what the sky is actually doing: not a generic horoscope, but your chart, today.',
    scenes: [
      {
        // ritual-system at 0s: "Good morning, Celeste" home screen — Cosmic Score + personalised
        // reading + TODAY'S RITUAL. Perfect opening for a morning ritual script.
        headline: 'Open the app.\nSee your day.',
        subline: 'Personalised from the moment you were born.',
        callout: 'Your daily sky',
        videoSrc: 'app-demos/web/ritual-system.mp4',
        seekToSeconds: 0,
        startTime: 0,
        endTime: 8,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        // grimoire-search at 5s: guide list (Beginner's Guide, Birth Chart Guide, Tarot Guide etc.)
        headline: 'Read something\nthat means something.',
        subline: '2,000+ articles. Searchable by topic.',
        callout: 'Grimoire guides',
        videoSrc: 'app-demos/web/grimoire-search.mp4',
        seekToSeconds: 5,
        startTime: 8,
        endTime: 16,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        // tarot-spreads at 5s: spread options including Past Present Future
        headline: 'One card.\nEvery morning.',
        subline: 'Tarot with your cosmic context.',
        callout: 'Daily tarot draw',
        videoSrc: 'app-demos/web/tarot-spreads.mp4',
        seekToSeconds: 5,
        startTime: 16,
        endTime: 24,
        calloutSide: 'right',
        highlightColor: '#9b59b6',
      },
      {
        // tarot-patterns at 5s: patterns section
        headline: 'Your ritual.\nShows up in the patterns.',
        subline: 'Consistency tracked across 30 days.',
        callout: 'Dominant themes',
        videoSrc: 'app-demos/web/tarot-patterns.mp4',
        seekToSeconds: 5,
        startTime: 24,
        endTime: 30,
        calloutSide: 'right',
        highlightColor: '#e91e63',
      },
    ],
  },
];

// ============================================================================
// Multi-Phone Scripts — 1920×1080 static hero or animated promo
// ============================================================================

export const MULTI_PHONE_SCRIPTS: MultiPhoneScript[] = [
  {
    id: 'multi-phone-hero',
    format: 'multiphone',
    title: 'Multi-phone hero',
    layout: 'arc',
    backgroundType: 'starfield',
    heading: 'Everything astrology, in one place.',
    subheading: 'Birth chart · Daily horoscope · Tarot · Grimoire · AI guide',
    animate: false,
    phones: [
      {
        videoSrc: 'app-demos/web/birth-chart.mp4',
        seekToSeconds: 10,
        label: 'Birth chart',
        glowColor: '#d4af37',
      },
      {
        videoSrc: 'app-demos/web/horoscope-deepdive.mp4',
        seekToSeconds: 5,
        label: 'Horoscope',
        glowColor: '#8458D8',
      },
      {
        videoSrc: 'app-demos/web/tarot-patterns.mp4',
        seekToSeconds: 5,
        label: 'Tarot patterns',
        glowColor: '#e91e63',
      },
      {
        videoSrc: 'app-demos/web/grimoire-search.mp4',
        seekToSeconds: 0,
        label: 'Grimoire',
        glowColor: '#5AD7FF',
      },
      {
        videoSrc: 'app-demos/web/astral-guide.mp4',
        seekToSeconds: 8,
        label: 'Astral Guide',
        glowColor: '#9b59b6',
      },
    ],
  },

  {
    id: 'multi-phone-deep',
    format: 'multiphone',
    title: 'Deep feature showcase (6 phones)',
    layout: 'row',
    backgroundType: 'aurora',
    animate: true,
    phones: [
      {
        videoSrc: 'app-demos/web/birth-chart.mp4',
        seekToSeconds: 10,
        label: 'Birth chart',
        glowColor: '#d4af37',
      },
      {
        videoSrc: 'app-demos/web/birth-chart.mp4',
        seekToSeconds: 20,
        label: '12 Houses',
        glowColor: '#8458D8',
      },
      {
        videoSrc: 'app-demos/web/horoscope-deepdive.mp4',
        seekToSeconds: 5,
        label: 'Horoscope',
        glowColor: '#9b59b6',
      },
      {
        videoSrc: 'app-demos/web/tarot-patterns.mp4',
        seekToSeconds: 5,
        label: 'Tarot',
        glowColor: '#e91e63',
      },
      {
        videoSrc: 'app-demos/web/grimoire-search.mp4',
        seekToSeconds: 0,
        label: 'Grimoire',
        glowColor: '#5AD7FF',
      },
      {
        videoSrc: 'app-demos/web/astral-guide.mp4',
        seekToSeconds: 8,
        label: 'Astral Guide',
        glowColor: '#5AD7FF',
      },
    ],
  },
];

// ============================================================================
// Combined export for scripts lookup
// ============================================================================

export const ALL_SHOWCASE_SCRIPTS: ShowcaseScript[] = [
  ...LANDSCAPE_SCRIPTS,
  ...MULTI_PHONE_SCRIPTS,
];

export function getShowcaseScript(id: string): ShowcaseScript | undefined {
  return ALL_SHOWCASE_SCRIPTS.find((s) => s.id === id);
}
