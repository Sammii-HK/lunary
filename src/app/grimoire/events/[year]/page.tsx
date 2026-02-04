import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Sparkles, Sun, Moon, ArrowRight, Satellite } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { generateYearlyForecast } from '@/lib/forecast/yearly';
import { format } from 'date-fns';
import { getTransitsForYear } from '@/constants/seo/yearly-transits';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';
import { Heading } from '@/components/ui/Heading';

// 30-day ISR revalidation
export const revalidate = 2592000;

// Dynamic year range: current year to 10 years in advance
// Keep historical years indexed (starting from 2025) and extend 10 years into the future
const START_YEAR = 2025;
const CURRENT_YEAR = new Date().getFullYear();
const END_YEAR = Math.max(CURRENT_YEAR + 10, START_YEAR + 10);
const AVAILABLE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i,
);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = parseInt(year);

  // Generate dynamic highlight from actual forecast data
  const forecast = await generateYearlyForecast(yearNum);

  // Get the most significant ingress for SEO highlight
  const majorIngress = forecast.ingresses.find(
    (i) =>
      ['Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(i.planet) &&
      !i.isRetrograde,
  );
  const highlight = majorIngress
    ? `${majorIngress.planet} Enters ${majorIngress.toSign}`
    : '';

  // Count special events for description
  const supermoonsCount = forecast.moonEvents.filter(
    (m) => m.type === 'supermoon',
  ).length;
  const eclipseCount = forecast.eclipses.length;
  const mercuryRxCount = forecast.retrogrades.filter(
    (r) => r.planet === 'Mercury',
  ).length;

  return {
    title: `${year} Astrology Events: ${highlight ? highlight + ', ' : ''}Eclipses, Retrogrades & Supermoons | Lunary`,
    description: `Complete ${year} cosmic calendar with ${eclipseCount} eclipses, ${mercuryRxCount} Mercury retrogrades, ${supermoonsCount} supermoons, equinoxes, solstices & planetary transits.${highlight ? ` Major event: ${highlight}.` : ''} Plan ahead with precise astronomical dates.`,
    keywords: [
      `${year} astrology`,
      `${year} mercury retrograde`,
      `${year} eclipses`,
      `${year} supermoon`,
      `${year} equinox`,
      `${year} solstice`,
      `${year} astrological events`,
      `${year} lunar calendar`,
      `${year} planetary transits`,
      `${year} retrograde dates`,
      `major astrological transits ${year}`,
      ...(majorIngress
        ? [
            `${majorIngress.planet.toLowerCase()} ${majorIngress.toSign.toLowerCase()} ${year}`,
          ]
        : []),
    ],
    openGraph: {
      title: `${year} Astrology Events: ${highlight ? highlight + ', ' : ''}Eclipses & Retrogrades | Lunary`,
      description: `Complete ${year} cosmic calendar: ${eclipseCount} eclipses, ${mercuryRxCount} Mercury retrogrades, supermoons & more. Plan ahead with precise dates.`,
      url: `https://lunary.app/grimoire/events/${year}`,
      siteName: 'Lunary',
      images: [`/api/og/cosmic?title=${year}%20Cosmic%20Events`],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/events/${year}`,
    },
  };
}

interface EventCategory {
  category: string;
  icon: typeof Star;
  color: 'orange' | 'pink' | 'amber' | 'blue';
  events: Array<{ date: string; description: string }>;
  link: string;
}

async function getEventsForYear(year: number): Promise<EventCategory[]> {
  // All data is now dynamically generated using astronomical calculations
  const forecast = await generateYearlyForecast(year);

  // Group retrogrades by planet
  const mercuryRetrogrades = forecast.retrogrades.filter(
    (r) => r.planet.toLowerCase() === 'mercury',
  );
  const venusRetrogrades = forecast.retrogrades.filter(
    (r) => r.planet.toLowerCase() === 'venus',
  );
  const marsRetrogrades = forecast.retrogrades.filter(
    (r) => r.planet.toLowerCase() === 'mars',
  );
  const outerRetrogrades = forecast.retrogrades.filter(
    (r) =>
      r.planet.toLowerCase() !== 'mercury' &&
      r.planet.toLowerCase() !== 'venus' &&
      r.planet.toLowerCase() !== 'mars',
  );

  // Format date range helper with validation
  const formatDateRange = (startDate: string, endDate: string): string => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return `${startDate} - ${endDate}`;
      }

      // Handle cross-year ranges
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();

      if (startYear !== endYear) {
        return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;
      }

      return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d')}`;
    } catch (error) {
      // Fallback to raw dates if formatting fails
      return `${startDate} - ${endDate}`;
    }
  };

  // Format single date with validation
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return format(date, 'MMMM d');
    } catch (error) {
      return dateStr;
    }
  };

  const categories: EventCategory[] = [];

  // Mercury Retrograde
  if (mercuryRetrogrades.length > 0) {
    categories.push({
      category: 'Mercury Retrograde',
      icon: Star,
      color: 'orange',
      events: mercuryRetrogrades.map((r) => ({
        date: formatDateRange(r.startDate, r.endDate),
        description: r.description
          .replace(/Mercury retrograde period \(/, '')
          .replace(/\)$/, ''),
      })),
      link: `/grimoire/events/${year}/mercury-retrograde`,
    });
  }

  // Venus Retrograde
  if (venusRetrogrades.length > 0) {
    categories.push({
      category: 'Venus Retrograde',
      icon: Sparkles,
      color: 'pink',
      events: venusRetrogrades.map((r) => ({
        date: formatDateRange(r.startDate, r.endDate),
        description: r.description
          .replace(/Venus retrograde period \(/, '')
          .replace(/\)$/, ''),
      })),
      link: `/grimoire/events/${year}/venus-retrograde`,
    });
  }

  // Mars Retrograde (happens every ~2 years, important enough for its own category)
  if (marsRetrogrades.length > 0) {
    categories.push({
      category: 'Mars Retrograde',
      icon: Star,
      color: 'orange',
      events: marsRetrogrades.map((r) => ({
        date: formatDateRange(r.startDate, r.endDate),
        description: r.description
          .replace(/Mars retrograde period \(/, '')
          .replace(/\)$/, ''),
      })),
      link: `/grimoire/events/${year}/mars-retrograde`,
    });
  }

  // Eclipses
  if (forecast.eclipses.length > 0) {
    categories.push({
      category: 'Eclipses',
      icon: Sun,
      color: 'amber',
      events: forecast.eclipses.map((e) => ({
        date: formatDate(e.date),
        description: `${e.type === 'solar' ? 'Solar' : 'Lunar'} Eclipse in ${e.sign}`,
      })),
      link: `/grimoire/events/${year}/eclipses`,
    });
  }

  // Seasonal Events (Equinoxes & Solstices)
  if (forecast.seasonalEvents && forecast.seasonalEvents.length > 0) {
    categories.push({
      category: 'Equinoxes & Solstices',
      icon: Sun,
      color: 'amber',
      events: forecast.seasonalEvents.map((s) => ({
        date: formatDate(s.date),
        description: s.type
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
      link: `/grimoire/events/${year}`,
    });
  }

  // Supermoons and special moon events
  const specialMoons =
    forecast.moonEvents?.filter(
      (m) =>
        m.type === 'supermoon' ||
        m.type === 'blue_moon' ||
        m.type === 'micromoon' ||
        m.type === 'black_moon',
    ) || [];
  if (specialMoons.length > 0) {
    categories.push({
      category: 'Special Moons',
      icon: Moon,
      color: 'pink',
      events: specialMoons.map((m) => ({
        date: formatDate(m.date),
        description: `${m.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} in ${m.sign}`,
      })),
      link: `/grimoire/moon`,
    });
  }

  // Planetary Elongations (Mercury/Venus visibility)
  if (
    forecast.planetaryElongations &&
    forecast.planetaryElongations.length > 0
  ) {
    categories.push({
      category: 'Planetary Visibility',
      icon: Star,
      color: 'blue',
      events: forecast.planetaryElongations.map((e) => ({
        date: formatDate(e.date),
        description: `${e.planet} - ${e.visibility} star (${e.elongation}°)`,
      })),
      link: `/grimoire/astronomy`,
    });
  }

  // Major Planetary Conjunctions (rare events)
  if (forecast.conjunctions && forecast.conjunctions.length > 0) {
    categories.push({
      category: 'Major Conjunctions',
      icon: Sparkles,
      color: 'amber',
      events: forecast.conjunctions.map((c) => ({
        date: formatDate(c.date),
        description: `${c.planet1}-${c.planet2} in ${c.sign}`,
      })),
      link: `/grimoire/transits/year/${year}`,
    });
  }

  // Sign Changes (Ingresses) - major planet sign changes
  if (forecast.ingresses && forecast.ingresses.length > 0) {
    categories.push({
      category: 'Major Sign Changes',
      icon: Satellite,
      color: 'pink',
      events: forecast.ingresses.map((i) => ({
        date: formatDate(i.exactDate),
        description: `${i.planet} enters ${i.toSign}${i.isRetrograde ? ' (Retrograde)' : ''}`,
      })),
      link: `/grimoire/transits/year/${year}`,
    });
  }

  // Outer Planet Retrogrades (Jupiter, Saturn, Uranus, Neptune, Pluto)
  if (outerRetrogrades.length > 0) {
    categories.push({
      category: 'Outer Planet Retrogrades',
      icon: Moon,
      color: 'blue',
      events: outerRetrogrades.map((r) => ({
        date: formatDateRange(r.startDate, r.endDate),
        description: `${r.planet} Retrograde`,
      })),
      link: `/grimoire/events/${year}/retrogrades`,
    });
  }

  // Add static transits data if available (for backwards compatibility)
  const transits = getTransitsForYear(year);
  if (transits.length > 0) {
    categories.push({
      category: 'Major Transits',
      icon: Satellite,
      color: 'blue',
      events: transits.map((t) => ({ date: t.dates, description: t.title })),
      link: `/grimoire/transits/year/${year}`,
    });
  }

  return categories;
}

function getSummaryStats(
  year: number,
  events: EventCategory[],
): {
  mercuryRetrograde: number;
  venusRetrograde: number;
  eclipses: number;
  outerPlanetRx: number;
  signChanges: number;
  specialMoons: number;
  seasonalEvents: number;
  conjunctions: number;
} {
  const mercury = events.find((e) => e.category === 'Mercury Retrograde');
  const venus = events.find((e) => e.category === 'Venus Retrograde');
  const eclipses = events.find((e) => e.category === 'Eclipses');
  const other = events.find((e) => e.category === 'Outer Planet Retrogrades');
  const signChanges = events.find((e) => e.category === 'Major Sign Changes');
  const specialMoons = events.find((e) => e.category === 'Special Moons');
  const seasonal = events.find((e) => e.category === 'Equinoxes & Solstices');
  const conjunctions = events.find((e) => e.category === 'Major Conjunctions');

  return {
    mercuryRetrograde: mercury?.events.length || 0,
    venusRetrograde: venus?.events.length || 0,
    eclipses: eclipses?.events.length || 0,
    outerPlanetRx: other?.events.length || 0,
    signChanges: signChanges?.events.length || 0,
    specialMoons: specialMoons?.events.length || 0,
    seasonalEvents: seasonal?.events.length || 0,
    conjunctions: conjunctions?.events.length || 0,
  };
}

const colorClasses: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  orange: {
    border: 'border-lunary-rose-700',
    bg: 'bg-lunary-rose-950',
    text: 'text-lunary-rose',
  },
  pink: {
    border: 'border-lunary-rose-700',
    bg: 'bg-lunary-rose-950',
    text: 'text-lunary-rose',
  },
  amber: {
    border: 'border-lunary-accent-700',
    bg: 'bg-lunary-accent-950',
    text: 'text-lunary-accent',
  },
  blue: {
    border: 'border-lunary-secondary-700',
    bg: 'bg-lunary-secondary-950',
    text: 'text-lunary-secondary',
  },
};

export default async function EventsYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearNum = parseInt(year);
  const nextYear = yearNum + 1;

  const minYear = START_YEAR;
  const maxYear = END_YEAR;
  if (yearNum < minYear || yearNum > maxYear) {
    notFound();
  }

  const events = await getEventsForYear(yearNum);
  const stats = getSummaryStats(yearNum, events);
  const hubSections = getCosmicConnections('hub-events', 'events');
  const cosmicSections = [
    ...hubSections,
    {
      title: `${year} Coverage`,
      links: [
        {
          label: `${year} Astrology Events`,
          href: `/grimoire/events/${year}`,
        },
        {
          label: `${year} Eclipses`,
          href: `/grimoire/events/${year}/eclipses`,
        },
        {
          label: `${year} Mercury Retrograde`,
          href: `/grimoire/events/${year}/mercury-retrograde`,
        },
        {
          label: `${year} Venus Retrograde`,
          href: `/grimoire/events/${year}/venus-retrograde`,
        },
      ],
    },
    {
      title: 'Other Years',
      links: AVAILABLE_YEARS.filter((y) => y !== yearNum).map((y) => ({
        label: `${y} Astrology Events`,
        href: `/grimoire/events/${y}`,
      })),
    },
  ];
  const eclipseCategory = events.find((event) => event.category === 'Eclipses');
  const eclipseEntries =
    eclipseCategory?.events.map((event) => {
      const [typePart, signPart] = event.description.split(' in ');
      return {
        date: event.date,
        type: typePart || 'Eclipse',
        sign: signPart || '—',
        theme: 'Cosmic shift',
      };
    }) ?? [];

  const faqs = [
    {
      question: `What are the major astrological events in ${year}?`,
      answer: `${year} features ${stats.mercuryRetrograde} Mercury retrograde periods, ${stats.venusRetrograde} Venus retrograde period, ${stats.eclipses} eclipses, ${stats.outerPlanetRx} outer planet retrograde periods${stats.signChanges > 0 ? `, and ${stats.signChanges} major planet sign changes` : ''}.`,
    },
    {
      question: `When is Mercury retrograde in ${year}?`,
      answer: `Mercury retrograde occurs ${stats.mercuryRetrograde} times in ${year}. Check the calendar above for specific dates and signs.`,
    },
    {
      question: `How many eclipses occur in ${year}?`,
      answer: `There are ${stats.eclipses} eclipses in ${year}, including both solar and lunar eclipses.`,
    },
    ...(stats.signChanges > 0
      ? [
          {
            question: `What major planet sign changes happen in ${year}?`,
            answer: `${year} includes ${stats.signChanges} significant planetary sign changes. These are moments when slow-moving outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) enter new zodiac signs, marking major shifts in collective energy that affect everyone.`,
          },
        ]
      : []),
    {
      question: `What should I know about ${year} astrological events?`,
      answer: `${year} brings significant cosmic shifts with retrogrades, eclipses, ${stats.signChanges > 0 ? 'major sign changes, ' : ''}and planetary transits. Use this calendar to plan ahead and align with cosmic energies.`,
    },
  ];

  const meaningContent = `
### ${year} Astrological Events Overview

Your complete guide to navigating the cosmic events of ${year}. This calendar includes all major retrogrades, eclipses, and planetary transits that will shape the year ahead.

#### Major Events at a Glance

- **Mercury Retrograde**: ${stats.mercuryRetrograde} periods
- **Venus Retrograde**: ${stats.venusRetrograde} period
- **Eclipses**: ${stats.eclipses} total (solar and lunar)
- **Outer Planet Retrogrades**: ${stats.outerPlanetRx} periods

#### Understanding the Calendar

Each event category below provides detailed information about timing, astrological signs involved, and how these cosmic shifts may affect you. Click through to individual event pages for deeper insights and guidance.

#### Planning Your Year

Use this calendar to:
- Plan important decisions around retrograde periods
- Prepare for eclipse seasons (powerful transformation times)
- Align major life changes with supportive planetary energies
- Understand the cosmic rhythm of ${year}

#### Getting Personalized Guidance

While these events affect everyone, their impact on your personal chart is unique. Consider getting a personalized forecast to see how ${year}'s cosmic events specifically influence your birth chart.
  `;

  return (
    <SEOContentTemplate
      title={`${year} Astrological Events Calendar | Lunary`}
      h1={`${year} Cosmic Events Calendar`}
      description={`Complete guide to ${year} astrological events including Mercury retrograde dates, Venus retrograde, eclipses, equinoxes, and major planetary transits.`}
      keywords={[
        `${year} astrology`,
        `${year} mercury retrograde`,
        `${year} eclipses`,
        `${year} astrological events`,
        `${year} lunar calendar`,
        `${year} planetary transits`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/events/${year}`}
      datePublished={`${year}-01-01`}
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Astrological Events'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Events', href: '/grimoire/events' },
        { label: year },
      ]}
      whatIs={{
        question: `What are the astrological events in ${year}?`,
        answer: `${year} features ${stats.mercuryRetrograde} Mercury retrograde periods, ${stats.venusRetrograde} Venus retrograde, ${stats.eclipses} eclipses, ${stats.outerPlanetRx} outer planet retrograde periods${stats.signChanges > 0 ? `, and ${stats.signChanges} major planet sign changes` : ''}. This calendar provides complete dates and guidance for navigating all major cosmic events.`,
      }}
      intro={`Major astrological events gathers the eclipses, retrogrades, and major transits that matter so you can scan the dates and the quick meaning they carry. Each date also notes what to expect so you can plan within the timing instead of reacting to it.`}
      tldr={`${year} Astrological Events: ${stats.mercuryRetrograde} Mercury retrogrades, ${stats.venusRetrograde} Venus retrograde, ${stats.eclipses} eclipses, ${stats.outerPlanetRx} outer planet retrogrades. Use this calendar to plan ahead and align with cosmic energies.`}
      meaning={meaningContent}
      faqs={faqs}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-events'
          entityKey='events'
          title={`${year} Event Connections`}
          sections={cosmicSections}
        />
      }
    >
      {/* Custom content: Events Calendar */}
      <div className='mt-8 space-y-8'>
        {nextYear <= maxYear && (
          <section className='rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-5'>
            <Heading as='h2' variant='h3' className='text-zinc-100 mb-3'>
              Upcoming events
            </Heading>
            <div className='grid gap-3 md:grid-cols-2'>
              <Link
                href='/grimoire/events'
                className='px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm font-medium text-zinc-200 hover:border-lunary-primary-500 transition-colors'
              >
                Current astrology events
              </Link>
              <Link
                href={`/grimoire/events/${nextYear}`}
                className='px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950 text-sm font-medium text-zinc-200 hover:border-lunary-primary-500 transition-colors'
              >
                Astrology events {nextYear}
              </Link>
            </div>
          </section>
        )}
        {/* Quick Summary */}
        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <Heading
            as='h2'
            variant='h2'
            className='text-lunary-primary-300 mb-4'
          >
            {year} At a Glance
          </Heading>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 text-center'>
            <div>
              <div className='text-3xl font-light text-lunary-primary-400'>
                {stats.mercuryRetrograde}
              </div>
              <div className='text-sm text-zinc-400'>Mercury Retrogrades</div>
            </div>
            <div>
              <div className='text-3xl font-light text-lunary-primary-400'>
                {stats.venusRetrograde}
              </div>
              <div className='text-sm text-zinc-400'>Venus Retrograde</div>
            </div>
            <div>
              <div className='text-3xl font-light text-lunary-primary-400'>
                {stats.eclipses}
              </div>
              <div className='text-sm text-zinc-400'>Eclipses</div>
            </div>
            <div>
              <div className='text-3xl font-light text-lunary-primary-400'>
                {stats.outerPlanetRx}
              </div>
              <div className='text-sm text-zinc-400'>Outer Planet Rx</div>
            </div>
            {stats.signChanges > 0 && (
              <div>
                <div className='text-3xl font-light text-lunary-primary-400'>
                  {stats.signChanges}
                </div>
                <div className='text-sm text-zinc-400'>Sign Changes</div>
              </div>
            )}
          </div>
        </div>
        {eclipseEntries.length > 0 && (
          <section className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6'>
            <Heading as='h2' variant='h2'>
              {year} Eclipse Calendar
            </Heading>
            <div className='max-w-full overflow-x-auto'>
              <table className='w-full border-collapse border border-zinc-800'>
                <thead>
                  <tr className='bg-zinc-800/50'>
                    <th className='border border-zinc-800 px-3 py-2 text-left text-zinc-200 font-medium'>
                      Date
                    </th>
                    <th className='border border-zinc-800 px-3 py-2 text-left text-zinc-200 font-medium'>
                      Type
                    </th>
                    <th className='border border-zinc-800 px-3 py-2 text-left text-zinc-200 font-medium'>
                      Sign
                    </th>
                    <th className='border border-zinc-800 px-3 py-2 text-left text-zinc-200 font-medium'>
                      Theme
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eclipseEntries.map((entry) => (
                    <tr key={`${entry.date}-${entry.type}`}>
                      <td className='border border-zinc-800 px-3 py-2 text-zinc-300'>
                        {entry.date}
                      </td>
                      <td className='border border-zinc-800 px-3 py-2 text-zinc-300'>
                        {entry.type}
                      </td>
                      <td className='border border-zinc-800 px-3 py-2 text-zinc-300'>
                        {entry.sign}
                      </td>
                      <td className='border border-zinc-800 px-3 py-2 text-zinc-300'>
                        {entry.theme}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {/* Events by Category */}
        <div className='space-y-8'>
          {events.map((category, index) => {
            const Icon = category.icon;
            const colors = colorClasses[category.color];
            return (
              <section
                key={index}
                className={`p-6 rounded-lg border ${colors.border} ${colors.bg}`}
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                    <Heading as='h2' variant='h2'>
                      {category.category}
                    </Heading>
                  </div>
                </div>
                <div className='space-y-3'>
                  {category.events.map((event, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0'
                    >
                      <span className='text-zinc-100 font-medium'>
                        {event.date}
                      </span>
                      <span className='text-zinc-400 text-sm'>
                        {event.description}
                      </span>
                    </div>
                  ))}
                  <Link
                    href={category.link}
                    className={`flex w-full items-center align-middle gap-1 text-sm ${colors.text} justify-end hover:underline`}
                  >
                    View {category.category} Details{' '}
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
