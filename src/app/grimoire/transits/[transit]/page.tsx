function sentenceCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSentenceList(items: string[]) {
  return items.map((item) => sentenceCase(item)).join(', ');
}

function buildTransitMeaning(transit: {
  title: string;
  description: string;
  dates: string;
  signs: string[];
  themes: string[];
  doList: string[];
  avoidList: string[];
}) {
  return `
## ${transit.title}

${transit.description}

**Who this is for**  
${transit.signs.join(', ')} ${transit.signs.length > 1 ? 'are' : 'is'} the placements this transit lands strongest in, and anyone navigating ${transit.themes.join(
    ', ',
  )} themes right now will notice the energy shifting toward ${transit.themes[0]} and beyond.

> This transit doesn’t play out the same for everyone. Your rising sign, houses, and natal aspects change how this energy lands.

**Want to know how ${transit.title} affects your chart specifically?**  
[View your personal transit interpretation →](/horoscope)

### When does this transit occur?

${transit.dates}

### Signs most affected

${transit.signs.join(', ')} ${transit.signs.length > 1 ? 'are' : 'is'} most directly impacted.

### Key themes

${transit.themes.map((t) => `- ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('\n')}

### How this transit may show up for you

Depending on the house this transit activates in your natal chart, you may notice changes around:
${transit.themes.map((t) => `- ${t}`).join('\n')}

### How it affects you personally

When ${transit.title} crosses your natal sky, these themes can touch relationships, work, and personal rhythm—pay attention to how it lands in your chart. Revisit your [horoscope](/horoscope) for day-by-day timing and the [birth chart guide](/birth-chart) to see which houses and aspects are active so you can plan your next move with confidence.

### What to focus on

${transit.doList.map((d) => `- ${sentenceCase(d)}`).join('\n')}

### What to avoid

${transit.avoidList.map((a) => `- ${sentenceCase(a)}`).join('\n')}
`;
}
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

// 30-day ISR revalidation
export const revalidate = 2592000;
// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ transit: string }>;
}) {
  const { transit: transitId } = await params;

  const transit = YEARLY_TRANSITS.find((t) => t.id === transitId);
  if (!transit) {
    return { title: 'Transit Not Found | Lunary' };
  }

  return createGrimoireMetadata({
    title: `${transit.title} Transit: Dates, Meaning & What to Do | Lunary`,
    description: `${transit.title} transit (${transit.dates}) activates ${transit.themes.join(
      ', ',
    )}. Learn the meaning, likely effects, and grounded ways to work with this ${transit.transitType.toLowerCase()}.`,
    keywords: [
      transit.title.toLowerCase(),
      transit.transitType.toLowerCase(),
      `${transit.planet.toLowerCase()} transit ${transit.year}`,
      ...transit.signs.map(
        (s) => `${transit.planet.toLowerCase()} in ${s.toLowerCase()}`,
      ),
    ],
    url: `https://lunary.app/grimoire/transits/${transitId}`,
    ogImagePath: '/api/og/grimoire/transits',
    ogImageAlt: transit.title,
  });
}

export default async function TransitPage({
  params,
}: {
  params: Promise<{ transit: string }>;
}) {
  const { transit: transitId } = await params;

  const transit = YEARLY_TRANSITS.find((t) => t.id === transitId);
  if (!transit) {
    notFound();
  }

  const sameYearTransits = getTransitsForYear(transit.year).filter(
    (t) => t.id !== transitId,
  );

  const faqs = [
    {
      question: `What does ${transit.title} mean in astrology?`,
      answer: `${transit.description} It is a ${transit.transitType.toLowerCase()} moment where ${transit.planet} keeps shifting focus through ${transit.signs.join(
        ', ',
      )}.`,
    },
    {
      question: `When is ${transit.title}?`,
      answer: `${transit.title} occurs ${transit.dates}.`,
    },
    {
      question: `Is ${transit.title} good or bad?`,
      answer: `${transit.title} is considered ${transit.tone.toLowerCase()} How it feels depends on your natal chart and the house it activates.`,
    },
    {
      question: `Which zodiac signs feel ${transit.title} the most?`,
      answer: `${transit.signs.join(', ')} tend to feel this transit most strongly.`,
    },
    {
      question: `How do I work with ${transit.title}?`,
      answer: `Lean into ${formatSentenceList(transit.doList)} and keep a check on ${formatSentenceList(
        transit.avoidList,
      )} so you can stay grounded in this ${transit.tone.toLowerCase()} energy.`,
    },
    {
      question: `How does ${transit.title} affect career or relationships?`,
      answer: `The ${transit.themes.join(
        ', ',
      )} themes can make you reassess ambitions and how you relate to others, so keep conversations open and let practical adjustments guide the way.`,
    },
    {
      question: `How does ${transit.title} affect my personal chart?`,
      answer: `Your rising sign, house placements, and natal aspects determine how this transit plays out. A personalised reading shows timing and impact.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={transit.title}
      h1={transit.title}
      description={transit.description}
      keywords={[transit.transitType, transit.planet, ...transit.signs]}
      canonicalUrl={`https://lunary.app/grimoire/transits/${transitId}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Yearly Transits'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Transits', href: '/grimoire/transits' },
        {
          label: String(transit.year),
          href: `/grimoire/transits/year/${transit.year}`,
        },
        { label: transit.title },
      ]}
      whatIs={{
        question: `What is ${transit.title}?`,
        answer: transit.description,
      }}
      tldr={`${transit.title} (${transit.dates}) is a ${transit.tone.toLowerCase()} ${transit.transitType.toLowerCase()} led by ${transit.planet}. Signs: ${transit.signs.join(
        ', ',
      )}. Key themes: ${transit.themes.join(', ')}—expect shifts in focus that feel like ${transit.tone.toLowerCase()} momentum, and ground it by revisiting your chart.`}
      meaning={buildTransitMeaning(transit)}
      rituals={transit.doList}
      emotionalThemes={transit.themes.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={transit.signs}
      tables={[
        {
          title: 'Transit Overview',
          headers: ['Property', 'Value'],
          rows: [
            ['Transit', transit.transitType],
            ['Planet', transit.planet],
            ['Year', String(transit.year)],
            ['Dates', transit.dates],
            ['Signs', transit.signs.join(', ')],
          ],
        },
      ]}
      relatedItems={[
        {
          name: transit.planet,
          href: `/grimoire/astronomy/planets/${transit.planet.toLowerCase()}`,
          type: 'Planet',
        },
        ...transit.signs.slice(0, 2).map((s) => ({
          name: s,
          href: `/grimoire/zodiac/${s.toLowerCase()}`,
          type: 'Zodiac' as const,
        })),
      ]}
      ctaText={`See how ${transit.title} affects your chart, timing, and next steps`}
      ctaHref='/horoscope'
      sources={[{ name: 'Ephemeris calculations' }]}
      faqs={faqs}
    >
      {sameYearTransits.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-lg font-medium mb-4'>
            Other {transit.year} Transits
          </h3>
          <div className='flex flex-wrap gap-2'>
            {sameYearTransits.map((t) => (
              <Link
                key={t.id}
                href={`/grimoire/transits/${t.id}`}
                className='px-3 py-1.5 rounded-lg text-sm bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors'
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </SEOContentTemplate>
  );
}
