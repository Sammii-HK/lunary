'use client';

import { grimoire, customContentHrefs } from '@/constants/grimoire';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stringToKebabCase } from '../../../utils/string';
import { sectionToSlug, slugToSection } from '@/utils/grimoire';
import { useState, useEffect, useTransition, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MarketingFooterGate } from '@/components/MarketingFooterGate';
import {
  ChevronRightIcon,
  Menu,
  X,
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

const currentYear = new Date().getFullYear();

// Sidebar categories for organized navigation
const SIDEBAR_CATEGORIES = [
  {
    name: 'Complete Guides',
    icon: <Sparkles size={14} />,
    sections: ['guides', 'beginners'],
  },
  {
    name: 'Zodiac & Signs',
    icon: <Star size={14} />,
    sections: [
      'zodiac',
      'decans',
      'cusps',
      'birthday',
      'seasons',
      'compatibility',
    ],
  },
  {
    name: 'Astrology',
    icon: <Compass size={14} />,
    sections: [
      'birthChart',
      'houses',
      'aspects',
      'placements',
      'transits',
      'horoscopes',
      'astronomy',
      'astronomyVsAstrology',
    ],
  },
  {
    name: 'Moon',
    icon: <MoonIcon size={14} />,
    sections: ['moon'],
  },
  {
    name: 'Tarot & Divination',
    icon: <Layers size={14} />,
    sections: ['tarot', 'runes', 'divination'],
  },
  {
    name: 'Crystals',
    icon: <Gem size={14} />,
    sections: ['crystals'],
  },
  {
    name: 'Numerology',
    icon: <Hash size={14} />,
    sections: ['numerology'],
  },
  {
    name: 'Witchcraft',
    icon: <Wand size={14} />,
    sections: [
      'modernWitchcraft',
      'practices',
      'candleMagic',
      'correspondences',
      'meditation',
      'protection',
      'manifestation',
    ],
  },
  {
    name: 'Self-Discovery',
    icon: <Sparkles size={14} />,
    sections: ['archetypes', 'shadowWork'],
  },
  {
    name: 'Other',
    icon: <BookOpen size={14} />,
    sections: [
      'chakras',
      'wheelOfTheYear',
      'chineseZodiac',
      'events',
      'glossary',
    ],
  },
];
import { AskTheGrimoire } from './AskTheGrimoire';
import { captureEvent } from '@/lib/posthog-client';
import { getStoredAttribution, extractSearchQuery } from '@/lib/attribution';

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
  crystals: <Crystals />,
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
        title: 'Monthly Horoscopes',
        href: '/grimoire/horoscopes',
        description: 'Sign forecasts',
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

function GrimoireIndexPage() {
  return (
    <div className='p-4 md:py-12 lg:py-16'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12 md:mb-16'>
          <Notebook className='w-16 h-16 md:w-20 md:h-20 text-lunary-primary-400 mx-auto mb-6' />
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Welcome to the Grimoire
          </h1>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
            Explore mystical knowledge, cosmic wisdom, and ancient practices to
            deepen your spiritual journey.
          </p>
        </div>

        <div className='mb-12 md:mb-16 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8'>
          <h2 className='text-xl md:text-2xl font-medium text-zinc-100 mb-4'>
            How to Use the Grimoire
          </h2>
          <p className='text-sm md:text-base text-zinc-400 mb-4'>
            The Grimoire is organized by topic so you can explore at your own
            pace. Start with a guide if you are new, or jump straight into a
            specific practice. Each section is designed to give clear meanings,
            practical steps, and links to deeper topics.
          </p>
          <p className='text-sm md:text-base text-zinc-400 mb-4'>
            Use the categories below to browse by interest. If you are looking
            for timing, check the Moon and Astrology sections. For intuitive
            practice, explore Tarot, Runes, and Divination.
          </p>
          <p className='text-sm md:text-base text-zinc-400'>
            Save the pages you return to most often and build your own study
            path. Consistent study reveals patterns and helps the knowledge
            settle into daily life.
          </p>
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
                    href={item.href}
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

export default function GrimoireLayout({
  currentSectionSlug,
}: {
  currentSectionSlug?: string;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSection = currentSectionSlug
    ? slugToSection(currentSectionSlug)
    : undefined;

  const trackedSectionRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (currentSection && currentSection !== trackedSectionRef.current) {
      const attribution = getStoredAttribution();
      const referrer =
        typeof document !== 'undefined' ? document.referrer : undefined;
      const searchQuery = referrer ? extractSearchQuery(referrer) : undefined;

      captureEvent('grimoire_viewed', {
        section: currentSection,
        section_title: grimoire[currentSection]?.title,
        source: attribution?.source || 'direct',
        landing_page: pathname,
        referrer,
        search_query: searchQuery || attribution?.keyword,
        first_touch_source: attribution?.source,
        first_touch_page: attribution?.landingPage,
        is_seo_traffic: attribution?.source === 'seo',
      });
      trackedSectionRef.current = currentSection;
    }
  }, [currentSection, pathname]);

  // Auto-expand active section
  useEffect(() => {
    if (currentSection && grimoire[currentSection]?.contents) {
      setExpandedSections(new Set([currentSection]));
    }
  }, [currentSection]);

  // Handle hash navigation - expand section and scroll to hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    if (hash && currentSection) {
      const sectionHasHash = grimoire[currentSection]?.contents?.some(
        (content) => stringToKebabCase(content) === hash,
      );
      if (sectionHasHash) {
        setExpandedSections(new Set([currentSection]));
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [currentSection, pathname]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const handleSearchResultClick = (section?: string) => {
    if (section) {
      setExpandedSections(new Set([section]));
    }
  };

  return (
    <div className='flex flex-row h-full overflow-hidden relative'>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky top-0 left-0
          h-full z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-64 md:w-72 lg:w-80 xl:w-96 flex-shrink-0 bg-zinc-900 border-r border-zinc-700
          transition-transform duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Header */}
        <div className='p-4 md:p-5 lg:p-6 border-b border-zinc-700 flex items-center justify-between'>
          <Link
            href='/grimoire'
            onClick={() => setSidebarOpen(false)}
            className='text-lg md:text-xl lg:text-2xl font-bold text-white hover:text-lunary-primary-400 transition-colors flex items-center gap-2'
          >
            <Sparkles className='w-5 h-5 md:w-6 md:h-6 text-lunary-primary-400' />
            Grimoire
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className='md:hidden p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white'
            aria-label='Close sidebar menu'
          >
            <X size={20} aria-hidden='true' />
          </button>
        </div>

        {/* Search / Ask AI */}
        <AskTheGrimoire
          onResultClick={handleSearchResultClick}
          onSidebarClose={() => setSidebarOpen(false)}
        />

        {/* Navigation - Categorized */}
        <div className='flex-1 overflow-y-auto p-3 md:p-4 lg:p-5'>
          <div className='space-y-4'>
            {SIDEBAR_CATEGORIES.map((category) => (
              <div key={category.name}>
                {/* Category Header */}
                <div className='flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                  <span className='text-lunary-primary-500'>
                    {category.icon}
                  </span>
                  {category.name}
                </div>

                {/* Category Items */}
                <div className='space-y-0.5'>
                  {category.sections.map((itemKey: string) => {
                    if (!grimoire[itemKey]) return null;
                    const isExpanded = expandedSections.has(itemKey);
                    const hasContents =
                      grimoire[itemKey].contents &&
                      grimoire[itemKey].contents!.length > 0;
                    const isActive = currentSection === itemKey;

                    const slug = sectionToSlug(itemKey);
                    const href = `/grimoire/${slug}`;

                    return (
                      <div key={itemKey} className='w-full'>
                        <div
                          className={`flex items-center rounded-lg transition-all duration-200 group ${
                            isActive
                              ? 'bg-lunary-primary-900/10 border-l-2 border-lunary-primary-400'
                              : 'hover:bg-zinc-800/50'
                          }`}
                        >
                          {hasContents ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSection(itemKey);
                              }}
                              className='p-2 hover:bg-zinc-700/50 rounded-lg transition-colors'
                              aria-label={
                                isExpanded
                                  ? `Collapse ${grimoire[itemKey].title}`
                                  : `Expand ${grimoire[itemKey].title}`
                              }
                              aria-expanded={isExpanded}
                            >
                              <ChevronRightIcon
                                size={14}
                                className={`text-zinc-400 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                                aria-hidden='true'
                              />
                            </button>
                          ) : (
                            <div className='w-8' />
                          )}

                          <Link
                            href={href}
                            prefetch={true}
                            onClick={() => {
                              startTransition(() => {
                                setSidebarOpen(false);
                              });
                            }}
                            className={`flex-1 flex items-center gap-3 py-2 px-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'text-lunary-primary-400'
                                : 'text-zinc-300 group-hover:text-white'
                            }`}
                          >
                            {grimoire[itemKey].title}
                          </Link>
                        </div>

                        {hasContents && (
                          <div
                            className={`
                              overflow-hidden transition-all duration-300 ease-in-out
                              ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                            `}
                          >
                            <div className='ml-8 pl-3 mt-1 mb-2 border-l border-zinc-800 space-y-0.5'>
                              {grimoire[itemKey].contents!.map(
                                (content: string) => {
                                  const customHref =
                                    customContentHrefs[itemKey]?.[content];
                                  const contentHref =
                                    customHref ||
                                    `/grimoire/${slug}#${stringToKebabCase(content)}`;
                                  return (
                                    <Link
                                      key={content}
                                      href={contentHref}
                                      prefetch={true}
                                      onClick={() => {
                                        startTransition(() => {
                                          setSidebarOpen(false);
                                        });
                                      }}
                                      className='block py-1.5 px-3 text-sm text-zinc-400 hover:text-lunary-primary-300 hover:bg-lunary-primary-900/5 rounded-md transition-colors'
                                    >
                                      {content}
                                    </Link>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-y-auto min-w-0 px-4 pt-4 pb-20'>
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className='md:hidden fixed top-4 left-4 z-30 p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white hover:bg-zinc-800 transition-colors'
          aria-label='Open grimoire menu'
        >
          <Menu size={20} aria-hidden='true' />
        </button>

        {/* Loading indicator */}
        {isPending && (
          <div className='absolute top-0 left-0 right-0 h-1 bg-lunary-primary-900/20 z-50'>
            <div className='h-full bg-lunary-primary-500 animate-pulse' />
          </div>
        )}

        {currentSection ? (
          <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
            <div className='max-w-7xl mx-auto'>
              {GrimoireContent[currentSection as keyof typeof GrimoireContent]}
              {/* <ExploreGrimoire /> */}
              <MarketingFooterGate />
            </div>
          </div>
        ) : (
          <div>
            <GrimoireIndexPage withNavParams={withNavParams} />
            <div className='max-w-7xl mx-auto px-4'>
              {/* <ExploreGrimoire /> */}
              <MarketingFooterGate />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
