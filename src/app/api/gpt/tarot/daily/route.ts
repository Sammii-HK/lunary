import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAJOR_ARCANA = [
  {
    name: 'The Fool',
    keywords: ['new beginnings', 'innocence', 'spontaneity', 'free spirit'],
  },
  {
    name: 'The Magician',
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'],
  },
  {
    name: 'The High Priestess',
    keywords: [
      'intuition',
      'sacred knowledge',
      'divine feminine',
      'subconscious',
    ],
  },
  {
    name: 'The Empress',
    keywords: ['femininity', 'beauty', 'nature', 'abundance'],
  },
  {
    name: 'The Emperor',
    keywords: ['authority', 'structure', 'control', 'fatherhood'],
  },
  {
    name: 'The Hierophant',
    keywords: ['tradition', 'conformity', 'morality', 'ethics'],
  },
  {
    name: 'The Lovers',
    keywords: ['love', 'harmony', 'relationships', 'values alignment'],
  },
  {
    name: 'The Chariot',
    keywords: ['control', 'willpower', 'success', 'determination'],
  },
  {
    name: 'Strength',
    keywords: ['courage', 'persuasion', 'influence', 'compassion'],
  },
  {
    name: 'The Hermit',
    keywords: ['soul searching', 'introspection', 'guidance', 'inner wisdom'],
  },
  {
    name: 'Wheel of Fortune',
    keywords: ['good luck', 'karma', 'life cycles', 'destiny'],
  },
  {
    name: 'Justice',
    keywords: ['fairness', 'truth', 'cause and effect', 'law'],
  },
  {
    name: 'The Hanged Man',
    keywords: ['pause', 'surrender', 'letting go', 'new perspectives'],
  },
  {
    name: 'Death',
    keywords: ['endings', 'change', 'transformation', 'transition'],
  },
  {
    name: 'Temperance',
    keywords: ['balance', 'moderation', 'patience', 'purpose'],
  },
  {
    name: 'The Devil',
    keywords: ['shadow self', 'attachment', 'addiction', 'restriction'],
  },
  {
    name: 'The Tower',
    keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'],
  },
  { name: 'The Star', keywords: ['hope', 'faith', 'purpose', 'renewal'] },
  {
    name: 'The Moon',
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious'],
  },
  { name: 'The Sun', keywords: ['positivity', 'fun', 'warmth', 'success'] },
  { name: 'Judgement', keywords: ['rebirth', 'inner calling', 'absolution'] },
  {
    name: 'The World',
    keywords: ['completion', 'integration', 'accomplishment', 'travel'],
  },
];

function generateMessage(
  card: (typeof MAJOR_ARCANA)[0],
  focus?: string,
  mood?: string,
): string {
  const baseMessages: Record<string, string> = {
    'The Fool':
      "Today invites you to take a leap of faith. There's magic in the unknown—trust your journey.",
    'The Magician':
      'You have all the tools you need. Channel your energy with intention and watch things manifest.',
    'The High Priestess':
      'Listen to your inner voice today. The answers you seek are already within you.',
    'The Empress':
      'Embrace abundance and creativity. Nurture what matters and let beauty flow through you.',
    'The Emperor':
      'Structure and stability serve you today. Lead with authority and make decisive choices.',
    'The Hierophant':
      'Seek wisdom from trusted sources. Traditional approaches may offer unexpected guidance.',
    'The Lovers':
      'Alignment is key today. Make choices that honor your values and deepen connections.',
    'The Chariot':
      "Victory comes through focused willpower. Stay determined and you'll overcome any obstacle.",
    Strength:
      'Gentle persistence wins today. Lead with compassion and trust your inner strength.',
    'The Hermit':
      'Take time for reflection. Wisdom often comes in moments of solitude.',
    'Wheel of Fortune':
      'Change is in the air. Embrace the cycle and trust that things are aligning.',
    Justice:
      "Truth and fairness guide today's decisions. What you put out returns to you.",
    'The Hanged Man':
      'A shift in perspective changes everything. Sometimes surrender is the wisest action.',
    Death:
      'Something is completing to make room for new. Embrace this transformation.',
    Temperance:
      'Balance and patience bring the best results today. Find your middle ground.',
    'The Devil':
      'Examine what holds you back. Awareness is the first step to freedom.',
    'The Tower':
      "Sudden clarity shakes things loose. What falls away wasn't meant to stay.",
    'The Star':
      'Hope lights your way today. Trust in renewal and stay open to inspiration.',
    'The Moon':
      'Navigate uncertainty with intuition. Not everything needs to be clear right now.',
    'The Sun':
      'Radiant energy surrounds you. Let joy and optimism guide your day.',
    Judgement:
      "An inner calling grows stronger. Listen to what's asking to be reborn in you.",
    'The World':
      "A sense of completion arrives. Celebrate how far you've come before the next cycle.",
  };

  let message =
    baseMessages[card.name] ||
    `${card.name} brings energy of ${card.keywords.join(', ')}.`;

  if (focus === 'career') {
    message +=
      ' In your career, this energy suggests being open to new approaches.';
  } else if (focus === 'love') {
    message +=
      ' In matters of the heart, this speaks to emotional authenticity.';
  } else if (focus === 'growth') {
    message +=
      ' For personal growth, consider what this card reflects about your journey.';
  }

  return message;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { focus, mood } = body;

    const randomIndex = Math.floor(Math.random() * MAJOR_ARCANA.length);
    const selectedCard = MAJOR_ARCANA[randomIndex];

    const upright = Math.random() > 0.3;

    const response = {
      card: {
        name: selectedCard.name,
        arcana: 'Major',
        upright,
        keywords: selectedCard.keywords,
      },
      message: generateMessage(selectedCard, focus, mood),
      spreadType: 'single_daily',
      interpretation: upright
        ? `${selectedCard.name} appears upright, emphasizing ${selectedCard.keywords.slice(0, 2).join(' and ')}.`
        : `${selectedCard.name} reversed suggests examining blocked or internalized ${selectedCard.keywords[0]} energy.`,
      ctaUrl: 'https://lunary.app/tarot?from=gpt_tarot_daily',
      ctaText: 'Get a full personalized tarot reading with pattern analysis',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GPT tarot/daily error:', error);
    return NextResponse.json(
      { error: 'Failed to draw tarot card' },
      { status: 500 },
    );
  }
}
