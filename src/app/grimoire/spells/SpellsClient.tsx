'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Beaker,
  Clock,
  Filter,
  Flame,
  Gem,
  Leaf,
  Moon,
  Shield,
  Sparkles,
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';

interface Spell {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  type: string;
  difficulty: string;
  duration: string;
  description: string;
  purpose: string;
  timing?: {
    moonPhase?: string[];
    planetaryDay?: string[];
  };
  correspondences?: {
    elements?: string[];
    planets?: string[];
  };
}

interface SpellsClientProps {
  spells: Spell[]; // already filtered + paginated server-side
  totalCount: number; // total results count (after filters)
  currentPage: number;
  totalPages: number;
  pageSize: number;
  basePath?: string; // default: /grimoire/spells
  categories: Record<
    string,
    { name: string; description: string; icon: string }
  >;
  categoryCounts: Record<string, number>; // global counts across ALL results (after filters)

  // initial values (from server searchParams)
  initialQuery?: string;
  initialCategory?: string;
  initialDifficulty?: string;
}

const DEFAULT_CURRENT_MOON_PHASE = 'Waning Crescent';

const difficultyColors: Record<string, string> = {
  beginner: 'text-emerald-400 bg-emerald-900/30',
  intermediate: 'text-amber-400 bg-amber-900/30',
  advanced: 'text-orange-400 bg-orange-900/30',
  master: 'text-red-400 bg-red-900/30',
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  spell: Sparkles,
  ritual: Moon,
  charm: Shield,
  candle_magic: Flame,
  herb_magic: Leaf,
  crystal_magic: Gem,
  sigil_magic: Zap,
  potion: Beaker,
};

function MoonBanner({ phase }: { phase: string }) {
  return (
    <div className='rounded-xl border border-lunary-primary-700/40 bg-lunary-primary-900/20 p-4 text-sm'>
      <div className='flex items-center gap-2 text-lunary-primary-200'>
        <Moon className='h-4 w-4' />
        <span className='font-medium'>Current Moon Phase: {phase}</span>
      </div>
      <p className='mt-1 text-zinc-300'>
        Certain spells work best during specific moon phases. Look for moon
        phase indicators on each spell.
      </p>
    </div>
  );
}

function getPageHref(basePath: string, page: number, qs?: string) {
  const path = page <= 1 ? basePath : `${basePath}/page/${page}`;
  return qs && qs.length ? `${path}?${qs}` : path;
}

