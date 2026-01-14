'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import type { TrendAnalysis } from '../../../utils/tarot/improvedTarot';

interface TarotSeasonReadingProps {
  trendAnalysis: TrendAnalysis | null;
  period: 7 | 14 | 30 | 90 | 180 | 365;
  className?: string;
}

const SEASON_NAMES: Record<string, { name: string; description: string }> = {
  Cups: {
    name: 'Emotional Depth',
    description: 'feelings, relationships, intuition',
  },
  Wands: { name: 'Creative Fire', description: 'passion, action, inspiration' },
  Swords: {
    name: 'Mental Clarity',
    description: 'truth, communication, decisions',
  },
  Pentacles: {
    name: 'Grounded Growth',
    description: 'stability, resources, manifestation',
  },
  'Major Arcana': {
    name: 'Soul Journey',
    description: 'major life lessons and transitions',
  },
};

const THEME_NARRATIVES: Record<string, string> = {
  healing:
    'This period emphasizes restoration and emotional mending. The cards are asking you to prioritize self-care and inner work.',
  transformation:
    'You are in a cycle of profound change. Old patterns are dissolving to make way for new growth.',
  creativity:
    'Creative energy is abundant right now. The cards encourage you to express yourself and bring ideas to life.',
  action:
    'This is a time for decisive movement. The universe is supporting bold steps forward.',
  reflection:
    'Pause and look inward. The patterns suggest wisdom comes from contemplation rather than action.',
  truth:
    'Clarity is emerging. You are being called to see situations as they truly are.',
  abundance:
    'Energy around resources and prosperity is highlighted. Focus on what you want to grow.',
  connection:
    'Relationships and emotional bonds are central to this phase. Open your heart.',
};

function generateSeasonName(trendAnalysis: TrendAnalysis): string {
  const topSuit = trendAnalysis.suitPatterns[0];
  const topTheme = trendAnalysis.dominantThemes[0];

  if (topSuit && SEASON_NAMES[topSuit.suit]) {
    return SEASON_NAMES[topSuit.suit].name;
  }

  if (topTheme) {
    return `${topTheme.charAt(0).toUpperCase() + topTheme.slice(1)} Cycle`;
  }

  return 'Unfolding Journey';
}

