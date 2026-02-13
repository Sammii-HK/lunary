import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import transitData from '@/data/slow-planet-sign-changes.json';

// 30-day ISR revalidation
export const revalidate = 2592000;
// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

function sentenceCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSentenceList(items: string[]) {
  return items.map((item) => sentenceCase(item)).join(', ');
}

/**
 * Look up the FULL transit history for a planet in a sign from ephemeris data.
 * Returns all segments (including retrograde re-entries), total cumulative days,
 * and the previous time the planet was in this sign (for historical context).
 */
function getTransitEphemeris(planet: string, sign: string) {
  const segments = (
    transitData.segments as Record<
      string,
      Record<string, { start: string; end: string }[]>
    >
  )[planet];
  if (!segments?.[sign]) return null;

  const segs = segments[sign].map((s) => ({
    start: new Date(s.start),
    end: new Date(s.end),
  }));

  const msPerDay = 86400000;
  const totalDays = Math.ceil(
    segs.reduce(
      (sum, s) => sum + (s.end.getTime() - s.start.getTime()) / msPerDay,
      0,
    ),
  );

  return {
    segments: segs,
    totalDays,
    firstEntry: segs[0].start,
    finalExit: segs[segs.length - 1].end,
    hasRetrograde: segs.length > 1,
  };
}

/**
 * Find the previous time a planet was in a sign (before the current transit).
 * Uses all signs in the JSON data to find the sign entry before our segments.
 */
