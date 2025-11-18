import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { retrogradeInfo } from '@/constants/grimoire/seo-data';

const retrogradeKeys = Object.keys(retrogradeInfo);

export async function generateStaticParams() {
  return retrogradeKeys.map((planet) => ({
    planet: planet,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet: string }>;
}): Promise<Metadata> {
  const { planet } = await params;
  const retrogradeData = retrogradeInfo[planet as keyof typeof retrogradeInfo];

  if (!retrogradeData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${retrogradeData.name} Meaning & Dates - Lunary`;
  const description = `Discover everything about ${retrogradeData.name}. Learn about ${retrogradeData.name} frequency (${retrogradeData.frequency}), duration (${retrogradeData.duration}), effects, and what to do during this retrograde period.`;

  return {
    title,
    description,
    keywords: [
      `${retrogradeData.name}`,
      `${retrogradeData.name.toLowerCase()} meaning`,
      `${retrogradeData.name.toLowerCase()} dates`,
      `${retrogradeData.name.toLowerCase()} effects`,
      `when is ${retrogradeData.name.toLowerCase()}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/retrogrades/${planet}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${retrogradeData.name}`,
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
      canonical: `https://lunary.app/grimoire/retrogrades/${planet}`,
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

export default async function RetrogradePage({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;
  const retrogradeData = retrogradeInfo[planet as keyof typeof retrogradeInfo];

  if (!retrogradeData) {
    notFound();
  }

  const faqs = [
    {
      question: `How often does ${retrogradeData.name} occur?`,
      answer: `${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} and lasts ${retrogradeData.duration.toLowerCase()}.`,
    },
    {
      question: `What are the effects of ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, you may experience ${retrogradeData.effects.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What should I do during ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, focus on ${retrogradeData.whatToDo.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What should I avoid during ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, avoid ${retrogradeData.whatToAvoid.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${retrogradeData.name} - Lunary`}
        h1={`${retrogradeData.name}: Complete Guide`}
        description={`Discover everything about ${retrogradeData.name}. Learn about frequency, duration, effects, and how to navigate this retrograde period.`}
        keywords={[
          `${retrogradeData.name}`,
          `${retrogradeData.name.toLowerCase()} meaning`,
          `${retrogradeData.name.toLowerCase()} dates`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/retrogrades/${planet}`}
        intro={`${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} and lasts ${retrogradeData.duration.toLowerCase()}. ${retrogradeData.description}`}
        tldr={`${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} for ${retrogradeData.duration.toLowerCase()}.`}
        meaning={`A retrograde occurs when a planet appears to move backward in the sky from our perspective on Earth. While planets don't actually move backward, this optical illusion creates a powerful astrological influence. ${retrogradeData.name} is one of the most significant retrograde periods.

${retrogradeData.description}

During retrograde periods, the planet's energy turns inward, creating opportunities for reflection, review, and re-evaluation. This is a time to work with internal processes rather than external actions.

Understanding ${retrogradeData.name} helps you navigate this period consciously, making the most of its reflective energy while avoiding common pitfalls.`}
        howToWorkWith={retrogradeData.whatToDo}
        tables={[
          {
            title: `${retrogradeData.name} Overview`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Frequency', retrogradeData.frequency],
              ['Duration', retrogradeData.duration],
              ['Key Effects', retrogradeData.effects.slice(0, 3).join(', ')],
            ],
          },
        ]}
        rituals={[
          `During ${retrogradeData.name}, focus on ${retrogradeData.whatToDo.join(', ').toLowerCase()}. This is a time for internal work and reflection.`,
        ]}
        journalPrompts={[
          `What does ${retrogradeData.name} mean for me?`,
          `What areas need review during this retrograde?`,
          `How can I work with ${retrogradeData.name} energy?`,
          `What should I focus on during this period?`,
        ]}
        relatedItems={[
          {
            name: retrogradeData.name.split(' ')[1] || 'Planets',
            href: `/grimoire/planets/${planet}`,
            type: 'Planet',
          },
          {
            name: 'Birth Chart',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'View Today\'s Horoscope', href: '/horoscope' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
