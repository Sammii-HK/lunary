'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import type { TrendAnalysis } from '../../../utils/tarot/improvedTarot';

interface TarotSeasonReadingProps {
  period: number | 'year-over-year';
  trendAnalysis: TrendAnalysis | null;
  className?: string;
}

const SEASON_NAMES: Record<string, string[]> = {
  action: ['Fire of Renewal', 'Season of Momentum', 'The Quickening'],
  healing: ['Gentle Restoration', 'Heart Mending Season', 'Waters of Healing'],
  truth: ['Clarity Dawning', 'Season of Truth', 'The Unveiling'],
  stability: ['Grounded Growth', 'Season of Foundation', 'Roots Deepening'],
  transformation: ['The Great Shift', 'Phoenix Rising', 'Season of Becoming'],
  intuition: ['Inner Knowing', 'Season of Dreams', 'The Mystic Waters'],
  creativity: ['Creative Bloom', 'Season of Expression', 'The Muse Awakens'],
  growth: ['Expansion Season', 'The Flourishing', 'New Horizons'],
  release: ['Letting Go Season', 'The Unbinding', 'Sacred Release'],
  connection: ['Heart Opening', 'Season of Bonds', 'The Gathering'],
};

const SUIT_ELEMENTS: Record<
  string,
  { element: string; energy: string; focus: string }
> = {
  Cups: {
    element: 'Water',
    energy: 'emotional and intuitive',
    focus: 'relationships, feelings, and inner knowing',
  },
  Wands: {
    element: 'Fire',
    energy: 'creative and passionate',
    focus: 'inspiration, action, and personal power',
  },
  Swords: {
    element: 'Air',
    energy: 'mental and communicative',
    focus: 'thoughts, decisions, and truth-seeking',
  },
  Pentacles: {
    element: 'Earth',
    energy: 'grounded and practical',
    focus: 'material matters, health, and tangible goals',
  },
  'Major Arcana': {
    element: 'Spirit',
    energy: 'transformative and karmic',
    focus: 'major life lessons and soul evolution',
  },
};

function getSeasonName(themes: string[]): string {
  const primaryTheme = themes[0]?.toLowerCase() || 'growth';
  const options = SEASON_NAMES[primaryTheme] || SEASON_NAMES.growth;
  const index = new Date().getDate() % options.length;
  return options[index];
}

function generateSeasonSummary(
  trendAnalysis: TrendAnalysis,
  isPremium: boolean,
): { short: string; long: string[]; focusBullets: string[] } {
  const { dominantThemes, suitPatterns, arcanaPatterns, frequentCards } =
    trendAnalysis;

  const primaryTheme = dominantThemes[0] || 'growth';
  const primarySuit = suitPatterns[0]?.suit || 'Mixed';
  const suitInfo = SUIT_ELEMENTS[primarySuit] || SUIT_ELEMENTS.Cups;
  const majorCount =
    arcanaPatterns.find((a) => a.type === 'Major Arcana')?.count || 0;
  const totalCards = trendAnalysis.timeFrame;
  const majorRatio = majorCount / totalCards;

  const shortSummary = `You are in a ${primaryTheme.toLowerCase()} cycle with ${suitInfo.energy} undertones, centered around ${suitInfo.focus}.`;

  if (!isPremium) {
    return { short: shortSummary, long: [], focusBullets: [] };
  }

  const longParagraphs: string[] = [];

  longParagraphs.push(
    `This ${trendAnalysis.timeFrame}-day period reveals a clear pattern of ${primaryTheme.toLowerCase()} energy flowing through your readings. The cards are speaking about ${suitInfo.focus}, inviting you to engage more deeply with this area of your life.`,
  );

  if (majorRatio > 0.3) {
    longParagraphs.push(
      `With Major Arcana cards appearing frequently (${Math.round(majorRatio * 100)}% of your readings), you are navigating significant life themes and soul-level lessons. These are not ordinary times—the universe is calling your attention to matters of lasting importance.`,
    );
  }

  const emotionalTone = getEmotionalTone(dominantThemes, suitPatterns);
  longParagraphs.push(
    `The emotional and spiritual tone of this season is ${emotionalTone}. ${getThemeGuidance(primaryTheme)}`,
  );

  if (frequentCards.length > 0) {
    const topCard = frequentCards[0];
    longParagraphs.push(
      `${topCard.name} has appeared ${topCard.count} times, serving as a recurring messenger. ${topCard.reading || 'Pay attention to its wisdom.'}`,
    );
  }

  const focusBullets = generateFocusBullets(
    dominantThemes,
    suitPatterns,
    primaryTheme,
  );

  return { short: shortSummary, long: longParagraphs, focusBullets };
}

function getEmotionalTone(
  themes: string[],
  suits: Array<{ suit: string }>,
): string {
  const tones: string[] = [];

  if (themes.includes('healing')) tones.push('gentle and restorative');
  if (themes.includes('action')) tones.push('dynamic and motivating');
  if (themes.includes('truth')) tones.push('clarifying and honest');
  if (themes.includes('transformation')) tones.push('intense yet liberating');
  if (themes.includes('intuition')) tones.push('dreamy and receptive');

  if (suits[0]?.suit === 'Cups') tones.push('emotionally rich');
  if (suits[0]?.suit === 'Wands') tones.push('energetically charged');
  if (suits[0]?.suit === 'Swords') tones.push('mentally stimulating');
  if (suits[0]?.suit === 'Pentacles') tones.push('grounding and stabilizing');

  return tones.slice(0, 2).join(' and ') || 'reflective and meaningful';
}

