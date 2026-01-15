import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Sun } from 'lucide-react';

const VALID_YEARS = ['2024', '2025', '2026'];

const seasons = [
  {
    slug: 'aries-season',
    name: 'Aries Season',
    dates: 'March 20 - April 19',
    element: 'Fire',
  },
  {
    slug: 'taurus-season',
    name: 'Taurus Season',
    dates: 'April 20 - May 20',
    element: 'Earth',
  },
  {
    slug: 'gemini-season',
    name: 'Gemini Season',
    dates: 'May 21 - June 20',
    element: 'Air',
  },
  {
    slug: 'cancer-season',
    name: 'Cancer Season',
    dates: 'June 21 - July 22',
    element: 'Water',
  },
  {
    slug: 'leo-season',
    name: 'Leo Season',
    dates: 'July 23 - August 22',
    element: 'Fire',
  },
  {
    slug: 'virgo-season',
    name: 'Virgo Season',
    dates: 'August 23 - September 22',
    element: 'Earth',
  },
  {
    slug: 'libra-season',
    name: 'Libra Season',
    dates: 'September 23 - October 22',
    element: 'Air',
  },
  {
    slug: 'scorpio-season',
    name: 'Scorpio Season',
    dates: 'October 23 - November 21',
    element: 'Water',
  },
  {
    slug: 'sagittarius-season',
    name: 'Sagittarius Season',
    dates: 'November 22 - December 21',
    element: 'Fire',
  },
  {
    slug: 'capricorn-season',
    name: 'Capricorn Season',
    dates: 'December 22 - January 19',
    element: 'Earth',
  },
  {
    slug: 'aquarius-season',
    name: 'Aquarius Season',
    dates: 'January 20 - February 18',
    element: 'Air',
  },
  {
    slug: 'pisces-season',
    name: 'Pisces Season',
    dates: 'February 19 - March 19',
    element: 'Water',
  },
];

const SEASON_MEANING =
  'Each zodiac season begins when the Sun crosses into a new sign, shifting the collective storyline for roughly 30 days. Tracking the element and modality of each season helps you set goals, match rituals to the cosmic weather, and pace bigger projects. Use the seasons as a planning cycle: start, build, refine, and integrate. If you track one theme across the year, the seasonal shifts make the pattern easy to see. Keep the focus practical and repeatable. Simplicity wins. Review monthly.';

const SEASON_WORK_TIPS = [
  'Note every Sun ingress in your planner and pick a focus or journal prompt for that season.',
  'Layer moon phases on top of the season to decide when to launch, refine, or release intentions.',
  'Rotate your altar correspondences—colors, crystals, herbs—to match the element of the active season.',
  'Pair each season with the ruling planet to add extra timing cues for spellwork or reflection.',
  'Review your notes at each equinox and solstice to see what changed.',
  'Use the final week of each season to reflect and reset goals.',
  'Keep one sentence per season so the year stays easy to scan.',
];

const SEASON_RELATED_ITEMS = [
  {
    name: 'Wheel of the Year',
    href: '/grimoire/wheel-of-the-year',
    type: 'Seasonal rituals',
  },
  { name: 'Moon Rituals', href: '/grimoire/moon/rituals', type: 'Lunar magic' },
  {
    name: 'Manifestation',
    href: '/grimoire/manifestation',
    type: 'Practical magic',
  },
];

