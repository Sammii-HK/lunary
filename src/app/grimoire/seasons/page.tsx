import { Metadata } from 'next';
import Link from 'next/link';
import { ZODIAC_SEASONS, getSeasonDates } from '@/constants/seo/zodiac-seasons';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Zodiac Seasons ${currentYear}-${nextYear}: Astrological Calendar & Dates | Lunary`,
    description:
      'Complete guide to zodiac seasons. Learn when each astrological season begins, its meaning, and how to work with the cosmic energy. All 12 zodiac seasons explained.',
    keywords: [
      'zodiac seasons',
      'astrological seasons',
      'aries season',
      'taurus season',
      'gemini season',
      'cancer season',
      'leo season',
      'virgo season',
      'libra season',
      'scorpio season',
      'sagittarius season',
      'capricorn season',
      'aquarius season',
      'pisces season',
    ],
    openGraph: {
      title: `Zodiac Seasons ${currentYear}-${nextYear}: Astrological Calendar & Dates`,
      description:
        'Complete guide to all 12 zodiac seasons with dates, meanings, and cosmic energies.',
      url: 'https://lunary.app/grimoire/seasons',
    },
    alternates: {
      canonical: 'https://lunary.app/grimoire/seasons',
    },
  };
}

export default async function SeasonsIndexPage() {
  const seasonsListSchema = createItemListSchema({
    name: 'Zodiac Seasons',
    description:
      'Complete guide to all 12 zodiac seasons with dates and cosmic energies.',
    url: 'https://lunary.app/grimoire/seasons',
    items: ZODIAC_SEASONS.map((s) => ({
      name: `${s.displayName} Season`,
      url: `https://lunary.app/grimoire/seasons/${currentYear}/${s.sign}`,
      description: `When the Sun moves through ${s.displayName}`,
    })),
  });

  const metadata = await generateMetadata();

  const intro =
    'Every zodiac season marks a fresh wave of cosmic energy. Track the Sun’s journey through the signs to align rituals, make major decisions, and honor seasonal celebrations.';

  const howToWorkWith = [
    'Use the yearly grid to plan rituals or journaling prompts tied to each season.',
    'Pair each season with a planetary or elemental correspondence for clearer intent.',
    'Refer back to the corresponding zodiac sign page for deeper sign-specific insights.',
  ];

  const relatedItems = [
    { name: 'Zodiac Signs', href: '/grimoire/zodiac', type: 'section' },
    {
      name: 'Astronomy & Astrology',
      href: '/grimoire/astronomy',
      type: 'section',
    },
    { name: 'Moon Phases', href: '/grimoire/moon/phases', type: 'lunar' },
  ];

  return (
    <>
      {renderJsonLd(seasonsListSchema)}
      <SEOContentTemplate
        title={`Zodiac Seasons ${currentYear}-${nextYear} | Lunary`}
        h1='Zodiac Seasons'
        description='Complete guide to zodiac season dates, symbols, and recipes for magical timing.'
        canonicalUrl='https://lunary.app/grimoire/seasons'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Seasons' },
        ]}
        intro={intro}
        tldr='Each zodiac season brings a distinct theme as the Sun moves through the signs. Use the season focus to plan rituals, goals, and timing.'
        meaning={`Zodiac seasons are defined by the Sun entering each sign. Each season carries elemental themes, gifts, and lessons that can guide rituals, readings, and self-discovery.

Seasonal energy is a practical timing tool. Fire seasons support bold action, Earth seasons support stability and planning, Air seasons support ideas and connection, and Water seasons support emotional healing.

Use the season as a backdrop rather than a rule. Your personal chart shapes how the season feels, but the collective theme still offers helpful direction.

If you are unsure where to start, use the element of the season to guide daily routines. Small shifts like scheduling creative work during Fire seasons or planning during Earth seasons can make a noticeable difference.

If you want a deeper approach, pair the season with a single intention and revisit it weekly. This turns the season into a focused practice rather than a vague theme.

Seasons also interact with lunar cycles. A New Moon in the same element as the season can feel like a strong reset, while a Full Moon can highlight results and closure.`}
        howToWorkWith={howToWorkWith}
        rituals={[
          'Set a seasonal intention on the first day of each sign.',
          'Choose one weekly ritual aligned to the element.',
          'Track how your mood shifts across the season.',
          'Close the season with a short reflection or release.',
        ]}
        journalPrompts={[
          'What does this season invite me to focus on?',
          'How does the current element show up in my life?',
          "What action would align with this season's theme?",
          'What should I complete before the next season begins?',
        ]}
        tables={[
          {
            title: 'Elemental Flow',
            headers: ['Element', 'Season Focus'],
            rows: [
              ['Fire', 'Initiation and confidence'],
              ['Earth', 'Structure and grounding'],
              ['Air', 'Ideas and connection'],
              ['Water', 'Healing and intuition'],
            ],
          },
          {
            title: 'Quick Timing Guide',
            headers: ['Season Type', 'Best For'],
            rows: [
              ['Cardinal', 'Starts and resets'],
              ['Fixed', 'Consistency and mastery'],
              ['Mutable', 'Change and transition'],
            ],
          },
        ]}
        relatedItems={relatedItems}
        ctaText='Plan with the Zodiac Seasons'
        ctaHref='/grimoire/seasons'
        keywords={metadata.keywords as string[]}
        internalLinks={[
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Astrology Guide', href: '/grimoire/astrology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={[
          {
            question: 'What is a zodiac season?',
            answer:
              'A zodiac season is the period when the Sun moves through a specific sign, shaping the collective tone for that time.',
          },
          {
            question: 'Do zodiac seasons affect everyone the same way?',
            answer:
              'The theme is collective, but your personal chart determines how strongly you feel it in specific life areas.',
          },
          {
            question: 'How can I use zodiac seasons in planning?',
            answer:
              'Align big starts with Cardinal seasons, steady progress with Fixed seasons, and changes with Mutable seasons.',
          },
        ]}
      >
        <div className='max-w-6xl mx-auto px-4 py-12 space-y-10'>
          <div className='grid md:grid-cols-2 gap-8'>
            {[currentYear, nextYear].map((year) => (
              <div
                key={year}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-6'
              >
                <h2 className='text-2xl font-light'>{year} Zodiac Seasons</h2>
                <p className='text-sm text-zinc-400'>
                  Track the Sun’s entry, fixed stars, and ritual focus for each
                  season.
                </p>
                <div className='space-y-3'>
                  {ZODIAC_SEASONS.map((s) => {
                    const dates = getSeasonDates(s.sign, year);
                    return (
                      <Link
                        key={`${year}-${s.sign}`}
                        href={`/grimoire/seasons/${year}/${s.sign}`}
                        className='flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group'
                      >
                        <div className='flex items-center gap-3'>
                          <span className='text-xl'>{s.symbol}</span>
                          <span className='font-medium group-hover:text-lunary-primary-300 transition-colors'>
                            {s.displayName} Season
                          </span>
                        </div>
                        <span className='text-sm text-zinc-400'>
                          {dates.start.split(',')[0]}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 space-y-3'>
            <h2 className='text-xl font-medium text-lunary-primary-300'>
              Personalized Season Forecasts
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Each season plays differently across your natal chart. Combine the
              zodiac energy with planetary aspects and houses to time spells,
              retreats, and journaling prompts.
            </p>
            <Link
              href='/horoscope'
              className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
            >
              View Personalized Horoscopes
            </Link>
          </div>
        </div>
      </SEOContentTemplate>
    </>
  );
}
