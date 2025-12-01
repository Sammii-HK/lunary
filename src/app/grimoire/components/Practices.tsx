'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { getMoonPhase } from '../../../../utils/moon/moonPhases';
import type { Spell } from '@/constants/spells';
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

interface SpellCategory {
  name: string;
  description: string;
}

const Practices = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [spellsData, setSpellsData] = useState<Spell[]>([]);
  const [categoriesData, setCategoriesData] = useState<
    Record<string, SpellCategory>
  >({});
  const [loading, setLoading] = useState(true);

  const currentMoonPhase = getMoonPhase(new Date());

  useEffect(() => {
    fetch('/api/grimoire/spells')
      .then((r) => r.json())
      .then((data) => {
        setSpellsData(data.spells || []);
        setCategoriesData(data.categories || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    }
  }, [loading]);

  const getSpellsByCategory = useMemo(
    () => (category: string) =>
      spellsData.filter((s) => s.category === category || s.type === category),
    [spellsData],
  );

  const getCategoryIcon = (category?: string) => {
    if (!category) return <Leaf className='w-4 h-4' />;
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

  const filteredSpells = useMemo(() => {
    if (selectedCategory) {
      return getSpellsByCategory(selectedCategory);
    }
    return spellsData.filter(
      (spell) =>
        spell.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.purpose.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [selectedCategory, searchTerm, spellsData, getSpellsByCategory]);

  return (
    <div className='space-y-6'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Spells & Rituals Collection
        </h2>
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
              All Categories ({spellsData.length})
            </button>

            {Object.entries(categoriesData).map(([key, category]) => (
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

        {selectedCategory && categoriesData[selectedCategory] && (
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h2 className='text-lg font-medium text-purple-400 mb-2'>
              {categoriesData[selectedCategory].name}
            </h2>
            <p className='text-sm text-zinc-300'>
              {categoriesData[selectedCategory].description}
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

      {/* Spellcraft Fundamentals Section */}
      <section id='spellcraft-fundamentals' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            <a
              href='/grimoire/spellcraft-fundamentals'
              className='hover:text-purple-400 transition-colors'
            >
              Spellcraft Fundamentals
            </a>
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Before casting spells, understand the foundational principles of
            spellcraft. These fundamentals ensure your magic is effective,
            ethical, and aligned with your intentions.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Intention Setting
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Clear intention is the foundation of all magic. Your intention
              directs energy and determines outcomes.
            </p>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>How to set clear intentions:</strong>
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Be specific about what you want (not vague)</li>
                <li>
                  Focus on what you want to attract, not what you want to avoid
                </li>
                <li>Use present tense ("I am" not "I will be")</li>
                <li>Include how it benefits you and others</li>
                <li>Write it down or speak it aloud clearly</li>
              </ul>
            </div>
            <p className='text-sm text-zinc-300 leading-relaxed mt-3'>
              Example: Instead of "I don't want to be poor," say "I am
              financially abundant and secure."
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Altar Setup
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              An altar is a sacred space for magical work. It doesn't need to be
              elaborate—simplicity and intention matter most.
            </p>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Essential altar elements:</strong>
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>
                  <strong>Representation of elements:</strong> Candle (fire),
                  water, salt (earth), incense (air)
                </li>
                <li>
                  <strong>Personal items:</strong> Photos, crystals, symbols
                  that hold meaning
                </li>
                <li>
                  <strong>Tools:</strong> Matches, athame or wand (optional),
                  offering bowl
                </li>
                <li>
                  <strong>Cleansing tools:</strong> Sage, salt, or cleansing
                  spray
                </li>
              </ul>
            </div>
            <p className='text-sm text-zinc-300 leading-relaxed mt-3'>
              Cleanse your altar before each use. Arrange items
              intuitively—there's no single "correct" way. Your altar should
              feel sacred and personal.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Altar Layout & Organization
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Directional Placement:</strong>
                <ul className='list-disc list-inside ml-4 mt-1 space-y-1'>
                  <li>
                    <strong>North (Earth):</strong> Crystals, salt, plants,
                    earth representations
                  </li>
                  <li>
                    <strong>East (Air):</strong> Incense, feathers, bells, air
                    representations
                  </li>
                  <li>
                    <strong>South (Fire):</strong> Candles, matches, fire-safe
                    dish, fire representations
                  </li>
                  <li>
                    <strong>West (Water):</strong> Water bowl, shells, water
                    representations
                  </li>
                  <li>
                    <strong>Center:</strong> Main working candle, intention
                    items, focal point
                  </li>
                </ul>
              </div>
              <div>
                <strong>Altar Maintenance:</strong>
                <ul className='list-disc list-inside ml-4 mt-1 space-y-1'>
                  <li>
                    Cleanse before each ritual (sage, salt, or visualization)
                  </li>
                  <li>Keep items organized and meaningful</li>
                  <li>Refresh offerings regularly</li>
                  <li>Dust and clean physical items monthly</li>
                  <li>Recharge crystals under moonlight or sunlight</li>
                </ul>
              </div>
              <div>
                <strong>Creating Sacred Space:</strong>
                <ul className='list-disc list-inside ml-4 mt-1 space-y-1'>
                  <li>Light white candle first for protection</li>
                  <li>Ring bell or chime to clear energy</li>
                  <li>Visualize white light surrounding your altar</li>
                  <li>State your intention for the ritual</li>
                  <li>Thank the elements and close properly when done</li>
                </ul>
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Understanding Magical Timing
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Timing amplifies spell effectiveness. Align your magic with
              natural cycles for best results.
            </p>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Moon phases:</strong>
                <ul className='list-disc list-inside ml-4 mt-1'>
                  <li>New Moon: New beginnings, setting intentions</li>
                  <li>Waxing Moon: Growth, attraction, building energy</li>
                  <li>Full Moon: Manifestation, release, charging</li>
                  <li>Waning Moon: Banishing, letting go, breaking habits</li>
                </ul>
              </div>
              <div>
                <strong>Days of the week:</strong>
                <ul className='list-disc list-inside ml-4 mt-1'>
                  <li>Monday (Moon): Intuition, dreams, emotions</li>
                  <li>Tuesday (Mars): Action, courage, protection</li>
                  <li>Wednesday (Mercury): Communication, learning, travel</li>
                  <li>Thursday (Jupiter): Abundance, expansion, luck</li>
                  <li>Friday (Venus): Love, beauty, relationships</li>
                  <li>Saturday (Saturn): Banishing, protection, discipline</li>
                  <li>Sunday (Sun): Success, vitality, confidence</li>
                </ul>
              </div>
              <div>
                <strong>Time of day:</strong>
                <ul className='list-disc list-inside ml-4 mt-1'>
                  <li>Dawn: New beginnings, fresh starts</li>
                  <li>Noon: Peak power, manifestation</li>
                  <li>Sunset: Release, gratitude, closure</li>
                  <li>Midnight: Transformation, shadow work</li>
                </ul>
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Energy Work Basics
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Magic works with energy. Learning to sense, direct, and work with
              energy is fundamental to spellcraft.
            </p>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Grounding:</strong> Connect with earth energy. Visualize
                roots extending from your feet into the earth. Feel stable and
                centered. Essential before and after spellwork.
              </div>
              <div>
                <strong>Centering:</strong> Find your core energy. Take deep
                breaths, feel your energy at your center (solar plexus or
                heart). This is your power source.
              </div>
              <div>
                <strong>Shielding:</strong> Protect your energy. Visualize a
                bubble of light around you. Set intention: "I am protected."
                Essential for protection work and when working with others'
                energy.
              </div>
              <div>
                <strong>Raising energy:</strong> Build power for spells. Methods
                include chanting, dancing, visualization, breathwork, or
                drumming. Feel energy building before directing it.
              </div>
              <div>
                <strong>Directing energy:</strong> Send intention outward.
                Visualize your intention clearly, feel energy flowing through
                you, and release it with purpose. Always ground excess energy
                afterward.
              </div>
            </div>
          </div>
        </div>
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

      {/* Related Topics Section */}
      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <a
            href='/grimoire/moon#rituals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Moon Rituals & Timing
          </a>
          <a
            href='/grimoire/candle-magic'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Candle Magic
          </a>
          <a
            href='/grimoire/crystals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Crystals for Magic
          </a>
          <a
            href='/grimoire/correspondences'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Magical Correspondences
          </a>
          <a
            href='/grimoire/tarot'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Tarot for Divination
          </a>
          <a
            href='/grimoire/divination'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-purple-300'
          >
            Other Divination Methods
          </a>
        </div>
      </section>
    </div>
  );
};

export default Practices;
