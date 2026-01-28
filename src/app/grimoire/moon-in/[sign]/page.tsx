import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { zodiacSigns, zodiacSymbol } from '../../../../../utils/zodiac/zodiac';
import { stringToKebabCase } from '../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
const signSlugs = Object.keys(zodiacSigns);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign } = await params;
  const signKey = signSlugs.find(
    (s) => stringToKebabCase(s) === sign.toLowerCase(),
  );

  if (!signKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const signData = zodiacSigns[signKey as keyof typeof zodiacSigns];
  const symbol = zodiacSymbol[signKey as keyof typeof zodiacSymbol];
  const title = `Moon in ${signData.name}: Emotions, Traits & Compatibility - Lunary`;
  const description = `Moon in ${signData.name} natal chart meaning: emotional needs, personality traits & compatibility. What your ${signData.name} moon sign reveals about you.`;

  return {
    title,
    description,
    keywords: [
      `moon in ${signData.name}`,
      `moon ${signData.name}`,
      `${signData.name} moon`,
      `moon in ${signData.name} meaning`,
      `lunar ${signData.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/moon-in/${sign}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/moon',
          width: 1200,
          height: 630,
          alt: `Moon in ${signData.name}`,
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
      canonical: `https://lunary.app/grimoire/moon-in/${sign}`,
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

export default async function MoonInSignPage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signKey = signSlugs.find(
    (s) => stringToKebabCase(s) === sign.toLowerCase(),
  );

  if (!signKey) {
    notFound();
  }

  const signData = zodiacSigns[signKey as keyof typeof zodiacSigns];
  const symbol = zodiacSymbol[signKey as keyof typeof zodiacSymbol];

  const elementDescriptions: Record<string, string> = {
    Fire: 'Fire moons are passionate, energetic, and action-oriented. Emotions are expressed with enthusiasm and intensity.',
    Earth:
      'Earth moons are practical, grounded, and stable. Emotions are expressed through tangible actions and material security.',
    Air: 'Air moons are intellectual, communicative, and social. Emotions are expressed through ideas, conversation, and mental connection.',
    Water:
      'Water moons are emotional, intuitive, and deeply feeling. Emotions flow naturally and are expressed with sensitivity.',
  };

  const faqs = [
    {
      question: `What does Moon in ${signData.name} mean?`,
      answer: `When the Moon is in ${signData.name}, emotions are expressed through ${signData.element.toLowerCase()} energy. This placement influences how you feel, react, and nurture yourself and others.`,
    },
    {
      question: `How does Moon in ${signData.name} affect emotions?`,
      answer: `Moon in ${signData.name} brings ${signData.element.toLowerCase()} emotional expression. ${elementDescriptions[signData.element]}`,
    },
    {
      question: `What is Moon in ${signData.name} good for?`,
      answer: `Moon in ${signData.name} is ideal for ${signData.element === 'Fire' ? 'taking action, pursuing passions, and expressing enthusiasm' : signData.element === 'Earth' ? 'practical activities, building stability, and creating security' : signData.element === 'Air' ? 'communication, learning, and social connection' : 'emotional healing, intuition, and deep feeling'}.`,
    },
    {
      question: `How long does Moon stay in ${signData.name}?`,
      answer: `The Moon moves through each sign approximately every 2-3 days, spending about 2.5 days in ${signData.name} before moving to the next sign.`,
    },
    {
      question: `What should I do when Moon is in ${signData.name}?`,
      answer: `When Moon is in ${signData.name}, focus on ${signData.element === 'Fire' ? 'taking action and expressing passion' : signData.element === 'Earth' ? 'practical matters and building stability' : signData.element === 'Air' ? 'communication and learning' : 'emotional healing and intuition'}. Honor your ${signData.name} emotional nature.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`Moon in ${signData.name} - Lunary`}
        h1={`Moon in ${signData.name}: Complete Emotional Guide`}
        description={`Discover what it means when the Moon is in ${signData.name}. Learn about emotional themes, traits, and how to work with this lunar placement.`}
        keywords={[
          `moon in ${signData.name}`,
          `${signData.name} moon`,
          `moon ${signData.name}`,
          `lunar ${signData.name}`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/moon-in/${sign}`}
        intro={`When the Moon is in ${signData.name} (${symbol}), emotions are expressed through ${signData.element.toLowerCase()} energy. This lunar placement influences how you feel, react, and nurture yourself and others during this transit.`}
        tldr={`Moon in ${signData.name} brings ${signData.element.toLowerCase()} emotional expression and influences feelings through ${signData.name} energy.`}
        meaning={`The Moon represents your emotions, instincts, and inner needs. When the Moon transits through ${signData.name}, it colors your emotional experience with ${signData.element.toLowerCase()} energy.

${elementDescriptions[signData.element]}

Moon in ${signData.name} influences how you:
- Express and process emotions
- Nurture yourself and others
- React to situations emotionally
- Seek emotional security
- Connect with your intuition

During this transit, you may feel more ${signData.element === 'Fire' ? 'passionate, energetic, and action-oriented' : signData.element === 'Earth' ? 'practical, grounded, and stable' : signData.element === 'Air' ? 'intellectual, communicative, and social' : 'emotional, intuitive, and sensitive'}. Your emotional needs align with ${signData.name} themes, and you may find yourself drawn to activities that honor this ${signData.element.toLowerCase()} nature.

Understanding Moon in ${signData.name} helps you work with this emotional energy consciously, whether it's in your natal chart (Moon sign) or during current transits.`}
        glyphs={['☽', symbol]}
        emotionalThemes={[
          `${signData.element} emotional expression`,
          `${signData.name} emotional needs`,
          `Nurturing through ${signData.element.toLowerCase()}`,
          `Intuitive responses aligned with ${signData.name}`,
        ]}
        howToWorkWith={[
          `Honor your ${signData.name} emotional nature`,
          `Express feelings through ${signData.element.toLowerCase()} activities`,
          `Create space for ${signData.name} emotional needs`,
          `Connect with ${signData.element.toLowerCase()} element practices`,
          `Work with Moon in ${signData.name} energy consciously`,
        ]}
        signsMostAffected={[signData.name]}
        journalPrompts={[
          `How do I express emotions when Moon is in ${signData.name}?`,
          `What emotional needs does ${signData.name} bring up?`,
          `How can I honor my ${signData.name} emotional nature?`,
          `What activities align with Moon in ${signData.name}?`,
          `How does ${signData.element.toLowerCase()} energy influence my feelings?`,
        ]}
        astrologyCorrespondences={`Moon Sign: ${signData.name}
Element: ${signData.element}
Symbol: ${symbol}
Dates: ${signData.dates}
Emotional Expression: ${signData.element.toLowerCase()}`}
        relatedItems={[
          {
            name: signData.name,
            href: `/grimoire/zodiac/${sign}`,
            type: 'Zodiac Sign',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon',
            type: 'Guide',
          },
          {
            name: 'Horoscope',
            href: '/horoscope',
            type: 'Daily Reading',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon Phases', href: '/grimoire/moon' },
          {
            label: `Moon in ${signData.name}`,
            href: `/grimoire/moon-in/${sign}`,
          },
        ]}
        internalLinks={[
          { text: "View Today's Moon Sign", href: '/horoscope' },
          { text: 'Explore Moon Phases', href: '/grimoire/moon' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want to see Moon in ${signData.name} in your birth chart?`}
        ctaHref='/pricing'
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='placement'
            entityKey={`moon-in-${sign}`}
            title={`Moon in ${signData.name} Cosmic Web`}
          />
        }
      />
    </div>
  );
}
