import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { generateYearlyForecast } from '@/lib/forecast/yearly';
import { format } from 'date-fns';

export async function generateStaticParams() {
  return [2025, 2026, 2027, 2028, 2029, 2030].map((year) => ({
    year: year.toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = parseInt(year);

  if (yearNum < 2025 || yearNum > 2030) {
    return {};
  }

  if (yearNum === 2025) {
    const title =
      'Major Astrological Events 2025: Eclipses, Retrogrades, Key Dates | Lunary';
    const description =
      'Major astrological events 2025 highlights eclipses, retrogrades, and the key transits that shape the year so you can track the dates and their meaning.';
    return {
      title,
      description,
      keywords: [
        '2025 astrological events',
        '2025 eclipses',
        '2025 retrogrades',
        '2025 transits',
        'astrology calendar 2025',
      ],
      openGraph: {
        title,
        description,
        url: 'https://lunary.app/grimoire/events/2025',
        siteName: 'Lunary',
        images: ['/api/og/cosmic?title=2025%20Cosmic%20Events'],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: 'https://lunary.app/grimoire/events/2025',
      },
    };
  }

  return {
    title: `${year} Astrological Events Calendar | Lunary`,
    description: `Complete guide to ${year} astrological events including Mercury retrograde dates, Venus retrograde, eclipses, equinoxes, and major planetary transits.`,
    keywords: [
      `${year} astrology`,
      `${year} mercury retrograde`,
      `${year} eclipses`,
      `${year} astrological events`,
      `${year} lunar calendar`,
      `${year} planetary transits`,
    ],
    openGraph: {
      title: `${year} Astrological Events | Lunary`,
      description: `Your complete guide to cosmic events in ${year}.`,
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
  // Hardcoded data for known years (2025, 2026)
  const eventsData: Record<number, EventCategory[]> = {
    2025: [
      {
        category: 'Mercury Retrograde',
        icon: Star,
        color: 'orange',
        events: [
          { date: 'March 14 - April 7', description: 'Aries → Pisces' },
          { date: 'July 18 - August 11', description: 'Leo → Cancer' },
          { date: 'November 9 - 29', description: 'Sagittarius → Scorpio' },
        ],
        link: `/grimoire/events/${year}/mercury-retrograde`,
      },
      {
        category: 'Venus Retrograde',
        icon: Sparkles,
        color: 'pink',
        events: [{ date: 'March 1 - April 12', description: 'Aries → Pisces' }],
        link: `/grimoire/events/${year}/venus-retrograde`,
      },
      {
        category: 'Eclipses',
        icon: Sun,
        color: 'amber',
        events: [
          { date: 'March 14', description: 'Total Lunar Eclipse in Virgo' },
          { date: 'March 29', description: 'Partial Solar Eclipse in Aries' },
          { date: 'September 7', description: 'Total Lunar Eclipse in Pisces' },
          {
            date: 'September 21',
            description: 'Partial Solar Eclipse in Virgo',
          },
        ],
        link: `/grimoire/events/${year}/eclipses`,
      },
      {
        category: 'Other Retrogrades',
        icon: Moon,
        color: 'blue',
        events: [
          { date: 'May 4 - September 1', description: 'Pluto Retrograde' },
          { date: 'July 7 - November 27', description: 'Saturn Retrograde' },
          { date: 'July 19 - December 7', description: 'Neptune Retrograde' },
          {
            date: 'September 1 - February 2026',
            description: 'Uranus Retrograde',
          },
          {
            date: 'October 9 - February 2026',
            description: 'Jupiter Retrograde',
          },
          {
            date: 'December 6 - February 2026',
            description: 'Mars Retrograde',
          },
        ],
        link: '/grimoire/astronomy',
      },
    ],
    2026: [
      {
        category: 'Mercury Retrograde',
        icon: Star,
        color: 'orange',
        events: [
          { date: 'February 23 - March 18', description: 'Pisces → Aquarius' },
          { date: 'June 26 - July 20', description: 'Cancer → Gemini' },
          { date: 'October 21 - November 10', description: 'Scorpio → Libra' },
        ],
        link: `/grimoire/events/${year}/mercury-retrograde`,
      },
      {
        category: 'Venus Retrograde',
        icon: Sparkles,
        color: 'pink',
        events: [
          { date: 'July 23 - September 3', description: 'Leo → Cancer' },
        ],
        link: `/grimoire/events/${year}/venus-retrograde`,
      },
      {
        category: 'Eclipses',
        icon: Sun,
        color: 'amber',
        events: [
          { date: 'March 3', description: 'Total Lunar Eclipse in Virgo' },
          { date: 'March 18', description: 'Partial Solar Eclipse in Pisces' },
          { date: 'August 28', description: 'Total Lunar Eclipse in Pisces' },
          {
            date: 'September 12',
            description: 'Partial Solar Eclipse in Virgo',
          },
        ],
        link: `/grimoire/events/${year}/eclipses`,
      },
      {
        category: 'Other Retrogrades',
        icon: Moon,
        color: 'blue',
        events: [
          { date: 'May 1 - October 8', description: 'Pluto Retrograde' },
          { date: 'June 29 - November 15', description: 'Saturn Retrograde' },
          { date: 'July 2 - December 6', description: 'Neptune Retrograde' },
          {
            date: 'January 26 - August 28',
            description: 'Uranus Retrograde',
          },
          {
            date: 'October 9 - February 2027',
            description: 'Jupiter Retrograde',
          },
          {
            date: 'December 6 - February 2027',
            description: 'Mars Retrograde',
          },
        ],
        link: '/grimoire/astronomy',
      },
    ],
  };

  // For future years (2027+), generate data dynamically using astronomical calculations
  if (!eventsData[year]) {
    const forecast = await generateYearlyForecast(year);

    // Group retrogrades by planet
    const mercuryRetrogrades = forecast.retrogrades.filter(
      (r) => r.planet.toLowerCase() === 'mercury',
    );
    const venusRetrogrades = forecast.retrogrades.filter(
      (r) => r.planet.toLowerCase() === 'venus',
    );
    const otherRetrogrades = forecast.retrogrades.filter(
      (r) =>
        r.planet.toLowerCase() !== 'mercury' &&
        r.planet.toLowerCase() !== 'venus',
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

        const startFormatted = format(start, 'MMMM d');
        const endFormatted = format(end, 'MMMM d');
        return `${startFormatted} - ${endFormatted}`;
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

    // Other Retrogrades
    if (otherRetrogrades.length > 0) {
      categories.push({
        category: 'Other Retrogrades',
        icon: Moon,
        color: 'blue',
        events: otherRetrogrades.map((r) => ({
          date: formatDateRange(r.startDate, r.endDate),
          description: r.planet,
        })),
        link: '/grimoire/astronomy',
      });
    }

    return categories;
  }

  return eventsData[year];
}

function getSummaryStats(
  year: number,
  events: EventCategory[],
): {
  mercuryRetrograde: number;
  venusRetrograde: number;
  eclipses: number;
  outerPlanetRx: number;
} {
  const mercury = events.find((e) => e.category === 'Mercury Retrograde');
  const venus = events.find((e) => e.category === 'Venus Retrograde');
  const eclipses = events.find((e) => e.category === 'Eclipses');
  const other = events.find((e) => e.category === 'Other Retrogrades');

  return {
    mercuryRetrograde: mercury?.events.length || 0,
    venusRetrograde: venus?.events.length || 0,
    eclipses: eclipses?.events.length || 0,
    outerPlanetRx: other?.events.length || 0,
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

  if (yearNum < 2025 || yearNum > 2030) {
    notFound();
  }

  const is2025 = yearNum === 2025;
  const pageTitle = is2025
    ? 'Major Astrological Events 2025: Eclipses, Retrogrades, Key Dates | Lunary'
    : `${year} Astrological Events Calendar | Lunary`;
  const pageH1 = is2025
    ? 'Major Astrological Events 2025'
    : `${year} Cosmic Events Calendar`;
  const pageDescription = is2025
    ? 'Major astrological events 2025 shows eclipses, retrogrades, and the key transits that shape the year so you can track dates and what each shift means.'
    : `Complete guide to ${year} astrological events including Mercury retrograde dates, Venus retrograde, eclipses, equinoxes, and major planetary transits.`;
  const pageIntro = is2025
    ? 'Major astrological events 2025 gathers the eclipses, retrogrades, and major transits that matter so you can scan the dates and the quick meaning they carry. Each date also notes what to expect so you can plan within the timing instead of reacting to it.'
    : undefined;
  const quickLinkItems = is2025
    ? [
        {
          label: 'Mercury retrograde 2025',
          href: '/grimoire/events/2025/mercury-retrograde',
        },
        {
          label: 'Venus retrograde 2025',
          href: '/grimoire/events/2025/venus-retrograde',
        },
        { label: 'Eclipses 2025', href: '/grimoire/events/2025/eclipses' },
      ]
    : [];

  const events = await getEventsForYear(yearNum);
  const stats = getSummaryStats(yearNum, events);

  const faqs = [
    {
      question: `What are the major astrological events in ${year}?`,
      answer: `${year} features ${stats.mercuryRetrograde} Mercury retrograde periods, ${stats.venusRetrograde} Venus retrograde period, ${stats.eclipses} eclipses, and ${stats.outerPlanetRx} outer planet retrograde periods.`,
    },
    {
      question: `When is Mercury retrograde in ${year}?`,
      answer: `Mercury retrograde occurs ${stats.mercuryRetrograde} times in ${year}. Check the calendar above for specific dates and signs.`,
    },
    {
      question: `How many eclipses occur in ${year}?`,
      answer: `There are ${stats.eclipses} eclipses in ${year}, including both solar and lunar eclipses.`,
    },
    {
      question: `What should I know about ${year} astrological events?`,
      answer: `${year} brings significant cosmic shifts with retrogrades, eclipses, and planetary transits. Use this calendar to plan ahead and align with cosmic energies.`,
    },
  ];

  const meaningContent = `
## ${year} Astrological Events Overview

Your complete guide to navigating the cosmic events of ${year}. This calendar includes all major retrogrades, eclipses, and planetary transits that will shape the year ahead.

### Major Events at a Glance

- **Mercury Retrograde**: ${stats.mercuryRetrograde} periods
- **Venus Retrograde**: ${stats.venusRetrograde} period
- **Eclipses**: ${stats.eclipses} total (solar and lunar)
- **Outer Planet Retrogrades**: ${stats.outerPlanetRx} periods

### Understanding the Calendar

Each event category below provides detailed information about timing, astrological signs involved, and how these cosmic shifts may affect you. Click through to individual event pages for deeper insights and guidance.

### Planning Your Year

Use this calendar to:
- Plan important decisions around retrograde periods
- Prepare for eclipse seasons (powerful transformation times)
- Align major life changes with supportive planetary energies
- Understand the cosmic rhythm of ${year}

### Getting Personalized Guidance

While these events affect everyone, their impact on your personal chart is unique. Consider getting a personalized forecast to see how ${year}'s cosmic events specifically influence your birth chart.
  `;

  return (
    <SEOContentTemplate
      title={pageTitle}
      h1={pageH1}
      description={pageDescription}
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
        answer: `${year} features ${stats.mercuryRetrograde} Mercury retrograde periods, ${stats.venusRetrograde} Venus retrograde, ${stats.eclipses} eclipses, and ${stats.outerPlanetRx} outer planet retrograde periods. This calendar provides complete dates and guidance for navigating all major cosmic events.`,
      }}
      intro={pageIntro}
      tldr={`${year} Astrological Events: ${stats.mercuryRetrograde} Mercury retrogrades, ${stats.venusRetrograde} Venus retrograde, ${stats.eclipses} eclipses, ${stats.outerPlanetRx} outer planet retrogrades. Use this calendar to plan ahead and align with cosmic energies.`}
      meaning={meaningContent}
      faqs={faqs}
      relatedItems={[
        { name: 'Astronomy Guide', href: '/grimoire/astronomy', type: 'guide' },
        { name: 'Moon Rituals', href: '/grimoire/moon/rituals', type: 'guide' },
        { name: 'Birth Chart', href: '/birth-chart', type: 'tool' },
        { name: 'Transits', href: '/grimoire/transits', type: 'guide' },
      ]}
    >
      {/* Custom content: Events Calendar */}
      <div className='mt-8 space-y-8'>
        {is2025 && quickLinkItems.length > 0 && (
          <section className='rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-5'>
            <h2 className='text-base font-semibold text-zinc-100 mb-3'>
              Quick links
            </h2>
            <div className='flex flex-wrap gap-3'>
              {quickLinkItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-sm font-medium text-zinc-200 hover:border-lunary-primary-500 transition-colors'
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Summary */}
        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-lg font-medium text-lunary-primary-300 mb-4'>
            {year} At a Glance
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
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
          </div>
        </div>

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
                    <h2 className='text-xl font-medium text-zinc-100'>
                      {category.category}
                    </h2>
                  </div>
                  <Link
                    href={category.link}
                    className={`flex items-center gap-1 text-sm ${colors.text} hover:underline`}
                  >
                    View {category.category} Details{' '}
                    <ArrowRight className='h-4 w-4' />
                  </Link>
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
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA */}
        <div className='mt-12 text-center'>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-lg transition-colors'
          >
            Get Your Personalized {year} Forecast
            <ArrowRight className='h-5 w-5' />
          </Link>
        </div>
      </div>

      <ExploreGrimoire />
    </SEOContentTemplate>
  );
}
