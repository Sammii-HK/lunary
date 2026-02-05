'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Moon } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { getCosmicContextForDate } from '@/lib/cosmic/cosmic-context-utils';

interface HoroscopeRitualForDayProps {
  sunSign: string;
  moonPhase: string;
  dailyAffirmation?: string;
  className?: string;
}

interface Ritual {
  title: string;
  oneLine: string;
  intention: string;
  timing: string;
  tools: string[];
  steps: string[];
  affirmation: string;
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

type ElementToolsAndSteps = {
  tools: string[];
  steps: string[];
};

const ELEMENT_FLAVOR: Record<string, ElementToolsAndSteps> = {
  fire: {
    tools: ['A candle (orange or red)', 'Cinnamon or ginger incense'],
    steps: [
      'Light your candle and focus on its flame.',
      'Move your body — stretch, dance, or do a brief power pose to activate your fire energy.',
    ],
  },
  earth: {
    tools: ['A crystal (citrine or smoky quartz)', 'A small plant or soil'],
    steps: [
      'Place your bare feet on the ground and take three deep breaths.',
      'Hold your crystal and feel its weight — let it anchor your intention into the physical world.',
    ],
  },
  air: {
    tools: ['Incense or sage', 'A feather or small fan'],
    steps: [
      'Light your incense and let the smoke carry stale energy away.',
      'Practice three rounds of box breathing (inhale 4, hold 4, exhale 4, hold 4) to clear the mind.',
    ],
  },
  water: {
    tools: ['A bowl of clean water', 'Sea salt or moon water'],
    steps: [
      'Hold the bowl of water and whisper your intention into it.',
      'Gently wash your hands or face, visualizing old energy being released.',
    ],
  },
};

const MOON_PHASE_RITUALS: Record<string, Omit<Ritual, 'tools' | 'steps'>> = {
  newMoon: {
    title: 'New Moon Intentions Ritual',
    oneLine:
      'Plant seeds of intention under the dark moon to invite fresh beginnings.',
    intention:
      'To set clear intentions for the new lunar cycle and invite new possibilities.',
    timing: 'Tonight or within 48 hours of the new moon.',
    affirmation: 'I plant seeds with trust. New beginnings unfold with grace.',
  },
  waxingCrescent: {
    title: 'Waxing Crescent Action Ritual',
    oneLine:
      'Build momentum on your intentions with a first courageous step forward.',
    intention:
      'To take the first tangible action toward your new moon intentions.',
    timing: 'Morning, when energy is rising.',
    affirmation:
      'I move forward with courage. Each small step builds my momentum.',
  },
  firstQuarter: {
    title: 'First Quarter Decision Ritual',
    oneLine:
      'Face a crossroads with clarity and commit to the path that calls you.',
    intention:
      'To gain clarity on a decision and commit to moving through obstacles.',
    timing: 'Midday, when the sun is strong.',
    affirmation: 'I choose with confidence. Challenges sharpen my resolve.',
  },
  waxingGibbous: {
    title: 'Waxing Gibbous Refinement Ritual',
    oneLine:
      'Fine-tune your approach and trust that patience will be rewarded.',
    intention:
      'To review progress, adjust your approach, and recommit with patience.',
    timing: 'Evening, as a moment of calm review.',
    affirmation: 'I refine with patience. My dedication brings results closer.',
  },
  fullMoon: {
    title: 'Full Moon Release Ritual',
    oneLine:
      'Release what no longer serves you and celebrate how far you have come.',
    intention:
      'To release stagnant energy, celebrate achievements, and express gratitude.',
    timing: 'Tonight, under the full moon if possible.',
    affirmation: 'I release with gratitude. I celebrate all I have become.',
  },
  waningGibbous: {
    title: 'Waning Gibbous Sharing Ritual',
    oneLine:
      'Share a lesson or kindness with someone — what you give returns to you.',
    intention:
      'To share wisdom from your experience and give back with a grateful heart.',
    timing: 'Afternoon, during a moment of connection.',
    affirmation: 'I share my light freely. Generosity enriches my soul.',
  },
  lastQuarter: {
    title: 'Last Quarter Letting Go Ritual',
    oneLine: 'Write down what you are ready to leave behind and surrender it.',
    intention:
      'To consciously let go of habits, thoughts, or situations that no longer serve your growth.',
    timing: 'Late evening, as the day winds down.',
    affirmation: 'I let go with love. Space opens for what is meant for me.',
  },
  waningCrescent: {
    title: 'Waning Crescent Rest Ritual',
    oneLine: 'Honor the quiet before the new cycle — rest is a form of wisdom.',
    intention:
      'To rest deeply, reflect on the full cycle, and prepare for renewal.',
    timing: 'Before bed, as part of a winding-down routine.',
    affirmation:
      'I rest without guilt. Stillness prepares me for what comes next.',
  },
};

function buildRitual(
  moonPhaseKey: string,
  element: string,
  dailyAffirmation?: string,
): Ritual {
  const phaseRitual =
    MOON_PHASE_RITUALS[moonPhaseKey] || MOON_PHASE_RITUALS.fullMoon;
  const elementFlavor = ELEMENT_FLAVOR[element] || ELEMENT_FLAVOR.water;

  const baseTools = ['A journal and pen', ...elementFlavor.tools];
  const baseSteps = [
    'Find a quiet space and take three slow, centering breaths.',
    ...elementFlavor.steps,
    'Write down your intention for this ritual in your journal.',
    'Sit quietly for a few minutes, letting the energy settle.',
    'Close by reading your affirmation aloud.',
  ];

  return {
    ...phaseRitual,
    tools: baseTools,
    steps: baseSteps,
    affirmation: dailyAffirmation || phaseRitual.affirmation,
  };
}

export function HoroscopeRitualForDay({
  sunSign,
  moonPhase,
  dailyAffirmation,
  className = '',
}: HoroscopeRitualForDayProps) {
  const subscription = useSubscription();
  const hasPaidAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const cosmicContext = useMemo(() => getCosmicContextForDate(new Date()), []);

  const ritual = useMemo(() => {
    const element = ELEMENT_MAP[sunSign] || 'water';
    return buildRitual(
      cosmicContext.moonPhase.phase,
      element,
      dailyAffirmation,
    );
  }, [sunSign, cosmicContext, dailyAffirmation]);

  return (
    <div
      className={`rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/30 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-lunary-secondary-900/30'>
            <Moon className='w-4 h-4 text-lunary-secondary-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-zinc-100'>{ritual.title}</p>
            <p className='text-xs text-zinc-400'>
              Today&apos;s moon-timed ritual
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
            {ritual.oneLine}
          </p>

          {hasPaidAccess ? (
            <div className='space-y-3'>
              <div>
                <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                  Intention
                </p>
                <p className='text-sm text-zinc-300'>{ritual.intention}</p>
              </div>

              <div>
                <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                  Best Timing
                </p>
                <p className='text-sm text-zinc-300'>{ritual.timing}</p>
              </div>

              <div>
                <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                  Tools
                </p>
                <ul className='space-y-1'>
                  {ritual.tools.map((tool, i) => (
                    <li
                      key={i}
                      className='text-sm text-zinc-300 flex items-start gap-2'
                    >
                      <span className='text-lunary-secondary-400 mt-0.5'>
                        •
                      </span>
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                  Steps
                </p>
                <ol className='space-y-2'>
                  {ritual.steps.map((step, i) => (
                    <li
                      key={i}
                      className='text-sm text-zinc-300 flex items-start gap-2'
                    >
                      <span className='text-lunary-secondary-400 font-medium min-w-[1.5rem]'>
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className='pt-3 border-t border-zinc-800/50'>
                <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                  Affirmation
                </p>
                <p className='text-sm text-lunary-secondary-300 italic'>
                  &ldquo;{ritual.affirmation}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <p className='text-xs text-zinc-500'>
              Upgrade for full ritual steps, tools, timing, and affirmation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
