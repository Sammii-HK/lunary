import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { zodiacSigns } from '../../../../../../utils/zodiac/zodiac';
import {
  getMoonEventsForYear,
  MONTH_NAMES,
  type MoonPhaseType,
} from '@/lib/moon/events';

const MIN_YEAR = 2025;
const MAX_YEAR = 2030;
const SUPPORTED_YEARS = [2025, 2027, 2028, 2029, 2030];

function parseMoonPhaseSlug(moonPhase: string) {
  if (moonPhase.startsWith('full-moon-')) {
    return { type: 'full' as MoonPhaseType, month: moonPhase.slice(10) };
  }
  if (moonPhase.startsWith('new-moon-')) {
    return { type: 'new' as MoonPhaseType, month: moonPhase.slice(9) };
  }
  return null;
}

function getMoonEventBySlug(
  year: number,
  moonPhase: string,
  type: MoonPhaseType,
) {
  const events = getMoonEventsForYear(year);
  const list = type === 'full' ? events.fullMoons : events.newMoons;
  return list.find((event) => event.slug === moonPhase);
}

export async function generateStaticParams() {
  return SUPPORTED_YEARS.flatMap((year) => {
    const { fullMoons, newMoons } = getMoonEventsForYear(year);
    return [
      ...fullMoons.map((moon) => ({
        year: year.toString(),
        moonPhase: moon.slug,
      })),
      ...newMoons.map((moon) => ({
        year: year.toString(),
        moonPhase: moon.slug,
      })),
    ];
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; moonPhase: string }>;
}): Promise<Metadata> {
  const { year, moonPhase } = await params;
  const yearNum = parseInt(year, 10);
  const parsed = parseMoonPhaseSlug(moonPhase);

  if (!parsed || isNaN(yearNum) || yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
    return { title: 'Moon Phase Not Found | Lunary' };
  }

  const moonEvent = getMoonEventBySlug(yearNum, moonPhase, parsed.type);

  if (!moonEvent) {
    return { title: 'Moon Phase Not Found | Lunary' };
  }

  const monthName = moonEvent.month;
  const fullDate = `${moonEvent.dateLabel}, ${year}`;
  const title =
    parsed.type === 'full'
      ? `${moonEvent.name} ${fullDate}: Full Moon in ${moonEvent.sign} | Lunary`
      : `New Moon in ${moonEvent.sign} ${fullDate}: Meaning & Rituals | Lunary`;
  const description =
    parsed.type === 'full'
      ? `${moonEvent.name} Full Moon in ${moonEvent.sign} on ${fullDate}. Meaning, rituals, and intentions for this lunar phase.`
      : `New Moon in ${moonEvent.sign} on ${fullDate}. Meaning, rituals, and intentions for this lunar phase.`;

  return {
    title,
    description,
    keywords: [
      parsed.type === 'full'
        ? `full moon ${moonEvent.monthSlug} ${year}`
        : `new moon ${moonEvent.monthSlug} ${year}`,
      parsed.type === 'full' ? moonEvent.name.toLowerCase() : null,
      `${moonEvent.sign.toLowerCase()} moon`,
      `${moonEvent.monthSlug} moon`,
      'moon rituals',
      'lunar magic',
      `${year} moon calendar`,
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      images: [
        `/api/og/cosmic?title=${encodeURIComponent(
          parsed.type === 'full'
            ? moonEvent.name
            : `New Moon in ${moonEvent.sign}`,
        )}`,
      ],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/moon/${year}/${moonPhase}`,
    },
  };
}

export default async function MoonPhaseYearPage({
  params,
}: {
  params: Promise<{ year: string; moonPhase: string }>;
}) {
  const { year, moonPhase } = await params;
  const yearNum = parseInt(year, 10);
  const parsed = parseMoonPhaseSlug(moonPhase);

  if (!parsed || isNaN(yearNum) || yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
    notFound();
  }

  const moonEvent = getMoonEventBySlug(yearNum, moonPhase, parsed.type);
  const monthName = moonEvent?.month;

  if (!moonEvent || !monthName) {
    notFound();
  }

  const eventDate = new Date(moonEvent.timestamp);

  const signKey = moonEvent.sign.toLowerCase();
  const signData = zodiacSigns[signKey as keyof typeof zodiacSigns];
  const element = signData?.element || 'Cosmic';
  const signKeywords = signData?.keywords?.slice(0, 4) || [
    'Intention',
    'Reflection',
    'Growth',
    'Alignment',
  ];
  const fullDate = `${moonEvent.dateLabel}, ${year}`;
  const typeLabel = parsed.type === 'full' ? 'Full Moon' : 'New Moon';
  const title =
    parsed.type === 'full'
      ? `${moonEvent.name}: Full Moon in ${moonEvent.sign}`
      : `New Moon in ${moonEvent.sign}`;

  const intro =
    parsed.type === 'full'
      ? `The ${moonEvent.name} is the ${monthName} ${year} full moon, illuminating ${moonEvent.sign} themes. Full moons bring clarity, culmination, and a chance to release what no longer supports you.`
      : `The ${monthName} ${year} new moon arrives in ${moonEvent.sign}, opening a fresh lunar cycle. New moons are for intention setting, planting seeds, and aligning with what you want to grow.`;

  const meaning = signData
    ? `This ${element.toLowerCase()} ${typeLabel.toLowerCase()} in ${moonEvent.sign} highlights ${signKeywords
        .map((keyword) => keyword.toLowerCase())
        .join(', ')}. ${signData.mysticalProperties} ${
        parsed.type === 'full'
          ? 'Use this moment to release, forgive, and bring plans to completion.'
          : 'Use this moment to set intentions and map out steady next steps.'
      }`
    : `This ${typeLabel.toLowerCase()} invites reflection, intention, and alignment with the lunar cycle.`;

  const rituals =
    parsed.type === 'full'
      ? [
          `Release a pattern tied to ${moonEvent.sign.toLowerCase()} themes`,
          'Charge crystals or ritual tools under the moonlight',
          `Write down what feels complete or ready to close`,
          `Create a gratitude list for ${monthName}`,
        ]
      : [
          `Set intentions around ${moonEvent.sign.toLowerCase()} priorities`,
          `Create a simple plan for the next lunar cycle`,
          `Ground yourself with a ${element.toLowerCase()} ritual`,
          `Start one small habit that supports your goals`,
        ];

  const howToWorkWith =
    parsed.type === 'full'
      ? [
          'Celebrate progress and name what has ripened',
          'Release what blocks your growth',
          'Share gratitude with someone you trust',
          `Align actions with ${moonEvent.sign} strengths`,
        ]
      : [
          'Write down 3 clear intentions',
          'Take one concrete step within 24 hours',
          `Focus on ${moonEvent.sign} themes first`,
          'Keep commitments small and sustainable',
        ];

  const journalPrompts =
    parsed.type === 'full'
      ? [
          `What is ready to be released this ${monthName}?`,
          `Where do I need more ${signKeywords[0]?.toLowerCase()}?`,
          `What has reached completion since last month?`,
          `How can I honor ${moonEvent.sign} energy?`,
        ]
      : [
          `What am I ready to begin this ${monthName}?`,
          `Which ${moonEvent.sign.toLowerCase()} themes feel most alive?`,
          `What support do I need to stay committed?`,
          `How can I nourish this new cycle?`,
        ];

  const faqs = [
    {
      question: `When is the ${monthName} ${year} ${typeLabel}?`,
      answer: `The ${typeLabel.toLowerCase()} in ${moonEvent.sign} occurs on ${fullDate}.`,
    },
    {
      question:
        parsed.type === 'full'
          ? `What is the ${moonEvent.name}?`
          : `What does the new moon in ${moonEvent.sign} mean?`,
      answer:
        parsed.type === 'full'
          ? `The ${moonEvent.name} is the traditional name for the ${monthName} full moon. It highlights ${moonEvent.sign.toLowerCase()} themes.`
          : `The new moon in ${moonEvent.sign} emphasizes ${signKeywords
              .map((keyword) => keyword.toLowerCase())
              .join(', ')} and supports intention setting.`,
    },
    {
      question: `What should I do during this ${typeLabel.toLowerCase()}?`,
      answer:
        parsed.type === 'full'
          ? 'Focus on releasing, celebrating progress, and clearing space for the next cycle.'
          : 'Focus on setting intentions, planning next steps, and starting new habits.',
    },
  ];

  const monthIndex = MONTH_NAMES.findIndex((month) => month === monthName);
  const monthNumber =
    monthIndex === -1 ? '01' : `${monthIndex + 1}`.padStart(2, '0');
  const paddedDay = `${eventDate.getUTCDate()}`.padStart(2, '0');

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={title}
        h1={`${title} - ${fullDate}`}
        description={`${typeLabel} meaning, rituals, and insights for ${moonEvent.sign} on ${fullDate}.`}
        keywords={[
          parsed.type === 'full' ? 'full moon' : 'new moon',
          monthName,
          year,
          moonEvent.sign,
          'moon rituals',
          'lunar magic',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/moon/${year}/${moonPhase}`}
        datePublished={`${year}-${monthNumber}-${paddedDay}`}
        dateModified={new Date().toISOString().split('T')[0]}
        articleSection='Moon Phases'
        intro={intro}
        tldr={`${fullDate} brings a ${typeLabel.toLowerCase()} in ${moonEvent.sign}. This ${element.toLowerCase()} moon is ideal for ${
          parsed.type === 'full'
            ? 'releasing, celebrating, and closing loops'
            : 'new beginnings, intention setting, and building momentum'
        }.`}
        meaning={meaning}
        rituals={rituals}
        emotionalThemes={signKeywords}
        howToWorkWith={howToWorkWith}
        journalPrompts={journalPrompts}
        signsMostAffected={
          moonEvent.sign === 'Unknown' ? undefined : [moonEvent.sign]
        }
        tables={[
          {
            title: 'Moon Phase Details',
            headers: ['Aspect', 'Details'],
            rows: [
              ['Date', fullDate],
              ['Type', typeLabel],
              ...(parsed.type === 'full'
                ? [['Traditional Name', moonEvent.name]]
                : []),
              ['Sign', moonEvent.sign],
              ['Element', element],
              ['UTC Time', eventDate.toUTCString()],
            ],
          },
        ]}
        relatedItems={[
          {
            name: `${moonEvent.sign} Zodiac Sign`,
            href: `/grimoire/zodiac/${moonEvent.sign.toLowerCase()}`,
            type: 'Zodiac',
          },
          {
            name: 'Moon Rituals',
            href: '/grimoire/moon/rituals',
            type: 'Ritual',
          },
          {
            name: `${year} Moon Calendar`,
            href: `/grimoire/moon/${year}`,
            type: 'Calendar',
          },
        ]}
        internalLinks={[
          { text: 'Moon Calendar Hub', href: '/moon-calendar' },
          { text: 'All Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Moon Rituals', href: '/grimoire/moon/rituals' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon', href: '/grimoire/moon' },
          { label: year, href: `/grimoire/moon/${year}` },
          {
            label: `${monthName} ${typeLabel}`,
            href: `/grimoire/moon/${year}/${moonPhase}`,
          },
        ]}
        ctaText={`Get personalized ${typeLabel.toLowerCase()} insights`}
        ctaHref='/horoscope'
        faqs={faqs}
        sources={[
          { name: 'Astronomy Engine (moon phase calculations)' },
          { name: 'Traditional lunar correspondences' },
        ]}
      />
    </div>
  );
}
