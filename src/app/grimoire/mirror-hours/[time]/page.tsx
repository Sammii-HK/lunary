import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  mirrorHours,
  mirrorHourKeys,
} from '@/constants/grimoire/clock-numbers-data';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

export async function generateStaticParams() {
  return mirrorHourKeys.map((time) => ({
    time: time.replace(':', '-'),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ time: string }>;
}): Promise<Metadata> {
  const { time } = await params;
  const timeKey = time.replace('-', ':');
  const hourData = mirrorHours[timeKey as keyof typeof mirrorHours];

  if (!hourData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${hourData.time} Mirror Hour Meaning: Spiritual Significance - Lunary`;
  const description = `Discover the complete meaning of ${hourData.time} mirror hour. Learn what it means when you see ${hourData.time} on the clock, its spiritual message, love meaning, and guidance.`;

  return {
    title,
    description,
    keywords: [
      `${hourData.time} meaning`,
      `mirror hour ${hourData.time}`,
      `seeing ${hourData.time}`,
      `${hourData.time} spiritual meaning`,
      'mirror hours',
      'angel numbers',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/mirror-hours/${time}`,
      siteName: 'Lunary',
      locale: 'en_US',
      type: 'article',
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/mirror-hours/${time}`,
    },
  };
}

export default async function MirrorHourPage({
  params,
}: {
  params: Promise<{ time: string }>;
}) {
  const { time } = await params;
  const timeKey = time.replace('-', ':');
  const hourData = mirrorHours[timeKey as keyof typeof mirrorHours];

  if (!hourData) {
    notFound();
  }

  const faqs = [
    {
      question: `What does ${hourData.time} mean?`,
      answer: `${hourData.time} is a mirror hour meaning ${hourData.meaning.toLowerCase()}. ${hourData.message}`,
    },
    {
      question: `What does it mean when I see ${hourData.time}?`,
      answer: `When you see ${hourData.time}, it means ${hourData.message.toLowerCase()}`,
    },
    {
      question: `What does ${hourData.time} mean in love?`,
      answer: hourData.loveMeaning,
    },
    {
      question: `What is the spiritual meaning of ${hourData.time}?`,
      answer: hourData.spiritualMeaning,
    },
    {
      question: 'Do I need exact birth time to interpret mirror hours?',
      answer:
        'No. Mirror hours are moment-based synchronicities, not birth chart placements. You can interpret them without exact birth time.',
    },
    {
      question: "What if I don't know my birth time?",
      answer:
        'You can still use mirror hours as guidance. If you want deeper chart-based insight, an approximate time can help, but it is not required.',
    },
  ];

  // Entity schema for Knowledge Graph
  const mirrorHourSchema = createCosmicEntitySchema({
    name: `${hourData.time} Mirror Hour`,
    description: `${hourData.time} mirror hour meaning: ${hourData.spiritualMeaning.slice(0, 120)}...`,
    url: `/grimoire/mirror-hours/${time}`,
    additionalType: 'https://en.wikipedia.org/wiki/Numerology',
    keywords: [
      `${hourData.time} meaning`,
      'mirror hour',
      'angel numbers',
      'clock synchronicity',
      'spiritual signs',
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(mirrorHourSchema)}
      <SEOContentTemplate
        title={`${hourData.time} Mirror Hour - Lunary`}
        h1={`${hourData.time} Mirror Hour: Complete Spiritual Guide`}
        description={`Discover the complete meaning of ${hourData.time} mirror hour. Learn about its spiritual significance, love meaning, and what it means when you see this time.`}
        keywords={[
          `${hourData.time} meaning`,
          `mirror hour ${hourData.time}`,
          `seeing ${hourData.time}`,
          'mirror hours',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/mirror-hours/${time}`}
        intro={`${hourData.name} carries the energy of ${hourData.meaning.toLowerCase()}. ${hourData.message}`}
        tldr={`${hourData.time} means ${hourData.meaning.toLowerCase()}. When you see this mirror hour, ${hourData.message.toLowerCase()}`}
        meaning={`Mirror hours are times when the hour and minute digits mirror each other, like ${hourData.time}. These synchronicities are believed to carry messages from your guardian angels and the universe.

${hourData.spiritualMeaning}

When you repeatedly see ${hourData.time} on clocks, phones, or other displays, it's not a coincidence. The universe is trying to communicate with you through this mirror hour.

**The Message of ${hourData.time}**

${hourData.message}

**In Love:** ${hourData.loveMeaning}

**In Career:** ${hourData.careerMeaning}

**Why You Keep Seeing ${hourData.time}:** This mirror hour shows up when the themes of ${hourData.meaning.toLowerCase()} need your attention. It is a nudge to notice the moment and make a small, aligned choice today.`}
        emotionalThemes={hourData.keywords}
        howToWorkWith={[
          `When you see ${hourData.time}, pause and take a breath`,
          `Reflect on what you were thinking about at that moment`,
          `Consider the message: ${hourData.meaning.toLowerCase()}`,
          'Keep a journal of when you see this mirror hour',
          'Express gratitude for the angelic guidance',
        ]}
        rituals={[
          'Light a candle for two minutes and set one clear intention.',
          `Write one sentence about how ${hourData.meaning.toLowerCase()} can guide your next choice.`,
          'Take one small action today that matches the message.',
        ]}
        journalPrompts={[
          `What was I thinking about when I saw ${hourData.time}?`,
          `How does the message of ${hourData.meaning.toLowerCase()} apply to my life?`,
          `What guidance am I receiving from this mirror hour?`,
          `How can I work with ${hourData.time}'s energy today?`,
        ]}
        relatedItems={[
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Angel Numbers',
            href: '/grimoire/angel-numbers',
            type: 'Guide',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'Guide',
          },
          {
            name: 'Daily Tarot',
            href: '/tarot',
            type: 'Reading',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Mirror Hours', href: '/grimoire/numerology' },
          {
            label: hourData.time,
            href: `/grimoire/mirror-hours/${time}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: 'Angel Numbers', href: '/grimoire/angel-numbers' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Tarot Card of the Day', href: '/tarot' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Want personalized numerology insights?'
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
