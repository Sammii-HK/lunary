import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { eclipseInfo } from '@/constants/grimoire/seo-data';
import { createEventSchema, renderJsonLd } from '@/lib/schema';

const eclipseKeys = Object.keys(eclipseInfo);

export async function generateStaticParams() {
  return eclipseKeys.map((type) => ({
    type: type,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const eclipseData = eclipseInfo[type as keyof typeof eclipseInfo];

  if (!eclipseData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${eclipseData.name} Meaning & Effects - Lunary`;
  const description = `Discover the complete guide to ${eclipseData.name}. Learn about ${eclipseData.name} meaning, effects, and how this eclipse influences your life and birth chart.`;

  return {
    title,
    description,
    keywords: [
      `${eclipseData.name}`,
      `${eclipseData.name.toLowerCase()} meaning`,
      `${eclipseData.type}`,
      `${eclipseData.name.toLowerCase()} effects`,
      `${eclipseData.name.toLowerCase()} astrology`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/eclipses/${type}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/eclipses',
          width: 1200,
          height: 630,
          alt: `${eclipseData.name}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/grimoire/eclipses'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/eclipses/${type}`,
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

export default async function EclipsePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const eclipseData = eclipseInfo[type as keyof typeof eclipseInfo];

  if (!eclipseData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is a ${eclipseData.name}?`,
      answer: `A ${eclipseData.name} is a ${eclipseData.type} that occurs when ${type === 'solar' ? 'the Moon passes between the Earth and the Sun' : 'the Earth passes between the Sun and the Moon'}. ${eclipseData.description}`,
    },
    {
      question: `What does ${eclipseData.name} mean?`,
      answer: `${eclipseData.meaning}`,
    },
    {
      question: `What are the effects of ${eclipseData.name}?`,
      answer: `${eclipseData.name} brings ${eclipseData.effects.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `How does ${eclipseData.name} affect my birth chart?`,
      answer: `${eclipseData.name} activates areas of your chart related to ${eclipseData.effects[0]?.toLowerCase() || 'transformation'}.`,
    },
    {
      question: 'Should I manifest during an eclipse?',
      answer:
        'Most astrologers recommend observing rather than manifesting. Eclipse energy is volatile, so it’s better to reflect and wait until it stabilizes.',
    },
  ];

  // Event schema for eclipses - helps appear in Google's event search
  const year = new Date().getFullYear();
  const eclipseSchema = createEventSchema({
    name: `${eclipseData.name} ${year}`,
    description: `${eclipseData.name}: ${eclipseData.description.slice(0, 150)}...`,
    url: `/grimoire/eclipses/${type}`,
    startDate: `${year}-01-01`, // Approximate
    eventType: 'Event',
    keywords: [
      eclipseData.name.toLowerCase(),
      `${type} eclipse ${year}`,
      'eclipse astrology',
      'astronomical event',
      ...eclipseData.effects.slice(0, 2),
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(eclipseSchema)}
      <SEOContentTemplate
        title={`${eclipseData.name} - Lunary`}
        h1={`${eclipseData.name}: Complete Guide`}
        description={`Discover everything about ${eclipseData.name}. Learn about its meaning, effects, and how it influences your life.`}
        keywords={[
          `${eclipseData.name}`,
          `${eclipseData.name.toLowerCase()} meaning`,
          `${eclipseData.type}`,
          `${eclipseData.name.toLowerCase()} effects`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/eclipses/${type}`}
        intro={`A ${eclipseData.name} is a ${eclipseData.type} that brings powerful astrological influences. ${eclipseData.description}`}
        tldr={`${eclipseData.name} is a ${eclipseData.type} meaning ${eclipseData.meaning.toLowerCase()}.`}
        meaning={`Eclipses are powerful astrological events that occur when the Sun, Moon, and Earth align in specific ways. ${eclipseData.name} is a ${eclipseData.type} that brings significant astrological influences.

${eclipseData.description}

${eclipseData.meaning}

Eclipses mark turning points and significant changes in your life. They often bring revelations, endings, and new beginnings. Understanding ${eclipseData.name} helps you navigate these powerful periods consciously and make the most of their transformative energy.

Eclipses occur in cycles, typically in pairs (solar and lunar), and their effects can be felt for months before and after the actual eclipse date.

Eclipse energy moves quickly, so give yourself space to process. The most helpful approach is observation: notice what shifts, then respond with intention once the dust settles.

If you know your birth chart, check which house the eclipse falls in. That house describes the life area being emphasized, such as relationships, work, or home.`}
        emotionalThemes={eclipseData.effects}
        howToWorkWith={[
          `Honor the energy of ${eclipseData.name}`,
          `Focus on ${eclipseData.effects[0]?.toLowerCase() || 'transformation'}`,
          `Be open to ${eclipseData.effects[1]?.toLowerCase() || 'change'}`,
          `Trust the process of ${eclipseData.name}`,
        ]}
        rituals={[
          'Keep your schedule light and prioritize rest.',
          'Write down what is ending and what is beginning.',
          'Do a simple cleansing ritual with water or smoke.',
          'Set an intention to stay open rather than force outcomes.',
        ]}
        journalPrompts={[
          `What does ${eclipseData.name} mean for me?`,
          `What areas of my life need ${eclipseData.effects[0]?.toLowerCase() || 'transformation'}?`,
          `How can I work with ${eclipseData.name} energy?`,
          `What should I release or embrace during this eclipse?`,
        ]}
        tables={[
          {
            title: `${eclipseData.name} Quick Lens`,
            headers: ['Focus', 'Guidance'],
            rows: [
              ['Theme', eclipseData.effects[0] || 'Transformation'],
              ['Best Action', 'Observe, reflect, and simplify'],
              ['Avoid', 'Forcing big decisions under pressure'],
            ],
          },
          {
            title: 'Eclipse Season Timing',
            headers: ['Phase', 'Tip'],
            rows: [
              ['Two weeks before', 'Notice repeating themes'],
              ['Eclipse day', 'Rest and reflect'],
              ['Two weeks after', 'Act on emerging clarity'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Moon Phases',
            href: '/grimoire/moon',
            type: 'Guide',
          },
          {
            name: 'Birth Chart',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon Phases', href: '/grimoire/moon' },
          {
            label: eclipseData.name,
            href: `/grimoire/eclipses/${type}`,
          },
        ]}
        internalLinks={[
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Explore Moon Phases', href: '/grimoire/moon' },
          { text: 'Grimoire Home', href: '/grimoire' },
          { text: 'Lunar Nodes', href: '/grimoire/lunar-nodes' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
