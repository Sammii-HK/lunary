'use client';

import { grimoire, grimoireItems } from '@/constants/grimoire';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stringToKebabCase } from '../../../utils/string';
import { sectionToSlug, slugToSection } from '@/utils/grimoire';
import { useState, useEffect, useMemo, useTransition } from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Menu,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import { runesList } from '@/constants/runes';
import { tarotSuits, tarotSpreads } from '@/constants/tarot';
import { spells } from '@/constants/spells';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { chakras } from '@/constants/chakras';
import {
  crystalCategories,
  getCrystalsByCategory,
  crystalDatabase,
} from '@/constants/grimoire/crystals';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import {
  MonthlyMoonPhase,
  monthlyMoonPhases,
} from '../../../utils/moon/monthlyPhases';
import { zodiacSigns, planetaryBodies } from '../../../utils/zodiac/zodiac';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { tarotCards } from '../../../utils/tarot/tarot-cards';

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

interface SearchResult {
  type:
    | 'section'
    | 'rune'
    | 'tarot'
    | 'spell'
    | 'correspondence'
    | 'crystal'
    | 'chakra'
    | 'moon'
    | 'zodiac'
    | 'planet'
    | 'candle'
    | 'practice'
    | 'sabbat'
    | 'meditation'
    | 'witch';
  title: string;
  section?: string;
  href: string;
  match?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const currentSection = currentSectionSlug
    ? slugToSection(currentSectionSlug)
    : undefined;

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

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSearchResults]);

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  // Comprehensive search across all content
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search sections
    grimoireItems.forEach((itemKey) => {
      const item = grimoire[itemKey];
      if (item.title.toLowerCase().includes(query)) {
        results.push({
          type: 'section',
          title: item.title,
          section: itemKey,
          href: `/grimoire/${sectionToSlug(itemKey)}`,
        });
      }
      item.contents?.forEach((content) => {
        if (content.toLowerCase().includes(query)) {
          results.push({
            type: 'section',
            title: `${item.title} - ${content}`,
            section: itemKey,
            href: `/grimoire/${sectionToSlug(itemKey)}#${stringToKebabCase(content)}`,
          });
        }
      });
    });

    // Search runes - link to individual pages
    Object.entries(runesList).forEach(([key, rune]) => {
      if (
        rune.name.toLowerCase().includes(query) ||
        rune.meaning.toLowerCase().includes(query) ||
        rune.magicalProperties.toLowerCase().includes(query) ||
        rune.notes.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'rune',
          title: `${rune.symbol} ${rune.name}`,
          section: 'runes',
          href: `/grimoire/runes/${stringToKebabCase(key)}`,
          match: `Meaning: ${rune.meaning}`,
        });
      }
    });

    // Search tarot suits - link to individual pages
    Object.entries(tarotSuits).forEach(([key, suit]) => {
      if (
        suit.name.toLowerCase().includes(query) ||
        suit.mysticalProperties.toLowerCase().includes(query) ||
        suit.qualities.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'tarot',
          title: `Tarot Suit - ${suit.name}`,
          section: 'tarot',
          href: `/grimoire/tarot-suits/${stringToKebabCase(key)}`,
        });
      }
    });

    // Search tarot spreads - link to individual pages
    Object.entries(tarotSpreads).forEach(([key, spread]) => {
      if (
        spread.name.toLowerCase().includes(query) ||
        spread.description.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'tarot',
          title: `Tarot Spread - ${spread.name}`,
          section: 'tarot',
          href: `/grimoire/tarot-spreads/${stringToKebabCase(key)}`,
        });
      }
    });

    // Search tarot cards - link to individual pages
    Object.entries(tarotCards.majorArcana).forEach(([key, card]) => {
      if (
        card.name.toLowerCase().includes(query) ||
        card.keywords.some((kw) => kw.toLowerCase().includes(query)) ||
        card.information?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'tarot',
          title: `Tarot Card - ${card.name}`,
          section: 'tarot',
          href: `/grimoire/tarot/${stringToKebabCase(card.name)}`,
        });
      }
    });
    Object.entries(tarotCards.minorArcana).forEach(([suitKey, suit]) => {
      Object.entries(suit).forEach(([key, card]) => {
        if (
          card.name.toLowerCase().includes(query) ||
          card.keywords.some((kw) => kw.toLowerCase().includes(query)) ||
          card.information?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'tarot',
            title: `Tarot Card - ${card.name}`,
            section: 'tarot',
            href: `/grimoire/tarot/${stringToKebabCase(card.name)}`,
          });
        }
      });
    });

    // Search correspondences - Colors - link to individual pages
    Object.entries(correspondencesData.colors).forEach(([color, data]) => {
      if (
        color.toLowerCase().includes(query) ||
        data.uses.some((use) => use.toLowerCase().includes(query)) ||
        data.planets.some((planet) => planet.toLowerCase().includes(query)) ||
        data.correspondences.some((corr) => corr.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Color - ${color}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/colors/${stringToKebabCase(color)}`,
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search candle colors
    const candleColors = [
      { name: 'Red', uses: ['Love spells', 'Courage', 'Energy', 'Protection'] },
      {
        name: 'Pink',
        uses: ['Romantic love', 'Friendship', 'Emotional healing'],
      },
      { name: 'Orange', uses: ['Career success', 'Creativity', 'Attraction'] },
      { name: 'Yellow', uses: ['Communication', 'Learning', 'Mental clarity'] },
      { name: 'Green', uses: ['Money', 'Growth', 'Fertility', 'Healing'] },
      { name: 'Blue', uses: ['Peace', 'Healing', 'Protection', 'Wisdom'] },
      {
        name: 'Purple',
        uses: ['Spirituality', 'Divination', 'Psychic development'],
      },
      {
        name: 'Indigo',
        uses: ['Meditation', 'Intuition', 'Psychic protection'],
      },
      { name: 'White', uses: ['All-purpose', 'Protection', 'Purification'] },
      {
        name: 'Black',
        uses: ['Banishing', 'Protection', 'Removing negativity'],
      },
      { name: 'Brown', uses: ['Grounding', 'Stability', 'Home protection'] },
      { name: 'Silver', uses: ['Intuition', 'Dream work', 'Moon magic'] },
    ];
    candleColors.forEach((candle) => {
      if (
        candle.name.toLowerCase().includes(query) ||
        candle.uses.some((use) => use.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'candle',
          title: `Candle Color - ${candle.name}`,
          section: 'candle-magic',
          href: `/grimoire/candle-magic#color-meanings`,
          match: `Uses: ${candle.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Elements - link to individual pages
    Object.entries(correspondencesData.elements).forEach(([element, data]) => {
      if (
        element.toLowerCase().includes(query) ||
        data.colors.some((color) => color.toLowerCase().includes(query)) ||
        data.crystals.some((crystal) =>
          crystal.toLowerCase().includes(query),
        ) ||
        data.herbs.some((herb) => herb.toLowerCase().includes(query)) ||
        data.planets.some((planet) => planet.toLowerCase().includes(query)) ||
        data.zodiacSigns.some((sign) => sign.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Element - ${element}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/elements/${stringToKebabCase(element)}`,
          match: `Direction: ${data.directions}`,
        });
      }
    });

    // Search correspondences - Days - link to individual pages
    Object.entries(correspondencesData.days).forEach(([day, data]) => {
      if (
        day.toLowerCase().includes(query) ||
        data.planet.toLowerCase().includes(query) ||
        data.element.toLowerCase().includes(query) ||
        data.uses.some((use) => use.toLowerCase().includes(query)) ||
        data.correspondences.some((corr) => corr.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Planetary Day - ${day}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/days/${stringToKebabCase(day)}`,
          match: `Planet: ${data.planet}, Element: ${data.element}`,
        });
      }
    });

    // Search correspondences - Herbs - link to individual pages
    Object.entries(correspondencesData.herbs).forEach(([herb, data]) => {
      if (
        herb.toLowerCase().includes(query) ||
        data.uses.some((use) => use.toLowerCase().includes(query)) ||
        data.planets.some((planet) => planet.toLowerCase().includes(query)) ||
        data.correspondences.some((corr) => corr.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Herb - ${herb}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/herbs/${stringToKebabCase(herb)}`,
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Numbers - link to individual pages
    Object.entries(correspondencesData.numbers).forEach(([num, data]) => {
      if (
        num === query ||
        data.uses.some((use) => use.toLowerCase().includes(query)) ||
        data.planets.some((planet) => planet.toLowerCase().includes(query)) ||
        data.correspondences.some((corr) => corr.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Number - ${num}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/numbers/${stringToKebabCase(num)}`,
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Deities - link to individual pages
    Object.entries(correspondencesData.deities).forEach(([pantheon, gods]) => {
      Object.entries(gods).forEach(([name, data]) => {
        if (
          name.toLowerCase().includes(query) ||
          pantheon.toLowerCase().includes(query) ||
          data.domain.some((domain) => domain.toLowerCase().includes(query))
        ) {
          results.push({
            type: 'correspondence',
            title: `${pantheon} Deity - ${name}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/deities/${stringToKebabCase(pantheon)}/${stringToKebabCase(name)}`,
            match: `Domain: ${data.domain.join(', ')}`,
          });
        }
      });
    });

    // Search correspondences - Flowers - link to individual pages
    Object.entries(correspondencesData.flowers).forEach(([flower, data]) => {
      if (
        flower.toLowerCase().includes(query) ||
        data.uses.some((use) => use.toLowerCase().includes(query)) ||
        data.planets.some((planet) => planet.toLowerCase().includes(query)) ||
        data.correspondences.some((corr) => corr.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Flower - ${flower}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/flowers/${stringToKebabCase(flower)}`,
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Wood - link to individual pages
    Object.entries(correspondencesData.wood).forEach(([wood, data]) => {
      if (
        wood.toLowerCase().includes(query) ||
        data.uses.some((use) => use.toLowerCase().includes(query)) ||
        data.planets.some((planet) => planet.toLowerCase().includes(query)) ||
        data.correspondences.some((corr) => corr.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Wood - ${wood}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/wood/${stringToKebabCase(wood)}`,
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Animals - link to individual pages
    Object.entries(correspondencesData.animals).forEach(([animal, data]) => {
      if (
        animal.toLowerCase().includes(query) ||
        data.uses.some((use) => use.toLowerCase().includes(query)) ||
        data.planets.some((planet) => planet.toLowerCase().includes(query)) ||
        data.correspondences.some((corr) => corr.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'correspondence',
          title: `Animal - ${animal}`,
          section: 'correspondences',
          href: `/grimoire/correspondences/animals/${stringToKebabCase(animal)}`,
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search candle magic
    if (
      query.includes('candle') ||
      query.includes('candle magic') ||
      query.includes('carving') ||
      query.includes('anointing')
    ) {
      results.push({
        type: 'practice',
        title: 'Candle Magic',
        section: 'candle-magic',
        href: '/grimoire/candle-magic',
        match:
          'Complete guide to candle magic, color meanings, carving, and rituals',
      });
    }

    // Search chakras - link to individual pages
    Object.entries(chakras).forEach(([key, chakra]) => {
      if (
        chakra.name.toLowerCase().includes(query) ||
        chakra.color.toLowerCase().includes(query) ||
        chakra.properties.toLowerCase().includes(query) ||
        chakra.mysticalProperties.toLowerCase().includes(query) ||
        chakra.location.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'chakra',
          title: `${chakra.symbol} ${chakra.name} Chakra`,
          section: 'chakras',
          href: `/grimoire/chakras/${stringToKebabCase(key)}`,
          match: `Color: ${chakra.color}, Properties: ${chakra.properties}`,
        });
      }
    });

    // Search moon phases - link to individual pages
    Object.entries(monthlyMoonPhases).forEach(([phase, data]) => {
      if (
        phase.toLowerCase().includes(query) ||
        (data as any).information?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'moon',
          title: `Moon Phase - ${phase}`,
          section: 'moon',
          href: `/grimoire/moon-phases/${stringToKebabCase(phase)}`,
        });
      }
    });

    // Search full moon names - link to individual pages
    Object.entries(annualFullMoons).forEach(([month, moon]) => {
      if (
        moon.name.toLowerCase().includes(query) ||
        month.toLowerCase().includes(query) ||
        moon.description.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'moon',
          title: `Full Moon - ${moon.name}`,
          section: 'moon',
          href: `/grimoire/full-moons/${stringToKebabCase(month)}`,
          match: `${month} - ${moon.description.slice(0, 60)}...`,
        });
      }
    });

    // Search zodiac signs - link to individual pages
    Object.entries(zodiacSigns).forEach(([key, sign]) => {
      const signData = sign as { name: string; mysticalProperties?: string };
      if (
        signData.name.toLowerCase().includes(query) ||
        signData.mysticalProperties?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'zodiac',
          title: `Zodiac Sign - ${signData.name}`,
          section: 'astronomy',
          href: `/grimoire/zodiac/${stringToKebabCase(key)}`,
        });
      }
    });

    // Search planets - link to individual pages
    Object.entries(planetaryBodies).forEach(([key, planet]) => {
      const planetData = planet as {
        name: string;
        mysticalProperties?: string;
      };
      if (
        planetData.name.toLowerCase().includes(query) ||
        planetData.mysticalProperties?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'planet',
          title: `Planet - ${planetData.name}`,
          section: 'astronomy',
          href: `/grimoire/planets/${stringToKebabCase(key)}`,
        });
      }
    });

    // Search crystals - link to individual pages
    crystalDatabase.forEach((crystal) => {
      if (
        crystal.name.toLowerCase().includes(query) ||
        crystal.alternativeNames?.some((name) =>
          name.toLowerCase().includes(query),
        ) ||
        crystal.properties.some((prop) => prop.toLowerCase().includes(query)) ||
        crystal.description.toLowerCase().includes(query) ||
        crystal.intentions.some((intent) =>
          intent.toLowerCase().includes(query),
        )
      ) {
        results.push({
          type: 'crystal',
          title: `Crystal - ${crystal.name}`,
          section: 'crystals',
          href: `/grimoire/crystals/${stringToKebabCase(crystal.name)}`,
          match: `Properties: ${crystal.properties.slice(0, 3).join(', ')}`,
        });
      }
    });

    // Search sabbats - link to individual pages
    wheelOfTheYearSabbats.forEach((sabbat) => {
      if (
        sabbat.name.toLowerCase().includes(query) ||
        sabbat.description.toLowerCase().includes(query) ||
        sabbat.date.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'sabbat',
          title: `Sabbat - ${sabbat.name}`,
          section: 'wheel-of-the-year',
          href: `/grimoire/sabbats/${stringToKebabCase(sabbat.name)}`,
          match: `${sabbat.date} - ${sabbat.description.slice(0, 60)}...`,
        });
      }
    });

    // Search meditation techniques - link to individual pages
    const meditationTechniques = {
      'guided-meditation': { name: 'Guided Meditation' },
      'mindfulness-meditation': { name: 'Mindfulness Meditation' },
      'visualization-meditation': { name: 'Visualization Meditation' },
      'walking-meditation': { name: 'Walking Meditation' },
      'mantra-meditation': { name: 'Mantra Meditation' },
      'loving-kindness-meditation': { name: 'Loving-Kindness Meditation' },
      'body-scan-meditation': { name: 'Body Scan Meditation' },
      'transcendental-meditation': { name: 'Transcendental Meditation' },
    };
    Object.entries(meditationTechniques).forEach(([key, technique]) => {
      if (technique.name.toLowerCase().includes(query)) {
        results.push({
          type: 'meditation',
          title: `Meditation - ${technique.name}`,
          section: 'meditation',
          href: `/grimoire/meditation/${key}`,
        });
      }
    });

    // Search witch types - link to individual pages
    const witchTypes = [
      'green-witch',
      'kitchen-witch',
      'hedge-witch',
      'sea-witch',
      'cosmic-witch',
      'eclectic-witch',
    ];
    witchTypes.forEach((witch) => {
      const witchName = witch
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      if (witchName.toLowerCase().includes(query) || witch.includes(query)) {
        results.push({
          type: 'witch',
          title: `Witch Path - ${witchName}`,
          section: 'modern-witchcraft',
          href: `/grimoire/witches/${witch}`,
        });
      }
    });

    // Search divination methods - link to individual pages
    const divinationMethods = [
      {
        name: 'Pendulum Divination',
        slug: 'pendulum-divination',
        keywords: ['pendulum', 'dowsing', 'yes no'],
      },
      {
        name: 'Scrying',
        slug: 'scrying',
        keywords: ['scrying', 'crystal ball', 'black mirror', 'water scrying'],
      },
      {
        name: 'Dream Interpretation',
        slug: 'dream-interpretation',
        keywords: ['dream', 'dreams', 'dream journal', 'lucid'],
      },
      {
        name: 'Reading Omens',
        slug: 'reading-omens',
        keywords: ['omen', 'omens', 'signs', 'animal omen', 'natural signs'],
      },
    ];
    divinationMethods.forEach((method) => {
      if (
        method.name.toLowerCase().includes(query) ||
        method.slug.toLowerCase().includes(query) ||
        method.keywords.some((kw) => kw.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'section',
          title: `Divination - ${method.name}`,
          section: 'divination',
          href: `/grimoire/${method.slug}`,
        });
      }
    });

    // Search modern witchcraft subsections - link to individual pages
    const witchcraftSubsections = [
      {
        name: 'Book of Shadows',
        slug: 'book-of-shadows',
        keywords: ['book of shadows', 'bos', 'grimoire', 'journal'],
      },
      {
        name: 'Witchcraft Tools',
        slug: 'witchcraft-tools',
        keywords: [
          'tools',
          'athame',
          'wand',
          'chalice',
          'pentacle',
          'cauldron',
        ],
      },
      {
        name: 'Witchcraft Ethics',
        slug: 'witchcraft-ethics',
        keywords: ['ethics', 'wiccan rede', 'threefold law', 'harm none'],
      },
    ];
    witchcraftSubsections.forEach((subsection) => {
      if (
        subsection.name.toLowerCase().includes(query) ||
        subsection.slug.toLowerCase().includes(query) ||
        subsection.keywords.some((kw) => kw.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'section',
          title: `Modern Witchcraft - ${subsection.name}`,
          section: 'modern-witchcraft',
          href: `/grimoire/${subsection.slug}`,
        });
      }
    });

    // Search breathwork
    if (
      query.includes('breathwork') ||
      query.includes('breathing') ||
      query.includes('pranayama') ||
      query.includes('breath')
    ) {
      results.push({
        type: 'meditation',
        title: 'Breathwork Techniques',
        section: 'meditation',
        href: '/grimoire/breathwork',
        match:
          'Conscious breathing techniques for grounding, centering, and energy regulation',
      });
    }

    // Search birth chart subsections
    const birthChartSubsections = [
      {
        name: 'Transits',
        slug: 'transits',
        keywords: [
          'transits',
          'planetary transits',
          'current transits',
          'saturn return',
        ],
      },
      {
        name: 'Rising Sign',
        slug: 'rising-sign',
        keywords: [
          'rising sign',
          'ascendant',
          'ascendant sign',
          'outer personality',
        ],
      },
      {
        name: 'Synastry',
        slug: 'synastry',
        keywords: [
          'synastry',
          'relationship compatibility',
          'compatibility',
          'relationship astrology',
        ],
      },
    ];
    birthChartSubsections.forEach((subsection) => {
      if (
        subsection.name.toLowerCase().includes(query) ||
        subsection.slug.toLowerCase().includes(query) ||
        subsection.keywords.some((kw) => kw.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'section',
          title: `Birth Chart - ${subsection.name}`,
          section: 'birth-chart',
          href: `/grimoire/${subsection.slug}`,
        });
      }
    });

    // Search candle magic subsections
    const candleMagicSubsections = [
      {
        name: 'Incantations by Candle Color',
        slug: 'incantations-by-candle-color',
        keywords: [
          'incantations',
          'candle incantations',
          'candle chants',
          'spell chants',
        ],
      },
      {
        name: 'Lighting Candles on Your Altar',
        slug: 'lighting-candles-on-altar',
        keywords: [
          'lighting candles',
          'altar',
          'candle lighting ritual',
          'altar setup',
        ],
      },
      {
        name: 'Anointing Candles with Oils',
        slug: 'anointing-candles',
        keywords: [
          'anointing',
          'anointing candles',
          'candle oils',
          'essential oils',
        ],
      },
    ];
    candleMagicSubsections.forEach((subsection) => {
      if (
        subsection.name.toLowerCase().includes(query) ||
        subsection.slug.toLowerCase().includes(query) ||
        subsection.keywords.some((kw) => kw.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'practice',
          title: `Candle Magic - ${subsection.name}`,
          section: 'candle-magic',
          href: `/grimoire/${subsection.slug}`,
        });
      }
    });

    // Search moon subsections
    const moonSubsections = [
      {
        name: 'Moon Rituals by Phase',
        slug: 'moon-rituals',
        keywords: [
          'moon rituals',
          'lunar rituals',
          'moon phase rituals',
          'new moon ritual',
          'full moon ritual',
        ],
      },
      {
        name: 'Moon Signs & Daily Influence',
        slug: 'moon-signs',
        keywords: [
          'moon signs',
          'moon in signs',
          'daily moon sign',
          'moon sign meaning',
        ],
      },
    ];
    moonSubsections.forEach((subsection) => {
      if (
        subsection.name.toLowerCase().includes(query) ||
        subsection.slug.toLowerCase().includes(query) ||
        subsection.keywords.some((kw) => kw.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'moon',
          title: `Moon - ${subsection.name}`,
          section: 'moon',
          href: `/grimoire/${subsection.slug}`,
        });
      }
    });

    // Search tarot subsections
    const tarotSubsections = [
      {
        name: 'Reading Card Combinations',
        slug: 'card-combinations',
        keywords: [
          'card combinations',
          'reading combinations',
          'tarot pairs',
          'multiple cards',
        ],
      },
      {
        name: 'Reversed Cards Guide',
        slug: 'reversed-cards-guide',
        keywords: [
          'reversed cards',
          'reversed tarot',
          'upside down cards',
          'reversed meaning',
        ],
      },
    ];
    tarotSubsections.forEach((subsection) => {
      if (
        subsection.name.toLowerCase().includes(query) ||
        subsection.slug.toLowerCase().includes(query) ||
        subsection.keywords.some((kw) => kw.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'tarot',
          title: `Tarot - ${subsection.name}`,
          section: 'tarot',
          href: `/grimoire/${subsection.slug}`,
        });
      }
    });

    // Search spellcraft fundamentals
    if (
      query.includes('spellcraft') ||
      query.includes('spell fundamentals') ||
      query.includes('magic basics') ||
      query.includes('how to cast') ||
      query.includes('spell basics')
    ) {
      results.push({
        type: 'practice',
        title: 'Spellcraft Fundamentals',
        section: 'practices',
        href: '/grimoire/spellcraft-fundamentals',
        match:
          'Essential foundations of spellcraft, timing, intention, and magical practice',
      });
    }

    return results.slice(0, 20); // Increased limit to 20 results
  }, [searchQuery]);

  // Filter sections based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return grimoireItems;

    const query = searchQuery.toLowerCase();
    return grimoireItems.filter((itemKey) => {
      const item = grimoire[itemKey];
      const titleMatch = item.title.toLowerCase().includes(query);
      const contentMatch = item.contents?.some((content) =>
        content.toLowerCase().includes(query),
      );
      return titleMatch || contentMatch;
    });
  }, [searchQuery]);

  return (
    <div className='flex flex-row h-[93dvh] overflow-hidden relative'>
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
            className='text-lg md:text-xl lg:text-2xl font-bold text-white hover:text-purple-400 transition-colors flex items-center gap-2'
          >
            <Sparkles className='w-5 h-5 md:w-6 md:h-6 text-purple-400' />
            Grimoire
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className='md:hidden p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white'
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className='p-4 md:p-5 lg:p-6 border-b border-zinc-700 relative search-container'>
          <div className='relative'>
            <Search className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-400' />
            <input
              type='text'
              placeholder='Search grimoire...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setShowSearchResults(true);
              }}
              className='w-full pl-10 md:pl-12 pr-4 py-2 md:py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base'
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className='absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-96 overflow-y-auto z-50'>
              <div className='p-2 md:p-3 space-y-1'>
                {searchResults.map((result, index) => (
                  <Link
                    key={index}
                    href={result.href}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery('');
                      setSidebarOpen(false);
                      startTransition(() => {
                        if (result.section) {
                          setExpandedSections(new Set([result.section]));
                        }
                      });
                    }}
                    className='block p-2 md:p-3 rounded hover:bg-zinc-800 transition-colors'
                  >
                    <div className='flex items-start gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm md:text-base font-medium text-zinc-100 truncate'>
                          {result.title}
                        </div>
                        {result.match && (
                          <div className='text-xs md:text-sm text-zinc-400 mt-1 truncate'>
                            {result.match}
                          </div>
                        )}
                        <div className='text-xs text-zinc-500 mt-1 capitalize'>
                          {result.type}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='flex-1 overflow-y-auto p-4 md:p-5 lg:p-6'>
          {filteredItems.length === 0 ? (
            <div className='text-center text-zinc-400 py-8'>
              <p>No results found</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {filteredItems.map((itemKey: string) => {
                const isExpanded = expandedSections.has(itemKey);
                const hasContents =
                  grimoire[itemKey].contents &&
                  grimoire[itemKey].contents!.length > 0;
                const isActive = currentSection === itemKey;

                const slug = sectionToSlug(itemKey);
                const href = `/grimoire/${slug}`;

                return (
                  <div key={itemKey} className='w-full'>
                    {/* Main header */}
                    <div
                      className={`flex items-center rounded transition-colors ${
                        isActive
                          ? 'bg-zinc-800/50 border-l-2 border-purple-400'
                          : ''
                      }`}
                    >
                      {hasContents ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSection(itemKey);
                          }}
                          className='p-1 mr-1 hover:bg-zinc-700 rounded'
                        >
                          {isExpanded ? (
                            <ChevronDownIcon
                              size={16}
                              className='text-zinc-400'
                            />
                          ) : (
                            <ChevronRightIcon
                              size={16}
                              className='text-zinc-400'
                            />
                          )}
                        </button>
                      ) : (
                        <div className='w-6' />
                      )}

                      <Link
                        href={href}
                        prefetch={true}
                        onClick={() => {
                          startTransition(() => {
                            setSidebarOpen(false);
                          });
                        }}
                        className={`flex-1 py-2 md:py-2.5 px-2 md:px-3 text-sm md:text-base lg:text-lg font-medium hover:text-purple-400 transition-colors block ${
                          isActive ? 'text-purple-400' : 'text-white'
                        }`}
                      >
                        {grimoire[itemKey].title}
                      </Link>
                    </div>

                    {/* Collapsible content */}
                    {hasContents && (
                      <div
                        className={`
                          overflow-hidden transition-all duration-300 ease-in-out
                          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                        `}
                      >
                        <div className='ml-6 md:ml-8 mt-1 space-y-1'>
                          {grimoire[itemKey].contents!.map(
                            (content: string) => {
                              const slug = sectionToSlug(itemKey);
                              return (
                                <Link
                                  key={content}
                                  href={`/grimoire/${slug}#${stringToKebabCase(content)}`}
                                  prefetch={true}
                                  onClick={() => {
                                    startTransition(() => {
                                      setSidebarOpen(false);
                                    });
                                  }}
                                  className='block py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm text-zinc-300 hover:text-purple-300 hover:bg-zinc-800 rounded transition-colors'
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
          )}
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-y-auto min-w-0'>
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className='md:hidden fixed top-4 left-4 z-30 p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white hover:bg-zinc-800 transition-colors'
        >
          <Menu size={20} />
        </button>

        {/* Loading indicator */}
        {isPending && (
          <div className='absolute top-0 left-0 right-0 h-1 bg-purple-500/20 z-50'>
            <div className='h-full bg-purple-500 animate-pulse' />
          </div>
        )}

        {currentSection ? (
          <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
            <div className='max-w-7xl mx-auto'>
              {GrimoireContent[currentSection as keyof typeof GrimoireContent]}
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center min-h-full text-center px-4 py-8 md:py-12 lg:py-16'>
            <div className='max-w-6xl w-full'>
              <div className='mb-8 md:mb-12'>
                <Sparkles className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-purple-400 mx-auto mb-6 md:mb-8' />
                <h1 className='text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-zinc-100 mb-4 md:mb-6'>
                  Welcome to the Grimoire
                </h1>
                <p className='text-base md:text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto'>
                  Explore mystical knowledge, cosmic wisdom, and ancient
                  practices to deepen your spiritual journey.
                </p>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mt-8 md:mt-12'>
                {grimoireItems.map((itemKey) => {
                  const item = grimoire[itemKey];
                  const slug = sectionToSlug(itemKey);
                  return (
                    <Link
                      key={itemKey}
                      href={`/grimoire/${slug}`}
                      prefetch={true}
                      className='group rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 md:p-6 lg:p-8 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all'
                    >
                      <h3 className='text-lg md:text-xl lg:text-2xl font-medium text-zinc-100 mb-2 md:mb-3 group-hover:text-purple-400 transition-colors'>
                        {item.title}
                      </h3>
                      {item.contents && (
                        <p className='text-sm md:text-base lg:text-lg text-zinc-400'>
                          {item.contents.length} section
                          {item.contents.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
