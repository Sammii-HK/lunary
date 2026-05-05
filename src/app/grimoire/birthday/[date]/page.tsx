import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  MONTH_NAMES,
  getZodiacForDate,
  getDecanForDate,
  getNumerologyNumber,
} from '@/constants/seo/birthday-zodiac';
import {
  formatRulershipValue,
  getPrimaryRuler,
} from '@/lib/astrology/rulerships';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const dynamicParams = false;
interface BirthdayData {
  month: number;
  day: number;
  monthName: string;
  dateString: string;
}

interface BirthdayLinkData {
  slug: string;
  label: string;
}

function parseDateSlug(slug: string): BirthdayData | null {
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 2) return null;

  const monthName = parts[0];
  const day = parseInt(parts[1]);

  const monthIndex = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthName,
  );
  if (monthIndex === -1) return null;

  const month = monthIndex + 1;
  const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysPerMonth[monthIndex]) return null;

  return {
    month,
    day,
    monthName: MONTH_NAMES[monthIndex],
    dateString: `${MONTH_NAMES[monthIndex]} ${day}`,
  };
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function formatBirthdaySlug(date: Date): BirthdayLinkData {
  const monthName = MONTH_NAMES[date.getUTCMonth()];
  const day = date.getUTCDate();
  return {
    slug: `${monthName.toLowerCase()}-${day}`,
    label: `${monthName} ${day}`,
  };
}

function getAdjacentBirthdayLinks(
  month: number,
  day: number,
): { prev: BirthdayLinkData; next: BirthdayLinkData } {
  const current = new Date(Date.UTC(2024, month - 1, day, 12, 0, 0));
  const prev = new Date(current);
  const next = new Date(current);

  prev.setUTCDate(prev.getUTCDate() - 1);
  next.setUTCDate(next.getUTCDate() + 1);

  return {
    prev: formatBirthdaySlug(prev),
    next: formatBirthdaySlug(next),
  };
}

