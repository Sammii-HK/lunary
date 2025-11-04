'use client';

import { grimoire, grimoireItems } from '@/constants/grimoire';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { stringToKebabCase } from '../../../utils/string';
import { sectionToSlug, slugToSection } from '@/utils/grimoire';
import { scrollToTop } from '../../../utils/scroll';
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
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

export default function GrimoireLayout({
  currentSectionSlug,
}: {
  currentSectionSlug?: string;
}) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentSection = currentSectionSlug
    ? slugToSection(currentSectionSlug)
    : undefined;

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className='flex flex-row h-[93dvh] overflow-hidden'>
      {/* Sidebar */}
      <div
        className={`
          ${sidebarCollapsed ? 'w-12' : 'w-64'}
          flex-shrink-0 bg-zinc-900 border-r border-zinc-700
          transition-all duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Header */}
        <div className='p-4 border-b border-zinc-700 flex items-center justify-between'>
          {!sidebarCollapsed && (
            <div
              onClick={() => router.push('/grimoire')}
              className='cursor-pointer text-lg font-bold text-white hover:text-purple-400 transition-colors'
            >
              Grimoire
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className='p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white'
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRightIcon
              size={16}
              className={`transform transition-transform duration-300 ${
                sidebarCollapsed ? 'rotate-0' : 'rotate-180'
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        {!sidebarCollapsed && (
          <div className='flex-1 overflow-y-auto p-4'>
            <div className='space-y-2'>
              {grimoireItems.map((itemKey: string) => {
                const isExpanded = expandedSections.has(itemKey);
                const hasContents =
                  grimoire[itemKey].contents &&
                  grimoire[itemKey].contents!.length > 0;
                const isActive = currentSection === itemKey;

                return (
                  <div key={itemKey} className='w-full'>
                    {/* Main header - clickable to toggle section */}
                    <div
                      className={`flex items-center cursor-pointer hover:bg-zinc-800 rounded transition-colors ${
                        isActive ? 'bg-zinc-800' : ''
                      }`}
                      onClick={() => {
                        // Navigate to static route
                        const slug = sectionToSlug(itemKey);
                        router.push(`/grimoire/${slug}`);
                        scrollToTop();

                        if (hasContents) {
                          // Toggle section expansion for items with sub-content
                          toggleSection(itemKey);
                        } else {
                          // For items without sub-content, collapse sidebar
                          setSidebarCollapsed(true);
                        }
                      }}
                    >
                      {hasContents ? (
                        <div className='p-1 mr-1'>
                          {isExpanded ? (
                            <ChevronDownIcon
                              size={14}
                              className='text-zinc-400'
                            />
                          ) : (
                            <ChevronRightIcon
                              size={14}
                              className='text-zinc-400'
                            />
                          )}
                        </div>
                      ) : (
                        <div className='w-6' />
                      )}

                      <div
                        className={`flex-1 py-2 px-2 text-sm font-medium hover:text-purple-400 transition-colors ${
                          isActive ? 'text-purple-400' : 'text-white'
                        }`}
                      >
                        {grimoire[itemKey].title}
                      </div>
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
                                  onClick={() => {
                                    scrollToTop();
                                    // Collapse the section when an item is clicked
                                    setExpandedSections((prev) => {
                                      const newSet = new Set(prev);
                                      newSet.delete(itemKey);
                                      return newSet;
                                    });
                                    // Also collapse the entire sidebar
                                    setSidebarCollapsed(true);
                                  }}
                                  className='block py-1 px-2 text-xs text-zinc-300 hover:text-purple-300 hover:bg-zinc-800 rounded transition-colors'
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
        )}
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-y-auto'>
        {currentSection ? (
          <div className='p-6'>
            {GrimoireContent[currentSection as keyof typeof GrimoireContent]}
          </div>
        ) : (
          <div className='flex items-center justify-center h-full text-center'>
            <div className='max-w-md'>
              <h2 className='text-2xl font-bold text-white mb-4'>
                Welcome to the Grimoire
              </h2>
              <p className='text-zinc-400 mb-6'>
                Select a topic from the sidebar to explore mystical knowledge
                and cosmic wisdom.
              </p>
              <div className='text-4xl'>📚✨</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
