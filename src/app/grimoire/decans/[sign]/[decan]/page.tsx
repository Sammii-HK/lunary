import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY,
  SIGN_SYMBOLS,
  getDecanData,
  generateAllDecanParams,
  ZodiacSign,
} from '@/constants/seo/decans';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

interface PageParams {
  sign: string;
  decan: string;
}

export async function generateStaticParams() {
  return generateAllDecanParams();
}

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
    {
      question: `Does the ${decanName} Decan affect compatibility?`,
      answer:
        'It can. Decans add nuance to how a sign expresses itself, which can influence communication style and pacing in relationships. Your full chart matters most, but decan insights can explain subtle differences.',
    },
  ];

  return (
    <SEOContentTemplate
      title={`${decanName} Decan of ${signName}`}
      h1={`${symbol} ${signName} ${decanName} Decan (${data.degrees})`}
      description={data.description}
      keywords={[`${signName} decan`, data.subruler, ...data.traits]}
      canonicalUrl={`https://lunary.app/grimoire/decans/${sign}/${decan}`}
      intro={`Decans divide each zodiac sign into three segments, adding nuance to personality and timing. The ${decanName} Decan of ${signName} blends the core ${signName} nature with the influence of ${data.subruler}, creating a distinct expression of this sign. If you were born between ${data.dateRange}, this guide helps you understand your decan strengths, challenges, and energetic themes.`}
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

### Decans in Your Birth Chart

Decans add detail beyond the Sun sign. If you know your Rising sign or key planetary placements, those placements also have decans. This is why two people with the same Sun sign can feel different: their Sun may fall in a different decan, and the rest of the chart tells a fuller story.

### Working with ${data.subruler} Energy

Lean into the strengths of ${data.subruler} when you need support, and balance them with the core ${signName} traits. Decan work is about integration—using the sub-ruler's gifts to express the sign more clearly.

### Decan Expression in Daily Life

The ${decanName} Decan often shows up in how you handle stress, ambition, and relationships. Some decans feel more internal and reflective, while others are expressive and outward-facing. If you notice a repeated pattern in work or love, the decan lens can clarify why.

You can also track decans through timing. When the Sun moves through your decan each year, themes related to that subruler can intensify. This makes the decan season a useful window for setting goals, refining habits, or focusing on a specific life area.

If you work with astrology intentionally, schedule your most aligned projects during your decan season for extra momentum.
      `}
      emotionalThemes={data.traits.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={[signName]}
      howToWorkWith={[
        `Reflect on how ${data.subruler} themes show up in your ${signName} expression`,
        'Track your energy and mood during your decan season each year',
        `Use the ${data.tarotCard} for meditation or journaling`,
        'Study your Rising and Moon decans for a fuller picture',
        'Notice where the decan strengths show up in relationships and work',
      ]}
      rituals={[
        `Meditate on the ${data.tarotCard} and note what themes arise.`,
        `Create a small altar with symbols of ${signName} and ${data.subruler}.`,
        'Set a 3-week intention during your decan season and track progress.',
        'Write a short affirmation that blends both rulers.',
      ]}
      journalPrompts={[
        `Where do I see ${data.subruler.toLowerCase()} influence in my ${signName} traits?`,
        'What is the strongest gift of this decan, and how do I use it?',
        'Which decan challenge shows up most often, and what would balance it?',
        `How does the ${data.tarotCard} reflect my current season of growth?`,
      ]}
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
      internalLinks={[
        { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
        { text: 'Tarot Guide', href: '/grimoire/tarot' },
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
