import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ZODIAC_SEASONS, getSeasonDates } from '@/constants/seo/zodiac-seasons';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

interface PageParams {
  year: string;
  season: string;
}

export async function generateStaticParams() {
  const years = ['2025', '2026'];
  const params: PageParams[] = [];

  for (const year of years) {
    for (const s of ZODIAC_SEASONS) {
      params.push({ year, season: s.sign });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { year, season } = await params;
  const yearNum = parseInt(year);
  const seasonData = ZODIAC_SEASONS.find((s) => s.sign === season);

  if (!seasonData || yearNum < 2024 || yearNum > 2030) {
    return { title: 'Season Not Found | Lunary' };
  }

  const dates = getSeasonDates(season, yearNum);
  const title = `${seasonData.displayName} Season ${year}: Dates, Meaning & Rituals | Lunary`;
  const description = `${seasonData.displayName} Season ${year} runs from ${dates.start} to ${dates.end}. Discover the cosmic energy, themes, and rituals for ${seasonData.displayName} season.`;

  return {
    title,
    description,
    keywords: [
      `${seasonData.displayName.toLowerCase()} season ${year}`,
      `${seasonData.displayName.toLowerCase()} season dates`,
      `when is ${seasonData.displayName.toLowerCase()} season`,
      `${seasonData.displayName.toLowerCase()} season meaning`,
      'zodiac season',
      'astrology season',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/seasons/${year}/${season}`,
      images: [
        `/api/og/thematic?category=zodiac&slug=${encodeURIComponent(season)}&title=${encodeURIComponent(`${seasonData.displayName} Season ${year}`)}&format=landscape`,
      ],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/seasons/${year}/${season}`,
    },
  };
}

export default async function ZodiacSeasonPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { year, season } = await params;
  const yearNum = parseInt(year);
  const seasonData = ZODIAC_SEASONS.find((s) => s.sign === season);

  if (!seasonData || yearNum < 2024 || yearNum > 2030) {
    notFound();
  }

  const dates = getSeasonDates(season, yearNum);
  const seasonIndex = ZODIAC_SEASONS.findIndex((s) => s.sign === season);
  const prevSeason =
    seasonIndex > 0 ? ZODIAC_SEASONS[seasonIndex - 1] : ZODIAC_SEASONS[11];
  const nextSeason =
    seasonIndex < 11 ? ZODIAC_SEASONS[seasonIndex + 1] : ZODIAC_SEASONS[0];

  return (
    <SEOContentTemplate
      title={`${seasonData.displayName} Season ${year}`}
      h1={`${seasonData.symbol} ${seasonData.displayName} Season ${year}`}
      description={`${seasonData.displayName} Season ${year} brings ${seasonData.theme}. From ${dates.start} to ${dates.end}, the Sun travels through ${seasonData.displayName}, activating ${seasonData.element} energy for everyone.`}
      keywords={[
        `${seasonData.displayName} season`,
        year,
        'zodiac season',
        seasonData.element,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/seasons/${year}/${season}`}
      intro={`${seasonData.displayName} Season ${year} is a collective transit that colors the mood of the month. From ${dates.start} to ${dates.end}, the Sun amplifies ${seasonData.element.toLowerCase()} energy, inviting everyone to work with ${seasonData.theme}. Whether you track astrology daily or simply want to align with seasonal rhythms, this guide offers practical ways to integrate the season into your goals, relationships, and rituals.`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Zodiac Seasons'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Seasons', href: '/grimoire/seasons' },
        { label: year, href: `/grimoire/seasons/${year}` },
        { label: `${seasonData.displayName} Season` },
      ]}
      whatIs={{
        question: `When is ${seasonData.displayName} Season ${year}?`,
        answer: `${seasonData.displayName} Season ${year} runs from ${dates.start} to ${dates.end}. During this time, the Sun transits through ${seasonData.displayName}, bringing ${seasonData.element} energy and themes of ${seasonData.theme} to everyone, regardless of their Sun sign.`,
      }}
      tldr={`${seasonData.displayName} Season ${year}: ${dates.start} - ${dates.end}. Theme: ${seasonData.theme}. Element: ${seasonData.element}. Natural season: ${seasonData.season}.`}
      meaning={`
## What is ${seasonData.displayName} Season?

${seasonData.displayName} Season occurs when the Sun transits through the zodiac sign of ${seasonData.displayName}. This happens annually from approximately ${dates.start} to ${dates.end}.

### The Energy of ${seasonData.displayName} Season

${seasonData.energy}. This affects everyone, not just those with ${seasonData.displayName} Sun signs. During ${seasonData.displayName} Season, we all experience heightened ${seasonData.element.toLowerCase()} energy.

### Themes of ${seasonData.displayName} Season

The primary theme of ${seasonData.displayName} Season is ${seasonData.theme}. This is an excellent time to focus on activities and intentions that align with these energies.

### ${seasonData.displayName} Season and the Natural World

${seasonData.displayName} Season falls during ${seasonData.season} in the Northern Hemisphere. The qualities of this natural season mirror the astrological energy beautifully.

### How to Work with ${seasonData.displayName} Season

The best way to use a zodiac season is to match your goals to its energy. If the season emphasizes action, start projects and take bold steps. If it emphasizes reflection, slow down, evaluate, and refine. Small daily rituals—like journaling or a short meditation—help you track how the season is influencing your mood and choices.

### Relationships and Focus

Seasonal energy shows up in communication and priorities. Notice where you feel motivated, and set one clear focus for the month so the season feels supportive rather than scattered.

### Timing Tips

If you want to plan ahead, use the first week to set direction, the middle weeks to build momentum, and the final days to review progress. This keeps your focus aligned with the natural arc of the season.

If you miss a week, return without judgment. The season holds the theme for a full month, so you can re-enter at any point.

### A Note on Hemispheres

If you are in the Southern Hemisphere, the natural season may be opposite. The astrological themes still apply, but you can weave them into your local climate and culture. Let the season meet you where you are.
      `}
      rituals={seasonData.rituals}
      emotionalThemes={[
        seasonData.theme,
        `${seasonData.element} energy activation`,
        `${seasonData.season} themes`,
      ]}
      howToWorkWith={[
        'Set one intention that mirrors the season theme.',
        'Review your calendar and align key actions with the season energy.',
        'Track your mood and energy levels each week to notice patterns.',
        'Use the season element in rituals (candles, water, incense, stones).',
        'Create a seasonal playlist or altar to anchor the vibe.',
      ]}
      journalPrompts={[
        `What does ${seasonData.theme.toLowerCase()} look like in my daily life?`,
        'Where do I feel most energized right now, and why?',
        `How can I honor ${seasonData.element.toLowerCase()} energy with my routine?`,
        'What needs closure before the next season begins?',
        'What is one habit I want to carry into the next season?',
      ]}
      signsMostAffected={[seasonData.displayName]}
      tables={[
        {
          title: `${seasonData.displayName} Season ${year} Details`,
          headers: ['Aspect', 'Details'],
          rows: [
            ['Sign', `${seasonData.displayName} ${seasonData.symbol}`],
            ['Dates', `${dates.start} - ${dates.end}`],
            ['Element', seasonData.element],
            ['Natural Season', seasonData.season],
            ['Theme', seasonData.theme],
          ],
        },
        {
          title: 'Seasonal Focus Ideas',
          headers: ['Area', 'Focus'],
          rows: [
            ['Work', `Align goals with ${seasonData.theme.toLowerCase()}`],
            ['Relationships', 'Communicate needs clearly'],
            ['Self-care', `Honor ${seasonData.element.toLowerCase()} balance`],
          ],
        },
      ]}
      relatedItems={[
        {
          name: `${seasonData.displayName} Zodiac Sign`,
          href: `/grimoire/zodiac/${season}`,
          type: 'Zodiac',
        },
        {
          name: `${prevSeason.displayName} Season ${year}`,
          href: `/grimoire/seasons/${year}/${prevSeason.sign}`,
          type: 'Season',
        },
        {
          name: `${nextSeason.displayName} Season ${year}`,
          href: `/grimoire/seasons/${year}/${nextSeason.sign}`,
          type: 'Season',
        },
      ]}
      faqs={[
        {
          question: `Does ${seasonData.displayName} Season affect everyone?`,
          answer: `Yes. The Sun's transit sets the collective tone for the month, so everyone feels some influence. Your natal chart shows which house is most activated for you personally.`,
        },
        {
          question: `How is ${seasonData.displayName} Season different from ${seasonData.displayName} Sun sign?`,
          answer: `Seasonal energy is a temporary transit that affects everyone, while your Sun sign is a lifelong placement. The season can highlight similar themes, but it does not change your core identity.`,
        },
        {
          question: 'Is the timing exact every year?',
          answer:
            'Dates are approximate and can shift by a day based on exact solar ingress times. This guide uses standard transit dates for planning and reflection.',
        },
      ]}
      internalLinks={[
        { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
        { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
        { text: 'Astrology Transits', href: '/grimoire/transits' },
      ]}
      ctaText={`Discover how ${seasonData.displayName} Season affects your chart`}
      ctaHref='/horoscope'
      sources={[
        { name: 'Solar transit calculations' },
        { name: 'Traditional astrological seasons' },
      ]}
    >
      <div className='mt-8 flex justify-between text-sm'>
        <Link
          href={`/grimoire/seasons/${year}/${prevSeason.sign}`}
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          ← {prevSeason.symbol} {prevSeason.displayName} Season
        </Link>
        <Link
          href={`/grimoire/seasons/${year}/${nextSeason.sign}`}
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          {nextSeason.displayName} Season {nextSeason.symbol} →
        </Link>
      </div>
    </SEOContentTemplate>
  );
}
