/**
 * Showcase Video Scripts
 *
 * Defines content for the cinematic marketing video pipeline:
 *   - LandscapeShowcase (1920×1080, YouTube / X)
 *   - MultiPhoneShowcase (1920×1080 static hero)
 *   - CinematicPhoneDemo (1080×1920, upgraded TikTok)
 *
 * Recordings live in public/app-demos/*.webm
 * Best moments documented in docs/app-demos.md
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
      'Most astrology apps give you generic horoscopes. Lunary gives you yours — every planet, your houses, personalised to the exact moment you were born.',
    scenes: [
      {
        headline: 'Good morning, [name].',
        subline: 'Personalised from the moment you open it.',
        callout: 'Your chart. Today.',
        videoSrc: 'app-demos/dashboard-overview.webm',
        seekToSeconds: 1,
        startTime: 0,
        endTime: 7,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        headline: 'Every planet.\nYour houses.',
        subline: 'Not generic sky positions — yours.',
        callout: 'Sky Now expanded',
        videoSrc: 'app-demos/dashboard-overview.webm',
        seekToSeconds: 6,
        startTime: 7,
        endTime: 14,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        headline: '17 celestial bodies.',
        subline: 'Most apps show 10.',
        callout: 'Full birth chart wheel',
        videoSrc: 'app-demos/birth-chart.webm',
        seekToSeconds: 1,
        startTime: 14,
        endTime: 21,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
      {
        headline: 'This transit.\n12 meanings.\nYours is one.',
        subline: 'Not copy-paste horoscopes.',
        callout: 'Transit Wisdom',
        videoSrc: 'app-demos/horoscope-deepdive.webm',
        seekToSeconds: 8,
        startTime: 21,
        endTime: 29,
        calloutSide: 'right',
        highlightColor: '#9b59b6',
      },
      {
        headline: '30 days of tarot patterns.',
        subline: 'The cards that keep showing up — and why.',
        callout: 'Pattern timeline',
        videoSrc: 'app-demos/tarot-patterns.webm',
        seekToSeconds: 5,
        startTime: 29,
        endTime: 37,
        calloutSide: 'right',
        highlightColor: '#e91e63',
      },
      {
        headline: 'Ask anything.\nSourced from 2,000+ articles.',
        subline: 'The Astral Guide.',
        callout: 'AI + Grimoire',
        videoSrc: 'app-demos/astral-guide.webm',
        seekToSeconds: 4,
        startTime: 37,
        endTime: 45,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
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
        headline: 'Not your sun sign.\nYour entire chart.',
        subline: '17 planets. 12 houses. One person.',
        callout: 'Birth chart wheel',
        videoSrc: 'app-demos/birth-chart.webm',
        seekToSeconds: 1,
        startTime: 0,
        endTime: 8,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
      {
        headline: 'Every planet.\nEvery house.\nEvery aspect.',
        subline: 'Tap any placement to understand it.',
        callout: 'Planet list + aspects',
        videoSrc: 'app-demos/birth-chart.webm',
        seekToSeconds: 5,
        startTime: 8,
        endTime: 16,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        headline: 'Your sky.\nThe moment you were born.',
        subline: 'Placidus house system. VSOP87 precision.',
        callout: 'Natal positions',
        videoSrc: 'app-demos/birth-chart.webm',
        seekToSeconds: 10,
        startTime: 16,
        endTime: 24,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        headline: 'Every placement\nhas a meaning.',
        subline: 'Sourced from 2,000+ grimoire articles.',
        callout: 'Grimoire linked',
        videoSrc: 'app-demos/grimoire-search.webm',
        seekToSeconds: 3,
        startTime: 24,
        endTime: 30,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
    ],
  },

  {
    id: 'synastry-reveal',
    format: 'landscape',
    title: '84% compatible. But look at the timing.',
    totalSeconds: 30,
    backgroundType: 'aurora',
    caption:
      'Compatibility scores are a starting point. The 36 planetary aspects between you and another person tell a much more interesting story.',
    scenes: [
      {
        headline: 'Two charts.\nOne relationship.',
        subline: 'Synastry: the astrology of connection.',
        callout: 'Profile circle',
        videoSrc: 'app-demos/profile-circle.webm',
        seekToSeconds: 1,
        startTime: 0,
        endTime: 8,
        calloutSide: 'right',
        highlightColor: '#e91e63',
      },
      {
        headline: '36 planetary\naspects computed.',
        subline: 'Not vibes — actual angular relationships.',
        callout: '36 aspects analysed',
        videoSrc: 'app-demos/profile-circle.webm',
        seekToSeconds: 4,
        startTime: 8,
        endTime: 16,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        headline: 'The compatibility\nscore matters less.',
        subline: 'The timing tab matters more.',
        callout: 'Timing + transits',
        videoSrc: 'app-demos/profile-circle.webm',
        seekToSeconds: 8,
        startTime: 16,
        endTime: 24,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
      },
      {
        headline: 'Add anyone.\nCompare charts instantly.',
        subline: 'Family, friends, partners — your cosmic circle.',
        callout: 'Circle system',
        videoSrc: 'app-demos/profile-circle.webm',
        seekToSeconds: 12,
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
      'Start every day knowing what the sky is actually doing — not a generic horoscope, but your chart, today.',
    scenes: [
      {
        headline: 'Open the app.\nSee your sky.',
        subline: 'Real-time planetary positions in your houses.',
        callout: 'Cosmic dashboard',
        videoSrc: 'app-demos/dashboard-overview.webm',
        seekToSeconds: 1,
        startTime: 0,
        endTime: 8,
        calloutSide: 'right',
        highlightColor: '#8458D8',
      },
      {
        headline: "Today's transits.\nYour interpretation.",
        subline: "Not 600 million people's horoscope. Yours.",
        callout: 'Daily horoscope',
        videoSrc: 'app-demos/horoscope-deepdive.webm',
        seekToSeconds: 2,
        startTime: 8,
        endTime: 16,
        calloutSide: 'right',
        highlightColor: '#d4af37',
      },
      {
        headline: 'One card.\nEvery morning.',
        subline: 'Tarot draw with cosmic context.',
        callout: 'Daily tarot draw',
        videoSrc: 'app-demos/tarot-spreads.webm',
        seekToSeconds: 2,
        startTime: 16,
        endTime: 24,
        calloutSide: 'right',
        highlightColor: '#9b59b6',
      },
      {
        headline: 'Your ritual.\nYour streak.',
        subline: 'Consistency shows up in the patterns.',
        callout: 'Streak tracker',
        videoSrc: 'app-demos/streaks-progress.webm',
        seekToSeconds: 3,
        startTime: 24,
        endTime: 30,
        calloutSide: 'right',
        highlightColor: '#5AD7FF',
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
    subheading: 'Birth chart · Daily horoscope · Tarot · Synastry · AI guide',
    animate: false,
    phones: [
      {
        videoSrc: 'app-demos/dashboard-overview.webm',
        seekToSeconds: 1,
        label: 'Dashboard',
        glowColor: '#8458D8',
      },
      {
        videoSrc: 'app-demos/birth-chart.webm',
        seekToSeconds: 1,
        label: 'Birth chart',
        glowColor: '#d4af37',
      },
      {
        videoSrc: 'app-demos/horoscope-deepdive.webm',
        seekToSeconds: 8,
        label: 'Daily horoscope',
        glowColor: '#5AD7FF',
      },
      {
        videoSrc: 'app-demos/tarot-patterns.webm',
        seekToSeconds: 5,
        label: 'Tarot patterns',
        glowColor: '#e91e63',
      },
      {
        videoSrc: 'app-demos/astral-guide.webm',
        seekToSeconds: 4,
        label: 'Astral Guide',
        glowColor: '#9b59b6',
      },
    ],
  },

  {
    id: 'multi-phone-deep',
    format: 'multiphone',
    title: 'Deep feature showcase (7 phones)',
    layout: 'row',
    backgroundType: 'aurora',
    animate: true,
    phones: [
      {
        videoSrc: 'app-demos/dashboard-overview.webm',
        seekToSeconds: 1,
        label: 'Dashboard',
        glowColor: '#8458D8',
      },
      {
        videoSrc: 'app-demos/dashboard-overview.webm',
        seekToSeconds: 6,
        label: 'Sky Now',
        glowColor: '#5AD7FF',
      },
      {
        videoSrc: 'app-demos/birth-chart.webm',
        seekToSeconds: 1,
        label: 'Birth chart',
        glowColor: '#d4af37',
      },
      {
        videoSrc: 'app-demos/horoscope-deepdive.webm',
        seekToSeconds: 8,
        label: 'Horoscope',
        glowColor: '#9b59b6',
      },
      {
        videoSrc: 'app-demos/tarot-patterns.webm',
        seekToSeconds: 5,
        label: 'Tarot',
        glowColor: '#e91e63',
      },
      {
        videoSrc: 'app-demos/profile-circle.webm',
        seekToSeconds: 4,
        label: 'Synastry',
        glowColor: '#e91e63',
      },
      {
        videoSrc: 'app-demos/astral-guide.webm',
        seekToSeconds: 4,
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
