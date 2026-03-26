import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { stringToKebabCase } from '../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Full Moon Names: All 12 Monthly Moons & Meanings | Lunary',
  description:
    'Complete guide to full moon names and their meanings. Discover Wolf Moon, Harvest Moon, and all 12 monthly full moons with their folklore and rituals.',
  keywords: [
    'full moon names',
    'wolf moon',
    'harvest moon',
    'strawberry moon',
    'blood moon',
    'full moon meanings',
    'lunar calendar',
    'monthly moons',
  ],
  openGraph: {
    title: 'Full Moon Names: Complete Monthly Guide | Lunary',
    description: 'Discover all 12 monthly full moon names and their meanings.',
    url: 'https://lunary.app/grimoire/moon/full-moons',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/moon',
        width: 1200,
        height: 630,
        alt: 'Full Moon Names Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Full Moon Names Guide | Lunary',
    description: 'Complete guide to monthly full moon names and meanings.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon/full-moons',
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

const faqs = [
  {
    question: 'Why do full moons have different names?',
    answer:
      "Full moon names come from Native American, Colonial American, and European traditions. Before modern calendars, people tracked time by lunar cycles. Each month's full moon was named after seasonal activities, weather patterns, or natural phenomena occurring at that time.",
  },
  {
    question: 'What is the Wolf Moon?',
    answer:
      "The Wolf Moon is January's full moon, named for the howling wolves that were heard during the cold winter nights. It's associated with survival, planning, and introspection during the darkest part of winter.",
  },
  {
    question: 'What is a Harvest Moon?',
    answer:
      "The Harvest Moon is the full moon closest to the autumn equinox (usually September). It rises shortly after sunset for several nights, providing extra light for farmers to harvest crops. It's associated with abundance, gratitude, and reaping what you've sown.",
  },
  {
    question: 'What is a Blue Moon?',
    answer:
      "A Blue Moon is the second full moon in a calendar month, occurring roughly every 2.7 years. The phrase 'once in a blue moon' comes from their rarity. Blue Moons are considered extra powerful for manifestation and goal-setting.",
  },
  {
    question: 'Do full moon names differ between traditions?',
    answer:
      'Yes, different cultures have their own names for full moons. The names commonly used today are primarily from Algonquin and Colonial American traditions. Celtic, Chinese, and other cultures have distinct naming systems with different meanings.',
  },
];

export default function FullMoonsIndexPage() {
  const moons = Object.entries(annualFullMoons);

  const fullMoonsListSchema = createItemListSchema({
    name: 'Full Moon Names',
    description:
      'Complete guide to all 12 monthly full moon names and their meanings, from Wolf Moon to Cold Moon.',
    url: 'https://lunary.app/grimoire/moon/full-moons',
    items: moons.map(([month, moon]) => ({
      name: moon.name,
      url: `https://lunary.app/grimoire/moon/full-moons/${stringToKebabCase(month)}`,
      description: moon.description,
    })),
  });

  return (
    <>
      {renderJsonLd(fullMoonsListSchema)}
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <SEOContentTemplate
          title='Full Moon Names | Lunary'
          h1='Full Moon Names: Monthly Lunar Guide'
          description="Each month's full moon carries a traditional name reflecting the season, nature, and activities of that time of year."
          keywords={[
            'full moon names',
            'wolf moon',
            'harvest moon',
            'monthly moons',
          ]}
          canonicalUrl='https://lunary.app/grimoire/moon/full-moons'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Moon', href: '/grimoire/moon' },
            { label: 'Full Moon Names', href: '/grimoire/moon/full-moons' },
          ]}
          whatIs={{
            question: 'What are Full Moon Names?',
            answer:
              "Full moon names are traditional names given to each month's full moon based on seasonal activities, weather, or natural phenomena. These names helped early cultures track time before modern calendars. Most commonly used names come from Native American (primarily Algonquin) and Colonial American traditions, though many cultures worldwide have their own naming systems.",
          }}
          tldr='Each month has a named full moon: Wolf (Jan), Snow (Feb), Worm (Mar), Pink (Apr), Flower (May), Strawberry (Jun), Buck (Jul), Sturgeon (Aug), Harvest (Sep), Hunter (Oct), Beaver (Nov), Cold (Dec).'
          meaning={`Full moon names connect us to the rhythms of nature and the wisdom of our ancestors. Understanding these names deepens your lunar practice.

**The 12 Monthly Full Moons:**

**January - Wolf Moon**: Named for wolves howling in the cold. Themes: survival, planning, inner reflection.

**February - Snow Moon**: Named for heavy snowfall. Themes: purification, patience, inner work.

**March - Worm Moon**: Named for earthworms appearing as ground thaws. Themes: renewal, emergence, awakening.

**April - Pink Moon**: Named for early spring wildflowers (phlox). Themes: growth, fertility, new beginnings.

**May - Flower Moon**: Named for abundant spring blooms. Themes: abundance, love, beauty.

**June - Strawberry Moon**: Named for strawberry harvest. Themes: sweetness, love, joy.

**July - Buck Moon**: Named for buck deer growing antlers. Themes: masculine energy, growth, strength.

**August - Sturgeon Moon**: Named for abundant sturgeon fish. Themes: abundance, prosperity, achievement.

**September - Harvest Moon**: Named for harvest season. Themes: gratitude, completion, abundance.

**October - Hunter's Moon**: Named for hunting season. Themes: preparation, providence, ancestors.

**November - Beaver Moon**: Named for beaver trapping season. Themes: industry, preparation, community.

**December - Cold Moon**: Named for winter's coldest month. Themes: rest, reflection, release.

**Working with Full Moon Energy:**

Each named moon carries specific energy for your practice. Align your rituals with the moon's themes for deeper connection and more powerful magic.`}
          howToWorkWith={[
            'Learn the name and meaning of the current full moon',
            'Align your full moon ritual with the moon seasonal themes',
            'Create moon water charged with that moon specific energy',
            'Journal about how the named moon energy appears in your life',
            'Honor ancestors and traditions connected to each moon',
          ]}
          tables={[
            {
              title: 'Full Moon Names by Month',
              headers: ['Month', 'Name', 'Theme'],
              rows: [
                ['January', 'Wolf Moon', 'Survival, planning'],
                ['February', 'Snow Moon', 'Purification, patience'],
                ['March', 'Worm Moon', 'Renewal, awakening'],
                ['April', 'Pink Moon', 'Growth, fertility'],
                ['May', 'Flower Moon', 'Abundance, love'],
                ['June', 'Strawberry Moon', 'Sweetness, joy'],
                ['July', 'Buck Moon', 'Strength, growth'],
                ['August', 'Sturgeon Moon', 'Prosperity'],
                ['September', 'Harvest Moon', 'Gratitude'],
                ['October', 'Hunter Moon', 'Preparation'],
                ['November', 'Beaver Moon', 'Industry'],
                ['December', 'Cold Moon', 'Rest, release'],
              ],
            },
          ]}
          relatedItems={[
            {
              name: 'Moon Phases',
              href: '/grimoire/moon/phases',
              type: 'Moon',
            },
            {
              name: 'Moon in Signs',
              href: '/grimoire/moon-in',
              type: 'Astrology',
            },
            {
              name: 'Moon Rituals',
              href: '/grimoire/moon/rituals',
              type: 'Practice',
            },
            {
              name: 'Eclipses',
              href: '/grimoire/eclipses',
              type: 'Moon',
            },
          ]}
          internalLinks={[
            { text: 'Moon Calendar', href: '/moon' },
            { text: 'Moon Phases', href: '/grimoire/moon/phases' },
            { text: 'Moon Rituals', href: '/grimoire/moon/rituals' },
            { text: 'Sabbats', href: '/grimoire/wheel-of-the-year' },
          ]}
          ctaText='Want personalized full moon insights for your chart?'
          ctaHref='/pricing'
          faqs={faqs}
        >
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              All 12 Full Moons
            </h2>
            <p className='text-zinc-400 mb-6'>
              Click on any moon to explore its full folklore, magical
              correspondences, and ritual suggestions.
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {moons.map(([month, moon]) => (
                <Link
                  key={month}
                  href={`/grimoire/moon/full-moons/${stringToKebabCase(month)}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-zinc-400'>{month}</span>
                    <span className='text-xl'>🌕</span>
                  </div>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                    {moon.name}
                  </h3>
                  <p className='text-sm text-zinc-400 line-clamp-2'>
                    {moon.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className='mb-12 bg-amber-950/20 border border-amber-900/50 rounded-xl p-6'>
            <h2 className='text-xl font-medium text-zinc-100 mb-4'>
              Quick Reference: Full Moon by Season
            </h2>
            <div className='grid md:grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-blue-400 font-medium'>Winter Moons:</p>
                <p className='text-zinc-400'>
                  Wolf (Jan), Snow (Feb), Cold (Dec)
                </p>
              </div>
              <div>
                <p className='text-green-400 font-medium'>Spring Moons:</p>
                <p className='text-zinc-400'>
                  Worm (Mar), Pink (Apr), Flower (May)
                </p>
              </div>
              <div>
                <p className='text-amber-400 font-medium'>Summer Moons:</p>
                <p className='text-zinc-400'>
                  Strawberry (Jun), Buck (Jul), Sturgeon (Aug)
                </p>
              </div>
              <div>
                <p className='text-orange-400 font-medium'>Autumn Moons:</p>
                <p className='text-zinc-400'>
                  Harvest (Sep), Hunter (Oct), Beaver (Nov)
                </p>
              </div>
            </div>
          </section>
        </SEOContentTemplate>
      </div>
    </>
  );
}
