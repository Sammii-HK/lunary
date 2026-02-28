'use client';

import { useMemo } from 'react';
import { Moon, Flame, Droplets, Wind, Mountain, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { getMoonPhase } from '../../../utils/moon/moonPhases';

interface SuitPattern {
  suit: string;
  count: number;
  reading?: string;
  cards?: Array<{ name: string; count: number }>;
}

interface ArcanaPattern {
  type: string;
  count: number;
  reading?: string;
}

interface TarotRitualForPatternsProps {
  suitPatterns: SuitPattern[];
  arcanaPatterns: ArcanaPattern[];
  dominantThemes: string[];
  period: number | 'year-over-year';
  className?: string;
}

interface Ritual {
  title: string;
  archetype: string;
  element: string;
  icon: React.ReactNode;
  teaser: string;
  intention: string;
  timing: string;
  ingredients: string[];
  steps: string[];
  affirmation: string;
  journalAnchor: string;
}

const SUIT_RITUALS: Record<string, Ritual> = {
  Wands: {
    title: 'Ignite Your Inner Fire',
    archetype: 'Motivation & Courage',
    element: 'Fire',
    icon: <Flame className='w-4 h-4' />,
    teaser: 'A ritual to channel creative fire and bold action.',
    intention:
      'I call forth the courage and creative fire within me. I am ready to act on my passions with clarity and purpose.',
    timing:
      'Best performed during the Waxing Moon, on a Tuesday (Mars day), or when the Sun is high.',
    ingredients: [
      'A red or orange candle',
      'Cinnamon or ginger (dried or essential oil)',
      'Paper and pen',
      "Optional: Carnelian or Tiger's Eye crystal",
    ],
    steps: [
      'Light the candle and take three deep breaths, feeling warmth spread through your body.',
      'Write down one bold action you have been hesitating to take.',
      'Hold the paper near (not in) the flame, feeling its energy. Speak your intention aloud.',
      'Sprinkle cinnamon around the candle as an offering to the fire element.',
      'Close your eyes and visualize yourself taking that bold action with confidence.',
      'When ready, safely extinguish the candle. Keep the paper somewhere you will see it daily.',
    ],
    affirmation:
      'I am fueled by passion and guided by purpose. My creative fire illuminates my path.',
    journalAnchor:
      'What bold action is my inner fire calling me toward? What fears must I release to act?',
  },
  Cups: {
    title: 'Heart Opening Ritual',
    archetype: 'Emotional Healing & Love',
    element: 'Water',
    icon: <Droplets className='w-4 h-4' />,
    teaser: 'A gentle ritual for emotional healing and opening the heart.',
    intention:
      'I open my heart to healing, love, and emotional flow. I release what blocks my ability to receive and give love.',
    timing:
      'Best performed during the Full Moon, on a Monday (Moon day) or Friday (Venus day), or near water.',
    ingredients: [
      'A bowl of water',
      'Rose petals or lavender',
      'A blue or pink candle',
      'Optional: Rose Quartz or Aquamarine crystal',
    ],
    steps: [
      'Fill the bowl with water. Add rose petals or lavender, creating a heart-opening infusion.',
      'Light the candle and place your hands around the bowl, feeling its coolness.',
      'Speak to the water: "I release grief, I welcome love. I release resistance, I welcome flow."',
      'Gently wash your hands in the water, imagining emotional blocks dissolving.',
      'Sit in stillness, placing one hand on your heart. Breathe deeply for several minutes.',
      'Pour the water into the earth (or a plant) as an offering. Extinguish the candle.',
    ],
    affirmation:
      'My heart is open and receptive. Love flows to me and through me effortlessly.',
    journalAnchor:
      'What emotions am I ready to release? What would it feel like to fully open my heart?',
  },
  Swords: {
    title: 'Clarity & Cord Cutting',
    archetype: 'Mental Clarity & Truth',
    element: 'Air',
    icon: <Wind className='w-4 h-4' />,
    teaser: 'A ritual to cut through confusion and embrace clarity.',
    intention:
      'I cut through confusion and illusion. I embrace clarity, truth, and mental peace.',
    timing:
      'Best performed during the Waning Moon, on a Wednesday (Mercury day), or during dawn.',
    ingredients: [
      'A white or yellow candle',
      'A feather or incense (for air element)',
      'Paper and pen',
      'Optional: Clear Quartz or Fluorite crystal',
    ],
    steps: [
      'Light the candle and incense (or hold the feather). Take three cleansing breaths.',
      'Write down what confuses you or what cords you wish to cut (patterns, beliefs, connections).',
      'Hold the paper and speak: "I see clearly now. I release what clouds my mind."',
      'Carefully tear the paper into small pieces, imagining confusion dissolving.',
      'Waft the incense smoke (or feather) over yourself, clearing your energy field.',
      'Sit in silence, focusing on the stillness of a clear mind. Extinguish the candle.',
    ],
    affirmation:
      'My mind is clear and focused. I see truth and speak it with compassion.',
    journalAnchor:
      'What mental patterns or cords am I ready to release? What truth am I now ready to see?',
  },
  Pentacles: {
    title: 'Grounding & Abundance',
    archetype: 'Stability & Manifestation',
    element: 'Earth',
    icon: <Mountain className='w-4 h-4' />,
    teaser: 'A ritual to ground your energy and invite abundance.',
    intention:
      'I ground my energy in the stability of earth. I am worthy of abundance and I create it through steady effort.',
    timing:
      'Best performed during the New Moon, on a Saturday (Saturn day), or while in nature.',
    ingredients: [
      'A green or brown candle',
      'Salt or soil',
      'A coin or seed',
      'Optional: Black Tourmaline or Green Aventurine crystal',
    ],
    steps: [
      'If possible, perform this ritual outdoors. Otherwise, bring earth energy inside with soil or a plant.',
      'Light the candle. Create a small circle of salt around it.',
      'Hold the coin or seed in both hands. Feel its weight and potential.',
      'Speak your intention for stability or abundance—be specific about what you are building.',
      'Bury the seed (or place the coin somewhere meaningful) as a symbol of what you are growing.',
      'Touch the earth (or floor) with both hands, grounding excess energy. Extinguish the candle.',
    ],
    affirmation:
      'I am grounded, stable, and abundant. What I plant with intention, I harvest with gratitude.',
    journalAnchor:
      'What am I building that requires patience? How can I ground myself more fully in daily life?',
  },
  'Major Arcana': {
    title: 'Soul Path Initiation',
    archetype: 'Life Path & Destiny',
    element: 'Spirit',
    icon: <Star className='w-4 h-4' />,
    teaser: "A powerful ritual for connecting with your soul's purpose.",
    intention:
      "I align with my soul's purpose. I welcome the lessons and transformations that guide me toward my highest path.",
    timing:
      'Best performed during significant astrological events, your birthday, or when Major Arcana appear repeatedly.',
    ingredients: [
      'A white or purple candle',
      'Your tarot deck (optional)',
      'Paper and pen',
      'Optional: Amethyst or Labradorite crystal',
    ],
    steps: [
      'Create a sacred space. Light the candle and sit in quiet contemplation.',
      'If using tarot, draw one card to represent guidance for your path. Otherwise, close your eyes and ask for inner guidance.',
      'Write a letter to your future self about the transformation you are undergoing.',
      'Speak aloud: "I honor my journey. I trust the path, even when I cannot see the destination."',
      'Sit in meditation for at least 5 minutes, opening yourself to messages from your higher self.',
      'Seal the letter and keep it somewhere sacred. Extinguish the candle.',
    ],
    affirmation:
      "I walk my soul's path with trust and courage. Every step is guided, even the uncertain ones.",
    journalAnchor:
      'What major life lesson am I currently learning? How is my soul asking me to grow?',
  },
};

function selectRitual(
  suitPatterns: SuitPattern[],
  arcanaPatterns: ArcanaPattern[],
): Ritual {
  const majorArcana = arcanaPatterns.find((a) => a.type === 'Major Arcana');
  const topSuit = suitPatterns[0]?.suit;

  if (majorArcana && majorArcana.count >= 3) {
    return SUIT_RITUALS['Major Arcana'];
  }

  if (topSuit && SUIT_RITUALS[topSuit]) {
    return SUIT_RITUALS[topSuit];
  }

  return SUIT_RITUALS['Major Arcana'];
}

export function TarotRitualForPatterns({
  suitPatterns,
  arcanaPatterns,
  dominantThemes,
  period,
  className = '',
}: TarotRitualForPatternsProps) {
  const { isSubscribed } = useSubscription();

  const ritual = useMemo(
    () => selectRitual(suitPatterns, arcanaPatterns),
    [suitPatterns, arcanaPatterns],
  );

  const moonPhase = useMemo(() => getMoonPhase(new Date()), []);

  if (suitPatterns.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 ${className}`}
    >
      <div className='flex items-center gap-2 mb-3'>
        <div className='w-8 h-8 rounded-full bg-lunary-primary-900/30 border border-lunary-primary-700/30 flex items-center justify-center text-lunary-primary-400'>
          {ritual.icon}
        </div>
        <div>
          <h3 className='text-sm font-medium text-zinc-100'>{ritual.title}</h3>
          <p className='text-xs text-zinc-500'>{ritual.archetype}</p>
        </div>
      </div>

      <p className='text-sm text-zinc-300 mb-3'>{ritual.teaser}</p>

      {isSubscribed ? (
        <div className='space-y-4'>
          <div className='p-3 rounded-lg bg-lunary-primary-950/30 border border-lunary-primary-800/30'>
            <p className='text-xs font-medium text-lunary-primary-300/80 uppercase tracking-wide mb-1'>
              Intention
            </p>
            <p className='text-sm text-zinc-200 italic'>{ritual.intention}</p>
          </div>

          <div>
            <p className='text-xs font-medium text-zinc-400 mb-2 flex items-center gap-2'>
              <Moon className='w-3 h-3' />
              Suggested Timing
            </p>
            <p className='text-xs text-zinc-400'>
              {ritual.timing}
              <span className='text-lunary-primary-400 ml-2'>
                (Current: {moonPhase})
              </span>
            </p>
          </div>

          <div>
            <p className='text-xs font-medium text-zinc-400 mb-2'>
              What You Will Need
            </p>
            <ul className='space-y-1'>
              {ritual.ingredients.map((item, i) => (
                <li
                  key={i}
                  className='text-xs text-zinc-400 flex items-start gap-2'
                >
                  <span className='text-lunary-primary-400'>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className='text-xs font-medium text-zinc-400 mb-2'>
              Ritual Steps
            </p>
            <ol className='space-y-2'>
              {ritual.steps.map((step, i) => (
                <li
                  key={i}
                  className='text-xs text-zinc-300 flex items-start gap-2'
                >
                  <span className='text-lunary-primary-400 shrink-0 w-4'>
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className='p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30'>
            <p className='text-xs font-medium text-zinc-400 mb-1'>
              Affirmation
            </p>
            <p className='text-sm text-lunary-primary-300 italic'>
              "{ritual.affirmation}"
            </p>
          </div>

          <div>
            <p className='text-xs font-medium text-zinc-400 mb-1'>
              Journaling Anchor
            </p>
            <p className='text-xs text-zinc-400 italic'>
              {ritual.journalAnchor}
            </p>
          </div>
        </div>
      ) : (
        <div className='mt-3 pt-3 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-400'>
            <a
              href='/pricing?nav=app'
              className='text-lunary-primary-400 hover:text-lunary-primary-300'
            >
              Upgrade to Lunary+
            </a>{' '}
            for the full ritual with timing, ingredients, and step-by-step
            guidance.
          </p>
        </div>
      )}
    </div>
  );
}
