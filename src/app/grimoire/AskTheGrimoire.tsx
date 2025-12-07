'use client';

import { useState, useMemo, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Loader2, Send } from 'lucide-react';
import { grimoire, grimoireItems } from '@/constants/grimoire';
import { stringToKebabCase } from '../../../utils/string';
import { sectionToSlug } from '@/utils/grimoire';

type SearchDataType = {
  runesList: any;
  tarotSuits: any;
  tarotSpreads: any;
  spells: any;
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
} | null;

interface SearchResult {
  type: string;
  title: string;
  section?: string;
  href: string;
  match?: string;
}

interface AskTheGrimoireProps {
  onResultClick?: (section?: string) => void;
  onSidebarClose?: () => void;
}

export function AskTheGrimoire({
  onResultClick,
  onSidebarClose,
}: AskTheGrimoireProps) {
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchData, setSearchData] = useState<SearchDataType>(null);
  const [searchDataLoading, setSearchDataLoading] = useState(false);
  const loadingStarted = useRef(false);

  const [aiMode, setAiMode] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingStarted.current || searchData) return;
    loadingStarted.current = true;

    const loadData = async () => {
      setSearchDataLoading(true);
      try {
        const [
          { runesList },
          { tarotSuits, tarotSpreads },
          { spells },
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
        ] = await Promise.all([
          import('@/constants/runes'),
          import('@/constants/tarot'),
          import('@/constants/spells'),
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
        ]);
        setSearchData({
          runesList,
          tarotSuits,
          tarotSpreads,
          spells,
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

  const handleAskAI = async () => {
    if (!searchQuery.trim() || aiLoading) return;

    setAiLoading(true);
    setAiError(null);
    setAiResponse('');
    setShowSearchResults(true);

    try {
      const response = await fetch('/api/ai/astral-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setAiResponse(fullText);
              }
            } catch {
              // Non-JSON data, ignore
            }
          }
        }
      }
    } catch (error) {
      console.error('AI error:', error);
      setAiError('Something went wrong. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (aiMode && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const searchResults = useMemo(() => {
    if (aiMode || !searchQuery.trim() || !searchData) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

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

    Object.entries(searchData.runesList || {}).forEach(
      ([key, rune]: [string, any]) => {
        if (
          rune.name.toLowerCase().includes(query) ||
          rune.meaning.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'rune',
            title: `${rune.symbol} ${rune.name}`,
            section: 'runes',
            href: `/grimoire/runes/${stringToKebabCase(key)}`,
            match: `Meaning: ${rune.meaning}`,
          });
        }
      },
    );

    Object.entries(searchData.tarotCards?.majorArcana || {}).forEach(
      ([, card]: [string, any]) => {
        if (
          card.name.toLowerCase().includes(query) ||
          card.keywords.some((kw: string) => kw.toLowerCase().includes(query))
        ) {
          results.push({
            type: 'tarot',
            title: `Tarot Card - ${card.name}`,
            section: 'tarot',
            href: `/grimoire/tarot/${stringToKebabCase(card.name)}`,
          });
        }
      },
    );

    Object.entries(searchData.chakras || {}).forEach(
      ([key, chakra]: [string, any]) => {
        if (
          chakra.name.toLowerCase().includes(query) ||
          chakra.color.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'chakra',
            title: `${chakra.symbol} ${chakra.name} Chakra`,
            section: 'chakras',
            href: `/grimoire/chakras/${stringToKebabCase(key)}`,
          });
        }
      },
    );

    Object.entries(searchData.zodiacSigns || {}).forEach(
      ([key, sign]: [string, any]) => {
        if (sign.name.toLowerCase().includes(query)) {
          results.push({
            type: 'zodiac',
            title: `Zodiac Sign - ${sign.name}`,
            section: 'astronomy',
            href: `/grimoire/zodiac/${stringToKebabCase(key)}`,
          });
        }
      },
    );

    Object.entries(searchData.planetaryBodies || {}).forEach(
      ([key, planet]: [string, any]) => {
        if (planet.name.toLowerCase().includes(query)) {
          results.push({
            type: 'planet',
            title: `Planet - ${planet.name}`,
            section: 'astronomy',
            href: `/grimoire/planets/${stringToKebabCase(key)}`,
          });
        }
      },
    );

    (searchData.wheelOfTheYearSabbats || []).forEach((sabbat: any) => {
      if (sabbat.name.toLowerCase().includes(query)) {
        results.push({
          type: 'sabbat',
          title: `Sabbat - ${sabbat.name}`,
          section: 'wheel-of-the-year',
          href: `/grimoire/sabbats/${stringToKebabCase(sabbat.name)}`,
        });
      }
    });

    (searchData.spells || []).forEach((spell: any) => {
      if (
        spell.title.toLowerCase().includes(query) ||
        spell.category.toLowerCase().includes(query) ||
        spell.purpose.toLowerCase().includes(query) ||
        spell.type.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'spell',
          title: `${spell.type === 'ritual' ? 'Ritual' : 'Spell'} - ${spell.title}`,
          section: 'practices',
          href: `/grimoire/spells/${spell.id}`,
          match: spell.purpose,
        });
      }
    });

    Object.entries(searchData.tarotCards?.minorArcana || {}).forEach(
      ([, suitCards]: [string, any]) => {
        Object.entries(suitCards || {}).forEach(([, card]: [string, any]) => {
          if (
            card.name.toLowerCase().includes(query) ||
            card.keywords?.some((kw: string) =>
              kw.toLowerCase().includes(query),
            )
          ) {
            results.push({
              type: 'tarot',
              title: `Tarot Card - ${card.name}`,
              section: 'tarot',
              href: `/grimoire/tarot/${stringToKebabCase(card.name)}`,
            });
          }
        });
      },
    );

    searchData.crystalDatabase?.forEach((crystal: any) => {
      if (
        crystal.name.toLowerCase().includes(query) ||
        crystal.chakras?.some((c: string) => c.toLowerCase().includes(query)) ||
        crystal.properties?.healing?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'crystal',
          title: `Crystal - ${crystal.name}`,
          section: 'crystals',
          href: `/grimoire/crystals/${crystal.id}`,
          match: crystal.properties?.healing?.slice(0, 80),
        });
      }
    });

    searchData.TAROT_SPREADS?.forEach((spread: any) => {
      if (
        spread.name.toLowerCase().includes(query) ||
        spread.description?.toLowerCase().includes(query) ||
        spread.category?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'spread',
          title: `Tarot Spread - ${spread.name}`,
          section: 'tarot',
          href: `/grimoire/tarot-spreads/${spread.slug}`,
          match: spread.description?.slice(0, 80),
        });
      }
    });

    Object.entries(searchData.monthlyMoonPhases || {}).forEach(
      ([key, phase]: [string, any]) => {
        if (
          key.toLowerCase().includes(query) ||
          phase.keywords?.some((kw: string) => kw.toLowerCase().includes(query))
        ) {
          results.push({
            type: 'moon',
            title: `Moon Phase - ${key}`,
            section: 'moon',
            href: `/grimoire/moon/phases/${stringToKebabCase(key)}`,
          });
        }
      },
    );

    Object.entries(searchData.annualFullMoons || {}).forEach(
      ([month, moon]: [string, any]) => {
        if (
          month.toLowerCase().includes(query) ||
          moon.name?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'moon',
            title: `Full Moon - ${moon.name || month}`,
            section: 'moon',
            href: `/grimoire/moon/full-moons/${month.toLowerCase()}`,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.colors || {}).forEach(
      ([color, data]: [string, any]) => {
        if (color.toLowerCase().includes(query)) {
          results.push({
            type: 'correspondence',
            title: `Color - ${color}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/colors/${color.toLowerCase()}`,
            match: data.meaning?.slice(0, 60),
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.elements || {}).forEach(
      ([element]: [string, any]) => {
        if (element.toLowerCase().includes(query)) {
          results.push({
            type: 'correspondence',
            title: `Element - ${element}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/elements/${element.toLowerCase()}`,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.herbs || {}).forEach(
      ([herb, data]: [string, any]) => {
        if (
          herb.toLowerCase().includes(query) ||
          data.magicalUses?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'correspondence',
            title: `Herb - ${herb}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/herbs/${herb.toLowerCase()}`,
            match: data.magicalUses?.slice(0, 60),
          });
        }
      },
    );

    Object.entries(searchData.angelNumbers || {}).forEach(
      ([number, data]: [string, any]) => {
        if (
          number.includes(query) ||
          data.meaning?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'numerology',
            title: `Angel Number ${number}`,
            section: 'numerology',
            href: `/grimoire/angel-numbers/${number}`,
            match: data.meaning?.slice(0, 60),
          });
        }
      },
    );

    Object.entries(searchData.lifePathNumbers || {}).forEach(
      ([number, data]: [string, any]) => {
        if (
          number.includes(query) ||
          data.title?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'numerology',
            title: `Life Path ${number} - ${data.title}`,
            section: 'numerology',
            href: `/grimoire/life-path/${number}`,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.days || {}).forEach(
      ([day, data]: [string, any]) => {
        if (
          day.toLowerCase().includes(query) ||
          data.planet?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'correspondence',
            title: `Day - ${day}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/days/${day.toLowerCase()}`,
            match: `Ruled by ${data.planet}`,
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.flowers || {}).forEach(
      ([flower, data]: [string, any]) => {
        if (
          flower.toLowerCase().includes(query) ||
          data.meaning?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'correspondence',
            title: `Flower - ${flower}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/flowers/${flower.toLowerCase()}`,
            match: data.meaning?.slice(0, 60),
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.animals || {}).forEach(
      ([animal, data]: [string, any]) => {
        if (
          animal.toLowerCase().includes(query) ||
          data.symbolism?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'correspondence',
            title: `Animal - ${animal}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/animals/${animal.toLowerCase()}`,
            match: data.symbolism?.slice(0, 60),
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.wood || {}).forEach(
      ([wood, data]: [string, any]) => {
        if (
          wood.toLowerCase().includes(query) ||
          data.magicalUses?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'correspondence',
            title: `Wood - ${wood}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/wood/${wood.toLowerCase()}`,
            match: data.magicalUses?.slice(0, 60),
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.numbers || {}).forEach(
      ([num, data]: [string, any]) => {
        if (
          num.includes(query) ||
          data.meaning?.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'correspondence',
            title: `Number ${num}`,
            section: 'correspondences',
            href: `/grimoire/correspondences/numbers/${num}`,
            match: data.meaning?.slice(0, 60),
          });
        }
      },
    );

    Object.entries(searchData.correspondencesData?.deities || {}).forEach(
      ([pantheon, gods]: [string, any]) => {
        Object.entries(gods || {}).forEach(([deity, data]: [string, any]) => {
          const domainArray = Array.isArray(data.domain) ? data.domain : [];
          const domainMatch = domainArray.some((d: string) =>
            d.toLowerCase().includes(query),
          );
          if (
            deity.toLowerCase().includes(query) ||
            pantheon.toLowerCase().includes(query) ||
            domainMatch
          ) {
            results.push({
              type: 'correspondence',
              title: `${deity} (${pantheon})`,
              section: 'correspondences',
              href: `/grimoire/correspondences/deities/${pantheon.toLowerCase()}/${deity.toLowerCase()}`,
              match: domainArray.join(', '),
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
      if (color.includes(query)) {
        results.push({
          type: 'candle',
          title: `Candle Magic - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
          section: 'candle-magic',
          href: `/grimoire/candle-magic/colors/${color}`,
        });
      }
    });

    for (let i = 1; i <= 9; i++) {
      if (String(i).includes(query)) {
        results.push({
          type: 'numerology',
          title: `Core Number ${i}`,
          section: 'numerology',
          href: `/grimoire/numerology/core-numbers/${i}`,
        });
      }
    }

    [11, 22, 33].forEach((num) => {
      if (String(num).includes(query)) {
        results.push({
          type: 'numerology',
          title: `Master Number ${num}`,
          section: 'numerology',
          href: `/grimoire/numerology/master-numbers/${num}`,
        });
      }
    });

    for (let i = 1; i <= 12; i++) {
      if (
        String(i).includes(query) ||
        `${i}st house`.includes(query) ||
        `${i}nd house`.includes(query) ||
        `${i}rd house`.includes(query) ||
        `${i}th house`.includes(query) ||
        'house'.includes(query)
      ) {
        const suffix = i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th';
        results.push({
          type: 'house',
          title: `${i}${suffix} House`,
          section: 'birth-chart',
          href: `/grimoire/birth-chart/houses/${i}`,
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
      if (witch.name.toLowerCase().includes(query)) {
        results.push({
          type: 'witch',
          title: witch.name,
          section: 'modern-witchcraft',
          href: `/grimoire/modern-witchcraft/witch-types/${witch.slug}`,
        });
      }
    });

    const tools = ['athame', 'wand', 'cauldron', 'chalice', 'pentacle'];
    tools.forEach((tool) => {
      if (tool.includes(query)) {
        results.push({
          type: 'tool',
          title: `Witchcraft Tool - ${tool.charAt(0).toUpperCase() + tool.slice(1)}`,
          section: 'modern-witchcraft',
          href: `/grimoire/modern-witchcraft/tools/${tool}`,
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
      if (med.name.toLowerCase().includes(query)) {
        results.push({
          type: 'meditation',
          title: med.name,
          section: 'meditation',
          href: `/grimoire/meditation/techniques/${med.slug}`,
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
      if (
        method.name.toLowerCase().includes(query) ||
        'scrying'.includes(query)
      ) {
        results.push({
          type: 'divination',
          title: method.name,
          section: 'divination',
          href: `/grimoire/divination/scrying/${method.slug}`,
        });
      }
    });

    if ('north node'.includes(query) || 'lunar node'.includes(query)) {
      results.push({
        type: 'astrology',
        title: 'North Node',
        section: 'lunar-nodes',
        href: '/grimoire/lunar-nodes/north-node',
      });
    }
    if ('south node'.includes(query) || 'lunar node'.includes(query)) {
      results.push({
        type: 'astrology',
        title: 'South Node',
        section: 'lunar-nodes',
        href: '/grimoire/lunar-nodes/south-node',
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
      if (
        planet.includes(query) ||
        'retrograde'.includes(query) ||
        `${planet} retrograde`.includes(query)
      ) {
        results.push({
          type: 'astrology',
          title: `${planet.charAt(0).toUpperCase() + planet.slice(1)} Retrograde`,
          section: 'retrogrades',
          href: `/grimoire/retrogrades/${planet}`,
        });
      }
    });

    return results.slice(0, 25);
  }, [searchQuery, searchData, aiMode]);

  return (
    <div className='p-4 md:p-5 lg:p-6 border-b border-zinc-700 relative search-container'>
      <div className='flex items-center gap-2 mb-3'>
        <button
          onClick={() => {
            setAiMode(false);
            setAiResponse('');
            setAiError(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            !aiMode
              ? 'bg-zinc-700 text-white'
              : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <Search className='w-3 h-3 inline mr-1.5' />
          Search
        </button>
        <button
          onClick={() => {
            setAiMode(true);
            setShowSearchResults(false);
          }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            aiMode
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <Sparkles className='w-3 h-3 inline mr-1.5' />
          Ask AI
        </button>
      </div>

      <div className='relative'>
        {aiMode ? (
          <Sparkles
            className='absolute left-3 md:left-4 top-3 w-4 h-4 md:w-5 md:h-5 text-purple-400'
            aria-hidden='true'
          />
        ) : (
          <Search
            className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-400'
            aria-hidden='true'
          />
        )}
        <input
          type='text'
          placeholder={
            aiMode
              ? 'Ask about astrology, tarot, crystals...'
              : searchDataLoading
                ? 'Loading search...'
                : 'Search grimoire...'
          }
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!aiMode) {
              setShowSearchResults(e.target.value.length > 0);
            }
          }}
          onFocus={() => {
            if (!aiMode && searchQuery.length > 0) setShowSearchResults(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label={
            aiMode ? 'Ask the grimoire AI' : 'Search grimoire content'
          }
          className={`w-full pl-10 md:pl-12 pr-12 py-2 md:py-2.5 bg-zinc-800 border rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent text-sm md:text-base ${
            aiMode
              ? 'border-purple-500/50 focus:ring-purple-500'
              : 'border-zinc-700 focus:ring-purple-500'
          }`}
        />
        {aiMode && (
          <button
            onClick={handleAskAI}
            disabled={aiLoading || !searchQuery.trim()}
            className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            aria-label='Send question'
          >
            {aiLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </button>
        )}
      </div>

      {/* AI Response */}
      {aiMode && (aiResponse || aiLoading || aiError) && showSearchResults && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-purple-500/30 rounded-md shadow-lg max-h-80 overflow-y-auto z-50'>
          <div className='p-4'>
            {aiLoading && !aiResponse && (
              <div className='flex items-center gap-2 text-purple-400'>
                <Loader2 className='w-4 h-4 animate-spin' />
                <span className='text-sm'>Consulting the grimoire...</span>
              </div>
            )}
            {aiError && <p className='text-red-400 text-sm'>{aiError}</p>}
            {aiResponse && (
              <div className='text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap'>
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyword Search Results */}
      {!aiMode &&
        showSearchResults &&
        searchDataLoading &&
        searchQuery.trim() && (
          <div className='absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-4 z-50'>
            <div className='flex items-center gap-2 text-zinc-400'>
              <div className='w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
              <span className='text-sm'>Loading search data...</span>
            </div>
          </div>
        )}

      {!aiMode &&
        showSearchResults &&
        !searchDataLoading &&
        searchResults.length > 0 && (
          <div className='absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-96 overflow-y-auto z-50'>
            <div className='p-2 md:p-3 space-y-1'>
              {searchResults.map((result, index) => (
                <Link
                  key={index}
                  href={result.href}
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery('');
                    onSidebarClose?.();
                    startTransition(() => {
                      onResultClick?.(result.section);
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
  );
}
