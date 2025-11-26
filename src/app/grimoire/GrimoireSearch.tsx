'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
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
} | null;

interface SearchResult {
  type: string;
  title: string;
  section?: string;
  href: string;
  match?: string;
}

interface GrimoireSearchProps {
  onResultClick?: (section?: string) => void;
  onSidebarClose?: () => void;
}

export function GrimoireSearch({
  onResultClick,
  onSidebarClose,
}: GrimoireSearchProps) {
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchData, setSearchData] = useState<SearchDataType>(null);
  const [searchDataLoading, setSearchDataLoading] = useState(false);

  const loadSearchData = useCallback(async () => {
    if (searchData || searchDataLoading) return;
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
      });
    } catch (error) {
      console.error('Failed to load search data:', error);
    } finally {
      setSearchDataLoading(false);
    }
  }, [searchData, searchDataLoading]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !searchData) return [];

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

    Object.entries(searchData.runesList).forEach(
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

    Object.entries(searchData.tarotCards.majorArcana).forEach(
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

    Object.entries(searchData.chakras).forEach(
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

    Object.entries(searchData.zodiacSigns).forEach(
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

    Object.entries(searchData.planetaryBodies).forEach(
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

    searchData.wheelOfTheYearSabbats.forEach((sabbat: any) => {
      if (sabbat.name.toLowerCase().includes(query)) {
        results.push({
          type: 'sabbat',
          title: `Sabbat - ${sabbat.name}`,
          section: 'wheel-of-the-year',
          href: `/grimoire/sabbats/${stringToKebabCase(sabbat.name)}`,
        });
      }
    });

    return results.slice(0, 15);
  }, [searchQuery, searchData]);

  return (
    <div className='p-4 md:p-5 lg:p-6 border-b border-zinc-700 relative search-container'>
      <div className='relative'>
        <Search
          className='absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-400'
          aria-hidden='true'
        />
        <input
          type='text'
          placeholder={
            searchDataLoading ? 'Loading search...' : 'Search grimoire...'
          }
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(e.target.value.length > 0);
          }}
          onFocus={() => {
            loadSearchData();
            if (searchQuery.length > 0) setShowSearchResults(true);
          }}
          aria-label='Search grimoire content'
          className='w-full pl-10 md:pl-12 pr-4 py-2 md:py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base'
        />
      </div>

      {showSearchResults && searchDataLoading && searchQuery.trim() && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-4 z-50'>
          <div className='flex items-center gap-2 text-zinc-400'>
            <div className='w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
            <span className='text-sm'>Loading search data...</span>
          </div>
        </div>
      )}

      {showSearchResults && !searchDataLoading && searchResults.length > 0 && (
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
