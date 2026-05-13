import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import Moon from '../components/Moon';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';
import { generateYearlyForecast, type MoonEvent } from '@/lib/forecast/yearly';
import { format } from 'date-fns';
import { Sparkles, Moon as MoonIcon, Star, Circle } from 'lucide-react';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { monthlyMoonPhases } from '../../../../utils/moon/monthlyPhases';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { stringToKebabCase } from '../../../../utils/string';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Moon Phases: New, Full, Waxing & Waning Meanings | Lunary',
  description:
    'Explore moon phases, full moon names, and lunar rituals. Learn how to work with the Moon’s cycles for manifestation and emotional balance.',
  keywords: [
    'moon phases',
    'lunar cycles',
    'full moon',
    'new moon',
    'moon signs',
    'lunar calendar',
    'moon magic',
    'moon rituals',
    'lunar eclipse',
    'moon in signs',
  ],
  openGraph: {
    title: 'Moon Phases: New, Full, Waxing & Waning Meanings - Lunary',
    description:
      "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
    type: 'article',
    images: [
      {
        url: '/api/og/grimoire/moon',
        width: 1200,
        height: 630,
        alt: 'Moon Phases Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moon Phases: New, Full, Waxing & Waning Meanings - Lunary',
    description:
      "Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life.",
    images: ['/api/og/grimoire/moon'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon',
  },
};

// Helper to format moon type for display
function formatMoonType(type: MoonEvent['type']): string {
  const labels: Record<MoonEvent['type'], string> = {
    supermoon: 'Supermoon',
    micromoon: 'Micromoon',
    blue_moon: 'Blue Moon',
    black_moon: 'Black Moon',
    new_moon: 'New Moon',
    full_moon: 'Full Moon',
  };
  return labels[type] || type;
}

// Get icon for moon type
function getMoonTypeIcon(type: MoonEvent['type']) {
  switch (type) {
    case 'supermoon':
      return <Sparkles className='w-4 h-4 text-amber-400' />;
    case 'blue_moon':
      return <MoonIcon className='w-4 h-4 text-blue-400' />;
    case 'black_moon':
      return <Circle className='w-4 h-4 text-content-muted' />;
    case 'micromoon':
      return <Star className='w-4 h-4 text-content-muted' />;
    default:
      return <MoonIcon className='w-4 h-4 text-lunary-primary-400' />;
  }
}

// Get description for moon type
function getMoonTypeDescription(type: MoonEvent['type']): string {
  const descriptions: Record<string, string> = {
    supermoon:
      'A full moon at its closest point to Earth, appearing larger and brighter than usual.',
    micromoon:
      'A full moon at its farthest point from Earth, appearing smaller than usual.',
    blue_moon:
      'The second full moon in a calendar month, or the third full moon in a season with four.',
    black_moon:
      'The second new moon in a calendar month, a powerful time for shadow work.',
  };
  return descriptions[type] || '';
}

export default async function MoonPage() {
  // Fetch special moon events for current and next year
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const [currentYearForecast, nextYearForecast] = await Promise.all([
    generateYearlyForecast(currentYear),
    generateYearlyForecast(nextYear),
  ]);

  // Combine and filter for special moons (supermoon, blue moon, etc.)
  const allMoonEvents = [
    ...currentYearForecast.moonEvents,
    ...nextYearForecast.moonEvents,
  ];

  const specialMoons = allMoonEvents.filter(
    (m) =>
      m.type === 'supermoon' ||
      m.type === 'blue_moon' ||
      m.type === 'micromoon' ||
      m.type === 'black_moon',
  );

  // Sort by date
  specialMoons.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const moonYears = [Math.max(2025, currentYear - 1), currentYear, nextYear];
  const moonPhases = Object.entries(monthlyMoonPhases);
  const fullMoons = Object.entries(annualFullMoons);
  const cosmicSections = [
    ...getCosmicConnections('hub-moon', 'moon'),
    {
      title: 'Lunar Years',
      links: moonYears.map((year) => ({
        label: `${year} Moon Calendar`,
        href: `/grimoire/moon/${year}`,
      })),
    },
    {
      title: 'Moon Resources',
      links: [
        {
          label: 'Moon Phases Guide',
          href: '/grimoire/guides/moon-phases-guide',
        },
        { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
        { label: 'Full Moon Guide', href: '/grimoire/moon/full-moons' },
        { label: 'New Moon Guide', href: '/grimoire/moon/phases/new-moon' },
      ],
    },
  ];

  return (
    <SEOContentTemplate
      title='Moon Phases: New, Full, Waxing & Waning Meanings - Lunary'
      h1='Moon Phases & Lunar Wisdom'
      description="Explore moon phases, full moon names, and lunar wisdom. Learn about the moon's influence on magic and daily life. Discover moon rituals, moon signs, and how to work with lunar energy."
      keywords={[
        'moon phases',
        'lunar cycles',
        'full moon',
        'new moon',
        'moon signs',
        'lunar calendar',
        'moon magic',
        'moon rituals',
      ]}
      canonicalUrl='https://lunary.app/grimoire/moon'
      tableOfContents={[
        { label: 'What the Moon tracks', href: '#what-is' },
        { label: 'How to read lunar timing', href: '#meaning' },
        { label: 'The 8 moon phases', href: '#moon-phases' },
        { label: 'Full moon names', href: '#full-moon-names' },
        { label: 'Moon signs and daily mood', href: '#moon-signs' },
        { label: 'Lunar rituals', href: '#moon-rituals' },
        { label: 'FAQ', href: '#faq' },
      ]}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Moon Phases', href: '/grimoire/moon' },
      ]}
      intro="The moon has been a source of wonder, magic, and guidance for millennia. Its cycles influence tides, emotions, and magical work. Understanding moon phases, full moon names, and lunar correspondences helps you align your practice with natural rhythms and harness the moon's powerful energy. This comprehensive guide covers all aspects of lunar magic, from basic moon phases to advanced moon sign work and eclipse magic."
      meaning="The moon represents the feminine principle, intuition, emotions, and the subconscious. Its 29.5-day cycle mirrors natural cycles of growth, release, and renewal. Each phase carries unique energy that can enhance different types of magical work.

New Moon: Time for new beginnings, intention setting, and planting seeds for the future. The dark moon offers a blank slate for manifestation.

Waxing Moon: Growing energy supports attraction, building, and increasing. Use for spells that bring things toward you.

Full Moon: Peak power for manifestation, release, and celebration. The moon's energy is at its strongest, amplifying all magical work.

Waning Moon: Decreasing energy supports banishing, releasing, and letting go. Use for removing obstacles and releasing what no longer serves.

Understanding these phases and aligning your practice with them creates powerful synchronicity between your intentions and natural rhythms.

For chart reading, the Moon matters in two distinct ways. Your natal Moon sign describes your emotional baseline, attachment style, and instinctive soothing patterns. The current Moon describes the emotional weather of the day. Lunary treats those as related but different layers, so you can learn the difference between your ongoing lunar nature and the temporary mood of the sky."
      howToWorkWith={[
        'Track moon phases using a lunar calendar',
        'Set intentions during New Moon',
        'Perform manifestation spells during Waxing Moon',
        'Release and banish during Waning Moon',
        'Celebrate and charge tools during Full Moon',
        'Work with moon signs for daily guidance and compare them to your natal Moon placement',
        'Use full moon names for seasonal magic',
        'Honor eclipses as powerful transformation times',
      ]}
      internalLinks={[
        {
          text: 'Moon Phases Guide',
          href: '/grimoire/guides/moon-phases-guide',
        },
        { text: 'Moon in Signs', href: '/grimoire/moon-in' },
        { text: 'New Moon Phase', href: '/grimoire/moon/phases/new-moon' },
        { text: 'Full Moon Phase', href: '/grimoire/moon/phases/full-moon' },
      ]}
      sources={[
        {
          name: 'Lunary lunar cycle interpretation framework',
          url: 'https://lunary.app/about/methodology',
        },
        {
          name: 'Astronomy Engine moon phase calculations',
          url: 'https://github.com/cosinekitty/astronomy',
        },
        {
          name: 'Traditional lunar cycle doctrine',
        },
      ]}
      faqs={[
        {
          question: 'What moon phase is best for love spells?',
          answer:
            'Waxing Moon (especially approaching Full Moon) is ideal for love spells, as it supports attraction and growth. New Moon works for new relationships, while Full Moon amplifies all love magic.',
        },
        {
          question: 'How do moon signs affect daily life?',
          answer:
            'The moon changes signs every 2-3 days, influencing emotional energy and moods. Moon in Fire signs (Aries, Leo, Sagittarius) brings action and passion. Moon in Water signs (Cancer, Scorpio, Pisces) enhances emotions and intuition.',
        },
        {
          question: 'What should I do during a Full Moon?',
          answer:
            'Full Moons are powerful for charging tools, performing manifestation rituals, releasing what no longer serves, and celebrating your growth. Many practitioners charge crystals, make moon water, and perform gratitude rituals.',
        },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-moon'
          entityKey='moon'
          title='Moon Cosmic Connections'
          sections={cosmicSections}
        />
      }
    >
      <div className='max-w-4xl mx-auto p-4 space-y-8'>
        <section id='moon-phases' className='space-y-4'>
          <Heading as='h2' variant='h2'>
            The 8 Moon Phases
          </Heading>
          <p className='text-content-muted'>
            The moon phase tells you what part of the cycle you are in: begin,
            build, culminate, release, or rest.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {moonPhases.map(([key, phase]) => (
              <Link
                key={key}
                href={`/grimoire/moon/phases/${stringToKebabCase(key)}`}
                className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-4 hover:bg-surface-elevated/50 transition-colors'
              >
                <div className='flex items-center justify-between gap-3'>
                  <h3 className='text-lg font-medium text-content-primary'>
                    {phase.symbol} {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <span className='text-xs text-content-muted'>
                    {phase.keywords.slice(0, 2).join(' · ')}
                  </span>
                </div>
                <p className='mt-3 text-sm text-content-secondary line-clamp-3'>
                  {phase.information}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id='full-moon-names' className='space-y-4'>
          <Heading as='h2' variant='h2'>
            Full Moon Names
          </Heading>
          <p className='text-content-muted'>
            Named full moons help you connect lunar work to the seasonal mood of
            the year instead of treating every full moon like the same event.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {fullMoons.slice(0, 6).map(([month, moon]) => (
              <Link
                key={month}
                href={`/grimoire/moon/full-moons/${stringToKebabCase(month)}`}
                className='rounded-xl border border-stroke-subtle bg-surface-elevated/20 p-4 hover:bg-surface-elevated/40 transition-colors'
              >
                <h3 className='text-lg font-medium text-content-primary'>
                  {month}: {moon.name}
                </h3>
                <p className='mt-2 text-sm text-content-secondary line-clamp-3'>
                  {moon.description}
                </p>
              </Link>
            ))}
          </div>
          <div>
            <Link
              href='/grimoire/moon/full-moons/september'
              className='text-sm text-lunary-primary-400 hover:text-content-brand'
            >
              Browse the full moon month pages
            </Link>
          </div>
        </section>

        <section
          id='moon-signs'
          className='rounded-xl border border-stroke-subtle bg-surface-elevated/20 p-5'
        >
          <Heading as='h2' variant='h2'>
            Moon Signs and Daily Mood
          </Heading>
          <p className='text-content-secondary leading-relaxed'>
            The current moon sign changes every two to three days and acts like
            short-term emotional weather. Fire moon days push action. Earth moon
            days stabilise. Air moon days favour communication. Water moon days
            deepen intuition and feeling.
          </p>
          <div className='mt-4 flex flex-wrap gap-3 text-sm'>
            <Link
              href='/grimoire/moon-in'
              className='text-lunary-primary-400 hover:text-content-brand'
            >
              Read Moon in zodiac signs
            </Link>
            <Link
              href='/grimoire/moon-in/cancer'
              className='text-lunary-primary-400 hover:text-content-brand'
            >
              Example: Moon in Cancer
            </Link>
          </div>
        </section>

        <section
          id='moon-rituals'
          className='rounded-xl border border-stroke-subtle bg-surface-elevated/20 p-5'
        >
          <Heading as='h2' variant='h2'>
            Lunar Ritual Timing
          </Heading>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='rounded-lg border border-stroke-subtle bg-surface-card/30 p-4'>
              <h3 className='text-base font-medium text-content-primary'>
                Waxing and new moon work
              </h3>
              <p className='mt-2 text-sm text-content-secondary'>
                Use the new moon to set intention, then use waxing phases to
                build, refine, and grow what you want more of.
              </p>
            </div>
            <div className='rounded-lg border border-stroke-subtle bg-surface-card/30 p-4'>
              <h3 className='text-base font-medium text-content-primary'>
                Full and waning moon work
              </h3>
              <p className='mt-2 text-sm text-content-secondary'>
                Use the full moon for illumination, gratitude, charging, and
                culmination. Use waning phases for release, banishing, and
                recovery.
              </p>
            </div>
          </div>
          <div className='mt-4'>
            <Link
              href='/grimoire/moon/phases/full-moon'
              className='text-sm text-lunary-primary-400 hover:text-content-brand'
            >
              Go deeper on full moon timing
            </Link>
          </div>
        </section>

        {/* Special Moons Section */}
        {specialMoons.length > 0 && (
          <section className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Sparkles className='w-5 h-5 text-amber-400' />
              <Heading as='h2' variant='h2'>
                Upcoming Special Moons
              </Heading>
            </div>
            <p className='text-sm text-content-muted'>
              Rare and powerful lunar events for {currentYear}–{currentYear + 1}
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {specialMoons.slice(0, 8).map((moon, index) => {
                const moonDate = new Date(moon.date);
                const isPast = moonDate < new Date();

                return (
                  <div
                    key={`${moon.date}-${moon.type}-${index}`}
                    className={`p-4 rounded-lg border ${
                      isPast
                        ? 'border-stroke-subtle/30 bg-surface-elevated/20 opacity-60'
                        : 'border-stroke-subtle/50 bg-surface-elevated/30 hover:bg-surface-elevated/50 hover:border-lunary-primary-600'
                    } transition-all`}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='mt-1'>{getMoonTypeIcon(moon.type)}</div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='font-medium text-content-primary'>
                            {formatMoonType(moon.type)}
                          </span>
                          <span className='text-xs px-2 py-0.5 rounded-full bg-surface-card text-content-muted'>
                            {moon.sign}
                          </span>
                          {isPast && (
                            <span className='text-xs text-content-muted'>
                              Past
                            </span>
                          )}
                        </div>
                        <p className='text-sm text-lunary-primary-400 mt-1'>
                          {format(moonDate, 'MMMM d, yyyy')}
                        </p>
                        <p className='text-xs text-content-muted mt-1'>
                          {getMoonTypeDescription(moon.type)}
                        </p>
                        {moon.distanceKm && (
                          <p className='text-xs text-content-muted mt-1'>
                            Distance: {moon.distanceKm.toLocaleString()} km
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Link to events page for more */}
            <div className='text-center pt-2'>
              <Link
                href={`/grimoire/events/${currentYear}`}
                className='text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
              >
                View all {currentYear} cosmic events →
              </Link>
            </div>
          </section>
        )}

        {/* Existing Moon component */}
        <Moon />
      </div>
    </SEOContentTemplate>
  );
}
