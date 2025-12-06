'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Sparkles,
  X,
  ArrowRight,
  Zap,
  Brain,
} from 'lucide-react';
import {
  searchGrimoireIndex,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';

interface SemanticSearchResult {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
  relatedSlugs: string[];
  similarity: number;
}

interface AskTheGrimoireProps {
  variant?: 'inline' | 'modal' | 'hero';
  placeholder?: string;
  onSearch?: (query: string) => void;
  enableAI?: boolean; // Allow AI search to be enabled
}

const CATEGORY_ICONS: Record<GrimoireEntry['category'], string> = {
  zodiac: '♈',
  planet: '🪐',
  tarot: '🎴',
  crystal: '💎',
  ritual: '🌙',
  concept: '✨',
  horoscope: '🔮',
  'chinese-zodiac': '🐉',
  season: '☀️',
  numerology: '🔢',
  birthday: '🎂',
  compatibility: '💕',
};

const CATEGORY_COLORS: Record<GrimoireEntry['category'], string> = {
  zodiac: 'bg-purple-500/20 text-purple-300',
  planet: 'bg-amber-500/20 text-amber-300',
  tarot: 'bg-rose-500/20 text-rose-300',
  crystal: 'bg-cyan-500/20 text-cyan-300',
  ritual: 'bg-indigo-500/20 text-indigo-300',
  concept: 'bg-emerald-500/20 text-emerald-300',
  horoscope: 'bg-violet-500/20 text-violet-300',
  'chinese-zodiac': 'bg-red-500/20 text-red-300',
  season: 'bg-orange-500/20 text-orange-300',
  numerology: 'bg-blue-500/20 text-blue-300',
  birthday: 'bg-pink-500/20 text-pink-300',
  compatibility: 'bg-fuchsia-500/20 text-fuchsia-300',
};

export function AskTheGrimoire({
  variant = 'inline',
  placeholder = 'Ask the Grimoire anything...',
  onSearch,
  enableAI = true,
}: AskTheGrimoireProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GrimoireEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Semantic AI search function
  const performAISearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/grimoire/semantic-search?q=${encodeURIComponent(searchQuery)}&limit=8`,
      );
      if (response.ok) {
        const data: SemanticSearchResult[] = await response.json();
        // Convert semantic results to GrimoireEntry format
        const convertedResults: GrimoireEntry[] = data.map((r) => ({
          slug: r.slug,
          title: r.title,
          category: r.category as GrimoireEntry['category'],
          keywords: r.keywords,
          summary: r.summary,
          relatedSlugs: r.relatedSlugs,
        }));
        setResults(convertedResults);
        setIsOpen(true);
        setSelectedIndex(0);
      } else {
        // Fall back to keyword search on error
        const searchResults = searchGrimoireIndex(searchQuery, 8);
        setResults(searchResults);
        setIsOpen(true);
        setSelectedIndex(0);
      }
    } catch {
      // Fall back to keyword search on error
      const searchResults = searchGrimoireIndex(searchQuery, 8);
      setResults(searchResults);
      setIsOpen(true);
      setSelectedIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      onSearch?.(searchQuery);

      if (searchQuery.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      if (isAIMode && enableAI) {
        // Debounce AI search to avoid too many API calls
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        setIsLoading(true);
        debounceRef.current = setTimeout(() => {
          performAISearch(searchQuery);
        }, 300);
      } else {
        // Instant keyword search
        const searchResults = searchGrimoireIndex(searchQuery, 8);
        setResults(searchResults);
        setIsOpen(true);
        setSelectedIndex(0);
      }
    },
    [onSearch, isAIMode, enableAI, performAISearch],
  );

  // Re-search when AI mode changes
  useEffect(() => {
    if (query.trim().length > 1) {
      handleSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAIMode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            window.location.href = `/grimoire/${results[selectedIndex].slug}`;
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, results, selectedIndex],
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  const baseClasses =
    variant === 'hero'
      ? 'w-full max-w-2xl mx-auto'
      : variant === 'modal'
        ? 'w-full max-w-lg'
        : 'w-full max-w-md';

  return (
    <div className={`relative ${baseClasses}`}>
      {/* AI Mode Toggle */}
      {enableAI && (
        <div className='flex justify-end mb-2'>
          <button
            onClick={() => setIsAIMode(!isAIMode)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all duration-300
              ${
                isAIMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-700/60'
              }
            `}
            title={
              isAIMode ? 'AI semantic search enabled' : 'Quick keyword search'
            }
          >
            {isAIMode ? (
              <>
                <Brain className='h-3.5 w-3.5' />
                <span>AI Search</span>
              </>
            ) : (
              <>
                <Zap className='h-3.5 w-3.5' />
                <span>Quick Search</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
          {isLoading ? (
            <div className='h-5 w-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin' />
          ) : (
            <Search className='h-5 w-5 text-purple-400/60' />
          )}
        </div>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length > 1 && setIsOpen(true)}
          placeholder={
            isAIMode
              ? 'Ask anything about astrology, tarot, crystals...'
              : placeholder
          }
          className={`
            w-full pl-12 pr-12 py-4 
            bg-black/40 backdrop-blur-xl
            border ${isAIMode ? 'border-indigo-500/40' : 'border-purple-500/30'}
            rounded-2xl
            text-white placeholder:text-purple-300/50
            focus:outline-none focus:ring-2 ${isAIMode ? 'focus:ring-indigo-500/50 focus:border-indigo-400/50' : 'focus:ring-purple-500/50 focus:border-purple-400/50'}
            transition-all duration-300
            ${variant === 'hero' ? 'text-lg' : 'text-base'}
          `}
          aria-label='Search the Grimoire'
          aria-expanded={isOpen}
          aria-controls='grimoire-search-results'
          role='combobox'
          autoComplete='off'
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className='absolute inset-y-0 right-0 flex items-center pr-4 text-purple-400/60 hover:text-purple-300 transition-colors'
            aria-label='Clear search'
          >
            <X className='h-5 w-5' />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          id='grimoire-search-results'
          role='listbox'
          className='
            absolute top-full left-0 right-0 mt-2 
            bg-black/90 backdrop-blur-xl
            border border-purple-500/30 
            rounded-2xl
            shadow-2xl shadow-purple-500/10
            overflow-hidden
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          '
        >
          <div className='p-2 border-b border-purple-500/20'>
            <div className='flex items-center justify-between px-3 py-1.5 text-xs'>
              <div className='flex items-center gap-2 text-purple-400/70'>
                {isAIMode ? (
                  <Brain className='h-3 w-3 text-indigo-400' />
                ) : (
                  <Sparkles className='h-3 w-3' />
                )}
                <span>
                  Found {results.length} cosmic{' '}
                  {results.length === 1 ? 'insight' : 'insights'}
                </span>
              </div>
              {isAIMode && (
                <span className='text-indigo-400/70 flex items-center gap-1'>
                  <span className='h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse' />
                  AI Powered
                </span>
              )}
            </div>
          </div>

          <div className='max-h-[400px] overflow-y-auto'>
            {results.map((result, index) => (
              <Link
                key={result.slug}
                href={`/grimoire/${result.slug}`}
                data-index={index}
                role='option'
                aria-selected={index === selectedIndex}
                className={`
                  flex items-start gap-4 px-4 py-3
                  transition-colors duration-150
                  ${
                    index === selectedIndex
                      ? 'bg-purple-500/20'
                      : 'hover:bg-purple-500/10'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <span
                  className={`
                    flex items-center justify-center 
                    w-10 h-10 rounded-xl text-lg
                    ${CATEGORY_COLORS[result.category]}
                  `}
                >
                  {CATEGORY_ICONS[result.category]}
                </span>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-white truncate'>
                      {result.title}
                    </span>
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full capitalize
                        ${CATEGORY_COLORS[result.category]}
                      `}
                    >
                      {result.category}
                    </span>
                  </div>
                  <p className='text-sm text-purple-300/70 line-clamp-2 mt-0.5'>
                    {result.summary}
                  </p>
                </div>

                <ArrowRight className='h-4 w-4 text-purple-400/40 flex-shrink-0 mt-1' />
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className='p-3 border-t border-purple-500/20 bg-purple-500/5'>
            <Link
              href={`/grimoire/search?q=${encodeURIComponent(query)}`}
              className='
                flex items-center justify-center gap-2
                text-sm text-purple-300 hover:text-white
                transition-colors
              '
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className='h-4 w-4' />
              <span>View all results for &quot;{query}&quot;</span>
            </Link>
          </div>
        </div>
      )}

      {/* No Results State */}
      {isOpen && query.trim().length > 1 && results.length === 0 && (
        <div
          className='
            absolute top-full left-0 right-0 mt-2 
            bg-black/90 backdrop-blur-xl
            border border-purple-500/30 
            rounded-2xl
            p-6
            text-center
            z-50
          '
        >
          <Sparkles className='h-8 w-8 text-purple-400/50 mx-auto mb-3' />
          <p className='text-purple-300/70'>
            No cosmic insights found for &quot;{query}&quot;
          </p>
          <p className='text-sm text-purple-400/50 mt-1'>
            Try searching for a zodiac sign, planet, tarot card, or crystal
          </p>
        </div>
      )}
    </div>
  );
}

export default AskTheGrimoire;
