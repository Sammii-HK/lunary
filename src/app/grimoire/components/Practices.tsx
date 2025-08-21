'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  spells,
  spellCategories,
  getSpellsByCategory,
  Spell,
} from '@/constants/spells';
import { getMoonPhase } from '../../../../utils/moon/moonPhases';
import {
  Clock,
  Star,
  Moon,
  Leaf,
  Shield,
  Heart,
  DollarSign,
  Cross,
  Sparkles,
  Eye,
  Zap,
  X,
} from 'lucide-react';

const Practices = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentMoonPhase = getMoonPhase(new Date());

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      protection: <Shield className='w-4 h-4' />,
      love: <Heart className='w-4 h-4' />,
      prosperity: <DollarSign className='w-4 h-4' />,
      healing: <Cross className='w-4 h-4' />,
      cleansing: <Sparkles className='w-4 h-4' />,
      divination: <Eye className='w-4 h-4' />,
      manifestation: <Star className='w-4 h-4' />,
      banishing: <X className='w-4 h-4' />,
    };
    return iconMap[category] || <Leaf className='w-4 h-4' />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      beginner: 'text-green-400 bg-green-900/30',
      intermediate: 'text-yellow-400 bg-yellow-900/30',
      advanced: 'text-red-400 bg-red-900/30',
    };
    return colorMap[difficulty] || 'text-zinc-400 bg-zinc-800';
  };

  const filteredSpells = selectedCategory
    ? getSpellsByCategory(selectedCategory)
    : spells.filter(
        (spell) =>
          spell.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spell.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spell.purpose.toLowerCase().includes(searchTerm.toLowerCase()),
      );

  return (
    <div className='h-[91vh] overflow-y-auto space-y-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='mb-2'>
          <h1 className='text-3xl font-bold'>Spells & Rituals</h1>
        </div>
        <p className='text-zinc-300 text-lg mb-4'>
          A comprehensive collection of magical practices, rituals, and spells
          organized by purpose and moon phase.
        </p>

        <div className='bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-lg p-4 border border-indigo-700/30 mb-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Moon className='w-5 h-5 text-indigo-300' />
            <h3 className='font-semibold text-indigo-300'>
              Current Moon Phase: {currentMoonPhase}
            </h3>
          </div>
          <p className='text-indigo-200 text-sm'>
            Certain spells work best during specific moon phases. Look for the
            moon phase indicators on each spell.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='space-y-4'>
        <div>
          <input
            type='text'
            placeholder='Search spells and rituals...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-purple-500'
          />
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            All Categories ({spells.length})
          </button>

          {Object.entries(spellCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedCategory === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {category.name} ({getSpellsByCategory(key).length})
            </button>
          ))}
        </div>
      </div>

      {/* Category Description */}
      {selectedCategory && (
        <div className='bg-zinc-800 rounded-lg p-4 border border-zinc-700'>
          <div className='mb-2'>
            <h2 className='text-xl font-semibold text-purple-400'>
              {
                spellCategories[
                  selectedCategory as keyof typeof spellCategories
                ].name
              }
            </h2>
          </div>
          <p className='text-zinc-300'>
            {
              spellCategories[selectedCategory as keyof typeof spellCategories]
                .description
            }
          </p>
        </div>
      )}

      {/* Spells Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredSpells.map((spell: Spell) => (
          <Link
            key={spell.id}
            href={`/grimoire/spells/${spell.id}`}
            className='bg-zinc-800 hover:bg-zinc-750 rounded-lg p-4 border border-zinc-700 hover:border-purple-500/50 transition-all duration-300 group'
          >
            <div className='space-y-3'>
              {/* Header */}
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  {getCategoryIcon(spell.category)}
                  <h3 className='font-medium text-purple-300 group-hover:text-purple-200 transition-colors truncate'>
                    {spell.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(spell.difficulty)}`}
                >
                  {spell.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className='text-zinc-400 text-sm line-clamp-2'>
                {spell.purpose}
              </p>

              {/* Meta Info */}
              <div className='space-y-2'>
                <div className='flex items-center gap-4 text-xs text-zinc-500'>
                  <div className='flex items-center gap-1'>
                    <Clock className='w-3 h-3' />
                    {spell.duration}
                  </div>
                  <div className='capitalize'>
                    {spell.type.replace('_', ' ')}
                  </div>
                </div>

                {/* Timing Info */}
                <div className='flex flex-wrap gap-1'>
                  {spell.timing.moonPhase && (
                    <div className='flex items-center gap-1'>
                      <Moon className='w-3 h-3 text-indigo-400' />
                      <div className='flex gap-1'>
                        {spell.timing.moonPhase
                          .slice(0, 2)
                          .map((phase, index) => (
                            <span
                              key={index}
                              className={`text-xs px-1 py-0.5 rounded ${
                                phase === currentMoonPhase
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-900/40 text-indigo-300'
                              }`}
                            >
                              {phase.split(' ')[0]}
                            </span>
                          ))}
                        {spell.timing.moonPhase.length > 2 && (
                          <span className='text-xs text-indigo-400'>
                            +{spell.timing.moonPhase.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ingredients Preview */}
                <div className='text-xs text-zinc-500'>
                  <span className='font-medium'>Key ingredients: </span>
                  {spell.ingredients
                    .slice(0, 2)
                    .map((ingredient) => ingredient.name)
                    .join(', ')}
                  {spell.ingredients.length > 2 &&
                    ` +${spell.ingredients.length - 2} more`}
                </div>
              </div>

              {/* View Spell Link */}
              <div className='pt-2 border-t border-zinc-700'>
                <div className='text-purple-400 group-hover:text-purple-300 text-sm font-medium flex items-center gap-1'>
                  View Full Spell →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredSpells.length === 0 && (
        <div className='text-center py-12'>
          <h3 className='text-xl font-medium text-zinc-400 mb-2'>
            No spells found
          </h3>
          <p className='text-zinc-500'>
            {searchTerm
              ? `No spells match "${searchTerm}". Try a different search term.`
              : 'No spells in this category yet. Check back soon for more magical practices!'}
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30 mt-8'>
        <h3 className='text-white font-medium mb-2'>
          About These Spells & Rituals
        </h3>
        <p className='text-zinc-300 text-sm mb-3'>
          Each spell and ritual has been thoroughly researched and includes
          historical context, proper timing, safety considerations, and
          variations. All practices are based on traditional magical systems and
          folklore.
        </p>
        <p className='text-zinc-400 text-xs'>
          Always practice magic responsibly and with respect for all beings.
          These are for educational and spiritual purposes. Use your intuition
          and adapt practices to your personal beliefs.
        </p>
      </div>
    </div>
  );
};

export default Practices;