function generateNarrative(
  trendAnalysis: TrendAnalysis,
  period: number,
  isPremium: boolean,
): { summary: string; paragraphs: string[]; focusBullets: string[] } {
  const topTheme = trendAnalysis.dominantThemes[0]?.toLowerCase();
  const topSuit = trendAnalysis.suitPatterns[0];
  const topCard = trendAnalysis.frequentCards[0];

  let summary = '';

  if (topSuit) {
    const suitInfo = SEASON_NAMES[topSuit.suit];
    if (suitInfo) {
      summary = `Over the past ${period} days, ${suitInfo.description} has been the dominant energy in your readings.`;
    }
  } else if (topTheme) {
    summary = `Your recent readings reveal a strong ${topTheme} pattern emerging.`;
  } else {
    summary = `Your tarot journey over the past ${period} days shows diverse energies at play.`;
  }

  if (!isPremium) {
    return { summary, paragraphs: [], focusBullets: [] };
  }

  const paragraphs: string[] = [];

  if (topTheme && THEME_NARRATIVES[topTheme]) {
    paragraphs.push(THEME_NARRATIVES[topTheme]);
  }

  if (topCard && topCard.count >= 2) {
    paragraphs.push(
      `${topCard.name} has appeared ${topCard.count} times, suggesting its message is particularly relevant for you right now. ${topCard.reading || 'Pay attention to the themes this card brings.'}`,
    );
  }

  if (trendAnalysis.arcanaPatterns.length > 0) {
    const majorArcana = trendAnalysis.arcanaPatterns.find(
      (a) => a.type === 'Major Arcana',
    );
    const minorArcana = trendAnalysis.arcanaPatterns.find(
      (a) => a.type === 'Minor Arcana',
    );

    if (majorArcana && minorArcana) {
      const majorPercent = Math.round(
        (majorArcana.count / (majorArcana.count + minorArcana.count)) * 100,
      );
      if (majorPercent > 40) {
        paragraphs.push(
          `With ${majorPercent}% Major Arcana cards, you are experiencing significant soul-level shifts. These are not small adjustments but meaningful life transitions.`,
        );
      } else if (majorPercent < 20) {
        paragraphs.push(
          `Your readings have been predominantly Minor Arcana, suggesting the focus is on everyday matters and practical implementation rather than major life changes.`,
        );
      }
    }
  }

  const focusBullets: string[] = [];

  if (topTheme === 'healing') {
    focusBullets.push('Prioritize rest and emotional self-care');
    focusBullets.push('Release what no longer serves your wellbeing');
    focusBullets.push('Seek support when needed—healing is not a solo journey');
  } else if (topTheme === 'transformation') {
    focusBullets.push('Embrace uncertainty as a catalyst for growth');
    focusBullets.push('Let go of outdated identities or patterns');
    focusBullets.push('Trust the process even when the destination is unclear');
  } else if (topTheme === 'creativity' || topSuit?.suit === 'Wands') {
    focusBullets.push('Make time for creative expression');
    focusBullets.push('Start before you feel ready');
    focusBullets.push('Follow inspiration without overthinking');
  } else if (topTheme === 'action') {
    focusBullets.push('Take decisive steps forward');
    focusBullets.push('Channel your energy into focused efforts');
    focusBullets.push("Don't wait for perfect conditions");
  } else if (topSuit?.suit === 'Cups') {
    focusBullets.push('Honor your emotional needs');
    focusBullets.push('Nurture important relationships');
    focusBullets.push('Trust your intuition');
  } else if (topSuit?.suit === 'Pentacles') {
    focusBullets.push('Focus on practical foundations');
    focusBullets.push('Take steady, consistent action');
    focusBullets.push('Value what you are building');
  } else if (topSuit?.suit === 'Swords') {
    focusBullets.push('Seek clarity in communication');
    focusBullets.push('Face difficult truths with courage');
    focusBullets.push('Make decisions from a place of clarity');
  } else {
    focusBullets.push('Stay present with what emerges');
    focusBullets.push('Trust your personal interpretation');
    focusBullets.push('Return to the cards for continued guidance');
  }

  return { summary, paragraphs, focusBullets };
}

export function TarotSeasonReading({
  trendAnalysis,
  period,
  className = '',
}: TarotSeasonReadingProps) {
  const subscription = useSubscription();
  const hasTarotPatternsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'tarot_patterns',
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const seasonData = useMemo(() => {
    if (!trendAnalysis) return null;

    return {
      name: generateSeasonName(trendAnalysis),
      ...generateNarrative(trendAnalysis, period, hasTarotPatternsAccess),
    };
  }, [trendAnalysis, period, hasTarotPatternsAccess]);

  if (!trendAnalysis || !seasonData) {
    return null;
  }

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
              Your Tarot Season: {seasonData.name}
            </p>
            <p className='text-xs text-zinc-400'>
              {period}-day pattern reading
            </p>
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
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {seasonData.summary}
          </p>

          {isPremium && seasonData.paragraphs.length > 0 && (
            <div className='space-y-3'>
              {seasonData.paragraphs.map((paragraph, i) => (
                <p key={i} className='text-sm text-zinc-300 leading-relaxed'>
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {isPremium && seasonData.focusBullets.length > 0 && (
            <div className='pt-3 border-t border-zinc-800/50'>
              <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2'>
                What to focus on
              </p>
              <ul className='space-y-1.5'>
                {seasonData.focusBullets.map((bullet, i) => (
                  <li
                    key={i}
                    className='text-sm text-zinc-300 flex items-start gap-2'
                  >
                    <span className='text-lunary-primary-400 mt-0.5'>•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isPremium && (
            <p className='text-xs text-zinc-500'>
              Upgrade for detailed narrative and focus guidance.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