function getPreviousTransit(planet: string, sign: string) {
  const allSigns = (
    transitData.segments as Record<
      string,
      Record<string, { start: string; end: string }[]>
    >
  )[planet];
  if (!allSigns?.[sign]) return null;

  const currentSegs = allSigns[sign];
  if (currentSegs.length === 0) return null;

  // The JSON may contain multiple distinct transit periods (separated by decades)
  // Group segments that are close together (within 2 years) as one transit
  const groups: { start: Date; end: Date }[][] = [];
  let currentGroup: { start: Date; end: Date }[] = [];

  for (const seg of currentSegs) {
    const s = { start: new Date(seg.start), end: new Date(seg.end) };
    if (
      currentGroup.length === 0 ||
      s.start.getTime() - currentGroup[currentGroup.length - 1].end.getTime() <
        2 * 365 * 86400000
    ) {
      currentGroup.push(s);
    } else {
      groups.push(currentGroup);
      currentGroup = [s];
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  // If there are at least 2 groups, the first group is the "previous" transit
  if (groups.length >= 2) {
    const prev = groups[0];
    return {
      start: prev[0].start,
      end: prev[prev.length - 1].end,
    };
  }

  return null;
}

/**
 * Format a transit duration as a human-readable string.
 * E.g. "2 years, 1 month" or "13 months" or "3 months"
 */
function formatTransitDuration(totalDays: number): string {
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays - years * 365;
  const months = Math.round(remainingDays / 30);

  if (years >= 2) {
    return months > 0
      ? `approximately ${years} years and ${months} months`
      : `approximately ${years} years`;
  } else if (years === 1) {
    return months > 0
      ? `approximately 1 year and ${months} months`
      : `approximately 1 year`;
  } else if (totalDays >= 60) {
    return `approximately ${Math.round(totalDays / 30)} months`;
  } else if (totalDays >= 14) {
    return `approximately ${Math.round(totalDays / 7)} weeks`;
  }
  return `approximately ${totalDays} days`;
}

function buildTransitMeaning(
  transit: {
    title: string;
    description: string;
    dates: string;
    signs: string[];
    themes: string[];
    doList: string[];
    avoidList: string[];
    planet: string;
    startDate?: Date;
    endDate?: Date;
  },
  ephemeris: ReturnType<typeof getTransitEphemeris>,
  previousTransit: ReturnType<typeof getPreviousTransit>,
) {
  const dateSection = transit.startDate
    ? `**Entry date:** ${format(transit.startDate, 'MMMM d, yyyy')}`
    : '';

  const durationSection = ephemeris
    ? `**Duration:** ${formatTransitDuration(ephemeris.totalDays)}${ephemeris.hasRetrograde ? ' (including a brief retrograde return to the previous sign)' : ''}`
    : '';

  const exitSection = ephemeris?.finalExit
    ? `**Final exit:** ${format(ephemeris.finalExit, 'MMMM d, yyyy')}`
    : '';

  const historicalSection = previousTransit
    ? `**Previous transit:** ${transit.planet} was last in ${transit.signs[0]} from ${format(previousTransit.start, 'MMMM yyyy')} to ${format(previousTransit.end, 'MMMM yyyy')}.`
    : '';

  return `
## ${transit.title}

${transit.description}

${[dateSection, durationSection, exitSection, historicalSection].filter(Boolean).join('  \n')}

**Who this is for**
${transit.signs.join(', ')} ${transit.signs.length > 1 ? 'are' : 'is'} the placements this transit lands strongest in, and anyone navigating ${transit.themes.join(
    ', ',
  )} themes right now will notice the energy shifting toward ${transit.themes[0]} and beyond.

> This transit doesn't play out the same for everyone. Your rising sign, houses, and natal aspects change how this energy lands.

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

  // Build a keyword-rich title: include "Enters" and date when available
  const hasEnters = transit.title.toLowerCase().includes('enters');
  const dateHint = transit.startDate
    ? format(transit.startDate, 'MMMM d, yyyy')
    : '';

  // Title pattern: "Saturn Enters Taurus 2028: April 13 Date, Meaning & What to Do"
  const titleParts = [transit.title];
  if (dateHint && !hasEnters) {
    titleParts.push(`(${dateHint})`);
  }
  const seoTitle =
    dateHint && hasEnters
      ? `${transit.title}: ${format(transit.startDate!, 'MMMM d')} Date, Meaning & What to Do | Lunary`
      : `${transit.title} Transit: Dates, Meaning & What to Do | Lunary`;

  return createGrimoireMetadata({
    title: seoTitle,
    description: `${transit.title} transit (${transit.dates}) activates ${transit.themes.join(
      ', ',
    )}. Learn the exact date, meaning, likely effects, and grounded ways to work with this ${transit.transitType.toLowerCase()}.`,
    keywords: [
      transit.title.toLowerCase(),
      transit.transitType.toLowerCase(),
      `${transit.planet.toLowerCase()} transit ${transit.year}`,
      `${transit.planet.toLowerCase()} enters ${transit.signs[0]?.toLowerCase()} ${transit.year}`,
      `${transit.planet.toLowerCase()} enters ${transit.signs[0]?.toLowerCase()} ${transit.year} date`,
      `${transit.planet.toLowerCase()} in ${transit.signs[0]?.toLowerCase()} ${transit.year}`,
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

  // Look up ephemeris data for richer content
  const ephemeris = getTransitEphemeris(transit.planet, transit.signs[0]);
  const previousTransit = getPreviousTransit(transit.planet, transit.signs[0]);

  // Build richer table with computed dates
  const tableRows: [string, string][] = [
    ['Transit', transit.transitType],
    ['Planet', transit.planet],
    ['Sign', transit.signs.join(', ')],
    ['Dates', transit.dates],
  ];

  if (transit.startDate) {
    tableRows.push(['Entry Date', format(transit.startDate, 'MMMM d, yyyy')]);
  }
  if (ephemeris) {
    tableRows.push(['Exit Date', format(ephemeris.finalExit, 'MMMM d, yyyy')]);
    tableRows.push(['Duration', formatTransitDuration(ephemeris.totalDays)]);
    if (ephemeris.hasRetrograde) {
      tableRows.push([
        'Retrograde',
        'Yes (planet briefly returns to previous sign)',
      ]);
    }
  }
  if (previousTransit) {
    tableRows.push([
      'Last Time in This Sign',
      `${format(previousTransit.start, 'MMMM yyyy')} - ${format(previousTransit.end, 'MMMM yyyy')}`,
    ]);
  }

  // Auto-generate comprehensive FAQs from transit data
  const faqs: { question: string; answer: string }[] = [];

  // FAQ 1: "When does X enter Y?" — targets the high-volume "date" queries
  if (transit.startDate) {
    faqs.push({
      question: `What date does ${transit.planet} enter ${transit.signs[0]} in ${transit.year}?`,
      answer: `${transit.planet} enters ${transit.signs[0]} on ${format(transit.startDate, 'MMMM d, yyyy')}.${ephemeris ? ` This transit lasts ${formatTransitDuration(ephemeris.totalDays)}, with the final exit on ${format(ephemeris.finalExit, 'MMMM d, yyyy')}.` : ''}`,
    });
  }

  // FAQ 2: "How long will X be in Y?"
  if (ephemeris) {
    faqs.push({
      question: `How long will ${transit.planet} be in ${transit.signs[0]}?`,
      answer: `${transit.planet} will be in ${transit.signs[0]} for ${formatTransitDuration(ephemeris.totalDays)} (${transit.dates}).${ephemeris.hasRetrograde ? ` Note that ${transit.planet} briefly retrogrades back to the previous sign before re-entering ${transit.signs[0]} for its main transit.` : ''}`,
    });
  }

  // FAQ 3: "What does X in Y mean?"
  faqs.push({
    question: `What does ${transit.title} mean in astrology?`,
    answer: `${transit.description} It is a ${transit.transitType.toLowerCase()} moment where ${transit.planet} shifts focus through ${transit.signs.join(
      ', ',
    )}, activating themes of ${transit.themes.join(', ')}.`,
  });

  // FAQ 4: When is it?
  faqs.push({
    question: `When is ${transit.title}?`,
    answer: `${transit.title} occurs ${transit.dates}.${transit.startDate ? ` The exact entry date is ${format(transit.startDate, 'MMMM d, yyyy')}.` : ''}`,
  });

  // FAQ 5: Good or bad?
  faqs.push({
    question: `Is ${transit.title} good or bad?`,
    answer: `${transit.title} is considered ${transit.tone.toLowerCase()} How it feels depends on your natal chart and the house it activates.`,
  });

  // FAQ 6: Signs affected
  faqs.push({
    question: `Which zodiac signs feel ${transit.title} the most?`,
    answer: `${transit.signs.join(', ')} tend to feel this transit most strongly. However, all signs experience it through the house ${transit.planet} activates in their chart.`,
  });

  // FAQ 7: How to work with it
  faqs.push({
    question: `How do I work with ${transit.title}?`,
    answer: `Lean into ${formatSentenceList(transit.doList)} and keep a check on ${formatSentenceList(
      transit.avoidList,
    )} so you can stay grounded in this ${transit.tone.toLowerCase()} energy.`,
  });

  // FAQ 8: Historical context
  if (previousTransit) {
    faqs.push({
      question: `When was ${transit.planet} last in ${transit.signs[0]}?`,
      answer: `${transit.planet} was last in ${transit.signs[0]} from ${format(previousTransit.start, 'MMMM yyyy')} to ${format(previousTransit.end, 'MMMM yyyy')}. Think back to what was happening in your life around that time for clues about this transit's themes.`,
    });
  }

  // FAQ 9: Career/relationships
  faqs.push({
    question: `How does ${transit.title} affect career or relationships?`,
    answer: `The ${transit.themes.join(
      ', ',
    )} themes can make you reassess ambitions and how you relate to others, so keep conversations open and let practical adjustments guide the way.`,
  });

  // FAQ 10: Personal chart
  faqs.push({
    question: `How does ${transit.title} affect my personal chart?`,
    answer: `Your rising sign, house placements, and natal aspects determine how this transit plays out. A personalised reading shows timing and impact.`,
  });

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
      meaning={buildTransitMeaning(transit, ephemeris, previousTransit)}
      rituals={transit.doList}
      emotionalThemes={transit.themes.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={transit.signs}
      tables={[
        {
          title: 'Transit Overview',
          headers: ['Property', 'Value'],
          rows: tableRows,
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
