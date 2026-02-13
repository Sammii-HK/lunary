import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { retrogradeInfo } from '@/constants/grimoire/seo-data';
import { createEventSchema, renderJsonLd } from '@/lib/schema';
import { generateYearlyForecast } from '@/lib/forecast/yearly';

// 30-day ISR revalidation
export const revalidate = 2592000;

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

/**
 * Fetch retrograde periods for a specific planet across current + next year.
 * Returns formatted date ranges with signs extracted from description.
 */
async function getRetrogradeDates(planetSlug: string) {
  const currentYear = new Date().getFullYear();
  const planetName = planetSlug.charAt(0).toUpperCase() + planetSlug.slice(1);

  const years = [currentYear, currentYear + 1];
  const periods: {
    year: number;
    startDate: string;
    endDate: string;
    signs: string;
    formatted: string;
  }[] = [];

  for (const yr of years) {
    try {
      const forecast = await generateYearlyForecast(yr);
      const planetRetrogrades = forecast.retrogrades.filter(
        (r) => r.planet === planetName,
      );
      for (const r of planetRetrogrades) {
        // Extract signs from description like "Mercury retrograde period (Pisces → Aquarius)"
        const signMatch = r.description.match(/\((.+?)\)/);
        const signs = signMatch ? signMatch[1] : '';

        const start = new Date(r.startDate);
        const end = r.endDate ? new Date(r.endDate) : null;

        periods.push({
          year: yr,
          startDate: r.startDate,
          endDate: r.endDate,
          signs,
          formatted: end
            ? `${format(start, 'MMMM d')} – ${format(end, 'MMMM d, yyyy')}${signs ? ` (${signs})` : ''}`
            : `${format(start, 'MMMM d, yyyy')} onwards${signs ? ` (${signs})` : ''}`,
        });
      }
    } catch {
      // If forecast fails for a year, skip it
    }
  }

  return { periods, years };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet: string }>;
}): Promise<Metadata> {
  const { planet } = await params;
  const retrogradeData = retrogradeInfo[planet as keyof typeof retrogradeInfo];

  if (!retrogradeData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const planetName = retrogradeData.name.replace(' Retrograde', '');
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // SEO-optimized title targeting high-volume queries
  const title = `${retrogradeData.name} ${currentYear}: Dates, Meaning & Survival Guide | Lunary`;
  const description = `Complete ${retrogradeData.name} dates for ${currentYear} and ${nextYear}. When it starts, how long it lasts, what to expect, and how to survive each retrograde period.`;

  return {
    title,
    description,
    keywords: [
      `${retrogradeData.name.toLowerCase()}`,
      `${retrogradeData.name.toLowerCase()} ${currentYear}`,
      `${retrogradeData.name.toLowerCase()} ${nextYear}`,
      `${retrogradeData.name.toLowerCase()} dates ${currentYear}`,
      `${retrogradeData.name.toLowerCase()} dates`,
      `when is ${retrogradeData.name.toLowerCase()} ${currentYear}`,
      `${retrogradeData.name.toLowerCase()} meaning`,
      `${retrogradeData.name.toLowerCase()} effects`,
      `${planetName.toLowerCase()} retrograde`,
      `${planetName.toLowerCase()} retrograde ${currentYear} dates`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/astronomy/retrogrades/${planet}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/retrogrades',
          width: 1200,
          height: 630,
          alt: `${retrogradeData.name}`,
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
      canonical: `https://lunary.app/grimoire/astronomy/retrogrades/${planet}`,
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

export default async function RetrogradePage({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;
  const retrogradeData = retrogradeInfo[planet as keyof typeof retrogradeInfo];

  if (!retrogradeData) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const planetName = retrogradeData.name.replace(' Retrograde', '');

  // Fetch actual computed retrograde dates for current + next year
  const { periods } = await getRetrogradeDates(planet);
  const currentYearPeriods = periods.filter((p) => p.year === currentYear);
  const nextYearPeriods = periods.filter((p) => p.year === nextYear);

  // Build date-specific table rows
  const dateTableRows: [string, string][] = [];
  currentYearPeriods.forEach((p, i) => {
    dateTableRows.push([
      `${currentYear} Retrograde ${currentYearPeriods.length > 1 ? i + 1 : ''}`.trim(),
      p.formatted,
    ]);
  });
  nextYearPeriods.forEach((p, i) => {
    dateTableRows.push([
      `${nextYear} Retrograde ${nextYearPeriods.length > 1 ? i + 1 : ''}`.trim(),
      p.formatted,
    ]);
  });

  // Build date schedule text for the meaning section
  const dateSchedule =
    periods.length > 0
      ? `## ${retrogradeData.name} ${currentYear} & ${nextYear} Dates

${currentYearPeriods.length > 0 ? `### ${currentYear} Dates\n\n${currentYearPeriods.map((p, i) => `${i + 1}. **${p.formatted}**`).join('\n')}\n\nSee complete [${currentYear} astrological events calendar →](/grimoire/events/${currentYear})` : ''}

${nextYearPeriods.length > 0 ? `### ${nextYear} Dates\n\n${nextYearPeriods.map((p, i) => `${i + 1}. **${p.formatted}**`).join('\n')}\n\nSee complete [${nextYear} astrological events calendar →](/grimoire/events/${nextYear})` : ''}`
      : '';

  // Richer FAQs with date-specific answers
  const faqs = [
    // FAQ 1: Date query — highest volume
    ...(currentYearPeriods.length > 0
      ? [
          {
            question: `When is ${retrogradeData.name} ${currentYear}?`,
            answer: `${retrogradeData.name} occurs ${currentYearPeriods.length} time${currentYearPeriods.length > 1 ? 's' : ''} in ${currentYear}: ${currentYearPeriods.map((p) => p.formatted).join('; ')}.`,
          },
        ]
      : []),
    // FAQ 2: Next year dates
    ...(nextYearPeriods.length > 0
      ? [
          {
            question: `When is ${retrogradeData.name} ${nextYear}?`,
            answer: `${retrogradeData.name} occurs ${nextYearPeriods.length} time${nextYearPeriods.length > 1 ? 's' : ''} in ${nextYear}: ${nextYearPeriods.map((p) => p.formatted).join('; ')}.`,
          },
        ]
      : []),
    {
      question: `How often does ${retrogradeData.name} occur?`,
      answer: `${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} and lasts ${retrogradeData.duration.toLowerCase()}.`,
    },
    {
      question: `What are the effects of ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, you may experience ${retrogradeData.effects.join(', ').toLowerCase()}.`,
    },
    {
      question: `What should I do during ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, focus on ${retrogradeData.whatToDo.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `What should I avoid during ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, avoid ${retrogradeData.whatToAvoid.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `Is ${retrogradeData.name} really bad?`,
      answer: `${retrogradeData.name} is not inherently bad. It is a period for review, reflection, and revision. Problems often arise when we resist the need to slow down. Working with the energy — revisiting old projects, reconnecting with people, and double-checking details — can make this a productive time.`,
    },
    {
      question: `How do I survive ${retrogradeData.name}?`,
      answer: `Back up your devices, re-read important messages before sending, avoid signing major contracts if possible, and use this time to revisit unfinished projects. Patience and flexibility are your best tools.`,
    },
  ];

  const retrogradeSchema = createEventSchema({
    name: `${retrogradeData.name} ${currentYear}`,
    description: `${retrogradeData.name} dates for ${currentYear} and ${nextYear}. Occurs ${retrogradeData.frequency.toLowerCase()} for ${retrogradeData.duration.toLowerCase()}.`,
    url: `/grimoire/astronomy/retrogrades/${planet}`,
    startDate: currentYearPeriods[0]?.startDate || `${currentYear}-01-01`,
    eventType: 'Event',
    keywords: [
      retrogradeData.name.toLowerCase(),
      `${planet} retrograde ${currentYear}`,
      `${planet} retrograde ${nextYear}`,
      `${planet} retrograde dates`,
      'retrograde',
      'planetary retrograde',
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(retrogradeSchema)}
      <SEOContentTemplate
        title={`${retrogradeData.name} ${currentYear} - Lunary`}
        h1={`${retrogradeData.name} ${currentYear}: Dates & Survival Guide`}
        description={`Complete ${retrogradeData.name} dates for ${currentYear} and ${nextYear}, plus meaning, effects, and how to navigate each period.`}
        keywords={[
          retrogradeData.name,
          `${retrogradeData.name.toLowerCase()} ${currentYear}`,
          `${retrogradeData.name.toLowerCase()} dates`,
          `${retrogradeData.name.toLowerCase()} meaning`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/astronomy/retrogrades/${planet}`}
        dateModified={new Date().toISOString().split('T')[0]}
        intro={`${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} and lasts ${retrogradeData.duration.toLowerCase()}. ${retrogradeData.description} Below you will find all ${currentYear} and ${nextYear} dates, plus practical guidance for each period.`}
        tldr={`${retrogradeData.name} happens ${retrogradeData.frequency.toLowerCase()} for ${retrogradeData.duration.toLowerCase()}. In ${currentYear} it occurs ${currentYearPeriods.length} time${currentYearPeriods.length !== 1 ? 's' : ''}.`}
        meaning={`${dateSchedule}

## What is ${retrogradeData.name}?

A retrograde occurs when a planet appears to move backward in the sky from our perspective on Earth. While ${planetName} does not actually reverse direction, this optical illusion creates a distinct astrological influence.

${retrogradeData.description}

During retrograde periods, the planet's energy turns inward, creating opportunities for reflection, review, and re-evaluation. This is a time to work with internal processes rather than external actions.

## Effects of ${retrogradeData.name}

${retrogradeData.effects.map((e) => `- ${e}`).join('\n')}

## How to Navigate ${retrogradeData.name}

${retrogradeData.whatToDo.map((d) => `- ${d}`).join('\n')}

## What to Avoid During ${retrogradeData.name}

${retrogradeData.whatToAvoid.map((a) => `- ${a}`).join('\n')}`}
        howToWorkWith={retrogradeData.whatToDo}
        tables={[
          ...(dateTableRows.length > 0
            ? [
                {
                  title: `${retrogradeData.name} ${currentYear}-${nextYear} Schedule`,
                  headers: ['Period', 'Dates'] as [string, string],
                  rows: dateTableRows,
                },
              ]
            : []),
          {
            title: `${retrogradeData.name} Overview`,
            headers: ['Aspect', 'Details'] as [string, string],
            rows: [
              ['Frequency', retrogradeData.frequency],
              ['Duration', retrogradeData.duration],
              ['Key Effects', retrogradeData.effects.slice(0, 3).join(', ')],
            ],
          },
        ]}
        rituals={[
          `During ${retrogradeData.name}, focus on ${retrogradeData.whatToDo.join(', ').toLowerCase()}. This is a time for internal work and reflection.`,
        ]}
        journalPrompts={[
          `What does ${retrogradeData.name} mean for me?`,
          `What areas need review during this retrograde?`,
          `How can I work with ${retrogradeData.name} energy?`,
          `What should I focus on during this period?`,
        ]}
        relatedItems={[
          {
            name: planetName,
            href: `/grimoire/astronomy/planets/${planet}`,
            type: 'Planet',
          },
          {
            name: `${currentYear} Events Calendar`,
            href: `/grimoire/events/${currentYear}`,
            type: 'Guide',
          },
          {
            name: 'Birth Chart',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy', href: '/grimoire/astronomy' },
          { label: 'Retrogrades', href: '/grimoire/astronomy/retrogrades' },
          {
            label: retrogradeData.name,
            href: `/grimoire/astronomy/retrogrades/${planet}`,
          },
        ]}
        internalLinks={[
          {
            text: `${currentYear} Astrological Events`,
            href: `/grimoire/events/${currentYear}`,
          },
          {
            text: `${nextYear} Astrological Events`,
            href: `/grimoire/events/${nextYear}`,
          },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
        ]}
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='planet'
            entityKey={planet}
            title={`${retrogradeData.name} Cosmic Connections`}
          />
        }
      >
        {/* Cross-link to events pages for year-specific deep dives */}
        <nav className='mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'>
          <h3 className='text-sm font-medium text-zinc-300 mb-3'>
            {planetName} Retrograde by Year
          </h3>
          <div className='flex flex-wrap gap-2'>
            {[currentYear - 1, currentYear, nextYear].map((yr) => (
              <Link
                key={yr}
                href={`/grimoire/events/${yr}`}
                className='px-3 py-1.5 rounded-lg text-sm bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors'
              >
                {yr} Events
              </Link>
            ))}
          </div>
        </nav>
      </SEOContentTemplate>
    </div>
  );
}
