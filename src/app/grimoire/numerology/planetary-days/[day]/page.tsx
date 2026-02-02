import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';

// 30-day ISR revalidation
export const revalidate = 2592000;
const dayKeys = Object.keys(correspondencesData.days);
const daySlugToKey: Record<string, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

const dayNumberMapping: Record<string, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 9,
  Wednesday: 5,
  Thursday: 3,
  Friday: 6,
  Saturday: 8,
};

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>;
}): Promise<Metadata> {
  const { day } = await params;
  const dayKey = daySlugToKey[day.toLowerCase()];

  if (!dayKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const dayData =
    correspondencesData.days[dayKey as keyof typeof correspondencesData.days];
  const numerologyNumber = dayNumberMapping[dayKey];

  const title = `${dayKey}'s Planet: ${dayData.planet} Rules This Day | Energy & Meaning`;
  const description = `${dayKey} is ruled by ${dayData.planet}. Discover why this planetary day boosts ${dayData.uses.slice(0, 2).join(' and ').toLowerCase()}. Best activities and rituals for ${dayData.planet}'s day.`;

  return {
    title,
    description,
    keywords: [
      `${dayKey.toLowerCase()} numerology`,
      `${dayData.planet} day`,
      `planetary day ${dayKey.toLowerCase()}`,
      `numerology ${dayKey.toLowerCase()}`,
      `${dayKey.toLowerCase()} magical correspondences`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/numerology/planetary-days/${day}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/numerology',
          width: 1200,
          height: 630,
          alt: `${dayKey} Planetary Day`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/cosmic'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/numerology/planetary-days/${day}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PlanetaryDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  const dayKey = daySlugToKey[day.toLowerCase()];

  if (!dayKey) {
    notFound();
  }

  const dayData =
    correspondencesData.days[dayKey as keyof typeof correspondencesData.days];
  const numerologyNumber = dayNumberMapping[dayKey];

  const faqs = [
    {
      question: `What planet rules ${dayKey}?`,
      answer: `${dayKey} is ruled by ${dayData.planet} and corresponds to the ${dayData.element} element. This planetary influence makes ${dayKey.toLowerCase()} ideal for ${dayData.uses.join(', ').toLowerCase()} activities.`,
    },
    {
      question: `What number is associated with ${dayKey}?`,
      answer: `In numerology, ${dayKey} resonates with the number ${numerologyNumber}. This number's energy combines with ${dayData.planet}'s influence to shape the day's vibrational qualities.`,
    },
    {
      question: `What activities are best for ${dayKey}?`,
      answer: `${dayKey} is ideal for ${dayData.uses.join(', ').toLowerCase()}. The ${dayData.planet} planetary influence and ${dayData.element.toLowerCase()} element energy support these types of activities.`,
    },
    {
      question: `How do planetary days work in numerology?`,
      answer: `Each day of the week is ruled by a planet and carries specific numerological energy. Working with planetary days helps you align activities with cosmic rhythms for optimal results.`,
    },
    {
      question: `Can I still do other activities on ${dayKey}?`,
      answer: `Yes, planetary days provide optimal timing but don't restrict other activities. Use ${dayKey}'s energy as guidance to enhance your work, not as strict rules.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${dayKey}'s Planet: ${dayData.planet} | Energy & Meaning`}
        h1={`${dayKey}: ${dayData.planet}'s Day`}
        description={`${dayKey} is ruled by ${dayData.planet}. Learn why this planetary day boosts ${dayData.uses.slice(0, 2).join(' and ').toLowerCase()}, and discover the best activities for ${dayKey.toLowerCase()}.`}
        keywords={[
          `${dayKey.toLowerCase()} numerology`,
          `${dayData.planet} day`,
          `planetary day ${dayKey.toLowerCase()}`,
          `numerology ${dayKey.toLowerCase()}`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/numerology/planetary-days/${day}`}
        intro={`${dayKey} is ruled by ${dayData.planet} and resonates with the number ${numerologyNumber}. Understanding ${dayKey.toLowerCase()}'s numerological significance helps you align activities with cosmic rhythms for enhanced effectiveness.`}
        tldr={`${dayKey} is ${dayData.planet}'s day, associated with number ${numerologyNumber} and ${dayData.element} energy. Best for ${dayData.uses.slice(0, 2).join(' and ').toLowerCase()}.`}
        meaning={`In numerology and magical traditions, each day of the week is governed by a planetary influence that shapes its energy and optimal uses. ${dayKey} is ruled by ${dayData.planet}, bringing ${dayData.element.toLowerCase()} element energy and specific vibrational qualities.

${dayKey} corresponds to the number ${numerologyNumber} in numerological systems, combining planetary influence with numerical vibration. This creates a unique energetic signature that affects everything from magical timing to daily planning.

The ${dayData.element.toLowerCase()} element associated with ${dayKey} brings ${dayData.correspondences.join(', ').toLowerCase()} qualities. When you align your activities with ${dayKey}'s energy, you work with cosmic forces rather than against them.

Key aspects of ${dayKey}'s energy:
- Ruling Planet: ${dayData.planet}
- Element: ${dayData.element}
- Numerological Number: ${numerologyNumber}
- Correspondences: ${dayData.correspondences.join(', ')}
- Best Uses: ${dayData.uses.join(', ')}

Understanding planetary days helps you optimize timing for important activities, magical work, and personal development. By working with ${dayKey}'s natural energy, you enhance your effectiveness and align with universal rhythms.`}
        emotionalThemes={dayData.correspondences}
        howToWorkWith={[
          `Schedule ${dayData.uses[0]?.toLowerCase() || 'aligned'} activities for ${dayKey.toLowerCase()}`,
          `Work with ${dayData.element.toLowerCase()} element correspondences`,
          `Invoke ${dayData.planet} energy in rituals`,
          `Use number ${numerologyNumber} symbolism`,
          `Wear colors associated with ${dayData.planet}`,
          `Time important ${dayData.uses[1]?.toLowerCase() || 'work'} for ${dayKey.toLowerCase()}`,
        ]}
        tables={[
          {
            title: `${dayKey} Numerology Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Ruling Planet', dayData.planet],
              ['Element', dayData.element],
              ['Numerological Number', String(numerologyNumber)],
              ['Correspondences', dayData.correspondences.join(', ')],
              ['Best Uses', dayData.uses.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `How does ${dayKey}'s energy feel to me?`,
          `What ${dayData.uses[0]?.toLowerCase() || ''} activities can I plan for ${dayKey.toLowerCase()}?`,
          `How can I work with ${dayData.planet} energy?`,
          `What does number ${numerologyNumber} mean in my life?`,
          `How can I honor ${dayKey.toLowerCase()}'s planetary influence?`,
        ]}
        numerology={`Planetary Day: ${dayKey}
Ruling Planet: ${dayData.planet}
Element: ${dayData.element}
Associated Number: ${numerologyNumber}`}
        relatedItems={[
          {
            name: 'Numerology Guide',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: `Core Number ${numerologyNumber}`,
            href: `/grimoire/numerology/core-numbers/${numerologyNumber}`,
            type: 'Core Number',
          },
          {
            name: `${dayKey} Correspondences`,
            href: `/grimoire/correspondences/days/${day}`,
            type: 'Correspondences',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          {
            label: 'Planetary Days',
            href: '/grimoire/numerology/planetary-days',
          },
          {
            label: `${dayKey}`,
            href: `/grimoire/numerology/planetary-days/${day}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore Numerology', href: '/grimoire/numerology' },
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
          { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Discover your personal numerology`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