const SEASON_INTERNAL_LINKS = [
  { text: 'All Seasons', href: '/grimoire/seasons' },
  { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
  { text: 'Astronomy', href: '/grimoire/astronomy' },
  { text: 'Moon Phase Guide', href: '/grimoire/moon' },
];

const SEASON_FAQS = [
  {
    question: 'Why do zodiac season dates shift each year?',
    answer:
      'Season dates depend on the exact moment the Sun enters a sign, which can vary by hours each year. We list the typical range, but the precise ingress may be early or late depending on your time zone. Check an ephemeris if you need the exact timestamp.',
  },
  {
    question: 'How can I work with zodiac seasons in ritual?',
    answer:
      'Treat seasons as month-long themes. Use the element and modality to guide spell ingredients, journaling prompts, and magic timing. For example, during water seasons focus on emotional healing, while earth seasons are ideal for grounding and abundance work.',
  },
  {
    question: 'What if my birthday falls on the cusp between seasons?',
    answer:
      'If you were born near a season change, double-check the exact Sun ingress for your birth year. You might resonate with energies from both seasons, which can be woven into your rituals and planning.',
  },
];

export async function generateStaticParams() {
  return VALID_YEARS.map((year) => ({ year }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;

  if (!VALID_YEARS.includes(year)) {
    return { title: 'Year Not Found | Lunary' };
  }

  const title = `Zodiac Seasons ${year}: All 12 Astrological Seasons | Lunary`;
  const description = `Explore all 12 zodiac seasons for ${year}. Learn the dates, themes, and energy of each astrological season from Aries to Pisces.`;

  return {
    title,
    description,
    keywords: [
      `zodiac seasons ${year}`,
      'astrological seasons',
      'aries season',
      'zodiac calendar',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/seasons/${year}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/seasons/${year}`,
    },
  };
}

export default async function YearSeasonsPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  if (!VALID_YEARS.includes(year)) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={`Zodiac Seasons ${year}: All 12 Astrological Seasons | Lunary`}
        h1={`Zodiac Seasons ${year}`}
        description={`Each year cycles through the twelve zodiac seasons. Discover the dates, elements, and themes for ${year}.`}
        keywords={[
          `zodiac seasons ${year}`,
          'astrological seasons',
          'zodiac calendar',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/seasons/${year}`}
        intro={`Use ${year} as a seasonal map. Each zodiac season lasts about a month and offers a clear theme for planning, reflection, and ritual.`}
        tldr={`Follow the twelve zodiac seasons in ${year} to align goals with the Sun’s monthly themes.`}
        meaning={SEASON_MEANING}
        howToWorkWith={SEASON_WORK_TIPS}
        rituals={[
          'Choose one intention at each seasonal shift and revisit weekly.',
          'Align your altar color with the season element.',
          'Do a short reflection at the midpoint of each season.',
        ]}
        journalPrompts={[
          'What does this season invite me to focus on?',
          'Where do I want more consistency this month?',
          'What am I ready to release before the next season begins?',
        ]}
        tables={[
          {
            title: 'Season Planning',
            headers: ['Element', 'Best Focus'],
            rows: [
              ['Fire', 'Action and momentum'],
              ['Earth', 'Stability and planning'],
              ['Air', 'Ideas and connection'],
              ['Water', 'Reflection and healing'],
            ],
          },
        ]}
        relatedItems={SEASON_RELATED_ITEMS}
        internalLinks={SEASON_INTERNAL_LINKS}
        faqs={SEASON_FAQS}
        heroContent={
          <div className='text-center'>
            <div className='flex justify-center mb-4'>
              <Sun className='w-16 h-16 text-amber-400' />
            </div>
            <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
              The Sun moves through twelve zodiac seasons each year, shaping
              collective energy and opportunities. Explore the dates and themes
              for every season in {year}.
            </p>
          </div>
        }
        tableOfContents={[
          { label: 'Astrological Seasons', href: '#astrological-seasons' },
          { label: 'Season Grid', href: '#season-grid' },
          { label: 'Related Resources', href: '#related-resources' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Seasons', href: '/grimoire/seasons' },
          { label: year },
        ]}
      >
        <section
          id='astrological-seasons'
          className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Astrological Seasons
          </h2>
          <p className='text-zinc-400'>
            Each zodiac season brings a unique flavor based on the sign's
            element and modality. These periods influence collective focus,
            priorities, and energy for yourself and the world.
          </p>
        </section>

        <section id='season-grid' className='mb-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {seasons.map((season) => (
              <Link
                key={season.slug}
                href={`/grimoire/seasons/${year}/${season.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
              >
                <h3 className='font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                  {season.name}
                </h3>
                <p className='text-sm text-zinc-400 mb-1'>{season.dates}</p>
                <p className='text-xs text-zinc-400'>{season.element} Season</p>
              </Link>
            ))}
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
