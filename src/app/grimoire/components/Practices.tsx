'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

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
    <div className='space-y-6 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Spells & Rituals
        </h1>
        <p className='text-sm text-zinc-400'>
          A comprehensive collection of magical practices, rituals, and spells
          organized by purpose and moon phase
        </p>
      </div>

      <div className='rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4'>
        <div className='flex items-center gap-2 mb-2'>
          <Moon className='w-5 h-5 text-indigo-300' />
          <h3 className='font-medium text-indigo-300'>
            Current Moon Phase: {currentMoonPhase}
          </h3>
        </div>
        <p className='text-sm text-indigo-200'>
          Certain spells work best during specific moon phases. Look for the
          moon phase indicators on each spell.
        </p>
      </div>

      <section id='spells-rituals' className='space-y-4'>
        <div className='space-y-4'>
          <div>
            <input
              type='text'
              placeholder='Search spells and rituals...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800'
              }`}
            >
              All Categories ({spells.length})
            </button>

            {Object.entries(spellCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedCategory === key
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800'
                }`}
              >
                {getCategoryIcon(key)}
                {category.name} ({getSpellsByCategory(key).length})
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h2 className='text-lg font-medium text-purple-400 mb-2'>
              {
                spellCategories[
                  selectedCategory as keyof typeof spellCategories
                ].name
              }
            </h2>
            <p className='text-sm text-zinc-300'>
              {
                spellCategories[
                  selectedCategory as keyof typeof spellCategories
                ].description
              }
            </p>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredSpells.map((spell: Spell) => (
            <Link
              key={spell.id}
              href={`/grimoire/spells/${spell.id}`}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
            >
              <div className='space-y-3'>
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

                <p className='text-sm text-zinc-400 line-clamp-2'>
                  {spell.purpose}
                </p>

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

                <div className='pt-2 border-t border-zinc-800/50'>
                  <div className='text-purple-400 group-hover:text-purple-300 text-sm font-medium'>
                    View Full Spell →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredSpells.length === 0 && (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-zinc-400 mb-2'>
              No spells found
            </h3>
            <p className='text-sm text-zinc-500'>
              {searchTerm
                ? `No spells match "${searchTerm}". Try a different search term.`
                : 'No spells in this category yet. Check back soon for more magical practices!'}
            </p>
          </div>
        )}
      </section>

      <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-4'>
        <h3 className='text-lg font-medium text-zinc-100 mb-2'>
          About These Spells & Rituals
        </h3>
        <p className='text-sm text-zinc-300 mb-3'>
          Each spell and ritual has been thoroughly researched and includes
          historical context, proper timing, safety considerations, and
          variations. All practices are based on traditional magical systems and
          folklore.
        </p>
        <p className='text-xs text-zinc-400'>
          Always practice magic responsibly and with respect for all beings.
          These are for educational and spiritual purposes. Use your intuition
          and adapt practices to your personal beliefs.
        </p>
      </div>
    </div>
  );
};

export default Practices;
