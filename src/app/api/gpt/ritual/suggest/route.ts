import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RitualSuggestion {
  title: string;
  summary: string;
  steps: string[];
  durationMinutes: number;
  tools: string[];
  moonPhaseIdeal?: string[];
}

const RITUAL_DATABASE: Record<string, RitualSuggestion[]> = {
  'self-trust': [
    {
      title: 'Mirror Affirmation Ritual',
      summary:
        'A simple ritual to rebuild trust in your inner voice and reconnect with your authentic self.',
      steps: [
        'Find a quiet space with a mirror and light a candle.',
        'Look into your own eyes and take three deep breaths.',
        'Speak aloud: "I trust myself. My intuition guides me wisely."',
        'List three recent decisions that turned out well.',
        'Thank your inner wisdom and extinguish the candle.',
      ],
      durationMinutes: 15,
      tools: ['candle', 'mirror'],
      moonPhaseIdeal: ['Waxing Crescent', 'First Quarter'],
    },
    {
      title: 'Firelight Promise Ritual',
      summary:
        'A candle ritual to recommit to your own voice and honor your inner knowing.',
      steps: [
        'Light a single candle and sit somewhere quiet.',
        "Write down one way you've doubted yourself recently.",
        'Rewrite it as a promise to your future self.',
        'Read it aloud three times, then fold the paper towards you.',
        'Keep the paper or burn it safely to release the doubt.',
      ],
      durationMinutes: 20,
      tools: ['candle', 'paper', 'pen'],
    },
  ],
  abundance: [
    {
      title: 'Abundance Bowl Ritual',
      summary:
        'Create a physical representation of the abundance you wish to attract.',
      steps: [
        'Gather a bowl and items representing abundance (coins, seeds, green crystals).',
        'Cleanse the space with smoke or visualization.',
        'Place each item in the bowl while naming what it represents.',
        'Hold the bowl and visualize abundance flowing to you.',
        "Place the bowl where you'll see it daily.",
      ],
      durationMinutes: 20,
      tools: ['bowl', 'coins or seeds', 'green candle (optional)'],
      moonPhaseIdeal: ['Waxing Gibbous', 'Full Moon'],
    },
  ],
  protection: [
    {
      title: 'Salt Circle Protection',
      summary:
        'A grounding protection ritual using salt to create energetic boundaries.',
      steps: [
        'Gather salt (sea salt or black salt works well).',
        'Stand in your space and set your intention for protection.',
        "Sprinkle salt in a circle around yourself or your home's perimeter.",
        'As you do so, say: "I am protected. Only love may enter here."',
        'Leave the salt overnight, then sweep it away.',
      ],
      durationMinutes: 15,
      tools: ['salt', 'broom'],
      moonPhaseIdeal: ['Waning Moon', 'New Moon'],
    },
  ],
  release: [
    {
      title: 'Full Moon Release Ceremony',
      summary:
        'Let go of what no longer serves you under the illuminating Full Moon.',
      steps: [
        'Write down what you wish to release on paper.',
        'Read each item aloud, acknowledging its presence.',
        'Safely burn the paper in a fire-safe container.',
        'Visualize the energy leaving your body as smoke rises.',
        'End with gratitude for the lessons learned.',
      ],
      durationMinutes: 25,
      tools: ['paper', 'pen', 'fire-safe container', 'lighter'],
      moonPhaseIdeal: ['Full Moon', 'Waning Gibbous'],
    },
  ],
  love: [
    {
      title: 'Self-Love Rose Ritual',
      summary:
        'A gentle ritual to cultivate love for yourself before seeking it elsewhere.',
      steps: [
        'Prepare a warm bath or foot soak with rose petals.',
        'Light a pink or red candle.',
        'As you soak, repeat: "I am worthy of love. I love myself fully."',
        'Visualize pink light surrounding your heart.',
        'When finished, thank yourself for this time.',
      ],
      durationMinutes: 30,
      tools: ['rose petals', 'pink candle', 'bath or basin'],
      moonPhaseIdeal: ['Waxing Moon', 'Full Moon'],
    },
  ],
  clarity: [
    {
      title: 'Smoke Clearing Ritual',
      summary: 'Clear mental fog and invite clarity through sacred smoke.',
      steps: [
        'Light your chosen herb (rosemary, cedar, or sage).',
        'Set your intention: "I release confusion and welcome clarity."',
        'Let the smoke drift around your head and third eye area.',
        'Take slow, deep breaths and let thoughts settle.',
        'Journal any insights that arise.',
      ],
      durationMinutes: 15,
      tools: ['dried herbs', 'fire-safe dish', 'journal'],
      moonPhaseIdeal: ['First Quarter', 'Full Moon'],
    },
  ],
};

const DEFAULT_RITUALS: RitualSuggestion[] = [
  {
    title: 'Simple Grounding Ritual',
    summary:
      'A quick way to center yourself and connect with the present moment.',
    steps: [
      'Stand barefoot on the ground if possible.',
      'Take five deep breaths, counting each one.',
      'Visualize roots growing from your feet into the earth.',
      'Feel supported and stable.',
      'Set one simple intention for the day.',
    ],
    durationMinutes: 10,
    tools: [],
  },
];

function findBestRitual(
  intent: string,
  experienceLevel?: string,
  moonPhase?: string,
): RitualSuggestion {
  const normalizedIntent = intent.toLowerCase();

  for (const [key, rituals] of Object.entries(RITUAL_DATABASE)) {
    if (normalizedIntent.includes(key) || key.includes(normalizedIntent)) {
      let selectedRituals = rituals;

      if (moonPhase) {
        const phaseMatches = rituals.filter((r) =>
          r.moonPhaseIdeal?.some((p) =>
            p.toLowerCase().includes(moonPhase.toLowerCase()),
          ),
        );
        if (phaseMatches.length > 0) {
          selectedRituals = phaseMatches;
        }
      }

      if (experienceLevel === 'beginner') {
        selectedRituals = selectedRituals.filter(
          (r) => r.durationMinutes <= 20,
        );
        if (selectedRituals.length === 0) selectedRituals = rituals;
      }

      return selectedRituals[
        Math.floor(Math.random() * selectedRituals.length)
      ];
    }
  }

  return DEFAULT_RITUALS[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent, experienceLevel, context } = body;

    if (!intent) {
      return NextResponse.json(
        { error: 'intent is required' },
        { status: 400 },
      );
    }

    const ritual = findBestRitual(intent, experienceLevel, context?.moonPhase);

    const response = {
      title: ritual.title,
      summary: ritual.summary,
      steps: ritual.steps,
      durationMinutes: ritual.durationMinutes,
      tools: ritual.tools,
      ...(ritual.moonPhaseIdeal && { bestMoonPhases: ritual.moonPhaseIdeal }),
      intent,
      ctaUrl: 'https://lunary.app/grimoire/practices?from=gpt_ritual_suggest',
      ctaText: 'Explore more rituals and spells in the Lunary Grimoire',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GPT ritual/suggest error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest ritual' },
      { status: 500 },
    );
  }
}