export function generateStaticParams() {
  const params: Array<{ date: string }> = [];

  for (let monthIndex = 0; monthIndex < MONTH_NAMES.length; monthIndex += 1) {
    const monthName = MONTH_NAMES[monthIndex].toLowerCase();
    const daysInMonth = new Date(
      Date.UTC(2024, monthIndex + 1, 0),
    ).getUTCDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
      params.push({ date: `${monthName}-${day}` });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const birthday = parseDateSlug(date);

  if (!birthday) {
    return { title: 'Birthday Not Found | Lunary' };
  }

  const zodiac = getZodiacForDate(birthday.month, birthday.day);

  const title = `${birthday.dateString} Zodiac Sign: ${zodiac.sign} Birthday Personality | Lunary`;
  const description = `Born on ${birthday.dateString}? Your zodiac sign is ${zodiac.sign}. Discover your ${birthday.dateString} birthday personality traits, compatibility, lucky numbers, and what the stars say about people born on this day.`;

  return {
    title,
    description,
    keywords: [
      `${birthday.dateString.toLowerCase()} zodiac sign`,
      `${birthday.dateString.toLowerCase()} birthday`,
      `${birthday.dateString.toLowerCase()} personality`,
      `${birthday.dateString.toLowerCase()} horoscope`,
      `${zodiac.sign.toLowerCase()} birthday`,
      'birthday zodiac',
      'birthday personality',
      'zodiac sign by birthday',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/birthday/${date}`,
      images: [
        `/api/og/cosmic?title=${encodeURIComponent(`${birthday.dateString} - ${zodiac.sign}`)}`,
      ],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/birthday/${date}`,
    },
  };
}

export default async function BirthdayZodiacPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const birthday = parseDateSlug(date);

  if (!birthday) {
    notFound();
  }

  const zodiac = getZodiacForDate(birthday.month, birthday.day);
  const { decan, ruler: decanRuler } = getDecanForDate(
    birthday.month,
    birthday.day,
    zodiac,
  );
  const numerology = getNumerologyNumber(birthday.month, birthday.day);
  const primaryRuler = getPrimaryRuler(zodiac.sign);
  const rulership = formatRulershipValue(zodiac.sign);
  const currentYear = new Date().getFullYear();

  const { prev: prevDay, next: nextDay } = getAdjacentBirthdayLinks(
    birthday.month,
    birthday.day,
  );

  return (
    <SEOContentTemplate
      title={`${birthday.dateString} Zodiac Sign: ${zodiac.sign}`}
      h1={`${birthday.dateString} Birthday: ${zodiac.sign} Personality`}
      description={`Discover the unique personality traits and cosmic influence of those born on ${birthday.dateString}. As a ${zodiac.sign} in the ${decan}${getOrdinalSuffix(decan)} decan, you carry special qualities shaped by ${decanRuler}.`}
      keywords={[
        `${birthday.dateString} zodiac`,
        `${birthday.dateString} birthday`,
        zodiac.sign,
        'birthday personality',
        'zodiac traits',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/birthday/${date}`}
      datePublished='2025-01-01'
      dateModified='2025-12-06'
      articleSection='Birthday Zodiac'
      whatIs={{
        question: `What zodiac sign is ${birthday.dateString}?`,
        answer: `People born on ${birthday.dateString} are ${zodiac.sign}. ${zodiac.sign} is a ${zodiac.modality} ${zodiac.element} sign with rulership ${rulership}. Those born on this date are in the ${decan}${getOrdinalSuffix(decan)} decan of ${zodiac.sign}, which is sub-ruled by ${decanRuler}, adding extra depth to their personality.`,
      }}
      tldr={`${birthday.dateString} birthday: ${zodiac.sign} (${zodiac.element} sign). ${decan}${getOrdinalSuffix(decan)} decan ruled by ${decanRuler}. Life path number ${numerology}. Key traits: ${zodiac.traits.slice(0, 3).join(', ')}.`}
      meaning={`
Those born on ${birthday.dateString} fall under the zodiac sign of ${zodiac.sign}, symbolized by the ${zodiac.symbol}. As a ${zodiac.modality} ${zodiac.element} sign with rulership ${rulership}, ${zodiac.sign} individuals are known for being ${zodiac.traits.slice(0, 4).join(', ')}.

Being in the ${decan}${getOrdinalSuffix(decan)} decan of ${zodiac.sign}, those born on ${birthday.dateString} receive additional influence from ${decanRuler}. This planetary influence adds unique nuances to the core ${zodiac.sign} personality, often manifesting as enhanced ${decan === 1 ? 'core' : decan === 2 ? 'creative' : 'transformative'} qualities.

Your numerology life path number is ${numerology}, which brings ${numerology === 1 ? 'leadership and independence' : numerology === 2 ? 'cooperation and sensitivity' : numerology === 3 ? 'creativity and self-expression' : numerology === 4 ? 'stability and hard work' : numerology === 5 ? 'freedom and adventure' : numerology === 6 ? 'responsibility and nurturing' : numerology === 7 ? 'introspection and wisdom' : numerology === 8 ? 'ambition and material success' : numerology === 9 ? 'humanitarianism and completion' : numerology === 11 ? 'intuition and spiritual insight' : numerology === 22 ? 'master building and vision' : 'universal love and compassion'} to your life path.

### How Lunary Reads This Birthday

This page combines three layers rather than treating a birthday as a one-note Sun sign label:

- **Sun sign framework:** your sign, element, modality, and planetary rulership
- **Decan refinement:** the specific third of the sign you were born into, which changes tone and emphasis
- **Numerology timing:** the reduced date number, which adds another symbolic layer around motivation, pace, and growth

That matters because two people can share the same Sun sign and still express it differently if they were born in different decans or carry a different numerology pattern.

### The Decan Layer

The ${decan}${getOrdinalSuffix(decan)} decan adds ${decanRuler} as a sub-ruler, which changes where your ${zodiac.sign} energy lands most strongly. This is often where people feel the “why am I not like every other ${zodiac.sign}?” question getting answered. The core sign stays the same, but the expression becomes more specific.

### The Numerology Layer

Numerology does not replace astrology here; it adds a second symbolic pattern. A life path of ${numerology} tends to highlight the lesson beneath your instinctive ${zodiac.sign} style, which is why the same birthday profile can feel both familiar and slightly more exact than a generic zodiac overview.
      `}
      rituals={[
        `Birthday candle ritual: Light a ${zodiac.luckyColors[0]} candle on your birthday to honor your ${zodiac.sign} energy`,
        `${zodiac.element} element meditation: Connect with ${zodiac.element.toLowerCase()} energy through ${zodiac.element === 'Fire' ? 'candle gazing' : zodiac.element === 'Earth' ? 'grounding exercises' : zodiac.element === 'Air' ? 'breathwork' : 'water blessing'}`,
        `Intention setting with ${primaryRuler}: Work with ${primaryRuler} energy on your birthday for manifestation`,
      ]}
      emotionalThemes={zodiac.traits.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={[zodiac.sign, ...zodiac.compatibleSigns.slice(0, 2)]}
      tables={[
        {
          title: `${birthday.dateString} Birthday Profile`,
          headers: ['Aspect', 'Details'],
          rows: [
            ['Zodiac Sign', zodiac.sign],
            ['Symbol', zodiac.symbol],
            ['Element', zodiac.element],
            ['Modality', zodiac.modality],
            ['Rulership', rulership],
            ['Decan', `${decan}${getOrdinalSuffix(decan)} (${decanRuler})`],
            ['Life Path Number', numerology.toString()],
            ['Lucky Numbers', zodiac.luckyNumbers.join(', ')],
            ['Lucky Colors', zodiac.luckyColors.join(', ')],
            ['Compatible Signs', zodiac.compatibleSigns.join(', ')],
          ],
        },
        {
          title: 'Strengths & Weaknesses',
          headers: ['Strengths', 'Growth Areas'],
          rows: zodiac.strengths.map((s, i) => [s, zodiac.weaknesses[i] || '']),
        },
      ]}
      relatedItems={[
        {
          name: `${zodiac.sign} ${currentYear} Horoscope`,
          href: `/grimoire/horoscopes/${zodiac.sign.toLowerCase()}/${currentYear}`,
          type: 'Horoscope',
        },
        {
          name: `${primaryRuler} in Astrology`,
          href: `/grimoire/astronomy/planets/${primaryRuler.toLowerCase()}`,
          type: 'Planet',
        },
        {
          name: `${currentYear} Major Transits`,
          href: `/grimoire/transits/year/${currentYear}`,
          type: 'Guide',
        },
        ...zodiac.compatibleSigns.slice(0, 2).map((sign) => ({
          name: `${sign} Compatibility`,
          href:
            zodiac.sign.toLowerCase() <= sign.toLowerCase()
              ? `/grimoire/compatibility/${zodiac.sign.toLowerCase()}-and-${sign.toLowerCase()}`
              : `/grimoire/compatibility/${sign.toLowerCase()}-and-${zodiac.sign.toLowerCase()}`,
          type: 'Compatibility' as const,
        })),
      ]}
      ctaText='Get your personalized birthday reading'
      ctaHref='/birth-chart'
      sources={[
        {
          name: 'Lunary birthday zodiac and decan mapping',
          url: 'https://lunary.app/about/methodology',
        },
        { name: 'Traditional Western astrology' },
        { name: 'Pythagorean numerology reduction method' },
        { name: 'Decan system' },
      ]}
    >
      <div className='mt-8 flex justify-between text-sm'>
        {prevDay ? (
          <Link
            href={`/grimoire/birthday/${prevDay.slug}`}
            className='text-lunary-primary-400 hover:text-content-brand'
          >
            ← {prevDay.label}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={`/grimoire/birthday/${nextDay.slug}`}
          className='text-lunary-primary-400 hover:text-content-brand'
        >
          {nextDay.label} →
        </Link>
      </div>
    </SEOContentTemplate>
  );
}
