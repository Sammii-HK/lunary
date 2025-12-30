import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { angelNumbers } from '@/constants/grimoire/numerology-data';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

const angelNumberKeys = Object.keys(angelNumbers);

export async function generateStaticParams() {
  return angelNumberKeys.map((number) => ({
    number: number,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = angelNumbers[number as keyof typeof angelNumbers];

  if (!numberData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${numberData.name}: Meaning in Love, Career & Manifestation - Lunary`,
    description: `${numberData.name} meaning: spiritual significance, love & twin flame messages, career guidance. What does ${numberData.number} mean? Complete angel number interpretation.`,
    keywords: [
      `${numberData.name} meaning`,
      `${numberData.number} angel number`,
      `seeing ${numberData.number}`,
      `${numberData.number} love meaning`,
      `${numberData.number} twin flame`,
      `${numberData.number} manifestation`,
    ],
    url: `/grimoire/angel-numbers/${number}`,
    ogImagePath: '/api/og/grimoire/angel-numbers',
    ogImageAlt: `${numberData.name} Angel Number`,
  });
}

export default async function AngelNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = angelNumbers[number as keyof typeof angelNumbers];

  if (!numberData) {
    notFound();
  }

  const meaningExtras = `
## Why do you keep seeing ${numberData.number}?

Seeing ${numberData.number} repeatedly is a signal to pay attention. It often shows up when you are moving through a transition or being nudged to notice your timing, habits, or direction. The repetition itself is the message: you are meant to be aware right now, not later.

## When does ${numberData.number} usually appear?

${numberData.number} tends to appear:
- during change or fresh starts
- before a decision that sets a new direction
- during emotional or spiritual shifts that need your attention

## Is ${numberData.number} a yes or no sign?

Generally yes, but not as a prediction. Think of ${numberData.number} as alignment: it is a green light to move forward if the choice feels honest and grounded.

## ${numberData.number} in love

### If you're single
${numberData.number} highlights ${numberData.meaning.toLowerCase()}. Be open to a new connection that feels aligned, not forced.

### If you're in a relationship
Lean into ${numberData.meaning.toLowerCase()} together. Small resets and honest check-ins bring you back into alignment.

### If you're thinking about someone
Check your motives and timing. If it feels aligned, take a simple, direct step.

## What to do when you see ${numberData.number}

- Pause for a beat
- Notice what you were just thinking about
- Take one aligned action today
- Journal a quick prompt: "What shift is ready for me now?"
`;

  const faqs = [
    {
      question: `What does ${numberData.number} mean?`,
      answer: `${numberData.number} is an angel number meaning ${numberData.meaning.toLowerCase()}. ${numberData.description}`,
    },
    {
      question: `What does it mean when I see ${numberData.number}?`,
      answer: `When you see ${numberData.number}, it means ${numberData.message.toLowerCase()}`,
    },
    {
      question: `What does ${numberData.number} mean in love?`,
      answer: `${numberData.loveMeaning}`,
    },
    {
      question: `What does ${numberData.number} mean for my career?`,
      answer: `${numberData.careerMeaning}`,
    },
    {
      question: `What is the spiritual meaning of ${numberData.number}?`,
      answer: `${numberData.spiritualMeaning}`,
    },
  ];

  // Entity schema for Knowledge Graph
  const angelNumberSchema = createCosmicEntitySchema({
    name: numberData.name,
    description: `${numberData.name} spiritual meaning: ${numberData.spiritualMeaning.slice(0, 150)}...`,
    url: `/grimoire/angel-numbers/${number}`,
    additionalType: 'https://en.wikipedia.org/wiki/Angel_number',
    keywords: [
      numberData.name,
      `${numberData.number} meaning`,
      'angel number',
      'spiritual meaning',
      'numerology',
      'divine message',
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(angelNumberSchema)}
      <SEOContentTemplate
        title={`${numberData.name} - Lunary`}
        h1={`${numberData.name}: Complete Spiritual Guide`}
        description={`Discover the complete meaning of ${numberData.name}. Learn about spiritual significance, love meaning, career meaning, and what it means when you see this angel number.`}
        keywords={[
          `${numberData.name}`,
          `angel number ${numberData.number}`,
          `seeing ${numberData.number}`,
          `${numberData.number} meaning`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/angel-numbers/${number}`}
        intro={`${numberData.name} is a powerful angel number that appears when your angels want to communicate with you. ${numberData.description}`}
        tldr={`${numberData.name} means ${numberData.meaning.toLowerCase()}. When you see this number, ${numberData.message.toLowerCase()}`}
        meaning={`Angel numbers are sequences of numbers that carry divine guidance and messages from your angels and the spiritual realm. ${numberData.number} is particularly significant because it carries the energy of ${numberData.meaning.toLowerCase()}.

${numberData.description}

When ${numberData.number} appears repeatedly in your life - on clocks, license plates, receipts, addresses, or anywhere else - it's a sign that your angels are trying to get your attention. This number carries a specific message for you at this moment in your life.

The appearance of ${numberData.number} is not a coincidence. It's a synchronicity, a meaningful coincidence that carries spiritual significance. Your angels use these numbers to communicate because they're a universal language that transcends barriers.

Understanding what ${numberData.number} means helps you interpret the message your angels are sending and take appropriate action in your life.${meaningExtras}`}
        emotionalThemes={numberData.keywords}
        howToWorkWith={[
          `Pay attention when you see ${numberData.number}`,
          `Reflect on ${numberData.meaning.toLowerCase()}`,
          `Trust the message your angels are sending`,
          `Take action aligned with ${numberData.number}'s meaning`,
          `Express gratitude for the guidance`,
        ]}
        journalPrompts={[
          `Where have I been seeing ${numberData.number}?`,
          `What does ${numberData.meaning.toLowerCase()} mean to me right now?`,
          `How can I work with ${numberData.number}'s energy?`,
          `What message are my angels sending me?`,
          `What action should I take based on this guidance?`,
        ]}
        numerology={`Angel Number: ${numberData.number}
Meaning: ${numberData.meaning}
Keywords: ${numberData.keywords.join(', ')}`}
        relatedItems={[
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Life Path Numbers',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          {
            label: numberData.name,
            href: `/grimoire/angel-numbers/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want personalized numerology insights for your life?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
