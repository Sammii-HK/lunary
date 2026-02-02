import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { astrologicalAspects } from '@/constants/grimoire/seo-data';
import { stringToKebabCase } from '../../../../../../utils/string';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
const aspectKeys = Object.keys(astrologicalAspects);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ aspect: string }>;
}): Promise<Metadata> {
  const { aspect } = await params;
  const aspectKey = aspectKeys.find(
    (a) => stringToKebabCase(a) === aspect.toLowerCase(),
  );

  if (!aspectKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const aspectData =
    astrologicalAspects[aspectKey as keyof typeof astrologicalAspects];
  // Use "an" for vowel sounds (Opposition, etc.), "a" for consonants
  const article = /^[aeiou]/i.test(aspectData.name) ? 'an' : 'a';
  const title = `${aspectData.name} Aspect in Astrology: ${aspectData.degrees}° Meaning & Interpretation`;
  const description = `What is ${article} ${aspectData.name.toLowerCase()} aspect? When planets sit ${aspectData.degrees}° apart, they create ${aspectData.nature === 'harmonious' ? 'flow and ease' : aspectData.nature === 'challenging' ? 'tension and awareness' : 'unique dynamics'}. Learn how ${aspectData.name.toLowerCase()}s work in your birth chart and transits.`;

  return {
    title,
    description,
    keywords: [
      `${aspectData.name} aspect`,
      `${aspectData.degrees} degree aspect`,
      `${aspectData.name} astrology`,
      `${aspectData.nature} aspect`,
      `${aspectData.name} meaning`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/aspects/types/${aspect}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/aspects',
          width: 1200,
          height: 630,
          alt: `${aspectData.name} Aspect`,
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
      canonical: `https://lunary.app/grimoire/aspects/types/${aspect}`,
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

export default async function AspectPage({
  params,
}: {
  params: Promise<{ aspect: string }>;
}) {
  const { aspect } = await params;
  const aspectKey = aspectKeys.find(
    (a) => stringToKebabCase(a) === aspect.toLowerCase(),
  );

  if (!aspectKey) {
    notFound();
  }

  const aspectData =
    astrologicalAspects[aspectKey as keyof typeof astrologicalAspects];
  const article = /^[aeiou]/i.test(aspectData.name) ? 'an' : 'a';

  const faqs = [
    {
      question: `What is ${article} ${aspectData.name} aspect?`,
      answer: `${article.charAt(0).toUpperCase() + article.slice(1)} ${aspectData.name} aspect occurs when two planets are ${aspectData.degrees} degrees apart. ${aspectData.description}`,
    },
    {
      question: `Is ${aspectData.name} a ${aspectData.nature} aspect?`,
      answer: `Yes, ${aspectData.name} is a ${aspectData.nature} aspect, meaning it brings ${aspectData.nature === 'harmonious' ? 'ease and flow' : aspectData.nature === 'challenging' ? 'tension and growth' : 'neutral energy'} between planets.`,
    },
    {
      question: `What does ${aspectData.name} mean in my birth chart?`,
      answer: `${aspectData.meaning}`,
    },
    {
      question: `What is the orb for ${aspectData.name}?`,
      answer: `The orb for ${aspectData.name} is ${aspectData.orb} degrees, meaning planets can be up to ${aspectData.orb} degrees away from the exact ${aspectData.degrees}° angle and still form this aspect.`,
    },
  ];

  // Entity schema for Knowledge Graph
  const aspectSchema = createCosmicEntitySchema({
    name: `${aspectData.name} Aspect`,
    description: `${aspectData.name} (${aspectData.degrees}°) is a ${aspectData.nature.toLowerCase()} aspect in astrology. ${aspectData.meaning.slice(0, 100)}...`,
    url: `/grimoire/aspects/types/${aspect}`,
    additionalType: 'https://en.wikipedia.org/wiki/Astrological_aspect',
    keywords: [
      `${aspectData.name.toLowerCase()} aspect`,
      `${aspectData.degrees} degree aspect`,
      aspectData.nature.toLowerCase(),
      'astrological aspects',
      'planetary aspects',
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(aspectSchema)}
      <SEOContentTemplate
        title={`${aspectData.name} Aspect: ${aspectData.degrees}° Meaning`}
        h1={`${aspectData.name} Aspect (${aspectData.degrees}°)`}
        description={`What is ${article} ${aspectData.name.toLowerCase()} aspect? When planets are ${aspectData.degrees}° apart, they create ${aspectData.nature === 'harmonious' ? 'ease and flow' : aspectData.nature === 'challenging' ? 'tension and growth' : 'unique dynamics'}. Learn how it works in your chart.`}
        keywords={[
          `${aspectData.name} aspect`,
          `${aspectData.degrees} degree aspect`,
          `${aspectData.name} astrology`,
          `${aspectData.nature} aspect`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/aspects/types/${aspect}`}
        intro={`The ${aspectData.name} aspect occurs when two planets are ${aspectData.degrees} degrees apart. This is a ${aspectData.type} aspect with a ${aspectData.nature} nature. ${aspectData.description}`}
        tldr={`${aspectData.name} (${aspectData.degrees}°) is a ${aspectData.nature} aspect meaning ${aspectData.meaning.toLowerCase()}.`}
        meaning={`Aspects are angles between planets in your birth chart that show how planetary energies interact. The ${aspectData.name} aspect is formed when two planets are ${aspectData.degrees} degrees apart (with an orb of ${aspectData.orb} degrees).

${aspectData.description}

${aspectData.meaning}

${aspectData.name} is classified as a ${aspectData.type} aspect with a ${aspectData.nature} nature. ${aspectData.nature === 'harmonious' ? 'Harmonious aspects create ease and flow between planets, bringing natural talents and opportunities.' : aspectData.nature === 'challenging' ? 'Challenging aspects create tension that requires growth and development, leading to strength through overcoming obstacles.' : 'Neutral aspects can be either harmonious or challenging depending on the planets involved.'}

Understanding ${aspectData.name} in your chart helps you understand how these planetary energies work together and what challenges or blessings they bring to your life.`}
        glyphs={[aspectData.symbol]}
        astrologyCorrespondences={`Aspect: ${aspectData.name}
Symbol: ${aspectData.symbol}
Degrees: ${aspectData.degrees}°
Orb: ${aspectData.orb} degrees
Type: ${aspectData.type}
Nature: ${aspectData.nature}`}
        tables={[
          {
            title: `${aspectData.name} Examples`,
            headers: ['Example', 'Meaning'],
            rows: aspectData.examples.map((ex) => ex.split(': ')),
          },
        ]}
        howToWorkWith={[
          `Understand ${aspectData.name} in your birth chart`,
          `Work with ${aspectData.nature === 'harmonious' ? 'the ease and flow' : aspectData.nature === 'challenging' ? 'the growth opportunities' : 'the energy'} this aspect brings`,
          `Recognize ${aspectData.name} patterns in your life`,
          `Use ${aspectData.name} energy consciously`,
        ]}
        journalPrompts={[
          `What ${aspectData.name} aspects do I have in my chart?`,
          `How does ${aspectData.name} energy manifest in my life?`,
          `What can I learn from ${aspectData.name}?`,
          `How can I work with ${aspectData.name} consciously?`,
        ]}
        relatedItems={[
          {
            name: 'Birth Chart Guide',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
          {
            name: 'Planets',
            href: '/grimoire/astronomy',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Birth Chart', href: '/grimoire/birth-chart' },
          {
            label: aspectData.name,
            href: `/grimoire/aspects/types/${aspect}`,
          },
        ]}
        internalLinks={[
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Explore Aspects', href: '/grimoire/aspects' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
