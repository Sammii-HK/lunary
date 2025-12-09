import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  MONTH_NAMES,
  getZodiacForDate,
  getDecanForDate,
  getNumerologyNumber,
  generateAllBirthdates,
} from '@/constants/seo/birthday-zodiac';

interface BirthdayData {
  month: number;
  day: number;
  monthName: string;
  dateString: string;
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

export async function generateStaticParams() {
  return generateAllBirthdates().map((date) => ({ date }));
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

  const prevDay =
    birthday.day > 1
      ? `${birthday.monthName.toLowerCase()}-${birthday.day - 1}`
      : null;
  const nextDay =
    birthday.day < 31
      ? `${birthday.monthName.toLowerCase()}-${birthday.day + 1}`
      : null;

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
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Birthday', href: '/grimoire/birthday' },
        { label: birthday.dateString },
      ]}
      whatIs={{
        question: `What zodiac sign is ${birthday.dateString}?`,
        answer: `People born on ${birthday.dateString} are ${zodiac.sign}. ${zodiac.sign} is a ${zodiac.modality} ${zodiac.element} sign ruled by ${zodiac.ruler}. Those born on this date are in the ${decan}${getOrdinalSuffix(decan)} decan of ${zodiac.sign}, which is sub-ruled by ${decanRuler}, adding extra depth to their personality.`,
      }}
      tldr={`${birthday.dateString} birthday: ${zodiac.sign} (${zodiac.element} sign). ${decan}${getOrdinalSuffix(decan)} decan ruled by ${decanRuler}. Life path number ${numerology}. Key traits: ${zodiac.traits.slice(0, 3).join(', ')}.`}
      meaning={`
Those born on ${birthday.dateString} fall under the zodiac sign of ${zodiac.sign}, symbolized by the ${zodiac.symbol}. As a ${zodiac.modality} ${zodiac.element} sign ruled by ${zodiac.ruler}, ${zodiac.sign} individuals are known for being ${zodiac.traits.slice(0, 4).join(', ')}.

Being in the ${decan}${getOrdinalSuffix(decan)} decan of ${zodiac.sign}, those born on ${birthday.dateString} receive additional influence from ${decanRuler}. This planetary influence adds unique nuances to the core ${zodiac.sign} personality, often manifesting as enhanced ${decan === 1 ? 'core' : decan === 2 ? 'creative' : 'transformative'} qualities.

Your numerology life path number is ${numerology}, which brings ${numerology === 1 ? 'leadership and independence' : numerology === 2 ? 'cooperation and sensitivity' : numerology === 3 ? 'creativity and self-expression' : numerology === 4 ? 'stability and hard work' : numerology === 5 ? 'freedom and adventure' : numerology === 6 ? 'responsibility and nurturing' : numerology === 7 ? 'introspection and wisdom' : numerology === 8 ? 'ambition and material success' : numerology === 9 ? 'humanitarianism and completion' : numerology === 11 ? 'intuition and spiritual insight' : numerology === 22 ? 'master building and vision' : 'universal love and compassion'} to your life path.
      `}
      rituals={[
        `Birthday candle ritual: Light a ${zodiac.luckyColors[0]} candle on your birthday to honor your ${zodiac.sign} energy`,
        `${zodiac.element} element meditation: Connect with ${zodiac.element.toLowerCase()} energy through ${zodiac.element === 'Fire' ? 'candle gazing' : zodiac.element === 'Earth' ? 'grounding exercises' : zodiac.element === 'Air' ? 'breathwork' : 'water blessing'}`,
        `Intention setting with ${zodiac.ruler}: Work with ${zodiac.ruler} energy on your birthday for manifestation`,
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
            ['Ruling Planet', zodiac.ruler],
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
          name: `${zodiac.sign} Zodiac Sign`,
          href: `/grimoire/zodiac/${zodiac.sign.toLowerCase()}`,
          type: 'Zodiac',
        },
        {
          name: `${zodiac.ruler} in Astrology`,
          href: `/grimoire/astronomy/planets/${zodiac.ruler.toLowerCase()}`,
          type: 'Planet',
        },
        ...zodiac.compatibleSigns.slice(0, 2).map((sign) => ({
          name: `${sign} Compatibility`,
          href: `/grimoire/compatibility/${zodiac.sign.toLowerCase()}-${sign.toLowerCase()}`,
          type: 'Compatibility' as const,
        })),
      ]}
      ctaText='Get your personalized birthday reading'
      ctaHref='/birth-chart'
      sources={[
        { name: 'Traditional Western Astrology' },
        { name: 'Numerology calculations' },
        { name: 'Decan system' },
      ]}
    >
      <div className='mt-8 flex justify-between text-sm'>
        {prevDay ? (
          <Link
            href={`/grimoire/birthday/${prevDay}`}
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            ← {birthday.monthName} {birthday.day - 1}
          </Link>
        ) : (
          <span />
        )}
        {nextDay && (
          <Link
            href={`/grimoire/birthday/${nextDay}`}
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            {birthday.monthName} {birthday.day + 1} →
          </Link>
        )}
      </div>
    </SEOContentTemplate>
  );
}
