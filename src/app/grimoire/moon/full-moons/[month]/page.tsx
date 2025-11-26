import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';

const monthKeys = Object.keys(annualFullMoons);

export async function generateStaticParams() {
  return monthKeys.map((month) => ({
    month: month.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  const monthKey = monthKeys.find(
    (m) => m.toLowerCase() === month.toLowerCase(),
  );

  if (!monthKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const moonData = annualFullMoons[monthKey as keyof typeof annualFullMoons];
  const title = `${monthKey} ${moonData.name}: Full Moon Meaning & Rituals - Lunary`;
  const description = `Discover the ${monthKey} ${moonData.name} meaning, rituals, and magical correspondences. Learn how to work with this full moon's energy for manifestation and spiritual growth.`;

  return {
    title,
    description,
    keywords: [
      `${monthKey} full moon`,
      `${moonData.name}`,
      `${monthKey} moon meaning`,
      `${moonData.name} rituals`,
      'full moon magic',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/moon/full-moons/${month}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/moon',
          width: 1200,
          height: 630,
          alt: `${monthKey} ${moonData.name}`,
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
      canonical: `https://lunary.app/grimoire/moon/full-moons/${month}`,
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
    (m) => m.toLowerCase() === month.toLowerCase(),
  );

  if (!monthKey) {
    notFound();
  }

  const moonData = annualFullMoons[monthKey as keyof typeof annualFullMoons];

  const faqs = [
    {
      question: `What is the ${monthKey} full moon called?`,
      answer: `The ${monthKey} full moon is traditionally called the ${moonData.name}. ${moonData.description}`,
    },
    {
      question: `What does the ${moonData.name} mean?`,
      answer: `The ${moonData.name} in ${monthKey} ${moonData.description.toLowerCase()}`,
    },
    {
      question: `What rituals should I do during the ${moonData.name}?`,
      answer: `During the ${moonData.name}, focus on rituals aligned with its energy. ${moonData.description}`,
    },
    {
      question: `When is the ${monthKey} full moon?`,
      answer: `The ${monthKey} full moon (${moonData.name}) occurs once per year in ${monthKey}. The exact date varies each year based on the lunar cycle.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${monthKey} ${moonData.name} - Lunary`}
        h1={`${monthKey} Full Moon: The ${moonData.name}`}
        description={`Discover the ${monthKey} ${moonData.name} meaning, rituals, and magical correspondences.`}
        keywords={[
          `${monthKey} full moon`,
          `${moonData.name}`,
          `${monthKey} moon meaning`,
          'full moon rituals',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/moon/full-moons/${month}`}
        intro={`The ${monthKey} full moon is traditionally known as the ${moonData.name}. ${moonData.description}`}
        tldr={`The ${monthKey} ${moonData.name} is perfect for ${moonData.description.split('.')[0].toLowerCase()}.`}
        meaning={`Each month's full moon carries a unique name and energy, passed down through generations of agricultural and spiritual traditions. The ${monthKey} full moon, known as the ${moonData.name}, holds special significance in the wheel of the year.

${moonData.description}

Full moons are powerful times for manifestation, celebration, and release. The ${moonData.name} amplifies these energies with its specific seasonal and spiritual qualities. Working with this full moon helps you align with the natural rhythms of the year.

The names of the monthly full moons come from various traditions, including Native American, Celtic, and medieval European sources. Each name reflects the natural phenomena, agricultural activities, or spiritual themes associated with that time of year.

Understanding the ${moonData.name}'s energy helps you plan meaningful rituals and align your intentions with cosmic forces. Whether you're celebrating achievements, releasing what no longer serves you, or charging crystals and tools, the ${monthKey} full moon provides powerful support.`}
        glyphs={['🌕']}
        emotionalThemes={[
          'Manifestation',
          'Celebration',
          'Release',
          'Illumination',
        ]}
        howToWorkWith={[
          `Perform rituals aligned with ${moonData.name} energy`,
          'Celebrate achievements and express gratitude',
          'Release what no longer serves you',
          'Charge crystals and magical tools',
          `Work with ${monthKey}-specific themes`,
        ]}
        rituals={[
          `Create a ${moonData.name} altar with seasonal items`,
          'Perform a full moon release ritual',
          'Charge crystals under the full moon light',
          'Write down what you want to manifest',
          'Practice gratitude meditation',
        ]}
        journalPrompts={[
          `What does the ${moonData.name} energy inspire in me?`,
          `What am I ready to release this ${monthKey}?`,
          'What achievements am I celebrating?',
          `How can I honor the ${moonData.name}?`,
        ]}
        relatedItems={[
          { name: 'Moon Guide', href: '/grimoire/moon', type: 'Guide' },
          { name: 'Moon Phases', href: '/grimoire/moon-phases', type: 'Guide' },
          { name: 'Horoscope', href: '/horoscope', type: 'Daily Reading' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon', href: '/grimoire/moon' },
          {
            label: `${monthKey} ${moonData.name}`,
            href: `/grimoire/moon/full-moons/${month}`,
          },
        ]}
        internalLinks={[
          { text: "View Today's Moon Phase", href: '/horoscope' },
          { text: 'All Moon Phases', href: '/grimoire/moon' },
          { text: 'Moon Rituals', href: '/grimoire/moon-rituals' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want personalized full moon insights?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
