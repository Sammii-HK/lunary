'use client';

import { grimoire } from '@/constants/grimoire';
import Link from 'next/link';
import { slugToSection } from '@/utils/grimoire';
import { useEffect, useRef, useCallback } from 'react';
import type { ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import { MarketingFooterGate } from '@/components/MarketingFooterGate';
import {
  Sparkles,
  Moon as MoonIcon,
  Star,
  Layers,
  Gem,
  BookOpen,
  Compass,
  Notebook,
  Hash,
  Wand,
} from 'lucide-react';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { GrimoireStats } from '@/components/grimoire/GrimoireStats';
import { GrimoireSearch } from './GrimoireSearch';

import { captureEvent } from '@/lib/posthog-client';
import { conversionTracking } from '@/lib/analytics';
import { getStoredAttribution, extractSearchQuery } from '@/lib/attribution';

const currentYear = new Date().getFullYear();

// Dynamic imports for grimoire components (lazy load to improve build speed)
const Moon = dynamic(() => import('./components/Moon'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const WheelOfTheYear = dynamic(() => import('./components/WheelOfTheYear'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Astronomy = dynamic(() => import('./components/Astronomy'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Correspondences = dynamic(() => import('./components/Correspondences'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Practices = dynamic(() => import('./components/Practices'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Tarot = dynamic(() => import('./components/Tarot'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Runes = dynamic(() => import('./components/Runes'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Chakras = dynamic(() => import('./components/Chakras'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Numerology = dynamic(
  () =>
    import('./components/Numerology').then((mod) => ({
      default: mod.Numerology,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
  },
);
const Crystals = dynamic(() => import('./components/Crystals'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
type CrystalsComponentProps = ComponentProps<typeof Crystals>;
const EMPTY_CRYSTAL_CATEGORIES: CrystalsComponentProps['categories'] = [];
const EMPTY_CRYSTAL_TOTAL_COUNT: CrystalsComponentProps['totalCount'] = 0;
const BirthChart = dynamic(() => import('./components/BirthChart'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const CandleMagic = dynamic(() => import('./components/CandleMagic'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const Divination = dynamic(() => import('./components/Divination'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const ModernWitchcraft = dynamic(
  () => import('./components/ModernWitchcraft'),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
  },
);
const Meditation = dynamic(() => import('./components/Meditation'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const CompatibilityChart = dynamic(
  () => import('./components/CompatibilityChart'),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
  },
);

const GrimoireContent = {
  moon: <Moon />,
  wheelOfTheYear: <WheelOfTheYear />,
  astronomy: <Astronomy />,
  correspondences: <Correspondences />,
  practices: <Practices />,
  tarot: <Tarot />,
  runes: <Runes />,
  chakras: <Chakras />,
  numerology: <Numerology />,
  crystals: (
    <Crystals
      categories={EMPTY_CRYSTAL_CATEGORIES}
      totalCount={EMPTY_CRYSTAL_TOTAL_COUNT}
    />
  ),
  birthChart: <BirthChart />,
  candleMagic: <CandleMagic />,
  divination: <Divination />,
  modernWitchcraft: <ModernWitchcraft />,
  meditation: <Meditation />,
  compatibilityChart: <CompatibilityChart />,
};

// Complete Grimoire structure with all subsections linked to dedicated pages
const GRIMOIRE_FULL_STRUCTURE = [
  {
    name: 'Complete Guides',
    icon: <Star className='w-5 h-5' />,
    items: [
      {
        title: "Beginner's Guide",
        href: '/grimoire/beginners',
        description: 'Start your spiritual journey',
      },
      {
        title: 'All Guides',
        href: '/grimoire/guides',
        description: 'In-depth pillar content',
      },
      {
        title: 'Birth Chart Guide',
        href: '/grimoire/guides/birth-chart-complete-guide',
        description: 'Master natal astrology',
      },
      {
        title: 'Tarot Guide',
        href: '/grimoire/guides/tarot-complete-guide',
        description: 'All 78 cards explained',
      },
      {
        title: 'Moon Phases Guide',
        href: '/grimoire/guides/moon-phases-guide',
        description: 'Lunar cycles & rituals',
      },
      {
        title: 'Crystal Healing Guide',
        href: '/grimoire/guides/crystal-healing-guide',
        description: 'Properties & practices',
      },
      {
        title: 'Archetypes Guide',
        href: '/grimoire/archetypes',
        description: 'Inner patterns & shadow work',
      },
    ],
  },
  {
    name: 'Zodiac & Signs',
    icon: <Compass className='w-5 h-5' />,
    items: [
      {
        title: 'Zodiac Signs',
        href: '/grimoire/zodiac',
        description: 'All 12 zodiac signs',
      },
      {
        title: 'Zodiac Decans',
        href: '/grimoire/decans',
        description: '36 decans of the zodiac',
      },
      {
        title: 'Zodiac Cusps',
        href: '/grimoire/cusps',
        description: 'Born on the cusp?',
      },
      {
        title: 'Birthday Zodiac',
        href: '/grimoire/birthday',
        description: 'Find your sign by date',
      },
      {
        title: 'Zodiac Seasons',
        href: '/grimoire/seasons',
        description: 'Astrological seasons',
      },
      {
        title: 'Compatibility',
        href: '/grimoire/compatibility',
        description: 'Sign compatibility',
      },
    ],
  },
  {
    name: 'Astrology',
    icon: <Compass className='w-5 h-5' />,
    items: [
      {
        title: 'Astrology Overview',
        href: '/grimoire/astrology',
        description: 'All astrology topics',
      },
      {
        title: 'Birth Chart',
        href: '/grimoire/birth-chart',
        description: 'Your natal chart guide',
      },
      {
        title: 'Astrological Houses',
        href: '/grimoire/houses',
        description: 'All 12 houses',
      },
      {
        title: 'Aspects',
        href: '/grimoire/aspects',
        description: 'Planetary aspects',
      },
      {
        title: 'Planet Placements',
        href: '/grimoire/placements',
        description: 'Planets in signs',
      },
      {
        title: 'Rising Sign',
        href: '/grimoire/rising-sign',
        description: 'Your ascendant',
      },
      {
        title: 'Synastry',
        href: '/grimoire/synastry',
        description: 'Relationship compatibility',
      },
      {
        title: 'Lunar Nodes',
        href: '/grimoire/lunar-nodes',
        description: 'North & South nodes',
      },
      {
        title: 'Retrogrades',
        href: '/grimoire/astronomy/retrogrades',
        description: 'Retrograde planets',
      },
      {
        title: 'Transits',
        href: '/grimoire/transits',
        description: 'Current planetary transits',
      },
      {
        title: 'Daily Horoscopes',
        href: '/grimoire/horoscopes/today',
        description: 'Daily horoscope forecasts for all signs',
      },
      {
        title: 'Weekly Horoscopes',
        href: '/grimoire/horoscopes/weekly',
        description: 'Weekly horoscope forecasts for all signs',
      },
      {
        title: 'Monthly Horoscopes',
        href: '/grimoire/horoscopes',
        description: 'Monthly horoscope forecasts for all signs',
      },
      {
        title: 'Yearly Horoscopes',
        href: '/grimoire/horoscopes/yearly',
        description: 'Yearly horoscope forecasts for all signs',
      },
      {
        title: 'Astronomy',
        href: '/grimoire/astronomy',
        description: 'Planets & celestial bodies',
      },
      {
        title: 'Astronomy vs Astrology',
        href: '/grimoire/astronomy-vs-astrology',
        description: 'Understanding the difference',
      },
    ],
  },
  {
    name: 'Moon',
    icon: <MoonIcon className='w-5 h-5' />,
    items: [
      {
        title: 'Moon Phases',
        href: '/grimoire/moon/phases',
        description: 'New to Full Moon',
      },
      {
        title: 'Full Moon Names',
        href: '/grimoire/moon/full-moons',
        description: 'Monthly full moons',
      },
      {
        title: 'Moon Signs',
        href: '/grimoire/moon/moon-signs',
        description: 'Emotional moon placements',
      },
      {
        title: 'Moon Rituals',
        href: '/grimoire/moon/moon-rituals',
        description: 'Lunar ceremonies',
      },
      {
        title: 'Eclipses',
        href: '/grimoire/eclipses',
        description: 'Solar & lunar eclipses',
      },
    ],
  },
  {
    name: 'Tarot & Divination',
    icon: <Layers className='w-5 h-5' />,
    items: [
      {
        title: 'Tarot Cards',
        href: '/grimoire/tarot',
        description: 'All 78 cards',
      },
      {
        title: 'Tarot Spreads',
        href: '/grimoire/tarot/spreads',
        description: 'Reading layouts',
      },
      {
        title: 'Major Arcana',
        href: '/grimoire/tarot/the-fool',
        description: '22 major cards',
      },
      {
        title: 'Minor Arcana',
        href: '/grimoire/tarot/suits/wands',
        description: '56 minor cards',
      },
      {
        title: 'Reversed Cards',
        href: '/grimoire/reversed-cards-guide',
        description: 'Upside-down meanings',
      },
      {
        title: 'Card Combinations',
        href: '/grimoire/card-combinations',
        description: 'Card pairs',
      },
      {
        title: 'Runes',
        href: '/grimoire/runes',
        description: 'Elder Futhark runes',
      },
      {
        title: 'Pendulum',
        href: '/grimoire/divination/pendulum',
        description: 'Pendulum divination',
      },
      {
        title: 'Scrying',
        href: '/grimoire/divination/scrying/crystal-ball',
        description: 'Crystal ball & mirror',
      },
      {
        title: 'Dream Interpretation',
        href: '/grimoire/divination/dream-interpretation',
        description: 'Dream meanings',
      },
      {
        title: 'Omen Reading',
        href: '/grimoire/divination/omen-reading',
        description: 'Signs & omens',
      },
    ],
  },
  {
    name: 'Numerology',
    icon: <Hash className='w-5 h-5' />,
    items: [
      {
        title: 'Angel Numbers',
        href: '/grimoire/angel-numbers',
        description: '111, 222, 333...',
      },
      {
        title: 'Life Path Numbers',
        href: '/grimoire/life-path',
        description: 'Your core number',
      },
      {
        title: 'Mirror Hours',
        href: '/grimoire/mirror-hours',
        description: '11:11, 12:21...',
      },
      {
        title: 'Double Hours',
        href: '/grimoire/double-hours',
        description: '12:12, 13:13...',
      },
      {
        title: 'Core Numbers',
        href: '/grimoire/numerology/core-numbers',
        description: 'Numbers 1-9',
      },
      {
        title: 'Master Numbers',
        href: '/grimoire/numerology/master-numbers',
        description: '11, 22, 33',
      },
      {
        title: 'Expression Numbers',
        href: '/grimoire/numerology/expression',
        description: 'From your name',
      },
      {
        title: 'Soul Urge',
        href: '/grimoire/numerology/soul-urge',
        description: "Heart's desire",
      },
      {
        title: 'Karmic Debt',
        href: '/grimoire/numerology/karmic-debt',
        description: 'Karmic lessons',
      },
      {
        title: 'Planetary Days',
        href: '/grimoire/numerology/planetary-days',
        description: 'Day energies',
      },
    ],
  },
  {
    name: 'Crystals',
    icon: <Gem className='w-5 h-5' />,
    items: [
      {
        title: 'Crystal Guide',
        href: '/grimoire/crystals',
        description: 'All crystals',
      },
      {
        title: 'Crystal Healing Guide',
        href: '/grimoire/guides/crystal-healing-guide',
        description: 'Complete guide',
      },
    ],
  },
  {
    name: 'Witchcraft & Practices',
    icon: <Wand className='w-5 h-5' />,
    items: [
      {
        title: 'Modern Witchcraft',
        href: '/grimoire/modern-witchcraft',
        description: 'Witchcraft overview',
      },
      {
        title: 'Witchcraft Practices',
        href: '/grimoire/practices',
        description: 'Complete guide to all practices',
      },
      {
        title: 'Witch Types',
        href: '/grimoire/modern-witchcraft/witch-types',
        description: 'Green, Kitchen, Hedge...',
      },
      {
        title: 'Witchcraft Tools',
        href: '/grimoire/modern-witchcraft/tools',
        description: 'Athame, Wand, Cauldron...',
      },
      {
        title: 'Witchcraft Ethics',
        href: '/grimoire/modern-witchcraft/ethics',
        description: 'Ethical practice',
      },
      {
        title: 'Book of Shadows',
        href: '/grimoire/book-of-shadows',
        description: 'Create your personal grimoire',
      },
      {
        title: 'Spellcraft',
        href: '/grimoire/spells/fundamentals',
        description: 'Spell basics',
      },
      {
        title: 'Spells',
        href: '/grimoire/spells',
        description: 'Spell collection',
      },
      {
        title: 'Jar Spells',
        href: '/grimoire/jar-spells',
        description: 'Spell jars & witch bottles',
      },
      {
        title: 'Candle Magic',
        href: '/grimoire/candle-magic',
        description: 'Candle spells',
      },
      {
        title: 'Candle Colors',
        href: '/grimoire/candle-magic/colors',
        description: 'Color meanings',
      },
      {
        title: 'Correspondences',
        href: '/grimoire/correspondences',
        description: 'Magical associations',
      },
      {
        title: 'Meditation',
        href: '/grimoire/meditation',
        description: 'Mindfulness practices',
      },
      {
        title: 'Breathwork',
        href: '/grimoire/meditation/breathwork',
        description: 'Breathing techniques',
      },
      {
        title: 'Grounding',
        href: '/grimoire/meditation/grounding',
        description: 'Grounding exercises',
      },
      {
        title: 'Protection',
        href: '/grimoire/protection',
        description: 'Energetic protection & boundaries',
      },
      {
        title: 'Manifestation',
        href: '/grimoire/manifestation',
        description: 'Intention setting & creation',
      },
    ],
  },
  {
    name: 'Self-Discovery',
    icon: <Sparkles className='w-5 h-5' />,
    items: [
      {
        title: 'Lunary Archetypes',
        href: '/grimoire/archetypes',
        description: 'Explore inner patterns',
      },
      {
        title: 'The Restorer',
        href: '/grimoire/archetypes#restorer',
        description: 'Healing & recovery',
      },
      {
        title: 'The Seeker',
        href: '/grimoire/archetypes#seeker',
        description: 'Quest for meaning',
      },
      {
        title: 'The Catalyst',
        href: '/grimoire/archetypes#catalyst',
        description: 'Transformative energy',
      },
      {
        title: 'The Grounded One',
        href: '/grimoire/archetypes#grounded-one',
        description: 'Stability & roots',
      },
      {
        title: 'The Empath',
        href: '/grimoire/archetypes#empath',
        description: 'Emotional sensitivity',
      },
      {
        title: 'The Shadow Dancer',
        href: '/grimoire/archetypes#shadow-dancer',
        description: 'Embrace the shadow',
      },
      {
        title: 'The Visionary',
        href: '/grimoire/archetypes#visionary',
        description: 'Future sight',
      },
      {
        title: 'The Mystic',
        href: '/grimoire/archetypes#mystic',
        description: 'Spiritual depths',
      },
      {
        title: 'The Protector',
        href: '/grimoire/archetypes#protector',
        description: 'Guardian energy',
      },
      {
        title: 'The Heart Opener',
        href: '/grimoire/archetypes#heart-opener',
        description: 'Love & connection',
      },
      {
        title: 'The Lunar Weaver',
        href: '/grimoire/archetypes#lunar-weaver',
        description: 'Moon mysteries',
      },
      {
        title: 'The Alchemist',
        href: '/grimoire/archetypes#alchemist',
        description: 'Transformation',
      },
      {
        title: 'Shadow Work',
        href: '/grimoire/shadow-work',
        description: 'Healing & integration',
      },
    ],
  },
  {
    name: 'Other',
    icon: <BookOpen className='w-5 h-5' />,
    items: [
      {
        title: 'Chakras',
        href: '/grimoire/chakras',
        description: '7 energy centers',
      },
      {
        title: 'Wheel of the Year',
        href: '/grimoire/wheel-of-the-year',
        description: '8 sabbats',
      },
      {
        title: 'Sabbats',
        href: '/grimoire/wheel-of-the-year',
        description: 'Seasonal festivals',
      },
      {
        title: 'Chinese Zodiac',
        href: '/grimoire/chinese-zodiac',
        description: '12 animals',
      },
      {
        title: 'Astrological Events',
        href: '/grimoire/events',
        description: `${currentYear} events`,
      },
      {
        title: 'Glossary',
        href: '/grimoire/glossary',
        description: 'Astrology terms',
      },
    ],
  },
];

function GrimoireIndexPage({
  withNavParams,
}: {
  withNavParams: (href: string) => string;
}) {
  return (
    <div className='p-4 md:py-12 lg:py-16'>
      <div className='max-w-6xl mx-auto'>
        {/* Header with Search */}
        <div className='text-center mb-12 md:mb-16'>
          <Notebook className='w-16 h-16 md:w-20 md:h-20 text-lunary-primary-400 mx-auto mb-6' />
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Welcome to the Grimoire
          </h1>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-8'>
            Explore mystical knowledge, cosmic wisdom, and ancient practices to
            deepen your spiritual journey.
          </p>

          {/* Search */}
          <div className='max-w-xl mx-auto'>
            <GrimoireSearch placeholder='Search tarot, crystals, zodiac...' />
          </div>
        </div>

        {/* Categories with all subsections */}
        <div className='space-y-12 md:space-y-16'>
          {GRIMOIRE_FULL_STRUCTURE.map((category) => (
            <section key={category.name}>
              {/* Category Header */}
              <div className='flex items-center gap-3 mb-6'>
                <span className='text-lunary-primary-400'>{category.icon}</span>
                <h2 className='text-xl md:text-2xl font-medium text-zinc-100'>
                  {category.name}
                </h2>
                <div className='flex-1 h-px bg-zinc-800' />
              </div>

              {/* All Items as Links */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                {category.items.map((item) => (
                  <Link
                    key={`${category.name}-${item.title}`}
                    href={withNavParams(item.href)}
                    prefetch={true}
                    className='group rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
                  >
                    <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors mb-1'>
                      {item.title}
                    </h3>
                    <p className='text-xs text-zinc-400'>{item.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export type GrimoireSearchParams = {
  nav?: string | string[];
  from?: string | string[];
};

/**
 * `pathname` and `searchParams` are supplied by the server page so the layout
 * can stay server-friendly while the client-side hooks hydrate afterwards.
 */
export type GrimoireLayoutProps = {
  currentSectionSlug?: string;
  searchParams?: GrimoireSearchParams;
  pathname: string;
};

function normalizeParam(value?: string | string[]): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[value.length - 1] : value;
}

export default function GrimoireLayout({
  currentSectionSlug,
  searchParams,
  pathname,
}: GrimoireLayoutProps) {
  const navParam = normalizeParam(searchParams?.nav);
  const fromParam = normalizeParam(searchParams?.from);

  const currentSection = currentSectionSlug
    ? slugToSection(currentSectionSlug)
    : undefined;

  const trackedPathRef = useRef<string | undefined>(undefined);

  // Analytics tracking
  useEffect(() => {
    if (trackedPathRef.current === pathname) {
      return;
    }

    const attribution = getStoredAttribution();
    const referrer =
      typeof document !== 'undefined' ? document.referrer : undefined;
    const searchQuery = referrer ? extractSearchQuery(referrer) : undefined;

    const resolvedSection = currentSection ?? 'grimoire_home';
    const trackingPayload = {
      section: resolvedSection,
      section_title: currentSection
        ? grimoire[currentSection]?.title
        : 'Grimoire',
      source: attribution?.source || 'direct',
      landing_page: pathname,
      referrer,
      search_query: searchQuery || attribution?.keyword,
      first_touch_source: attribution?.source,
      first_touch_page: attribution?.landingPage,
      is_seo_traffic: attribution?.source === 'seo',
    };

    captureEvent('grimoire_viewed', {
      ...trackingPayload,
    });
    conversionTracking.grimoireViewed(undefined, trackingPayload);
    trackedPathRef.current = pathname;
  }, [currentSection, pathname]);

  // Handle hash navigation on mount and pathname change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const scrollToElement = () => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Wait for content to render
    requestAnimationFrame(() => {
      setTimeout(scrollToElement, 150);
    });
  }, [pathname]);

  const withNavParams = useCallback(
    (href: string) => {
      if (!navParam && !fromParam) return href;
      if (/^https?:\/\//i.test(href)) return href;

      const baseUrl = new URL(href, 'https://lunary.app');
      if (navParam && !baseUrl.searchParams.get('nav')) {
        baseUrl.searchParams.set('nav', navParam);
      }
      if (fromParam && !baseUrl.searchParams.get('from')) {
        baseUrl.searchParams.set('from', fromParam);
      }
      const query = baseUrl.searchParams.toString();
      return `${baseUrl.pathname}${query ? `?${query}` : ''}${baseUrl.hash}`;
    },
    [navParam, fromParam],
  );

  return (
    <div className='h-full'>
      {currentSection ? (
        <div className='p-4 md:p-6 lg:p-8'>
          <div className='max-w-4xl mx-auto'>
            {GrimoireContent[currentSection as keyof typeof GrimoireContent]}
            <GrimoireStats className='mt-8 pt-6 border-t border-zinc-800/50' />
            <ExploreGrimoire />
            <MarketingFooterGate />
          </div>
        </div>
      ) : (
        <div>
          <GrimoireIndexPage withNavParams={withNavParams} />
          <div className='max-w-6xl mx-auto px-4'>
            <MarketingFooterGate />
          </div>
        </div>
      )}
    </div>
  );
}