function getThemeGuidance(theme: string): string {
  const guidance: Record<string, string> = {
    healing:
      'Allow yourself the time and space needed for restoration. This is not passive—it is essential work.',
    action:
      'Channel this momentum wisely. The energy is available; your job is to direct it with intention.',
    truth:
      'Welcome clarity even when it is uncomfortable. What you see now will serve your growth.',
    stability:
      'Build slowly and deliberately. The foundations you create now will support future aspirations.',
    transformation:
      'Embrace the changes unfolding. Something beautiful is emerging from what falls away.',
    intuition:
      'Trust what arises from within. Your inner knowing is particularly strong right now.',
    creativity:
      'Express freely without judgment. The muse is active and seeks your collaboration.',
    growth:
      'Expansion is natural and necessary. Say yes to opportunities that feel aligned.',
    release:
      'What you let go of creates space for what is meant for you. Release is an act of faith.',
    connection:
      'Nurture the bonds that matter. Relationships are a mirror for your own growth.',
  };
  return guidance[theme.toLowerCase()] || guidance.growth;
}

function generateFocusBullets(
  themes: string[],
  suits: Array<{ suit: string }>,
  primaryTheme: string,
): string[] {
  const bullets: string[] = [];

  const themeBullets: Record<string, string> = {
    healing: 'Prioritize self-care and rest',
    action: 'Take one decisive step toward your goal',
    truth: 'Have an honest conversation you have been avoiding',
    stability: 'Create or refine a daily routine',
    transformation: 'Release one thing that no longer serves you',
    intuition: 'Start a dream journal or meditation practice',
    creativity: 'Make time for creative expression',
    growth: 'Say yes to a new opportunity',
    release: 'Write down what you are ready to let go of',
    connection: 'Reach out to someone meaningful',
  };

  if (themeBullets[primaryTheme.toLowerCase()]) {
    bullets.push(themeBullets[primaryTheme.toLowerCase()]);
  }

  if (suits[0]?.suit === 'Cups') {
    bullets.push('Honor your emotional needs without judgment');
  } else if (suits[0]?.suit === 'Wands') {
    bullets.push('Channel your energy into a passion project');
  } else if (suits[0]?.suit === 'Swords') {
    bullets.push('Practice mental clarity through journaling');
  } else if (suits[0]?.suit === 'Pentacles') {
    bullets.push('Focus on one practical goal');
  }

  if (themes.length > 1) {
    const secondary = themes[1].toLowerCase();
    if (themeBullets[secondary] && !bullets.includes(themeBullets[secondary])) {
      bullets.push(themeBullets[secondary]);
    }
  }

  bullets.push('Trust the patterns your cards are revealing');

  return bullets.slice(0, 5);
}

export function TarotSeasonReading({
  period,
  trendAnalysis,
  className = '',
}: TarotSeasonReadingProps) {
  const { isSubscribed } = useSubscription();

  const seasonData = useMemo(() => {
    if (!trendAnalysis) return null;

    const seasonName = getSeasonName(trendAnalysis.dominantThemes);
    const summary = generateSeasonSummary(trendAnalysis, isSubscribed);

    return { seasonName, ...summary };
  }, [trendAnalysis, isSubscribed]);

  if (!trendAnalysis || trendAnalysis.dominantThemes.length === 0) {
    return null;
  }

  const periodLabel =
    period === 'year-over-year'
      ? 'Year-over-Year'
      : period === 365
        ? '12-Month'
        : period === 180
          ? '6-Month'
          : `${period}-Day`;

  return (
    <div
      className={`rounded-xl border border-lunary-primary-700/30 bg-gradient-to-br from-lunary-primary-950/20 to-zinc-900/60 p-4 ${className}`}
    >
      <div className='flex items-center gap-2 mb-3'>
        <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        <span className='text-xs font-medium text-lunary-primary-300/80 uppercase tracking-wide'>
          {periodLabel} Season
        </span>
      </div>

      {isSubscribed && seasonData && (
        <h3 className='text-lg font-medium text-zinc-100 mb-2'>
          {seasonData.seasonName}
        </h3>
      )}

      <p className='text-sm text-zinc-300 leading-relaxed'>
        {seasonData?.short}
      </p>

      {isSubscribed && seasonData && seasonData.long.length > 0 && (
        <div className='mt-4 space-y-3'>
          {seasonData.long.map((paragraph, i) => (
            <p key={i} className='text-sm text-zinc-400 leading-relaxed'>
              {paragraph}
            </p>
          ))}

          {seasonData.focusBullets.length > 0 && (
            <div className='mt-4 pt-3 border-t border-zinc-800/50'>
              <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2'>
                Focus for this period
              </p>
              <ul className='space-y-1.5'>
                {seasonData.focusBullets.map((bullet, i) => (
                  <li
                    key={i}
                    className='text-xs text-zinc-300 flex items-start gap-2'
                  >
                    <span className='text-lunary-primary-400 mt-0.5'>•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
