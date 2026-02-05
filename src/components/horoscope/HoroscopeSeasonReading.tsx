'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { getCosmicContextForDate } from '@/lib/cosmic/cosmic-context-utils';

interface HoroscopeSeasonReadingProps {
  sunSign: string;
  moonPhase: string;
  focusAreas?: Array<{
    area: 'love' | 'work' | 'inner';
    title: string;
    guidance: string;
  }>;
  className?: string;
}

const ELEMENT_MAP: Record<string, string> = {
  Aries: 'fire',
  Leo: 'fire',
  Sagittarius: 'fire',
  Taurus: 'earth',
  Virgo: 'earth',
  Capricorn: 'earth',
  Gemini: 'air',
  Libra: 'air',
  Aquarius: 'air',
  Cancer: 'water',
  Scorpio: 'water',
  Pisces: 'water',
};

const ELEMENT_SEASONS: Record<string, { name: string; description: string }> = {
  fire: {
    name: 'Passionate Fire',
    description: 'bold action, creative spark, and courageous momentum',
  },
  earth: {
    name: 'Grounded Growth',
    description: 'steady foundations, practical wisdom, and patient building',
  },
  air: {
    name: 'Mental Clarity',
    description:
      'clear thinking, inspired communication, and fresh perspective',
  },
  water: {
    name: 'Emotional Depth',
    description: 'deep feeling, intuitive flow, and heartfelt connection',
  },
};

function generateNarrative(
  element: string,
  moonName: string,
  moonKeywords: string[],
  isPremium: boolean,
): { summary: string; paragraphs: string[] } {
  const season = ELEMENT_SEASONS[element];
  const keywordStr = moonKeywords.slice(0, 2).join(' and ').toLowerCase();

  const summary = season
    ? `The ${moonName} blends ${keywordStr} energy with your season of ${season.description}.`
    : `The ${moonName} brings ${keywordStr} energy to your cosmic season.`;

  if (!isPremium) {
    return { summary, paragraphs: [] };
  }

  const paragraphs: string[] = [];

  if (element === 'fire') {
    paragraphs.push(
      `Your fire-sign energy is amplified right now. The ${moonName} asks you to channel passion into purposeful action rather than scattered sparks. Let inspiration move through you, but give it a clear direction.`,
    );
  } else if (element === 'earth') {
    paragraphs.push(
      `Your earth-sign energy craves tangible progress. The ${moonName} supports slow, deliberate steps. Trust that what you are building now will hold — patience is your superpower this season.`,
    );
  } else if (element === 'air') {
    paragraphs.push(
      `Your air-sign energy thrives on ideas and connection. The ${moonName} sharpens your mental clarity and invites fresh conversations. Follow curiosity, but stay grounded enough to act on the insights you receive.`,
    );
  } else if (element === 'water') {
    paragraphs.push(
      `Your water-sign energy runs deep right now. The ${moonName} amplifies intuition and emotional awareness. Honor what surfaces — feelings are information, and yours are especially reliable this season.`,
    );
  }

  return { summary, paragraphs };
}

export function HoroscopeSeasonReading({
  sunSign,
  moonPhase,
  focusAreas,
  className = '',
}: HoroscopeSeasonReadingProps) {
  const subscription = useSubscription();
  const hasPaidAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const cosmicContext = useMemo(() => getCosmicContextForDate(new Date()), []);

  const seasonData = useMemo(() => {
    const element = ELEMENT_MAP[sunSign] || 'water';
    const season = ELEMENT_SEASONS[element];
    const narrative = generateNarrative(
      element,
      cosmicContext.moonPhase.name,
      cosmicContext.moonPhase.keywords,
      hasPaidAccess,
    );

    return {
      seasonName: season?.name || 'Cosmic Flow',
      ...narrative,
    };
  }, [sunSign, cosmicContext, hasPaidAccess]);

  return (
    <div
      className={`rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/30 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-lunary-primary-900/30'>
            <Sparkles className='w-4 h-4 text-lunary-primary-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-zinc-100'>
              Your Cosmic Season: {seasonData.seasonName}
            </p>
            <p className='text-xs text-zinc-400'>Moon-guided energy reading</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className='px-4 pb-4 space-y-4'>
          {/* Moon phase info */}
          <div className='rounded-lg border border-lunary-secondary-800/50 bg-lunary-secondary-950/30 p-3'>
            <div className='flex items-center gap-3'>
              <img
                src={cosmicContext.moonPhase.icon.src}
                alt={cosmicContext.moonPhase.icon.alt}
                className='w-10 h-10 flex-shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-lunary-secondary-300 mb-1'>
                  {cosmicContext.moonPhase.name}
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {cosmicContext.moonPhase.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className='text-xs px-2 py-0.5 rounded-full bg-lunary-secondary-900/50 text-lunary-secondary-400 border border-lunary-secondary-800'
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary narrative */}
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {seasonData.summary}
          </p>

          {/* Paid: full narrative + focus areas */}
          {hasPaidAccess && seasonData.paragraphs.length > 0 && (
            <div className='space-y-3'>
              {seasonData.paragraphs.map((paragraph, i) => (
                <p key={i} className='text-sm text-zinc-300 leading-relaxed'>
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {hasPaidAccess && focusAreas && focusAreas.length > 0 && (
            <div className='pt-3 border-t border-zinc-800/50'>
              <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2'>
                Focus Areas
              </p>
              <ul className='space-y-1.5'>
                {focusAreas.map((area, i) => (
                  <li
                    key={i}
                    className='text-sm text-zinc-300 flex items-start gap-2'
                  >
                    <span className='text-lunary-primary-400 mt-0.5'>•</span>
                    <span>
                      <span className='font-medium text-zinc-200'>
                        {area.title}
                      </span>{' '}
                      — {area.guidance}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!hasPaidAccess && (
            <p className='text-xs text-zinc-500'>
              Upgrade for the full season narrative and personalized focus
              guidance.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
