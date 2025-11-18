import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { stringToKebabCase } from '../../../../../utils/string';

const monthKeys = Object.keys(annualFullMoons);

export async function generateStaticParams() {
  return monthKeys.map((month) => ({
    month: stringToKebabCase(month),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  const monthKey = monthKeys.find(
    (m) => stringToKebabCase(m) === month.toLowerCase(),
  );

  if (!monthKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const moonData = annualFullMoons[monthKey as keyof typeof annualFullMoons];
  const title = `${moonData.name} Full Moon: ${monthKey} Meaning - Lunary`;
  const description = `Discover the complete guide to ${moonData.name} Full Moon in ${monthKey}. Learn about ${moonData.name} meaning, rituals, and how to work with this full moon's energy.`;

  return {
    title,
    description,
    keywords: [
      `${moonData.name} full moon`,
      `${monthKey} full moon`,
      `${moonData.name} meaning`,
      `full moon ${monthKey}`,
      `${moonData.name} rituals`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/full-moons/${month}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${moonData.name} Full Moon`,
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
      canonical: `https://lunary.app/grimoire/full-moons/${month}`,
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

export default async function FullMoonPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const monthKey = monthKeys.find(
    (m) => stringToKebabCase(m) === month.toLowerCase(),
  );

  if (!monthKey) {
    notFound();
  }

  const moonData = annualFullMoons[monthKey as keyof typeof annualFullMoons];

  const faqs = [
    {
      question: `What is the ${moonData.name} Full Moon?`,
      answer: `The ${moonData.name} Full Moon occurs in ${monthKey} and is associated with ${moonData.description.toLowerCase()}`,
    },
    {
      question: `What does ${moonData.name} Full Moon mean?`,
      answer: `${moonData.description}`,
    },
    {
      question: `When does ${moonData.name} Full Moon occur?`,
      answer: `The ${moonData.name} Full Moon occurs in ${monthKey} each year.`,
    },
    {
      question: `What rituals work best for ${moonData.name} Full Moon?`,
      answer: `Rituals for ${moonData.name} Full Moon should focus on ${moonData.description.toLowerCase().split('.')[0]}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${moonData.name} Full Moon - Lunary`}
        h1={`${moonData.name} Full Moon: ${monthKey} Guide`}
        description={`Discover everything about ${moonData.name} Full Moon in ${monthKey}. Learn about its meaning, rituals, and how to work with this full moon's energy.`}
        keywords={[
          `${moonData.name} full moon`,
          `${monthKey} full moon`,
          `${moonData.name} meaning`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/full-moons/${month}`}
        intro={`The ${moonData.name} Full Moon occurs in ${monthKey} each year. ${moonData.description}`}
        tldr={`${moonData.name} Full Moon occurs in ${monthKey} and represents ${moonData.description.toLowerCase().split('.')[0]}.`}
        meaning={`Each month's full moon has a traditional name that reflects the season, nature, and cultural significance of that time of year. The ${moonData.name} Full Moon is the full moon that occurs in ${monthKey}.

${moonData.description}

Full moon names come from various traditions, including Native American, European, and agricultural calendars. These names help us connect with the natural rhythms of the year and understand the unique energy each full moon brings.

The ${moonData.name} Full Moon carries the energy of ${monthKey.toLowerCase()} and offers opportunities for specific types of magical and spiritual work. Understanding this full moon's meaning helps you align your practices with its unique energy.`}
        rituals={[
          `During ${moonData.name} Full Moon, focus on ${moonData.description.toLowerCase().split('.')[0]}. This is an ideal time for rituals that honor this full moon's unique energy.`,
        ]}
        journalPrompts={[
          `What does ${moonData.name} Full Moon mean to me?`,
          `How can I work with ${monthKey} energy?`,
          `What rituals align with ${moonData.name} Full Moon?`,
          `How does this full moon's energy support my goals?`,
        ]}
        relatedItems={[
          {
            name: 'Moon Phases',
            href: '/grimoire/moon-phases/full-moon',
            type: 'Guide',
          },
          {
            name: 'Moon Guide',
            href: '/grimoire/moon',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'View Today\'s Moon Phase', href: '/horoscope' },
          { text: 'Explore Moon Phases', href: '/grimoire/moon' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
