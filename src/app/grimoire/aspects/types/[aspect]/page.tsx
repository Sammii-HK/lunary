import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { astrologicalAspects } from '@/constants/grimoire/seo-data';
import { stringToKebabCase } from '../../../../../../utils/string';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';
import { Sparkles } from 'lucide-react';

const aspectKeys = Object.keys(astrologicalAspects);

export async function generateStaticParams() {
  return aspectKeys.map((aspect) => ({
    aspect: stringToKebabCase(aspect),
  }));
}

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
  const title = `${aspectData.name} (${aspectData.degrees}°): Meaning in Astrology - Lunary`;
  const description = `${aspectData.name} aspect (${aspectData.degrees}°) in astrology: ${aspectData.nature.toLowerCase()} aspect. What ${aspectData.name.toLowerCase()} means between planets in your birth chart.`;

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
      images: ['/api/og/grimoire/aspects'],
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

  const heroContent = (
    <div className='text-center space-y-3'>
      <div className='flex justify-center gap-3 items-center text-4xl text-lunary-primary-300'>
        <span>{aspectData.symbol}</span>
        <span>{aspectData.name}</span>
      </div>
      <p className='text-zinc-400'>
        {aspectData.degrees}° • {aspectData.nature} • {aspectData.type} aspect
      </p>
      <p className='text-zinc-400 max-w-2xl mx-auto'>
        Decode how this angle shapes your natal chart, transits, and synastry.
      </p>
    </div>
  );

  const faqs = [
    {
      question: `What is a ${aspectData.name} aspect?`,
      answer: `A ${aspectData.name} aspect occurs when two planets are ${aspectData.degrees} degrees apart. ${aspectData.description}`,
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

  const whatIs = {
    question: `What is the ${aspectData.name} aspect?`,
    answer: `It is formed when two planets are ${aspectData.degrees}° apart (allowing an orb of ${aspectData.orb}°). This creates a ${aspectData.nature.toLowerCase()} exchange of energy that ${aspectData.description.toLowerCase()}`,
  };

  const howToWorkWith = [
    `Note which houses the two planets rule to see where ${aspectData.name.toLowerCase()} themes play out.`,
    `Track transits that recreate a ${aspectData.name.toLowerCase()} to anticipate timing.`,
    `Use journaling or somatic check-ins to see how the ${aspectData.nature.toLowerCase()} energy feels.`,
    `Balance the element + modality involved (e.g., ground fiery squares with earth rituals).`,
    `When tension spikes, return to breathwork, embodiment, or conversations that honor both planets.`,
  ];

  const internalLinks = [
    { text: 'All Aspect Types', href: '/grimoire/aspects/types' },
    { text: 'Explore Aspects', href: '/grimoire/aspects' },
    {
      text: 'Birth Chart Guide',
      href: '/grimoire/guides/birth-chart-complete-guide',
    },
    { text: 'Calculate Birth Chart', href: '/birth-chart' },
  ];

  const relatedItems = [
    {
      name: 'Aspect Types Overview',
      href: '/grimoire/aspects/types',
      type: 'Guide',
    },
    {
      name: 'Transits Hub',
      href: '/grimoire/transits',
      type: 'Timing',
    },
    {
      name: 'Synastry',
      href: '/grimoire/synastry',
      type: 'Relationships',
    },
  ];

  const tableOfContents = [
    { label: `${aspectData.name} Snapshot`, href: '#aspect-overview' },
    { label: 'Nature & Keywords', href: '#aspect-keywords' },
    { label: 'History & Interpretation Tips', href: '#aspect-history' },
    { label: 'Workflows & Timing', href: '#aspect-workflows' },
    { label: 'Integration Rituals', href: '#integration' },
    { label: 'Reflection Prompts', href: '#aspect-prompts' },
    { label: 'Frequently Asked Questions', href: '#faq' },
  ];

  const sections = (
    <div className='space-y-10'>
      <section
        id='aspect-overview'
        className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          {aspectData.name} Snapshot
        </h2>
        <div className='grid sm:grid-cols-2 gap-4 text-sm text-zinc-300'>
          <div className='rounded-lg border border-zinc-800/60 p-4 space-y-1'>
            <p>
              <strong>Degrees:</strong> {aspectData.degrees}°
            </p>
            <p>
              <strong>Orb:</strong> {aspectData.orb}°
            </p>
            <p>
              <strong>Nature:</strong> {aspectData.nature}
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/60 p-4 space-y-1'>
            <p>
              <strong>Type:</strong> {aspectData.type}
            </p>
            <p>
              <strong>Symbol:</strong> {aspectData.symbol}
            </p>
            <p>
              <strong>Core Meaning:</strong> {aspectData.meaning}
            </p>
          </div>
        </div>
      </section>

      <section
        id='aspect-history'
        className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          History & Interpretation Tips
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Ancient astrologers watched planetary choirs rise over temple walls
          and noticed that certain angles repeated during key cultural moments.
          Over centuries, conjunctions became omens of new rulers, oppositions
          marked market swings, and trines signaled artistic bloom. We inherit
          that lineage today—every time you interpret an aspect, you are
          speaking a language first refined in Babylon, Alexandria, and medieval
          court courts.
        </p>
        <p className='text-zinc-300 leading-relaxed'>
          Combine classical wisdom with your modern context. Note the planets
          involved, the houses and signs they occupy, and then add your lived
          experience. This fusion keeps readings grounded in tradition while
          honoring the nuance of contemporary life.
        </p>
      </section>

      <section
        id='aspect-keywords'
        className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-light text-zinc-100 flex items-center gap-2'>
          <Sparkles className='h-5 w-5 text-lunary-primary-400' />
          Nature & Keywords
        </h2>
        <p className='text-zinc-300'>
          Use these keywords as starting points for journaling, spellcrafting,
          or interpreting charts.
        </p>
        <div className='flex flex-wrap gap-2'>
          {aspectData.keywords.map((keyword) => (
            <span
              key={keyword}
              className='px-3 py-1 text-sm rounded-full border border-lunary-primary-700/60 text-lunary-primary-200'
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>

      <section
        id='aspect-workflows'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          Workflows & Timing
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>
            Check which planets are involved and what stories they already tell.
          </li>
          <li>
            Identify the houses those planets rule to pinpoint life areas.
          </li>
          <li>
            Note any repeating transits or progressions that echo this aspect
            for timing clues.
          </li>
          <li>
            Balance the polarity: oppositions love mediation, squares need
            action, trines crave containers.
          </li>
        </ol>
      </section>

      <section
        id='integration'
        className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          Integration Rituals
        </h2>
        <ul className='space-y-2 text-zinc-300'>
          <li>
            Craft a candle spell aligning colors/elements with both planets for
            harmony.
          </li>
          <li>
            Set timed reminders during relevant transits to pause and check in
            with the aspect’s lesson.
          </li>
          <li>
            Pair the aspect with a tarot pull to add symbolic context before big
            decisions.
          </li>
        </ul>
      </section>

      <section
        id='aspect-prompts'
        className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-2'
      >
        <h2 className='text-2xl font-light text-zinc-100'>
          Reflection Prompts
        </h2>
        <p className='text-zinc-300'>
          Add these to your journal, digital notes, or Book of Shadows.
        </p>
        <ul className='space-y-2 text-zinc-300'>
          <li>
            Where do I feel {aspectData.name.toLowerCase()} energy most vividly
            in my chart?
          </li>
          <li>
            How can I honor both planets when this aspect triggers stress or
            opportunity?
          </li>
          <li>
            What support practices keep me grounded when this angle is active?
          </li>
        </ul>
      </section>
    </div>
  );

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(aspectSchema)}
      <SEOContentTemplate
        title={`${aspectData.name} Aspect - Lunary`}
        h1={`${aspectData.name} Aspect: Complete Guide`}
        description={`Discover everything about ${aspectData.name} aspect. Learn about its meaning, nature, degrees, and how it affects your birth chart.`}
        keywords={[
          `${aspectData.name} aspect`,
          `${aspectData.degrees} degree aspect`,
          `${aspectData.name} astrology`,
          `${aspectData.nature} aspect`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/aspects/types/${aspect}`}
        heroContent={heroContent}
        tableOfContents={tableOfContents}
        intro={`The ${aspectData.name} aspect occurs when two planets are ${aspectData.degrees} degrees apart. This is a ${aspectData.type} aspect with a ${aspectData.nature} nature. ${aspectData.description}`}
        tldr={`${aspectData.name} (${aspectData.degrees}°) is a ${aspectData.nature} aspect meaning ${aspectData.meaning.toLowerCase()}.`}
        meaning={`Aspects are angles between planets in your birth chart that show how planetary energies interact. The ${aspectData.name} aspect is formed when two planets are ${aspectData.degrees} degrees apart (with an orb of ${aspectData.orb} degrees).

${aspectData.description}

${aspectData.meaning}

${aspectData.name} is classified as a ${aspectData.type} aspect with a ${aspectData.nature} nature. ${aspectData.nature === 'harmonious' ? 'Harmonious aspects create ease and flow between planets, bringing natural talents and opportunities.' : aspectData.nature === 'challenging' ? 'Challenging aspects create tension that requires growth and development, leading to strength through overcoming obstacles.' : 'Neutral aspects can be either harmonious or challenging depending on the planets involved.'}

Understanding ${aspectData.name} in your chart helps you understand how these planetary energies work together and what challenges or blessings they bring to your life.`}
        glyphs={[aspectData.symbol]}
        whatIs={whatIs}
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
        howToWorkWith={howToWorkWith}
        journalPrompts={[
          `What ${aspectData.name} aspects do I have in my chart?`,
          `How does ${aspectData.name} energy manifest in my life?`,
          `What can I learn from ${aspectData.name}?`,
          `How can I work with ${aspectData.name} consciously?`,
        ]}
        relatedItems={relatedItems}
        internalLinks={internalLinks}
        emotionalThemes={aspectData.keywords}
        faqs={faqs}
        cosmicConnectionsParams={{
          entityType: 'hub-aspects',
          entityKey: aspect,
        }}
        ctaText='See this aspect in your birth chart'
        ctaHref='/birth-chart'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
