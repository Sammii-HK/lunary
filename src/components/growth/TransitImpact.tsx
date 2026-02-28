'use client';

import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface TransitImpactData {
  transitName: string;
  description: string;
  emotionalTone: string;
  suggestedActions: string[];
  watchFor: string[];
  intensity: 'low' | 'medium' | 'high';
}

interface TransitImpactProps {
  transits: TransitImpactData[];
  className?: string;
}

const INTENSITY_COLORS = {
  low: {
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/30',
    text: 'text-emerald-400',
    label: 'Gentle',
  },
  medium: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
    text: 'text-amber-400',
    label: 'Notable',
  },
  high: {
    bg: 'bg-lunary-rose/20',
    border: 'border-lunary-rose/30',
    text: 'text-lunary-rose',
    label: 'Significant',
  },
};

function TransitCard({
  transit,
  expanded,
  onToggle,
  isPremium,
}: {
  transit: TransitImpactData;
  expanded: boolean;
  onToggle: () => void;
  isPremium: boolean;
}) {
  const colors = INTENSITY_COLORS[transit.intensity];

  return (
    <div
      className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className='w-full flex items-start justify-between p-3 text-left'
      >
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-sm font-medium text-zinc-100'>
              {transit.transitName}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}
            >
              {colors.label}
            </span>
          </div>
          <p className='text-xs text-zinc-400 line-clamp-2'>
            {transit.description}
          </p>
        </div>
        <div className='shrink-0 ml-2 mt-1'>
          {expanded ? (
            <ChevronUp className='w-4 h-4 text-zinc-500' />
          ) : (
            <ChevronDown className='w-4 h-4 text-zinc-500' />
          )}
        </div>
      </button>

      {expanded && isPremium && (
        <div className='px-3 pb-3 pt-0 border-t border-zinc-800/50 space-y-3'>
          <div className='mt-3'>
            <p className='text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1'>
              <Sparkles className='w-3 h-3' />
              Emotional Tone
            </p>
            <p className='text-xs text-zinc-300'>{transit.emotionalTone}</p>
          </div>

          {transit.suggestedActions.length > 0 && (
            <div>
              <p className='text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1'>
                <TrendingUp className='w-3 h-3' />
                Suggested Actions
              </p>
              <ul className='space-y-1'>
                {transit.suggestedActions.map((action, i) => (
                  <li
                    key={i}
                    className='text-xs text-zinc-400 flex items-start gap-2'
                  >
                    <span className='text-lunary-primary-400'>•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {transit.watchFor.length > 0 && (
            <div>
              <p className='text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1'>
                <AlertCircle className='w-3 h-3' />
                Watch For
              </p>
              <ul className='space-y-1'>
                {transit.watchFor.map((item, i) => (
                  <li
                    key={i}
                    className='text-xs text-zinc-400 flex items-start gap-2'
                  >
                    <span className='text-amber-400'>•</span>
                    {item}
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

export function TransitImpact({
  transits,
  className = '',
}: TransitImpactProps) {
  const { isSubscribed } = useSubscription();
  const [expandedTransit, setExpandedTransit] = useState<string | null>(null);

  if (transits.length === 0) {
    return null;
  }

  const displayTransits = isSubscribed ? transits : transits.slice(0, 1);

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className='text-sm font-medium text-zinc-100 flex items-center gap-2'>
        <TrendingUp className='w-4 h-4 text-lunary-primary-400' />
        Transits for You
      </h3>

      <div className='space-y-2'>
        {displayTransits.map((transit) => (
          <TransitCard
            key={transit.transitName}
            transit={transit}
            expanded={expandedTransit === transit.transitName}
            onToggle={() =>
              setExpandedTransit(
                expandedTransit === transit.transitName
                  ? null
                  : transit.transitName,
              )
            }
            isPremium={isSubscribed}
          />
        ))}
      </div>

      {!isSubscribed && transits.length > 1 && (
        <div className='pt-2'>
          <p className='text-xs text-zinc-400'>
            <a
              href='/pricing?nav=app'
              className='text-lunary-primary-400 hover:text-lunary-primary-300'
            >
              Upgrade to Lunary+
            </a>{' '}
            for full transit breakdowns with actions and insights.
          </p>
        </div>
      )}
    </div>
  );
}

export function generateTransitImpacts(
  personalTransitImpacts: Array<{
    transit: { name: string };
    description: string;
    intensity: number;
  }>,
): TransitImpactData[] {
  return personalTransitImpacts.slice(0, 5).map((impact) => {
    const intensityLevel: 'low' | 'medium' | 'high' =
      impact.intensity >= 0.7
        ? 'high'
        : impact.intensity >= 0.4
          ? 'medium'
          : 'low';

    return {
      transitName: impact.transit.name,
      description: impact.description,
      emotionalTone: getEmotionalTone(impact.transit.name),
      suggestedActions: getSuggestedActions(impact.transit.name),
      watchFor: getWatchFor(impact.transit.name),
      intensity: intensityLevel,
    };
  });
}

function getEmotionalTone(transitName: string): string {
  const tones: Record<string, string> = {
    Sun: 'Confident and vital, with a focus on self-expression.',
    Moon: 'Emotionally attuned, with heightened sensitivity.',
    Mercury: 'Mentally active, favoring communication and learning.',
    Venus: 'Harmonious and pleasure-seeking, oriented toward beauty.',
    Mars: 'Energized and assertive, sometimes impatient.',
    Jupiter: 'Optimistic and expansive, seeking growth.',
    Saturn: 'Serious and structured, focused on responsibility.',
    Uranus: 'Restless and innovative, craving change.',
    Neptune: 'Dreamy and intuitive, potentially confused.',
    Pluto: 'Intense and transformative, uncovering depths.',
  };

  for (const [planet, tone] of Object.entries(tones)) {
    if (transitName.toLowerCase().includes(planet.toLowerCase())) {
      return tone;
    }
  }
  return 'A blend of energies inviting awareness and adaptation.';
}

function getSuggestedActions(transitName: string): string[] {
  const actions: Record<string, string[]> = {
    Sun: [
      'Express yourself authentically',
      'Take initiative on a personal project',
    ],
    Moon: ['Honor your emotional needs', 'Connect with loved ones'],
    Mercury: [
      'Communicate clearly',
      'Journal your thoughts',
      'Learn something new',
    ],
    Venus: ['Appreciate beauty', 'Nurture relationships', 'Practice self-care'],
    Mars: [
      'Channel energy into exercise',
      'Take decisive action',
      'Set boundaries',
    ],
    Jupiter: ['Expand your horizons', 'Take a calculated risk', 'Be generous'],
    Saturn: [
      'Focus on long-term goals',
      'Take responsibility',
      'Build structure',
    ],
    Uranus: [
      'Embrace change',
      'Try something unconventional',
      'Question assumptions',
    ],
    Neptune: [
      'Trust your intuition',
      'Engage in creative or spiritual practices',
    ],
    Pluto: [
      'Face what needs transforming',
      'Release what no longer serves you',
    ],
  };

  for (const [planet, actionList] of Object.entries(actions)) {
    if (transitName.toLowerCase().includes(planet.toLowerCase())) {
      return actionList;
    }
  }
  return ['Stay present and aware', 'Trust the process'];
}

function getWatchFor(transitName: string): string[] {
  const warnings: Record<string, string[]> = {
    Mars: ['Impulsive reactions', 'Unnecessary conflicts'],
    Saturn: ['Excessive self-criticism', 'Rigidity'],
    Mercury: ['Miscommunication', 'Overthinking'],
    Neptune: ['Confusion or escapism', 'Idealizing situations'],
    Pluto: ['Power struggles', 'Obsessive tendencies'],
    Uranus: ['Disruption to routine', 'Rash decisions'],
  };

  for (const [planet, warningList] of Object.entries(warnings)) {
    if (transitName.toLowerCase().includes(planet.toLowerCase())) {
      return warningList;
    }
  }
  return [];
}
