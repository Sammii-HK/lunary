'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Moon } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import type { TrendAnalysis } from '../../../utils/tarot/improvedTarot';

interface Ritual {
  title: string;
  oneLine: string;
  intention: string;
  timing: string;
  tools: string[];
  steps: string[];
  affirmation: string;
}

interface TarotRitualForPatternsProps {
  trendAnalysis: TrendAnalysis | null;
  className?: string;
}

const SUIT_RITUALS: Record<string, Ritual> = {
  Cups: {
    title: 'Water Blessing Ritual',
    oneLine:
      'Honor your emotional journey with a water-based cleansing ritual.',
    intention: 'To cleanse, heal, and open the heart to deeper emotional flow.',
    timing: 'Best performed during a waning or full moon, or on a Monday.',
    tools: [
      'A bowl of clean water',
      'Sea salt or moon water',
      'A blue or silver candle',
      'Optional: rose petals or lavender',
    ],
    steps: [
      'Create sacred space by dimming lights and lighting your candle.',
      'Hold the bowl of water and speak your intention for emotional healing.',
      'Add a pinch of salt to the water, visualizing it absorbing any stagnant emotions.',
      'Gently wash your hands or face with the water, imagining old feelings being released.',
      'Pour the water outside or down the drain, thanking it for carrying away what no longer serves you.',
      'Sit quietly and feel the openness in your heart.',
    ],
    affirmation: 'I flow with my emotions. I trust the wisdom of my heart.',
  },
  Wands: {
    title: 'Fire Activation Ritual',
    oneLine: 'Ignite your creative power and call in passionate energy.',
    intention: 'To spark creativity, motivation, and passionate action.',
    timing: 'Best performed during a waxing moon, on a Tuesday or Sunday.',
    tools: [
      'An orange or red candle',
      'Cinnamon or ginger (optional)',
      'Paper and pen',
      'A fireproof dish',
    ],
    steps: [
      'Write down what you want to activate or create on a small piece of paper.',
      'Light your candle and focus on the flame, feeling its warmth and energy.',
      'Read your intention aloud with conviction.',
      'Carefully burn the paper in the flame, releasing your intention to the fire element.',
      'As it burns, visualize your creative energy building and expanding.',
      'Let the candle burn for at least a few minutes while you sit with the energy.',
    ],
    affirmation:
      'My creative fire burns bright. I take inspired action with courage.',
  },
  Swords: {
    title: 'Air Clarity Ritual',
    oneLine: 'Clear mental fog and invite sharp insight.',
    intention: 'To clear the mind, gain clarity, and cut through confusion.',
    timing: 'Best performed during a new moon or waning moon, on a Wednesday.',
    tools: [
      'Incense or sage',
      'A white or yellow candle',
      'A journal',
      'Optional: a small fan or feather',
    ],
    steps: [
      'Open a window to invite fresh air into your space.',
      'Light your incense and let the smoke fill the room, symbolizing the air element.',
      'Wave the smoke around your head and body, clearing stagnant thoughts.',
      'Light your candle and sit before it, taking three deep breaths.',
      'In your journal, write down any confusion or questions you hold.',
      'Close your eyes and ask for clarity. Sit quietly and notice what arises.',
      'Write down any insights that come.',
    ],
    affirmation: 'My mind is clear and sharp. I see truth with ease.',
  },
  Pentacles: {
    title: 'Earth Grounding Ritual',
    oneLine: 'Root yourself in stability and call in abundance.',
    intention:
      'To ground your energy, attract abundance, and build solid foundations.',
    timing:
      'Best performed during a new or waxing moon, on a Friday or Saturday.',
    tools: [
      'A green or brown candle',
      'Coins or crystals (citrine, green aventurine)',
      'A small plant or soil',
      'Salt',
    ],
    steps: [
      'Place your feet flat on the ground and take three deep breaths.',
      'Create a small circle of salt around your candle and coins/crystals.',
      'Light the candle and hold a coin or crystal in your hands.',
      'Speak aloud what you are building or what abundance you are calling in.',
      'Bury the coin or crystal in soil (or place it with a plant) as a seed of intention.',
      'Sit with hands on the earth or floor, feeling your connection to stability.',
    ],
    affirmation: 'I am grounded and abundant. I build with patience and trust.',
  },
};

const DEFAULT_RITUAL: Ritual = {
  title: 'Integration Ritual',
  oneLine: 'Weave together the lessons from your recent readings.',
  intention: 'To integrate and honor the messages from your tarot practice.',
  timing:
    'Any time, especially during liminal moments (dawn, dusk, moon transitions).',
  tools: ['Your tarot deck', 'A candle', 'Your journal'],
  steps: [
    'Shuffle your deck while reflecting on recent readings.',
    'Draw a single card as a message of integration.',
    'Light your candle and journal about what patterns you have noticed.',
    'Write a commitment to yourself based on what the cards have shown.',
    'Thank your deck for its guidance.',
  ],
  affirmation:
    'I receive and integrate cosmic wisdom. My practice deepens with each reading.',
};

export function TarotRitualForPatterns({
  trendAnalysis,
  className = '',
}: TarotRitualForPatternsProps) {
  const subscription = useSubscription();
  const isPremium = hasBirthChartAccess(subscription.status, subscription.plan);
  const [isExpanded, setIsExpanded] = useState(false);

  const ritual = useMemo(() => {
    if (!trendAnalysis) return DEFAULT_RITUAL;

    const topSuit = trendAnalysis.suitPatterns[0];
    if (topSuit && SUIT_RITUALS[topSuit.suit]) {
      return SUIT_RITUALS[topSuit.suit];
    }

    return DEFAULT_RITUAL;
  }, [trendAnalysis]);

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
            <p className='text-xs text-zinc-400'>Ritual for your patterns</p>
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

          {isPremium ? (
            <>
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
                    "{ritual.affirmation}"
                  </p>
                </div>
              </div>
            </>
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
