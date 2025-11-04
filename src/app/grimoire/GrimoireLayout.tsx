'use client';

import { grimoire, grimoireItems } from '@/constants/grimoire';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stringToKebabCase } from '../../../utils/string';
import { sectionToSlug, slugToSection } from '@/utils/grimoire';
import { useState, useEffect, useMemo, useTransition } from 'react';
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
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import {
  MonthlyMoonPhase,
  monthlyMoonPhases,
} from '../../../utils/moon/monthlyPhases';
import { zodiacSigns, planetaryBodies } from '../../../utils/zodiac/zodiac';
import Moon from './components/Moon';
import WheelOfTheYear from './components/WheelOfTheYear';
import Astronomy from './components/Astronomy';
import Correspondences from './components/Correspondences';
import Practices from './components/Practices';
import Tarot from './components/Tarot';
import Runes from './components/Runes';
import Chakras from './components/Chakras';
import { Numerology } from './components/Numerology';
import Crystals from './components/Crystals';
import BirthChart from './components/BirthChart';

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
    | 'planet';
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

    // Search runes
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
          href: `/grimoire/runes#${key}`,
          match: `Meaning: ${rune.meaning}`,
        });
      }
    });

    // Search tarot
    Object.entries(tarotSuits).forEach(([key, suit]) => {
      if (
        suit.name.toLowerCase().includes(query) ||
        suit.mysticalProperties.toLowerCase().includes(query) ||
        suit.qualities.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'tarot',
          title: `Tarot - ${suit.name}`,
          section: 'tarot',
          href: '/grimoire/tarot#arcana',
        });
      }
    });

    Object.entries(tarotSpreads).forEach(([key, spread]) => {
      if (
        spread.name.toLowerCase().includes(query) ||
        spread.description.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'tarot',
          title: `Tarot Spread - ${spread.name}`,
          section: 'tarot',
          href: '/grimoire/tarot#spreads',
        });
      }
    });

    // Search correspondences - Colors
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
          href: '/grimoire/correspondences#colors',
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Elements
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
          href: '/grimoire/correspondences#elements',
          match: `Direction: ${data.directions}`,
        });
      }
    });

    // Search correspondences - Days
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
          href: '/grimoire/correspondences#days',
          match: `Planet: ${data.planet}, Element: ${data.element}`,
        });
      }
    });

    // Search correspondences - Herbs
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
          href: '/grimoire/correspondences#herbs',
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Numbers
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
          href: '/grimoire/correspondences#numbers',
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Deities
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
            href: '/grimoire/correspondences#deities',
            match: `Domain: ${data.domain.join(', ')}`,
          });
        }
      });
    });

    // Search correspondences - Flowers
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
          href: '/grimoire/correspondences#flowers',
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Wood
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
          href: '/grimoire/correspondences#wood',
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search correspondences - Animals
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
          href: '/grimoire/correspondences#animals',
          match: `Uses: ${data.uses.join(', ')}`,
        });
      }
    });

    // Search chakras
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
          href: '/grimoire/chakras',
          match: `Color: ${chakra.color}, Properties: ${chakra.properties}`,
        });
      }
    });

    // Search moon phases
    Object.entries(monthlyMoonPhases).forEach(([phase, data]) => {
      if (
        phase.toLowerCase().includes(query) ||
        (data as any).information?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'moon',
          title: `Moon Phase - ${phase}`,
          section: 'moon',
          href: '/grimoire/moon#phases',
        });
      }
    });

    // Search full moon names
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
          href: '/grimoire/moon#full-moon-names',
          match: `${month} - ${moon.description.slice(0, 60)}...`,
        });
      }
    });

    // Search zodiac signs
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
          href: '/grimoire/astronomy#zodiac',
        });
      }
    });

    // Search planets
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
          href: '/grimoire/astronomy#planets',
        });
      }
    });

    // Search crystals (from crystal categories)
    const crystalCategories = [
      {
        name: 'Protection & Grounding',
        crystals: [
          'Black Tourmaline',
          'Obsidian',
          'Hematite',
          'Smoky Quartz',
          'Shungite',
          'Red Jasper',
          'Garnet',
          'Onyx',
          'Apache Tear',
          'Fire Agate',
          'Jet',
          'Bloodstone',
        ],
      },
      {
        name: 'Love & Heart Healing',
        crystals: [
          'Rose Quartz',
          'Green Aventurine',
          'Rhodonite',
          'Morganite',
          'Pink Tourmaline',
          'Emerald',
          'Prehnite',
          'Kunzite',
          'Green Calcite',
          'Chrysoprase',
          'Unakite',
          'Amazonite',
        ],
      },
      {
        name: 'Spiritual & Intuitive',
        crystals: [
          'Amethyst',
          'Labradorite',
          'Moonstone',
          'Celestite',
          'Selenite',
          'Lapis Lazuli',
          'Iolite',
          'Kyanite',
          'Fluorite',
          'Moldavite',
          'Angelite',
          'Azurite',
          'Charoite',
        ],
      },
    ];
    crystalCategories.forEach((category) => {
      category.crystals.forEach((crystal) => {
        if (
          crystal.toLowerCase().includes(query) ||
          category.name.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'crystal',
            title: `Crystal - ${crystal}`,
            section: 'crystals',
            href: '/grimoire/crystals#crystal-categories',
            match: `Category: ${category.name}`,
          });
        }
      });
    });

    return results.slice(0, 15); // Increased limit to 15 results
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
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0
          h-full z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-700
          transition-transform duration-300 ease-in-out
          flex flex-col
          lg:flex
        `}
      >
        {/* Header */}
        <div className='p-4 border-b border-zinc-700 flex items-center justify-between'>
          <Link
            href='/grimoire'
            onClick={() => setSidebarOpen(false)}
            className='text-lg font-bold text-white hover:text-purple-400 transition-colors flex items-center gap-2'
          >
            <Sparkles className='w-5 h-5 text-purple-400' />
            Grimoire
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className='lg:hidden p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white'
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className='p-4 border-b border-zinc-700 relative'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400' />
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
              className='w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className='absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-96 overflow-y-auto z-50'>
              <div className='p-2 space-y-1'>
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
                    className='block p-2 rounded hover:bg-zinc-800 transition-colors'
                  >
                    <div className='flex items-start gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-zinc-100 truncate'>
                          {result.title}
                        </div>
                        {result.match && (
                          <div className='text-xs text-zinc-400 mt-1 truncate'>
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
        <div className='flex-1 overflow-y-auto p-4'>
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
                        className={`flex-1 py-2 px-2 text-sm font-medium hover:text-purple-400 transition-colors block ${
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
                        <div className='ml-6 mt-1 space-y-1'>
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
                                  className='block py-1.5 px-2 text-xs text-zinc-300 hover:text-purple-300 hover:bg-zinc-800 rounded transition-colors'
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
          className='lg:hidden fixed top-4 left-4 z-30 p-2 bg-zinc-900 border border-zinc-700 rounded-md text-white hover:bg-zinc-800 transition-colors'
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
          <div className='p-4 md:p-6 lg:p-8 min-h-full'>
            {GrimoireContent[currentSection as keyof typeof GrimoireContent]}
          </div>
        ) : (
          <div className='flex items-center justify-center min-h-full text-center px-4 py-8'>
            <div className='max-w-2xl w-full'>
              <div className='mb-6'>
                <Sparkles className='w-16 h-16 text-purple-400 mx-auto mb-4' />
                <h1 className='text-3xl md:text-4xl font-light text-zinc-100 mb-3'>
                  Welcome to the Grimoire
                </h1>
                <p className='text-base md:text-lg text-zinc-400 leading-relaxed'>
                  Explore mystical knowledge, cosmic wisdom, and ancient
                  practices to deepen your spiritual journey.
                </p>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8'>
                {grimoireItems.map((itemKey) => {
                  const item = grimoire[itemKey];
                  const slug = sectionToSlug(itemKey);
                  return (
                    <Link
                      key={itemKey}
                      href={`/grimoire/${slug}`}
                      prefetch={true}
                      className='group rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all'
                    >
                      <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
                        {item.title}
                      </h3>
                      {item.contents && (
                        <p className='text-sm text-zinc-400'>
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
