import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { stringToKebabCase } from '../../../../../utils/string';

export async function generateStaticParams() {
  return wheelOfTheYearSabbats.map((sabbat) => ({
    sabbat: stringToKebabCase(sabbat.name),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sabbat: string }>;
}): Promise<Metadata> {
  const { sabbat } = await params;
  const sabbatData = wheelOfTheYearSabbats.find(
    (s) => stringToKebabCase(s.name) === sabbat.toLowerCase(),
  );

  if (!sabbatData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${sabbatData.name}: Meaning, Rituals & Traditions - Lunary`;
  const description = `Discover ${sabbatData.name} (${sabbatData.date}). Learn about this sabbat's meaning, rituals, traditions, and how to celebrate the Wheel of the Year.`;

  return {
    title,
    description,
    keywords: [
      sabbatData.name.toLowerCase(),
      `${sabbatData.name.toLowerCase()} sabbat`,
      `${sabbatData.name.toLowerCase()} rituals`,
      `${sabbatData.name.toLowerCase()} meaning`,
      'wheel of the year',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/wheel-of-the-year/${sabbat}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/wheel-of-the-year',
          width: 1200,
          height: 630,
          alt: sabbatData.name,
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
      canonical: `https://lunary.app/grimoire/wheel-of-the-year/${sabbat}`,
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

export default async function SabbatPage({
  params,
}: {
  params: Promise<{ sabbat: string }>;
}) {
  const { sabbat } = await params;
  const sabbatData = wheelOfTheYearSabbats.find(
    (s) => stringToKebabCase(s.name) === sabbat.toLowerCase(),
  );

  if (!sabbatData) {
    notFound();
  }

  const faqs = [
    {
      question: `When is ${sabbatData.name}?`,
      answer: `${sabbatData.name} (pronounced "${sabbatData.pronunciation}") is celebrated on ${sabbatData.date}. It is a ${sabbatData.dateType === 'astronomical' ? `${sabbatData.astronomicalEvent}` : 'fixed date'} sabbat.`,
    },
    {
      question: `What is ${sabbatData.name}?`,
      answer: `${sabbatData.name} is one of the eight sabbats on the Wheel of the Year. ${sabbatData.description}`,
    },
    {
      question: `How do you celebrate ${sabbatData.name}?`,
      answer: `Celebrate ${sabbatData.name} through traditions like ${sabbatData.traditions.slice(0, 3).join(', ').toLowerCase()}. Rituals include ${sabbatData.rituals.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What are the correspondences for ${sabbatData.name}?`,
      answer: `${sabbatData.name} is associated with the ${sabbatData.element} element, colors ${sabbatData.colors.slice(0, 3).join(', ')}, crystals like ${sabbatData.crystals.slice(0, 3).join(', ')}, and herbs including ${sabbatData.herbs.slice(0, 3).join(', ')}.`,
    },
    {
      question: `What is the spiritual meaning of ${sabbatData.name}?`,
      answer: sabbatData.spiritualMeaning,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${sabbatData.name} - Lunary`}
        h1={`${sabbatData.name}: Complete Guide`}
        description={`Discover ${sabbatData.name} (${sabbatData.date}). Learn about this sabbat's meaning, rituals, and traditions.`}
        keywords={[
          sabbatData.name.toLowerCase(),
          `${sabbatData.name.toLowerCase()} sabbat`,
          `${sabbatData.name.toLowerCase()} rituals`,
          'wheel of the year',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/wheel-of-the-year/${sabbat}`}
        intro={`${sabbatData.name} (${sabbatData.pronunciation}) is celebrated on ${sabbatData.date}. Also known as ${sabbatData.alternateNames.slice(0, 2).join(' or ')}, this ${sabbatData.season} sabbat is associated with the ${sabbatData.element} element and marks the ${sabbatData.wheelPosition}.`}
        tldr={`${sabbatData.name} (${sabbatData.date}) celebrates ${sabbatData.keywords.slice(0, 3).join(', ').toLowerCase()}. ${sabbatData.affirmation}`}
        meaning={`${sabbatData.description}

**History:**
${sabbatData.history}

**Spiritual Meaning:**
${sabbatData.spiritualMeaning}

**Keywords:** ${sabbatData.keywords.join(', ')}

**Deities:** ${sabbatData.deities.join(', ')}

**Symbols:** ${sabbatData.symbols.join(', ')}

**Affirmation:** "${sabbatData.affirmation}"`}
        emotionalThemes={sabbatData.keywords}
        howToWorkWith={sabbatData.traditions}
        rituals={sabbatData.rituals}
        tables={[
          {
            title: `${sabbatData.name} Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Date', sabbatData.date],
              ['Wheel Position', sabbatData.wheelPosition],
              ['Element', sabbatData.element],
              ['Colors', sabbatData.colors.join(', ')],
              ['Crystals', sabbatData.crystals.join(', ')],
              ['Herbs', sabbatData.herbs.join(', ')],
              ['Foods', sabbatData.foods.slice(0, 5).join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `How does ${sabbatData.keywords[0].toLowerCase()} manifest in my life right now?`,
          `What traditions from ${sabbatData.name} resonate with me?`,
          `How can I embody: "${sabbatData.affirmation}"?`,
          `What am I harvesting or releasing this ${sabbatData.name}?`,
        ]}
        relatedItems={[
          {
            name: 'Wheel of the Year',
            href: '/grimoire/wheel-of-the-year',
            type: 'Guide',
          },
          { name: 'Moon Phases', href: '/grimoire/moon', type: 'Guide' },
          { name: 'Horoscope', href: '/horoscope', type: 'Daily Reading' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
          {
            label: sabbatData.name,
            href: `/grimoire/wheel-of-the-year/${sabbat}`,
          },
        ]}
        internalLinks={[
          {
            text: 'Wheel of the Year Guide',
            href: '/grimoire/wheel-of-the-year',
          },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Plan your ${sabbatData.name} celebration`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
