'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { NavParamLink } from '@/components/NavParamLink';
import { Search, Sparkles } from 'lucide-react';
import { grimoire, grimoireItems } from '@/constants/grimoire';
import { stringToKebabCase } from '../../../utils/string';
import { sectionToSlug } from '@/utils/grimoire';
import { Spell } from '@/lib/spells/index';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type SearchDataType = {
  runesList: any;
  tarotSuits: any;
  tarotSpreads: any;
  spellDatabase: Spell[];
  correspondencesData: any;
  chakras: any;
  annualFullMoons: any;
  monthlyMoonPhases: any;
  zodiacSigns: any;
  planetaryBodies: any;
  wheelOfTheYearSabbats: any;
  tarotCards: any;
  crystalDatabase: any;
  angelNumbers: any;
  lifePathNumbers: any;
  TAROT_SPREADS: any;
  glossaryTerms: any;
} | null;

interface SearchResult {
  type: string;
  title: string;
  section?: string;
  href: string;
  match?: string;
}

interface GrimoireSearchProps {
  compact?: boolean;
  placeholder?: string;
  onResultClick?: () => void;
}

export function GrimoireSearch({
  compact = false,
  placeholder = 'Search the grimoire...',
  onResultClick,
}: GrimoireSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 200);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchData, setSearchData] = useState<SearchDataType>(null);
  const [searchDataLoading, setSearchDataLoading] = useState(false);
  const loadingStarted = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (loadingStarted.current || searchData) return;
    loadingStarted.current = true;

    const loadData = async () => {
      setSearchDataLoading(true);
      try {
        const [
          { runesList },
          { tarotSuits, tarotSpreads },
          { spellDatabase },
          { correspondencesData },
          { chakras },
          { annualFullMoons },
          { monthlyMoonPhases },
          { zodiacSigns, planetaryBodies },
          { wheelOfTheYearSabbats },
          { tarotCards },
          { crystalDatabase },
          { angelNumbers, lifePathNumbers },
          { TAROT_SPREADS },
          { ASTROLOGY_GLOSSARY },
        ] = await Promise.all([
          import('@/constants/runes'),
          import('@/constants/tarot'),
          import('@/lib/spells/index'),
          import('@/constants/grimoire/correspondences'),
          import('@/constants/chakras'),
          import('@/constants/moon/annualFullMoons'),
          import('../../../utils/moon/monthlyPhases'),
          import('../../../utils/zodiac/zodiac'),
          import('@/constants/sabbats'),
          import('../../../utils/tarot/tarot-cards'),
          import('@/constants/grimoire/crystals'),
          import('@/constants/grimoire/numerology-data'),
          import('@/constants/tarotSpreads'),
          import('@/constants/grimoire/glossary'),
        ]);
        setSearchData({
          runesList,
          tarotSuits,
          tarotSpreads,
          spellDatabase,
          correspondencesData,
          chakras,
          annualFullMoons,
          monthlyMoonPhases,
          zodiacSigns,
          planetaryBodies,
          wheelOfTheYearSabbats,
          tarotCards,
          crystalDatabase,
          angelNumbers,
          lifePathNumbers,
          TAROT_SPREADS,
          glossaryTerms: ASTROLOGY_GLOSSARY,
        });
      } catch (error) {
        console.error('Failed to load search data:', error);
      } finally {
        setSearchDataLoading(false);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadData());
    } else {
      setTimeout(() => loadData(), 100);
    }
  }, [searchData]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim() || !searchData) return [];

    const queryWords = debouncedQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2);
    if (queryWords.length === 0) return [];

    const sharesStem = (word1: string, word2: string): boolean => {
      const minLen = Math.min(word1.length, word2.length);
      if (minLen < 4) return word1 === word2;
      const prefixLen = Math.min(4, minLen);
      return word1.slice(0, prefixLen) === word2.slice(0, prefixLen);
    };

    const matchesQuery = (text: string): number => {
      const lowerText = text.toLowerCase();
      const textWords = lowerText.split(/[\s\-_]+/);
      let score = 0;
      for (const queryWord of queryWords) {
        if (lowerText.includes(queryWord)) {
          score++;
          continue;
        }
        for (const textWord of textWords) {
          if (sharesStem(queryWord, textWord)) {
            score++;
            break;
          }
        }
      }
      return score;
    };

    const matchesAny = (...texts: (string | undefined)[]): number => {
      let maxScore = 0;
      for (const text of texts) {
        if (text) {
          const score = matchesQuery(text);
          if (score > maxScore) maxScore = score;
        }
      }
      return maxScore;
    };

    const scoredResults: Array<SearchResult & { score: number }> = [];

    // Search grimoire sections and contents
    grimoireItems.forEach((itemKey) => {
      const item = grimoire[itemKey];
      const titleScore = matchesQuery(item.title);
      if (titleScore > 0) {
        scoredResults.push({
          type: 'section',
          title: item.title,
          section: itemKey,
          href: `/grimoire/${sectionToSlug(itemKey)}`,
          score: titleScore + 2, // Boost full page results
        });
      }
      item.contents?.forEach((content) => {
        const contentScore = matchesAny(content, item.title);
        const combinedScore = matchesQuery(`${item.title} ${content}`);
        const bestScore = Math.max(contentScore, combinedScore);
        if (bestScore > 0) {
          scoredResults.push({
            type: 'section',
            title: `${item.title} - ${content}`,
            section: itemKey,
            href: `/grimoire/${sectionToSlug(itemKey)}#${stringToKebabCase(content)}`,
            score: bestScore,
          });
        }
      });
    });

    Object.entries(searchData.runesList || {}).forEach(
      ([key, rune]: [string, any]) => {
        const score = matchesAny(rune.name, rune.meaning);
        if (score > 0) {
          scoredResults.push({
            type: 'rune',
            title: `${rune.symbol} ${rune.name}`,
            section: 'runes',
            href: `/grimoire/runes/${stringToKebabCase(key)}`,
            match: `Meaning: ${rune.meaning}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.tarotCards?.majorArcana || {}).forEach(
      ([, card]: [string, any]) => {
        const keywordMatch = card.keywords?.some(
          (kw: string) => matchesQuery(kw) > 0,
        );
        const score = matchesAny(card.name) || (keywordMatch ? 1 : 0);
        if (score > 0) {
          scoredResults.push({
            type: 'tarot',
            title: `Tarot Card - ${card.name}`,
            section: 'tarot',
            href: `/grimoire/tarot/${stringToKebabCase(card.name)}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.chakras || {}).forEach(
      ([key, chakra]: [string, any]) => {
        const score = matchesAny(chakra.name, chakra.color);
        if (score > 0) {
          scoredResults.push({
            type: 'chakra',
            title: `${chakra.symbol} ${chakra.name} Chakra`,
            section: 'chakras',
            href: `/grimoire/chakras/${stringToKebabCase(key)}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.zodiacSigns || {}).forEach(
      ([key, sign]: [string, any]) => {
        const score = matchesQuery(sign.name);
        if (score > 0) {
          scoredResults.push({
            type: 'zodiac',
            title: `Zodiac Sign - ${sign.name}`,
            section: 'astronomy',
            href: `/grimoire/zodiac/${stringToKebabCase(key)}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.planetaryBodies || {}).forEach(
      ([key, planet]: [string, any]) => {
        const score = matchesQuery(planet.name);
        if (score > 0) {
          scoredResults.push({
            type: 'planet',
            title: `Planet - ${planet.name}`,
            section: 'astronomy',
            href: `/grimoire/astronomy/planets/${stringToKebabCase(key)}`,
            score,
          });
        }
      },
    );

    (searchData.wheelOfTheYearSabbats || []).forEach((sabbat: any) => {
      const score = matchesQuery(sabbat.name);
      if (score > 0) {
        scoredResults.push({
          type: 'sabbat',
          title: `Sabbat - ${sabbat.name}`,
          section: 'wheel-of-the-year',
          href: `/grimoire/wheel-of-the-year/${stringToKebabCase(sabbat.name)}`,
          score,
        });
      }
    });

    (searchData.spellDatabase || []).forEach((spell: any) => {
      const score = matchesAny(
        spell.title,
        spell.category,
        spell.purpose,
        spell.type,
      );
      if (score > 0) {
        scoredResults.push({
          type: 'spell',
          title: `${spell.type === 'ritual' ? 'Ritual' : 'Spell'} - ${spell.title}`,
          section: 'practices',
          href: `/grimoire/spells/${spell.id}`,
          match: spell.purpose,
          score,
        });
      }
    });

    Object.entries(searchData.tarotCards?.minorArcana || {}).forEach(
      ([, suitCards]: [string, any]) => {
        Object.entries(suitCards || {}).forEach(([, card]: [string, any]) => {
          const keywordMatch = card.keywords?.some(
            (kw: string) => matchesQuery(kw) > 0,
          );
          const score = matchesAny(card.name) || (keywordMatch ? 1 : 0);
          if (score > 0) {
            scoredResults.push({
              type: 'tarot',
              title: `Tarot Card - ${card.name}`,
              section: 'tarot',
              href: `/grimoire/tarot/${stringToKebabCase(card.name)}`,
              score,
            });
          }
        });
      },
    );

    searchData.crystalDatabase?.forEach((crystal: any) => {
      const nameScore = matchesQuery(crystal.name);
      const chakraMatch = crystal.chakras?.some(
        (c: string) => matchesQuery(c) > 0,
      );
      const propertyMatch = crystal.properties?.some(
        (p: string) => matchesQuery(p) > 0,
      );
      const cleansingMatch = crystal.careInstructions?.cleansing?.some(
        (c: string) => matchesQuery(c) > 0,
      );
      const score =
        nameScore ||
        (chakraMatch ? 1 : 0) ||
        (propertyMatch ? 1 : 0) ||
        (cleansingMatch ? 1 : 0);
      if (score > 0) {
        scoredResults.push({
          type: 'crystal',
          title: `Crystal - ${crystal.name}`,
          section: 'crystals',
          href: `/grimoire/crystals/${crystal.id}`,
          match: crystal.description?.slice(0, 80),
          score,
        });
      }
    });

    searchData.TAROT_SPREADS?.forEach((spread: any) => {
      const score = matchesAny(
        spread.name,
        spread.description,
        spread.category,
      );
      if (score > 0) {
        scoredResults.push({
          type: 'spread',
          title: `Tarot Spread - ${spread.name}`,
          section: 'tarot',
          href: `/grimoire/tarot/spreads/${spread.slug}`,
          match: spread.description?.slice(0, 80),
          score,
        });
      }
    });

    Object.entries(searchData.monthlyMoonPhases || {}).forEach(
      ([key, phase]: [string, any]) => {
        const keywordMatch = phase.keywords?.some(
          (kw: string) => matchesQuery(kw) > 0,
        );
        const score = matchesQuery(key) || (keywordMatch ? 1 : 0);
        if (score > 0) {
          scoredResults.push({
            type: 'moon',
            title: `Moon Phase - ${key}`,
            section: 'moon',
            href: `/grimoire/moon/phases/${stringToKebabCase(key)}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.annualFullMoons || {}).forEach(
      ([month, moon]: [string, any]) => {
        const score = matchesAny(month, moon.name);
        if (score > 0) {
          scoredResults.push({
            type: 'moon',
            title: `Full Moon - ${moon.name || month}`,
            section: 'moon',
            href: `/grimoire/moon/full-moons/${month.toLowerCase()}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.colors || {}).forEach(
      ([color, data]: [string, any]) => {
        const score = matchesQuery(color);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Color - ${color}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/colors/${color.toLowerCase()}`,
            match: data.meaning?.slice(0, 60),
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.elements || {}).forEach(
      ([element]: [string, any]) => {
        const score = matchesQuery(element);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Element - ${element}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/elements/${element.toLowerCase()}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.herbs || {}).forEach(
      ([herb, data]: [string, any]) => {
        const score = matchesAny(herb, data.magicalUses);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Herb - ${herb}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/herbs/${herb.toLowerCase()}`,
            match: data.magicalUses?.slice(0, 60),
            score,
          });
        }
      },
    );

    Object.entries(searchData.angelNumbers || {}).forEach(
      ([number, data]: [string, any]) => {
        const score = matchesAny(number, data.meaning);
        if (score > 0) {
          scoredResults.push({
            type: 'numerology',
            title: `Angel Number ${number}`,
            section: 'numerology',
            href: `/grimoire/angel-numbers/${number}`,
            match: data.meaning?.slice(0, 60),
            score,
          });
        }
      },
    );

    Object.entries(searchData.lifePathNumbers || {}).forEach(
      ([number, data]: [string, any]) => {
        const score = matchesAny(number, data.title);
        if (score > 0) {
          scoredResults.push({
            type: 'numerology',
            title: `Life Path ${number} - ${data.title}`,
            section: 'numerology',
            href: `/grimoire/life-path/${number}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.days || {}).forEach(
      ([day, data]: [string, any]) => {
        const score = matchesAny(day, data.planet);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Day - ${day}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/days/${day.toLowerCase()}`,
            match: `Ruled by ${data.planet}`,
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.flowers || {}).forEach(
      ([flower, data]: [string, any]) => {
        const score = matchesAny(flower, data.meaning);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Flower - ${flower}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/flowers/${flower.toLowerCase()}`,
            match: data.meaning?.slice(0, 60),
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.animals || {}).forEach(
      ([animal, data]: [string, any]) => {
        const score = matchesAny(animal, data.symbolism);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Animal - ${animal}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/animals/${animal.toLowerCase()}`,
            match: data.symbolism?.slice(0, 60),
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.wood || {}).forEach(
      ([wood, data]: [string, any]) => {
        const score = matchesAny(wood, data.magicalUses);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Wood - ${wood}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/wood/${wood.toLowerCase()}`,
            match: data.magicalUses?.slice(0, 60),
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.numbers || {}).forEach(
      ([num, data]: [string, any]) => {
        const score = matchesAny(num, data.meaning);
        if (score > 0) {
          scoredResults.push({
            type: 'correspondence',
            title: `Number ${num}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/numbers/${num}`,
            match: data.meaning?.slice(0, 60),
            score,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.deities || {}).forEach(
      ([pantheon, gods]: [string, any]) => {
        Object.entries(gods || {}).forEach(([deity, data]: [string, any]) => {
          const domainArray = Array.isArray(data.domain) ? data.domain : [];
          const domainMatch = domainArray.some(
            (d: string) => matchesQuery(d) > 0,
          );
          const score = matchesAny(deity, pantheon) || (domainMatch ? 1 : 0);
          if (score > 0) {
            scoredResults.push({
              type: 'correspondence',
              title: `${deity} (${pantheon})`,
              section: 'correspondences',
              href: `/grimoire/correspondences/deities/${pantheon.toLowerCase()}/${deity.toLowerCase()}`,
              match: domainArray.join(', '),
              score,
            });
          }
        });
      },
    );

    const candleColors = [
      'red',
      'pink',
      'orange',
      'yellow',
      'green',
      'blue',
      'purple',
      'indigo',
      'white',
      'black',
      'brown',
      'silver',
    ];
    candleColors.forEach((color) => {
      const score = matchesQuery(color);
      if (score > 0) {
        scoredResults.push({
          type: 'candle',
          title: `Candle Magic - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
          section: 'candle-magic',
          href: `/grimoire/candle-magic/colors/${color}`,
          score,
        });
      }
    });

    for (let i = 1; i <= 9; i++) {
      const score = matchesQuery(String(i));
      if (score > 0) {
        scoredResults.push({
          type: 'numerology',
          title: `Core Number ${i}`,
          section: 'numerology',
          href: `/grimoire/numerology/core-numbers/${i}`,
          score,
        });
      }
    }

    [11, 22, 33].forEach((num) => {
      const score = matchesQuery(String(num));
      if (score > 0) {
        scoredResults.push({
          type: 'numerology',
          title: `Master Number ${num}`,
          section: 'numerology',
          href: `/grimoire/numerology/master-numbers/${num}`,
          score,
        });
      }
    });

    for (let i = 1; i <= 12; i++) {
      const suffix = i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th';
      const score = matchesAny(`${i}${suffix} house`, 'house', String(i));
      if (score > 0) {
        scoredResults.push({
          type: 'house',
          title: `${i}${suffix} House`,
          section: 'houses',
          href: `/grimoire/houses/${i}${suffix}-house`,
          score,
        });
      }
    }

    const witchTypes = [
      { slug: 'green-witch', name: 'Green Witch' },
      { slug: 'kitchen-witch', name: 'Kitchen Witch' },
      { slug: 'hedge-witch', name: 'Hedge Witch' },
      { slug: 'sea-witch', name: 'Sea Witch' },
      { slug: 'cosmic-witch', name: 'Cosmic Witch' },
      { slug: 'eclectic-witch', name: 'Eclectic Witch' },
    ];
    witchTypes.forEach((witch) => {
      const score = matchesQuery(witch.name);
      if (score > 0) {
        scoredResults.push({
          type: 'witch',
          title: witch.name,
          section: 'modern-witchcraft',
          href: `/grimoire/modern-witchcraft/witch-types/${witch.slug}`,
          score,
        });
      }
    });

    const tools = ['athame', 'wand', 'cauldron', 'chalice', 'pentacle'];
    tools.forEach((tool) => {
      const score = matchesQuery(tool);
      if (score > 0) {
        scoredResults.push({
          type: 'tool',
          title: `Witchcraft Tool - ${tool.charAt(0).toUpperCase() + tool.slice(1)}`,
          section: 'modern-witchcraft',
          href: `/grimoire/modern-witchcraft/tools/${tool}`,
          score,
        });
      }
    });

    const meditations = [
      { slug: 'guided-meditation', name: 'Guided Meditation' },
      { slug: 'mindfulness-meditation', name: 'Mindfulness Meditation' },
      { slug: 'visualization-meditation', name: 'Visualization Meditation' },
      { slug: 'walking-meditation', name: 'Walking Meditation' },
      { slug: 'mantra-meditation', name: 'Mantra Meditation' },
    ];
    meditations.forEach((med) => {
      const score = matchesQuery(med.name);
      if (score > 0) {
        scoredResults.push({
          type: 'meditation',
          title: med.name,
          section: 'meditation',
          href: `/grimoire/meditation/techniques/${med.slug}`,
          score,
        });
      }
    });

    const scryingMethods = [
      { slug: 'crystal-ball', name: 'Crystal Ball Scrying' },
      { slug: 'black-mirror', name: 'Black Mirror Scrying' },
      { slug: 'water-scrying', name: 'Water Scrying' },
      { slug: 'fire-scrying', name: 'Fire Scrying' },
    ];
    scryingMethods.forEach((method) => {
      const score = matchesAny(method.name, 'scrying');
      if (score > 0) {
        scoredResults.push({
          type: 'divination',
          title: method.name,
          section: 'divination',
          href: `/grimoire/divination/scrying/${method.slug}`,
          score,
        });
      }
    });

    const nodeScore = matchesAny('north node', 'lunar node', 'node');
    if (nodeScore > 0) {
      scoredResults.push({
        type: 'astrology',
        title: 'North Node',
        section: 'lunar-nodes',
        href: '/grimoire/lunar-nodes/north-node',
        score: nodeScore,
      });
      scoredResults.push({
        type: 'astrology',
        title: 'South Node',
        section: 'lunar-nodes',
        href: '/grimoire/lunar-nodes/south-node',
        score: nodeScore,
      });
    }

    const retrogradePlanets = [
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
    ];
    retrogradePlanets.forEach((planet) => {
      const score = matchesAny(planet, 'retrograde', `${planet} retrograde`);
      if (score > 0) {
        scoredResults.push({
          type: 'astrology',
          title: `${planet.charAt(0).toUpperCase() + planet.slice(1)} Retrograde`,
          section: 'retrogrades',
          href: `/grimoire/astronomy/retrogrades/${planet}`,
          score,
        });
      }
    });

    (searchData.glossaryTerms || []).forEach((term: any) => {
      const relatedMatch = term.relatedTerms?.some(
        (t: string) => matchesQuery(t) > 0,
      );
      const score =
        matchesAny(term.term, term.definition) || (relatedMatch ? 1 : 0);
      if (score > 0) {
        scoredResults.push({
          type: 'glossary',
          title: `${term.term}`,
          section: 'glossary',
          href: `/grimoire/glossary#${term.slug}`,
          match: term.definition?.slice(0, 80),
          score,
        });
      }
    });

    const archetypes = [
      {
        id: 'restorer',
        name: 'The Restorer',
        keywords: ['healing', 'recovery', 'restoration'],
      },
      {
        id: 'seeker',
        name: 'The Seeker',
        keywords: ['exploration', 'truth', 'questioning'],
      },
      {
        id: 'catalyst',
        name: 'The Catalyst',
        keywords: ['change', 'transformation', 'action'],
      },
      {
        id: 'grounded-one',
        name: 'The Grounded One',
        keywords: ['stability', 'foundation', 'earth'],
      },
      {
        id: 'empath',
        name: 'The Empath',
        keywords: ['sensitivity', 'feeling', 'emotions'],
      },
      {
        id: 'shadow-dancer',
        name: 'The Shadow Dancer',
        keywords: ['shadow work', 'darkness', 'integration'],
      },
      {
        id: 'visionary',
        name: 'The Visionary',
        keywords: ['future', 'dreams', 'possibilities'],
      },
      {
        id: 'mystic',
        name: 'The Mystic',
        keywords: ['spiritual', 'mystery', 'intuition'],
      },
      {
        id: 'protector',
        name: 'The Protector',
        keywords: ['boundaries', 'safety', 'guardian'],
      },
      {
        id: 'heart-opener',
        name: 'The Heart Opener',
        keywords: ['love', 'vulnerability', 'connection'],
      },
      {
        id: 'lunar-weaver',
        name: 'The Lunar Weaver',
        keywords: ['moon', 'cycles', 'patterns'],
      },
      {
        id: 'alchemist',
        name: 'The Alchemist',
        keywords: ['transformation', 'magic', 'transmutation'],
      },
    ];
    archetypes.forEach((arch) => {
      const keywordMatch = arch.keywords.some((k) => matchesQuery(k) > 0);
      const score =
        matchesAny(arch.name, 'archetype', ...arch.keywords) ||
        (keywordMatch ? 2 : 0);
      if (score > 0) {
        scoredResults.push({
          type: 'archetype',
          title: arch.name,
          section: 'archetypes',
          href: `/grimoire/archetypes#${arch.id}`,
          score,
        });
      }
    });

    const archetypeGuideScore = matchesAny(
      'archetype',
      'archetypes',
      'inner patterns',
      'shadow work',
    );
    if (archetypeGuideScore > 0) {
      scoredResults.push({
        type: 'guide',
        title: 'Lunary Archetypes Guide',
        section: 'guides',
        href: '/grimoire/archetypes',
        score: archetypeGuideScore + 1,
      });
    }

    // Smart deduplication: prefer full pages over hash links
    return deduplicateResults(scoredResults);
  }, [debouncedQuery, searchData]);

  return (
    <div
      ref={containerRef}
      className={`relative ${compact ? 'w-48 md:w-64' : 'max-w-xl mx-auto'}`}
    >
      <Search
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 ${compact ? 'w-4 h-4' : 'w-4 h-4 md:w-5 md:h-5'}`}
        aria-hidden='true'
      />
      <input
        type='text'
        placeholder={searchDataLoading ? 'Loading...' : placeholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSearchResults(e.target.value.length > 0);
        }}
        onFocus={() => {
          if (searchQuery.length > 0) setShowSearchResults(true);
        }}
        name='grimoire-search'
        data-testid='grimoire-search'
        aria-label='Search grimoire'
        className={`w-full bg-zinc-800/80 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent ${
          compact
            ? 'pl-9 pr-3 py-1 text-xs'
            : 'pl-10 md:pl-12 pr-4 py-2 md:py-2.5 text-sm md:text-base'
        }`}
      />

      {/* Search Results Dropdown */}
      {showSearchResults && searchDataLoading && searchQuery.trim() && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-3 z-50'>
          <div className='flex items-center gap-2 text-zinc-400'>
            <div className='w-4 h-4 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin' />
            <span className='text-sm'>Loading...</span>
          </div>
        </div>
      )}

      {showSearchResults &&
        !searchDataLoading &&
        searchQuery.trim() &&
        searchResults.length > 0 && (
          <div className='absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-80 overflow-y-auto z-50'>
            <div className='p-2 space-y-0.5'>
              {searchResults.map((result, index) => (
                <NavParamLink
                  key={index}
                  href={result.href}
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery('');
                    onResultClick?.();
                  }}
                  className='block px-3 py-2 rounded hover:bg-zinc-800 transition-colors'
                >
                  <div className='text-sm font-medium text-zinc-100 truncate'>
                    {result.title}
                  </div>
                  {result.match && (
                    <div className='text-xs text-zinc-400 mt-0.5 truncate'>
                      {result.match}
                    </div>
                  )}
                  <div className='text-xs text-zinc-500 mt-0.5 capitalize'>
                    {result.type}
                  </div>
                </NavParamLink>
              ))}
            </div>
          </div>
        )}

      {/* No Results */}
      {showSearchResults &&
        !searchDataLoading &&
        searchQuery.trim() &&
        searchResults.length === 0 && (
          <div className='absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-3 z-50'>
            <p className='text-zinc-400 text-sm mb-2'>
              No results for "{searchQuery}"
            </p>
            <NavParamLink
              href='/guide'
              onClick={() => {
                setShowSearchResults(false);
                setSearchQuery('');
                onResultClick?.();
              }}
              className='inline-flex items-center gap-1.5 text-sm text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              <Sparkles className='w-4 h-4' />
              Ask the Astral Guide
            </NavParamLink>
          </div>
        )}
    </div>
  );
}

// Smart deduplication: prefer full pages over hash links
function deduplicateResults(
  results: Array<SearchResult & { score: number }>,
): SearchResult[] {
  const groups = new Map<string, Array<SearchResult & { score: number }>>();

  for (const result of results) {
    const key = normalizeKey(result.href);
    const group = groups.get(key) || [];
    group.push(result);
    groups.set(key, group);
  }

  // Pick best from each group and flatten
  const deduplicated: Array<SearchResult & { score: number }> = [];
  for (const group of groups.values()) {
    deduplicated.push(pickBest(group));
  }

  // Sort by score descending and remove score from results
  return deduplicated
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map(({ score: _, ...result }) => result);
}

function normalizeKey(href: string): string {
  // Remove hash to group by base page
  const base = href.split('#')[0];
  // Normalize to first 3 segments: e.g., "grimoire/tarot/spreads"
  const parts = base.split('/').filter(Boolean);
  return parts.slice(0, 3).join('/');
}

function pickBest(
  results: Array<SearchResult & { score: number }>,
): SearchResult & { score: number } {
  // Sort: prefer full page (no hash) > higher score > shorter path
  return results.sort((a, b) => {
    const aHash = a.href.includes('#') ? 1 : 0;
    const bHash = b.href.includes('#') ? 1 : 0;
    if (aHash !== bHash) return aHash - bHash;

    // Higher score first
    if (b.score !== a.score) return b.score - a.score;

    // Shorter path = more specific page
    return a.href.split('/').length - b.href.split('/').length;
  })[0];
}
