// Tarot Card of the Week component
// Selects card based on dominant planetary energy

'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import tarotData from '@/data/tarot-cards.json';

interface TarotOfWeekProps {
  weekNumber: number;
  year: number;
  dominantPlanet?: string;
  dominantElement?: string;
  variant?: 'full' | 'teaser';
  weekTitle?: string;
}

// Planet to tarot card mappings (Major Arcana)
const planetCardMappings: Record<string, string[]> = {
  Sun: ['theSun', 'theChariot', 'strength'],
  Moon: ['theHighPriestess', 'theMoon', 'theEmpress'],
  Mercury: ['theMagician', 'theLovers', 'theHermit'],
  Venus: ['theEmpress', 'theLovers', 'theStar'],
  Mars: ['theChariot', 'theTower', 'theEmperor'],
  Jupiter: ['wheelOfFortune', 'theWorld', 'temperance'],
  Saturn: ['theHermit', 'theDevil', 'theWorld'],
  Uranus: ['theFool', 'theTower', 'theStar'],
  Neptune: ['theHighPriestess', 'theMoon', 'theHangedMan'],
  Pluto: ['death', 'theDevil', 'judgement'],
};

// Element to card mappings
const elementCardMappings: Record<string, string[]> = {
  Fire: ['theEmperor', 'strength', 'theSun', 'theChariot'],
  Water: ['theHighPriestess', 'theMoon', 'theEmpress', 'theStar'],
  Air: ['theFool', 'theMagician', 'justice', 'theLovers'],
  Earth: ['theEmpress', 'theHierophant', 'theHermit', 'theWorld'],
};

// Simple hash function for seed generation
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Select card based on weekly energy
function selectWeeklyCard(
  weekNumber: number,
  year: number,
  dominantPlanet?: string,
  dominantElement?: string,
): { cardKey: string; card: any; reason: string } {
  const majorArcana = tarotData.majorArcana;
  const allCardKeys = Object.keys(majorArcana);

  // Create weekly seed for consistency
  const weekSeed = simpleHash(`tarot-week-${weekNumber}-${year}`);

  let candidateCards: string[] = [];
  let reason = '';

  // Prioritize cards matching dominant planet
  if (dominantPlanet && planetCardMappings[dominantPlanet]) {
    candidateCards = planetCardMappings[dominantPlanet];
    reason = `Selected for ${dominantPlanet}'s influence this week`;
  }
  // Fall back to element mapping
  else if (dominantElement && elementCardMappings[dominantElement]) {
    candidateCards = elementCardMappings[dominantElement];
    reason = `Selected for the ${dominantElement} energy this week`;
  }
  // Default: use all major arcana
  else {
    candidateCards = allCardKeys;
    reason = 'Selected to guide your week ahead';
  }

  // Use seed to pick from candidates
  const cardIndex = weekSeed % candidateCards.length;
  const cardKey = candidateCards[cardIndex];
  const card = majorArcana[cardKey as keyof typeof majorArcana];

  return { cardKey, card, reason };
}

// Get card image path
function getCardImagePath(cardKey: string): string {
  // Convert camelCase to kebab-case for file names
  const fileName = cardKey
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  return `/images/tarot/major-arcana/${fileName}.jpg`;
}

