'use client';

import { grimoire, grimoireItems } from '@/constants/grimoire';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stringToKebabCase } from '../../../utils/string';
import { sectionToSlug, slugToSection } from '@/utils/grimoire';
import { useState, useEffect, useTransition, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Menu,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import { GrimoireSearch } from './GrimoireSearch';
import { captureEvent } from '@/lib/posthog-client';

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
      captureEvent('grimoire_viewed', {
        section: currentSection,
        section_title: grimoire[currentSection]?.title,
      });
      trackedSectionRef.current = currentSection;
    }
  }, [currentSection]);

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
            className='text-lg md:text-xl lg:text-2xl font-bold text-white hover:text-purple-400 transition-colors flex items-center gap-2'
          >
            <Sparkles className='w-5 h-5 md:w-6 md:h-6 text-purple-400' />
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

        {/* Search */}
        <GrimoireSearch
          onResultClick={handleSearchResultClick}
          onSidebarClose={() => setSidebarOpen(false)}
        />

        {/* Navigation */}
        <div className='flex-1 overflow-y-auto p-4 md:p-5 lg:p-6'>
          <div className='space-y-2'>
            {grimoireItems.map((itemKey: string) => {
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
                        aria-label={
                          isExpanded
                            ? `Collapse ${grimoire[itemKey].title}`
                            : `Expand ${grimoire[itemKey].title}`
                        }
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <ChevronDownIcon
                            size={16}
                            className='text-zinc-400'
                            aria-hidden='true'
                          />
                        ) : (
                          <ChevronRightIcon
                            size={16}
                            className='text-zinc-400'
                            aria-hidden='true'
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
                        {grimoire[itemKey].contents!.map((content: string) => {
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
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-y-auto min-w-0 p-4'>
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
          <div className='flex items-center justify-center min-h-full text-center p-4 md:py-12 lg:py-16'>
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
