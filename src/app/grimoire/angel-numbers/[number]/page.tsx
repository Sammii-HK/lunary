import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { getAngelNumber } from '@/lib/angel-numbers/getAngelNumber';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';
import { Heading } from '@/components/ui/Heading';

// 30-day ISR revalidation
export const revalidate = 2592000;

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberData = getAngelNumber(number);

  if (!numberData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${numberData.name}: Meaning in Love, Career & Manifestation - Lunary`,
    description: `${numberData.name} meaning: spiritual significance, love & twin flame messages, career guidance. What does ${numberData.number} mean? Complete angel number interpretation.`,
    keywords: [
      `${numberData.name} meaning`,
      `${numberData.number} angel number`,
      `seeing ${numberData.number}`,
      `${numberData.number} love meaning`,
      `${numberData.number} twin flame`,
      `${numberData.number} manifestation`,
    ],
    url: `/grimoire/angel-numbers/${number}`,
    ogImagePath: '/api/og/grimoire/angel-numbers',
    ogImageAlt: `${numberData.name} Angel Number`,
  });
}

export default async function AngelNumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const data = getAngelNumber(number);

  if (!data) {
    notFound();
  }

  // Build rich meaning content with all the curated data
  const meaningContent = `${data.meaning}

## Why You Keep Seeing ${data.number}

${data.whyYouKeepSeeing}

## When ${data.number} Usually Appears

${data.whenItAppears.map((item) => `- ${item}`).join('\n')}

## Is ${data.number} a Yes or No?

${data.yesOrNo}

## ${data.number} in Love

### If You're Single
${data.love.single}

### If You're in a Relationship
${data.love.relationship}

### If You're Thinking About Someone
${data.love.thinkingOfSomeone}

## ${data.number} Career Meaning

${data.career}

## Numerology of ${data.number}

**Root Number:** ${data.numerologyBreakdown.rootNumber}
**Calculation:** ${data.numerologyBreakdown.calculation}

${data.numerologyBreakdown.rootMeaning}

${data.numerologyBreakdown.amplification}`;

  // Entity schema for Knowledge Graph
  const angelNumberSchema = createCosmicEntitySchema({
    name: data.name,
    description: `${data.name} spiritual meaning: ${data.spiritualMeaning.slice(0, 150)}...`,
    url: `/grimoire/angel-numbers/${number}`,
    additionalType: 'https://en.wikipedia.org/wiki/Angel_number',
    keywords: [
      data.name,
      `${data.number} meaning`,
      'angel number',
      'spiritual meaning',
      'numerology',
      'divine message',
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(angelNumberSchema)}
      <SEOContentTemplate
        title={`${data.name} - Lunary`}
        h1={`${data.name}: Complete Spiritual Guide`}
        subtitle={data.coreMeaning}
        description={data.description}
        keywords={data.keywords}
        canonicalUrl={`https://lunary.app/grimoire/angel-numbers/${number}`}
        intro={data.quickMeaning}
        tldr={`${data.name} means ${data.coreMeaning.toLowerCase()}. ${data.message}`}
        meaning={meaningContent}
        emotionalThemes={data.keywords}
        howToWorkWith={data.whatToDo}
        journalPrompts={data.journalPrompts}
        numerology={`Angel Number: ${data.number}
Core Meaning: ${data.coreMeaning}
Root Number: ${data.numerologyBreakdown.rootNumber}
Keywords: ${data.keywords.join(', ')}`}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Angel Numbers', href: '/grimoire/angel-numbers' },
          {
            label: data.name,
            href: `/grimoire/angel-numbers/${number}`,
          },
        ]}
        internalLinks={[
          { text: 'All Angel Numbers', href: '/grimoire/angel-numbers' },
          { text: 'Numerology Guide', href: '/grimoire/numerology' },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
        ]}
        ctaText='Want personalized numerology insights for your life?'
        ctaHref='/pricing'
        faqs={data.faq}
      >
        {/* Correspondences Section */}
        <section className='mb-8'>
          <Heading as='h2' variant='h3'>
            {data.number} Correspondences
          </Heading>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mt-4'>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
              <div className='text-2xl mb-1'>🪐</div>
              <div className='text-xs text-zinc-400'>Planet</div>
              <div className='text-sm text-zinc-300'>
                {data.correspondences.planet}
              </div>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
              <div className='text-2xl mb-1'>🔥</div>
              <div className='text-xs text-zinc-400'>Element</div>
              <div className='text-sm text-zinc-300'>
                {data.correspondences.element}
              </div>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
              <div className='text-2xl mb-1'>✨</div>
              <div className='text-xs text-zinc-400'>Chakra</div>
              <div className='text-sm text-zinc-300'>
                {data.correspondences.chakra}
              </div>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
              <div className='text-2xl mb-1'>💎</div>
              <div className='text-xs text-zinc-400'>Crystal</div>
              <div className='text-sm text-zinc-300'>
                {data.correspondences.crystal}
              </div>
            </div>
            <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
              <div className='text-2xl mb-1'>🃏</div>
              <div className='text-xs text-zinc-400'>Tarot</div>
              <div className='text-sm text-zinc-300'>
                {data.correspondences.tarotCard}
              </div>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