export function TarotOfWeek({
  weekNumber,
  year,
  dominantPlanet,
  dominantElement,
  variant = 'full',
  weekTitle,
}: TarotOfWeekProps) {
  const { cardKey, card, reason } = useMemo(
    () => selectWeeklyCard(weekNumber, year, dominantPlanet, dominantElement),
    [weekNumber, year, dominantPlanet, dominantElement],
  );

  if (!card) return null;

  const imagePath = getCardImagePath(cardKey);

  if (variant === 'teaser') {
    return (
      <div className='rounded-xl border border-purple-700/30 bg-gradient-to-br from-purple-950/30 to-zinc-900 p-4'>
        <div className='flex items-center gap-2 mb-3'>
          <Sparkles className='h-5 w-5 text-purple-400' />
          <h3 className='font-semibold text-purple-300'>Tarot of the Week</h3>
        </div>

        <div className='flex gap-4'>
          <div className='relative w-20 h-32 flex-shrink-0'>
            <Image
              src={imagePath}
              alt={card.name}
              fill
              className='object-cover rounded-lg'
              sizes='80px'
            />
          </div>
          <div className='flex-1'>
            <h4 className='font-medium text-zinc-100 mb-1'>{card.name}</h4>
            <p className='text-xs text-zinc-400 mb-2'>{reason}</p>
            <p className='text-sm text-zinc-300 line-clamp-3'>
              {card.keywords.slice(0, 3).join(' • ')}
            </p>
          </div>
        </div>

        <p className='text-xs text-purple-400 mt-3 italic'>
          Full interpretation and ritual guide available for paid subscribers
        </p>
      </div>
    );
  }

  // Full variant
  return (
    <section className='space-y-4'>
      <h2 className='text-2xl font-bold flex items-center gap-2'>
        <Sparkles className='h-6 w-6 text-purple-400' />
        Tarot Card of the Week
      </h2>

      <div className='rounded-xl border border-purple-700/30 bg-gradient-to-br from-purple-950/20 to-zinc-900 p-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Card Image */}
          <div className='flex justify-center md:justify-start'>
            <div className='relative w-40 h-64 flex-shrink-0'>
              <Image
                src={imagePath}
                alt={card.name}
                fill
                className='object-cover rounded-xl shadow-lg shadow-purple-900/30'
                sizes='160px'
              />
            </div>
          </div>

          {/* Card Content */}
          <div className='flex-1 space-y-4'>
            <div>
              <h3 className='text-2xl font-bold text-purple-300'>
                {card.name}
              </h3>
              <p className='text-sm text-zinc-400 mt-1'>{reason}</p>
            </div>

            {/* Keywords */}
            <div className='flex flex-wrap gap-2'>
              {card.keywords.map((keyword: string) => (
                <span
                  key={keyword}
                  className='px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 border border-purple-700/30'
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* Core Meaning */}
            <div>
              <h4 className='text-sm font-medium text-zinc-300 mb-1'>
                This Week's Message
              </h4>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                {card.information}
              </p>
            </div>

            {/* Affirmation */}
            <blockquote className='border-l-2 border-purple-500 pl-4 py-2'>
              <p className='text-sm italic text-purple-200'>
                "{card.affirmation}"
              </p>
            </blockquote>
          </div>
        </div>

        {/* How to Work With This Card */}
        <div className='mt-6 pt-6 border-t border-zinc-800'>
          <h4 className='text-sm font-medium text-zinc-300 mb-3'>
            How to Work With {card.name} This Week
          </h4>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-purple-400 font-medium'>In Love:</span>
              <p className='text-zinc-400 mt-1'>{card.loveMeaning}</p>
            </div>
            <div>
              <span className='text-purple-400 font-medium'>In Career:</span>
              <p className='text-zinc-400 mt-1'>{card.careerMeaning}</p>
            </div>
          </div>
        </div>

        {/* Symbolism for deeper exploration */}
        <details className='mt-4'>
          <summary className='text-sm text-zinc-400 cursor-pointer hover:text-zinc-300'>
            Explore the Symbolism
          </summary>
          <p className='text-sm text-zinc-500 mt-2 leading-relaxed'>
            {card.symbolism}
          </p>
        </details>
      </div>
    </section>
  );
}

// Compact card for sidebar
export function TarotCardCompact({
  weekNumber,
  year,
  dominantPlanet,
}: {
  weekNumber: number;
  year: number;
  dominantPlanet?: string;
}) {
  const { card, reason } = useMemo(
    () => selectWeeklyCard(weekNumber, year, dominantPlanet),
    [weekNumber, year, dominantPlanet],
  );

  if (!card) return null;

  return (
    <div className='rounded-lg border border-purple-700/20 bg-purple-950/10 p-3'>
      <div className='flex items-center gap-2 mb-2'>
        <Sparkles className='h-4 w-4 text-purple-400' />
        <span className='text-xs font-medium text-purple-300'>
          Card of the Week
        </span>
      </div>
      <p className='font-medium text-zinc-100'>{card.name}</p>
      <p className='text-xs text-zinc-400 mt-1'>
        {card.keywords.slice(0, 2).join(' • ')}
      </p>
    </div>
  );
}
