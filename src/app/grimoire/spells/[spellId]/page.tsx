'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSpellById, spellCategories } from '@/constants/spells';
import { ArrowLeft, Clock, Star, Moon, Sun, Leaf } from 'lucide-react';

export default function SpellPage() {
  const params = useParams();
  const spellId = params.spellId as string;
  const spell = getSpellById(spellId);

  if (!spell) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Spell Not Found</h1>
          <p className='text-zinc-400 mb-6'>
            The spell you're looking for doesn't exist.
          </p>
          <Link
            href='/grimoire/practices'
            className='text-purple-400 hover:text-purple-300 transition-colors'
          >
            ← Return to Grimoire
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = spellCategories[spell.category];
  const difficultyColors = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400',
  };

  return (
    <div className='min-h-screen p-4 max-w-md mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <Link
          href='/grimoire/practices'
          className='inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-4'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Grimoire
        </Link>

        <div className='mb-2'>
          <h1 className='text-2xl font-bold'>{spell.title}</h1>
        </div>

        <p className='text-zinc-300 text-lg mb-4'>{spell.description}</p>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span className='bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full'>
            {categoryInfo.name}
          </span>
          <span className='bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full'>
            {spell.type.replace('_', ' ')}
          </span>
          <span
            className={`bg-zinc-800 px-3 py-1 rounded-full ${difficultyColors[spell.difficulty]}`}
          >
            {spell.difficulty}
          </span>
          <span className='bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full flex items-center gap-1'>
            <Clock className='w-3 h-3' />
            {spell.duration}
          </span>
        </div>
      </div>

      <div className='space-y-6'>
        {/* Purpose */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-xl font-semibold text-purple-400 mb-3 flex items-center gap-2'>
            <Star className='w-5 h-5' />
            Purpose
          </h2>
          <p className='text-zinc-200'>{spell.purpose}</p>
        </div>

        {/* Timing */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2'>
            <Moon className='w-5 h-5' />
            Optimal Timing
          </h2>
          <div className='space-y-2 text-sm'>
            {spell.timing.moonPhase && (
              <div>
                <span className='text-zinc-400'>Moon Phase:</span>{' '}
                <span className='text-zinc-200'>
                  {spell.timing.moonPhase.join(', ')}
                </span>
              </div>
            )}
            {spell.timing.sabbat && (
              <div>
                <span className='text-zinc-400'>Sabbat:</span>{' '}
                <span className='text-zinc-200'>
                  {spell.timing.sabbat.join(', ')}
                </span>
              </div>
            )}
            {spell.timing.planetaryDay && (
              <div>
                <span className='text-zinc-400'>Best Days:</span>{' '}
                <span className='text-zinc-200'>
                  {spell.timing.planetaryDay.join(', ')}
                </span>
              </div>
            )}
            {spell.timing.timeOfDay && (
              <div>
                <span className='text-zinc-400'>Time of Day:</span>{' '}
                <span className='text-zinc-200'>{spell.timing.timeOfDay}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-xl font-semibold text-green-400 mb-3 flex items-center gap-2'>
            <Leaf className='w-5 h-5' />
            Ingredients
          </h2>
          <div className='space-y-3'>
            {spell.ingredients.map((ingredient, index) => (
              <div key={index} className='border-l-4 border-green-600 pl-4'>
                <div className='flex justify-between items-start mb-1'>
                  <span className='font-medium text-green-300'>
                    {ingredient.name}
                  </span>
                  {ingredient.amount && (
                    <span className='text-sm text-zinc-400'>
                      {ingredient.amount}
                    </span>
                  )}
                </div>
                <p className='text-sm text-zinc-300 mb-1'>
                  {ingredient.purpose}
                </p>
                {ingredient.substitutes && (
                  <p className='text-xs text-zinc-400'>
                    Substitutes: {ingredient.substitutes.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        {spell.tools.length > 0 && (
          <div className='bg-zinc-800 rounded-lg p-4'>
            <h2 className='text-xl font-semibold text-orange-400 mb-3'>
              Tools Needed
            </h2>
            <ul className='space-y-1'>
              {spell.tools.map((tool, index) => (
                <li
                  key={index}
                  className='text-zinc-200 flex items-center gap-2'
                >
                  <span className='w-2 h-2 bg-orange-400 rounded-full'></span>
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preparation */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-xl font-semibold text-indigo-400 mb-3'>
            Preparation
          </h2>
          <ol className='space-y-2'>
            {spell.preparation.map((step, index) => (
              <li key={index} className='text-zinc-200 flex gap-3'>
                <span className='flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium'>
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Steps */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-xl font-semibold text-purple-400 mb-3'>
            Ritual Steps
          </h2>
          <ol className='space-y-3'>
            {spell.steps.map((step, index) => (
              <li key={index} className='text-zinc-200 flex gap-3'>
                <span className='flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium'>
                  {index + 1}
                </span>
                <span className='pt-1'>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {/* Correspondences */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-xl font-semibold text-yellow-400 mb-3'>
          Correspondences
        </h2>
        <div className='space-y-3 text-sm'>
          {spell.correspondences.elements && (
            <div>
              <span className='text-zinc-400 block mb-1'>Elements:</span>
              <div className='flex flex-wrap gap-1'>
                {spell.correspondences.elements.map((element, index) => (
                  <span
                    key={index}
                    className='bg-yellow-900/40 text-yellow-300 px-2 py-1 rounded text-xs'
                  >
                    {element}
                  </span>
                ))}
              </div>
            </div>
          )}
          {spell.correspondences.colors && (
            <div>
              <span className='text-zinc-400 block mb-1'>Colors:</span>
              <div className='flex flex-wrap gap-1'>
                {spell.correspondences.colors.map((color, index) => (
                  <span
                    key={index}
                    className='bg-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs'
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
          {spell.correspondences.crystals && (
            <div>
              <span className='text-zinc-400 block mb-1'>Crystals:</span>
              <div className='flex flex-wrap gap-1'>
                {spell.correspondences.crystals.map((crystal, index) => (
                  <span
                    key={index}
                    className='bg-purple-900/40 text-purple-300 px-2 py-1 rounded text-xs'
                  >
                    {crystal}
                  </span>
                ))}
              </div>
            </div>
          )}
          {spell.correspondences.planets && (
            <div>
              <span className='text-zinc-400 block mb-1'>Planets:</span>
              <div className='flex flex-wrap gap-1'>
                {spell.correspondences.planets.map((planet, index) => (
                  <span
                    key={index}
                    className='bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs'
                  >
                    {planet}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety */}
      <div className='bg-red-900/20 border border-red-800 rounded-lg p-4'>
        <h2 className='text-xl font-semibold text-red-400 mb-3'>
          Safety & Ethics
        </h2>
        <ul className='space-y-2 text-sm'>
          {spell.safety.map((safety, index) => (
            <li key={index} className='text-red-200 flex items-start gap-2'>
              <span className='text-red-400 mt-1'>•</span>
              <span>{safety}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Variations */}
      {spell.variations && (
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-xl font-semibold text-cyan-400 mb-3'>
            Variations
          </h2>
          <ul className='space-y-2 text-sm'>
            {spell.variations.map((variation, index) => (
              <li key={index} className='text-zinc-200 flex items-start gap-2'>
                <span className='text-cyan-400 mt-1'>•</span>
                <span>{variation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      {spell.history && (
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-xl font-semibold text-amber-400 mb-3'>
            Historical Context
          </h2>
          <p className='text-zinc-200 text-sm'>{spell.history}</p>
        </div>
      )}

      {/* Share Section */}
      <div className='mt-8 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30'>
        <h3 className='text-lg font-medium text-white mb-2'>
          Share This Spell
        </h3>
        <p className='text-zinc-300 text-sm mb-3'>
          Share this spell with friends or bookmark it for future reference.
        </p>
        <div className='text-xs text-zinc-400 bg-zinc-800 p-2 rounded font-mono'>
          {typeof window !== 'undefined' ? window.location.href : ''}
        </div>
      </div>
    </div>
  );
}
