import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY,
  SIGN_SYMBOLS,
  getDecanData,
  ZodiacSign,
} from '@/constants/seo/decans';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

// 30-day ISR revalidation
export const revalidate = 2592000;
interface PageParams {
  sign: string;
  decan: string;
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { sign, decan: decanStr } = await params;
  const decan = parseInt(decanStr) as 1 | 2 | 3;

  if (
    !ZODIAC_SIGNS.includes(sign as ZodiacSign) ||
    ![1, 2, 3].includes(decan)
  ) {
    return { title: 'Decan Not Found | Lunary' };
  }

  const data = getDecanData(sign as ZodiacSign, decan);
  const signName = SIGN_DISPLAY[sign as ZodiacSign];
  const decanName = decan === 1 ? 'First' : decan === 2 ? 'Second' : 'Third';

  const title = `${decanName} Decan of ${signName} (${data.dateRange}): Personality & Traits | Lunary`;
  const description = `${signName} ${decanName} Decan personality. Born ${data.dateRange}, co-ruled by ${data.subruler}. Discover unique traits, strengths, and tarot card associations.`;

  return {
    title,
    description,
    keywords: [
      `${signName.toLowerCase()} ${decanName.toLowerCase()} decan`,
      `${signName.toLowerCase()} decan ${decan}`,
      `${data.dateRange} zodiac`,
      `${signName.toLowerCase()} ${data.subruler.toLowerCase()}`,
      'zodiac decans',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/decans/${sign}/${decan}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/decans/${sign}/${decan}`,
    },
  };
}

export default async function DecanPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { sign, decan: decanStr } = await params;
  const decan = parseInt(decanStr) as 1 | 2 | 3;

  if (
    !ZODIAC_SIGNS.includes(sign as ZodiacSign) ||
    ![1, 2, 3].includes(decan)
  ) {
    notFound();
  }

  const data = getDecanData(sign as ZodiacSign, decan);
  const signName = SIGN_DISPLAY[sign as ZodiacSign];
  const symbol = SIGN_SYMBOLS[sign as ZodiacSign];
  const decanName = decan === 1 ? 'First' : decan === 2 ? 'Second' : 'Third';

  const faqs = [
    {
      question: `What is the ${decanName} Decan of ${signName}?`,
      answer: `The ${decanName} Decan of ${signName} spans ${data.degrees} (${data.dateRange}). While the primary ruler is ${data.ruler}, this decan is co-ruled by ${data.subruler}.`,
    },
    {
      question: `What are ${decanName} Decan ${signName} traits?`,
      answer: `${decanName} Decan ${signName}s tend to be ${data.traits.slice(0, 4).join(', ').toLowerCase()}.`,
    },
    {
      question: `What tarot card is associated with ${decanName} Decan ${signName}?`,
      answer: `The ${data.tarotCard} is associated with the ${decanName} Decan of ${signName}, reflecting its themes and energy.`,
    },
    {
      question: `What are the strengths of ${decanName} Decan ${signName}?`,
      answer: `${decanName} Decan ${signName} strengths include ${data.strengths.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `How does ${data.subruler} influence ${decanName} Decan ${signName}?`,
      answer: `${data.subruler} as the sub-ruler adds unique qualities to ${decanName} Decan ${signName}s, including ${data.strengths.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${decanName} Decan of ${signName}`}
      h1={`${symbol} ${signName} ${decanName} Decan (${data.degrees})`}
      description={data.description}
      keywords={[`${signName} decan`, data.subruler, ...data.traits]}
      canonicalUrl={`https://lunary.app/grimoire/decans/${sign}/${decan}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Zodiac Decans'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Decans', href: '/grimoire/decans' },
        { label: signName, href: `/grimoire/zodiac/${sign}` },
        { label: `${decanName} Decan` },
      ]}
      whatIs={{
        question: `What is the ${decanName} Decan of ${signName}?`,
        answer: `The ${decanName} Decan of ${signName} spans ${data.degrees} (${data.dateRange}). While the primary ruler is ${data.ruler}, this decan is co-ruled by ${data.subruler}, which adds unique qualities to these ${signName} individuals.`,
      }}
      tldr={`${signName} Decan ${decan}: ${data.dateRange}. Degrees: ${data.degrees}. Co-ruler: ${data.subruler}. Tarot: ${data.tarotCard}. Key traits: ${data.traits.slice(0, 3).join(', ')}.`}
      meaning={`
## The ${decanName} Decan of ${signName}

${data.description}

### Birth Dates

Those born between ${data.dateRange} belong to this decan.

### Planetary Influence

While all ${signName} individuals share ${data.ruler} as their primary ruler, ${decanName} Decan ${signName}s have ${data.subruler} as their sub-ruler, adding:
${data.strengths.map((s) => `- ${s}`).join('\n')}

### Personality Traits

${decanName} Decan ${signName}s tend to be: ${data.traits.join(', ')}.

### Associated Tarot Card

The ${data.tarotCard} is associated with this decan, reflecting its themes and energy.
      `}
      emotionalThemes={data.traits.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={[signName]}
      tables={[
        {
          title: 'Decan Details',
          headers: ['Property', 'Value'],
          rows: [
            ['Sign', `${signName} ${symbol}`],
            ['Decan', decanName],
            ['Degrees', data.degrees],
            ['Dates', data.dateRange],
            ['Primary Ruler', data.ruler],
            ['Sub-Ruler', data.subruler],
            ['Tarot Card', data.tarotCard],
          ],
        },
      ]}
      relatedItems={[
        { name: signName, href: `/grimoire/zodiac/${sign}`, type: 'Zodiac' },
        {
          name: data.subruler,
          href: `/grimoire/astronomy/planets/${data.subruler.toLowerCase()}`,
          type: 'Planet',
        },
        { name: 'Decans Overview', href: '/grimoire/decans', type: 'Guide' },
      ]}
      ctaText='Discover your decan placement'
      ctaHref='/birth-chart'
      sources={[{ name: 'Traditional decan system' }]}
      faqs={faqs}
    >
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>{signName} Decans</h3>
        <div className='flex flex-wrap gap-2'>
          {[1, 2, 3].map((d) => (
            <Link
              key={d}
              href={`/grimoire/decans/${sign}/${d}`}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                d === decan
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {d === 1 ? 'First' : d === 2 ? 'Second' : 'Third'} Decan
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
