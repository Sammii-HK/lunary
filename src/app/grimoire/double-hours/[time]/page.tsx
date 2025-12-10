import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  doubleHours,
  doubleHourKeys,
} from '@/constants/grimoire/clock-numbers-data';

export async function generateStaticParams() {
  return doubleHourKeys.map((time) => ({
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
  const hourData = doubleHours[timeKey as keyof typeof doubleHours];

  if (!hourData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${hourData.time} Double Hour Meaning: Spiritual Significance - Lunary`;
  const description = `Discover the complete meaning of ${hourData.time} double hour. Learn what it means when you see ${hourData.time} on the clock, its spiritual message, love meaning, and guidance.`;

  return {
    title,
    description,
    keywords: [
      `${hourData.time} meaning`,
      `double hour ${hourData.time}`,
      `seeing ${hourData.time}`,
      `${hourData.time} spiritual meaning`,
      'double hours',
      'angel numbers',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/double-hours/${time}`,
      siteName: 'Lunary',
      locale: 'en_US',
      type: 'article',
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/double-hours/${time}`,
    },
  };
}

export default async function DoubleHourPage({
  params,
}: {
  params: Promise<{ time: string }>;
}) {
  const { time } = await params;
  const timeKey = time.replace('-', ':');
  const hourData = doubleHours[timeKey as keyof typeof doubleHours];

  if (!hourData) {
    notFound();
  }

  const faqs = [
    {
      question: `What does ${hourData.time} mean?`,
      answer: `${hourData.time} is a double hour meaning ${hourData.meaning.toLowerCase()}. ${hourData.message}`,
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
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${hourData.time} Double Hour - Lunary`}
        h1={`${hourData.time} Double Hour: Complete Spiritual Guide`}
        description={`Discover the complete meaning of ${hourData.time} double hour. Learn about its spiritual significance, love meaning, and what it means when you see this time.`}
        keywords={[
          `${hourData.time} meaning`,
          `double hour ${hourData.time}`,
          `seeing ${hourData.time}`,
          'double hours',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/double-hours/${time}`}
        intro={`${hourData.name} carries the energy of ${hourData.meaning.toLowerCase()}. ${hourData.message}`}
        tldr={`${hourData.time} means ${hourData.meaning.toLowerCase()}. When you see this double hour, ${hourData.message.toLowerCase()}`}
        meaning={`Double hours are times when the hour and minute are the same number, like ${hourData.time}. These powerful synchronicities are believed to be messages from your guardian angels and the universe, amplifying the energy of the repeated number.

${hourData.spiritualMeaning}

When you repeatedly see ${hourData.time} on clocks, phones, or other displays, pay attention. The universe is sending you a message through this double hour.

**The Message of ${hourData.time}**

${hourData.message}

**In Love:** ${hourData.loveMeaning}

**In Career:** ${hourData.careerMeaning}`}
        emotionalThemes={hourData.keywords}
        howToWorkWith={[
          `When you see ${hourData.time}, pause and take a breath`,
          `Reflect on what you were thinking about at that moment`,
          `Consider the message: ${hourData.meaning.toLowerCase()}`,
          'Keep a journal of when you see this double hour',
          'Express gratitude for the angelic guidance',
        ]}
        journalPrompts={[
          `What was I thinking about when I saw ${hourData.time}?`,
          `How does the message of ${hourData.meaning.toLowerCase()} apply to my life?`,
          `What guidance am I receiving from this double hour?`,
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
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Mirror Hours',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Double Hours', href: '/grimoire/numerology' },
          {
            label: hourData.time,
            href: `/grimoire/double-hours/${time}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          { text: 'Angel Numbers', href: '/grimoire/numerology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Want personalized numerology insights?'
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
