'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, Sparkles, Filter, X } from 'lucide-react';
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
  spells: Spell[];
  categories: Record<
    string,
    { name: string; description: string; icon: string }
  >;
}

const difficultyColors: Record<string, string> = {
  beginner: 'text-emerald-400 bg-emerald-900/30',
  intermediate: 'text-amber-400 bg-amber-900/30',
  advanced: 'text-orange-400 bg-orange-900/30',
  master: 'text-red-400 bg-red-900/30',
};

const typeIcons: Record<string, string> = {
  spell: '✨',
  ritual: '🌙',
  charm: '🔮',
  candle_magic: '🕯️',
  herb_magic: '🌿',
  crystal_magic: '💎',
  sigil_magic: '⚡',
  potion: '🧪',
};

export function SpellsClient({ spells, categories }: SpellsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredSpells = useMemo(() => {
    let filtered = spells;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (spell) =>
          spell.title.toLowerCase().includes(query) ||
          spell.description.toLowerCase().includes(query) ||
          spell.purpose.toLowerCase().includes(query) ||
          spell.category.toLowerCase().includes(query) ||
          (spell.subcategory &&
            spell.subcategory.toLowerCase().includes(query)),
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (spell) =>
          spell.category === selectedCategory ||
          spell.subcategory === selectedCategory,
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(
        (spell) => spell.difficulty === selectedDifficulty,
      );
    }

    return filtered;
  }, [spells, searchQuery, selectedCategory, selectedDifficulty]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: spells.length };
    spells.forEach((spell) => {
      counts[spell.category] = (counts[spell.category] || 0) + 1;
      if (spell.subcategory) {
        counts[spell.subcategory] = (counts[spell.subcategory] || 0) + 1;
      }
    });
    return counts;
  }, [spells]);

  const activeCategories = Object.entries(categories).filter(
    ([key]) => categoryCounts[key] > 0,
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all';

  return (
    <div className='space-y-8'>
      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder='Search spells by name, purpose, or category...'
        resultCount={searchQuery ? filteredSpells.length : undefined}
        resultLabel='spell'
        maxWidth='max-w-xl'
        className='mb-6'
      />

      {/* Filter Toggle */}
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

      {/* Filters Panel */}
      {showFilters && (
        <div className='bg-white/5 rounded-xl p-6 space-y-6 border border-white/10'>
          {/* Category Filter */}
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
                All ({categoryCounts.all})
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
                    ({categoryCounts[key] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <h3 className='text-sm font-medium text-white/70 mb-3'>
              Difficulty
            </h3>
            <div className='flex flex-wrap gap-2'>
              {['all', 'beginner', 'intermediate', 'advanced'].map((diff) => (
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredSpells.length > 0 ? (
        <div className='grid gap-4'>
          {filteredSpells.map((spell) => (
            <Link
              key={spell.id}
              href={`/grimoire/spells/${spell.id}`}
              className='group block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
            >
              <div className='flex items-start justify-between gap-4 mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-lg'>
                      {typeIcons[spell.type] || '✨'}
                    </span>
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
                    difficultyColors[spell.difficulty]
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
                  {categories[spell.category]?.name ||
                    spell.category.replace(/-/g, ' ')}
                </span>
                {spell.timing?.moonPhase &&
                  spell.timing.moonPhase.length > 0 && (
                    <span className='flex items-center gap-1'>
                      <Sparkles className='w-3 h-3' />
                      {spell.timing.moonPhase[0]}
                    </span>
                  )}
              </div>
            </Link>
          ))}
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

      {/* Stats */}
      <div className='text-center text-sm text-white/40 pt-8 border-t border-white/5'>
        Showing {filteredSpells.length} of {spells.length} spells and rituals
      </div>
    </div>
  );
}

export default SpellsClient;