function getPageNumbers(current: number, total: number, max = 7) {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | 'ellipsis'> = [];
  const showLeft = Math.max(2, current - 1);
  const showRight = Math.min(total - 1, current + 1);

  pages.push(1);
  if (showLeft > 2) pages.push('ellipsis');
  for (let p = showLeft; p <= showRight; p++) pages.push(p);
  if (showRight < total - 1) pages.push('ellipsis');
  pages.push(total);

  return pages;
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function SpellsClient({
  spells,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  basePath = '/grimoire/spells',
  categories,
  categoryCounts,
  initialQuery = '',
  initialCategory = 'all',
  initialDifficulty = 'all',
}: SpellsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const safeSpells = useMemo(
    () => (Array.isArray(spells) ? spells : []),
    [spells],
  );
  const safeCategories = useMemo(() => categories ?? {}, [categories]);
  const safeCategoryCounts = useMemo(
    () => categoryCounts ?? { all: totalCount },
    [categoryCounts, totalCount],
  );

  // controlled UI state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState(initialDifficulty);
  const [showFilters, setShowFilters] = useState(false);

  // keep UI in sync with server-provided initial values (when navigating between pages/filters)
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSelectedDifficulty(initialDifficulty);
  }, [initialDifficulty]);

  // debounce ONLY the text search, so typing does not cause reroute per keystroke
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Build query string based on current filter state.
  // Important: when filters change, always navigate to the basePath (page 1) with the qs.
  const buildQueryString = (opts: {
    q: string;
    category: string;
    difficulty: string;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    const q = (opts.q || '').trim();
    if (q) params.set('q', q);
    else params.delete('q');

    if (opts.category && opts.category !== 'all')
      params.set('category', opts.category);
    else params.delete('category');

    if (opts.difficulty && opts.difficulty !== 'all')
      params.set('difficulty', opts.difficulty);
    else params.delete('difficulty');

    return params.toString();
  };

  // Push debounced query changes into the URL without stealing focus.
  // Use replace + scroll:false to avoid jumpy behaviour.
  useEffect(() => {
    const qs = buildQueryString({
      q: debouncedQuery,
      category: selectedCategory,
      difficulty: selectedDifficulty,
    });

    // If we are already on /page/x, we want to reset to basePath when filters change.
    // We do not try to be clever with pathname, we always target basePath.
    const nextUrl = qs ? `${basePath}?${qs}` : basePath;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedCategory, selectedDifficulty]);

  // counts + categories
  const activeCategories = useMemo(() => {
    return Object.entries(safeCategories).filter(
      ([key]) => (safeCategoryCounts[key] || 0) > 0,
    );
  }, [safeCategories, safeCategoryCounts]);

  const hasActiveFilters =
    (searchQuery?.trim()?.length ?? 0) > 0 ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    startTransition(() => {
      router.replace(basePath, { scroll: false });
    });
  };

  // Preserve qs for pagination links (use debouncedQuery so it matches what the server sees)
  const preservedQs = useMemo(() => {
    return buildQueryString({
      q: debouncedQuery,
      category: selectedCategory,
      difficulty: selectedDifficulty,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedQuery,
    selectedCategory,
    selectedDifficulty,
    searchParams,
    pathname,
  ]);

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages, 7),
    [currentPage, totalPages],
  );

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className='space-y-8'>
      <MoonBanner phase={DEFAULT_CURRENT_MOON_PHASE} />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder='Search spells by name, purpose, or category...'
        // server-driven results count; avoid showing a misleading number while typing
        resultCount={undefined}
        resultLabel='spell'
        maxWidth='max-w-xl'
        className='mb-2'
      />

      <div className='flex items-center justify-between'>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all'
        >
          <Filter className='w-4 h-4' />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className='w-2 h-2 bg-lunary-primary rounded-full' />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='flex items-center gap-1 text-sm text-white/50 hover:text-white transition-all'
          >
            <X className='w-3 h-3' />
            Clear filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className='bg-white/5 rounded-xl p-6 space-y-6 border border-white/10'>
          <div>
            <h3 className='text-sm font-medium text-white/70 mb-3'>Category</h3>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-lunary-primary text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                All ({safeCategoryCounts.all ?? totalCount})
              </button>

              {activeCategories.map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                    selectedCategory === key
                      ? 'bg-lunary-primary text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className='text-xs opacity-60'>
                    ({safeCategoryCounts[key] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-white/70 mb-3'>
              Difficulty
            </h3>
            <div className='flex flex-wrap gap-2'>
              {['all', 'beginner', 'intermediate', 'advanced', 'master'].map(
                (diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-lunary-primary text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {diff === 'all' ? 'All Levels' : diff}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {safeSpells.length > 0 ? (
        <div className='grid gap-4'>
          {safeSpells.map((spell) => {
            const TypeIcon = typeIcons[spell.type] ?? Sparkles;

            return (
              <Link
                key={spell.id}
                href={`/grimoire/spells/${spell.id}`}
                className='group block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <div className='flex items-start justify-between gap-4 mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <TypeIcon className='h-4 w-4 text-lunary-primary-300' />
                      <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                        {spell.title}
                      </h3>
                    </div>
                    <p className='text-sm text-zinc-400 line-clamp-2'>
                      {spell.purpose}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                      difficultyColors[spell.difficulty] ||
                      'text-zinc-300 bg-zinc-800'
                    }`}
                  >
                    {spell.difficulty}
                  </span>
                </div>

                <div className='flex flex-wrap items-center gap-3 text-xs text-zinc-500'>
                  <span className='flex items-center gap-1'>
                    <Clock className='w-3 h-3' />
                    {spell.duration}
                  </span>

                  <span className='px-2 py-0.5 bg-zinc-800 rounded'>
                    {safeCategories[spell.category]?.name ||
                      spell.category.replace(/-/g, ' ')}
                  </span>

                  {spell.timing?.moonPhase?.length ? (
                    <div className='flex flex-wrap gap-1'>
                      {spell.timing.moonPhase.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className='px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-300'
                        >
                          {p}
                        </span>
                      ))}
                      {spell.timing.moonPhase.length > 3 && (
                        <span className='px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400'>
                          +{spell.timing.moonPhase.length - 3}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className='text-center py-16'>
          <p className='text-white/50 text-lg mb-4'>
            No spells found matching your criteria.
          </p>
          <button
            onClick={clearFilters}
            className='text-lunary-primary hover:text-lunary-primary-light transition-colors'
          >
            Clear all filters
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className='flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/5'
          aria-label='Spells pagination'
        >
          {currentPage > 1 ? (
            <Link
              href={getPageHref(basePath, currentPage - 1, preservedQs)}
              rel='prev'
              className='px-3 py-2 rounded-lg text-sm flex items-center gap-1 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all'
              aria-label='Go to previous page'
            >
              <ChevronLeft className='h-4 w-4' />
              Previous
            </Link>
          ) : (
            <span className='px-3 py-2 rounded-lg text-sm flex items-center gap-1 bg-white/5 text-white/50 opacity-40 cursor-not-allowed'>
              <ChevronLeft className='h-4 w-4' />
              Previous
            </span>
          )}

          <div className='flex items-center gap-1'>
            {pageNumbers.map((page, idx) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className='w-8 h-8 flex items-center justify-center text-zinc-500'
                >
                  …
                </span>
              ) : (
                <Link
                  key={page}
                  href={getPageHref(basePath, page, preservedQs)}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                    page === currentPage
                      ? 'bg-lunary-primary-900 text-lunary-primary-300 border border-lunary-primary-700'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  }`}
                >
                  {page}
                </Link>
              ),
            )}
          </div>

          {currentPage < totalPages ? (
            <Link
              href={getPageHref(basePath, currentPage + 1, preservedQs)}
              rel='next'
              className='px-3 py-2 rounded-lg text-sm flex items-center gap-1 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all'
              aria-label='Go to next page'
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Link>
          ) : (
            <span className='px-3 py-2 rounded-lg text-sm flex items-center gap-1 bg-white/5 text-white/50 opacity-40 cursor-not-allowed'>
              Next
              <ChevronRight className='h-4 w-4' />
            </span>
          )}
        </nav>
      )}

      <div className='text-center text-sm text-white/40 pt-6'>
        Showing {startIndex}–{endIndex} of {totalCount} spells
      </div>
    </div>
  );
}

export default SpellsClient;
