import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ZODIAC_CUSPS,
  getCuspData,
  generateAllCuspParams,
  CuspId,
} from '@/constants/seo/cusps';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export async function generateStaticParams() {
  return generateAllCuspParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cusp: string }>;
}): Promise<Metadata> {
  const { cusp } = await params;

  const cuspInfo = ZODIAC_CUSPS.find((c) => c.id === cusp);
  if (!cuspInfo) {
    return { title: 'Cusp Not Found | Lunary' };
  }

  const data = getCuspData(cusp as CuspId);

  const title = `${data.sign1}-${data.sign2} Cusp: The ${data.name} (${data.dates}) | Lunary`;
  const description = `Born on the ${data.sign1}-${data.sign2} cusp? The ${data.name} combines ${data.element1} and ${data.element2} energy. Discover your unique cusp personality, traits, and compatibility.`;

  return {
    title,
    description,
    keywords: [
      `${data.sign1.toLowerCase()} ${data.sign2.toLowerCase()} cusp`,
      `born on ${data.sign1.toLowerCase()} ${data.sign2.toLowerCase()} cusp`,
      data.name.toLowerCase(),
      `${data.dates} birthday`,
      'zodiac cusp',
      'cusp personality',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/cusps/${cusp}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/cusps/${cusp}`,
    },
  };
}

export default async function CuspPage({
  params,
}: {
  params: Promise<{ cusp: string }>;
}) {
  const { cusp } = await params;

  const cuspInfo = ZODIAC_CUSPS.find((c) => c.id === cusp);
  if (!cuspInfo) {
    notFound();
  }

  const data = getCuspData(cusp as CuspId);

  return (
    <SEOContentTemplate
      title={`${data.sign1}-${data.sign2} Cusp: The ${data.name}`}
      h1={`The ${data.name}: ${data.sign1}-${data.sign2} Cusp`}
      description={data.description}
      keywords={[`${data.sign1} ${data.sign2} cusp`, data.name, ...data.traits]}
      canonicalUrl={`https://lunary.app/grimoire/cusps/${cusp}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Zodiac Cusps'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Cusps', href: '/grimoire/cusps' },
        { label: `${data.sign1}-${data.sign2} Cusp` },
      ]}
      whatIs={{
        question: `What is the ${data.sign1}-${data.sign2} cusp?`,
        answer: `The ${data.sign1}-${data.sign2} cusp, known as the ${data.name}, occurs between ${data.dates}. Those born on this cusp blend ${data.sign1}'s ${data.element1} energy with ${data.sign2}'s ${data.element2} qualities, creating a unique and dynamic personality.`,
      }}
      tldr={`${data.sign1}-${data.sign2} Cusp (${data.dates}): The ${data.name}. Elements: ${data.element1} + ${data.element2}. Key traits: ${data.traits.slice(0, 3).join(', ')}.`}
      meaning={`
## The ${data.name}

${data.description}

### Birth Dates

Those born between ${data.dates} may identify with this cusp.

### Elemental Blend

The ${data.sign1}-${data.sign2} cusp uniquely blends ${data.element1} and ${data.element2} energy:
- ${data.sign1}: ${data.element1} sign - ${data.element1 === 'Fire' ? 'passion, action, initiative' : data.element1 === 'Earth' ? 'stability, practicality, grounding' : data.element1 === 'Air' ? 'intellect, communication, ideas' : 'emotion, intuition, depth'}
- ${data.sign2}: ${data.element2} sign - ${data.element2 === 'Fire' ? 'passion, action, initiative' : data.element2 === 'Earth' ? 'stability, practicality, grounding' : data.element2 === 'Air' ? 'intellect, communication, ideas' : 'emotion, intuition, depth'}

### Core Traits

People born on this cusp tend to be: ${data.traits.join(', ')}.

### Strengths

${data.strengths.map((s) => `- ${s}`).join('\n')}

### Challenges

${data.challenges.map((c) => `- ${c}`).join('\n')}

### Famous People Born on This Cusp

${data.celebrities.join(', ')}
      `}
      emotionalThemes={data.traits.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={[data.sign1, data.sign2]}
      tables={[
        {
          title: 'Cusp Overview',
          headers: ['Property', 'Value'],
          rows: [
            ['Cusp Name', data.name],
            ['Signs', `${data.sign1} - ${data.sign2}`],
            ['Dates', data.dates],
            ['Elements', `${data.element1} + ${data.element2}`],
          ],
        },
        {
          title: 'Compatibility',
          headers: ['Best Cusp Matches'],
          rows: data.compatibility.map((c) => [c]),
        },
      ]}
      relatedItems={[
        {
          name: data.sign1,
          href: `/grimoire/zodiac/${data.sign1.toLowerCase()}`,
          type: 'Zodiac',
        },
        {
          name: data.sign2,
          href: `/grimoire/zodiac/${data.sign2.toLowerCase()}`,
          type: 'Zodiac',
        },
        { name: 'Cusps Overview', href: '/grimoire/cusps', type: 'Guide' },
      ]}
      ctaText="Discover if you're a cusp baby"
      ctaHref='/birth-chart'
      sources={[{ name: 'Cusp astrology interpretations' }]}
    >
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>All Zodiac Cusps</h3>
        <div className='flex flex-wrap gap-2'>
          {ZODIAC_CUSPS.map((c) => (
            <Link
              key={c.id}
              href={`/grimoire/cusps/${c.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                c.id === cusp
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {c.sign1}-{c.sign2}
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
