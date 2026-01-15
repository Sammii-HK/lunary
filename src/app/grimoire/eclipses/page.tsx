import { Metadata } from 'next';
import Link from 'next/link';
import { Sun, Moon as MoonIcon } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

const eclipseTypes = [
  {
    slug: 'solar',
    name: 'Solar Eclipse',
    icon: <Sun className='w-8 h-8' />,
    description: 'New Moon eclipses - powerful new beginnings',
    themes: [
      'New beginnings',
      'Major life changes',
      'Fresh starts',
      'External manifestation',
    ],
    occurs: 'When the Moon passes between Earth and Sun',
    energy: 'Outward, active, manifest',
  },
  {
    slug: 'lunar',
    name: 'Lunar Eclipse',
    icon: <MoonIcon className='w-8 h-8' />,
    description: 'Full Moon eclipses - powerful releases and revelations',
    themes: [
      'Endings',
      'Revelations',
      'Emotional release',
      'Internal transformation',
    ],
    occurs: 'When Earth passes between Sun and Moon',
    energy: 'Inward, reflective, releasing',
  },
];

export const metadata: Metadata = {
  title: 'Solar & Lunar Eclipses: Complete Astrology Guide | Lunary',
  description:
    'Understand the spiritual and astrological significance of solar and lunar eclipses. Learn how eclipse energy affects you and how to work with it.',
  keywords: [
    'solar eclipse',
    'lunar eclipse',
    'eclipse astrology',
    'eclipse meaning',
    'eclipse effects',
    'eclipse season',
    'eclipse ritual',
  ],
  openGraph: {
    title: 'Eclipses Guide | Lunary',
    description:
      'Understand the spiritual significance of solar and lunar eclipses.',
    url: 'https://lunary.app/grimoire/eclipses',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/eclipses',
  },
};

export default function EclipsesIndexPage() {
  const eclipseListSchema = createItemListSchema({
    name: 'Types of Eclipses',
    description:
      'Complete guide to solar and lunar eclipses in astrology, their meanings, and how to work with eclipse energy.',
    url: 'https://lunary.app/grimoire/eclipses',
    items: eclipseTypes.map((eclipse) => ({
      name: eclipse.name,
      url: `https://lunary.app/grimoire/eclipses/${eclipse.slug}`,
      description: eclipse.description,
    })),
  });

  return (
    <>
      {renderJsonLd(eclipseListSchema)}
      <SEOContentTemplate
        title='Solar & Lunar Eclipses: Complete Astrology Guide'
        h1='Eclipses'
        description='Eclipses are powerful cosmic events that mark significant turning points. They accelerate change and catalyze transformation in our lives.'
        keywords={[
          'solar eclipse',
          'lunar eclipse',
          'eclipse astrology',
          'eclipse meaning',
          'eclipse effects',
        ]}
        canonicalUrl='https://lunary.app/grimoire/eclipses'
        whatIs={{
          question: 'What are eclipses in astrology?',
          answer:
            'Eclipses are powerful cosmic events that occur when the Sun, Moon, and Earth align. In astrology, they act as cosmic catalysts that accelerate change, bring revelations, and mark significant turning points. Solar eclipses (New Moon) bring new beginnings, while lunar eclipses (Full Moon) bring endings and emotional releases. Events set in motion during eclipses often unfold over the following 6 months.',
        }}
        tldr='Eclipses are cosmic wild cards that accelerate change. Solar eclipses bring new beginnings; lunar eclipses bring endings and revelations. Eclipse seasons occur every 6 months, and their effects unfold over 6 months. Avoid manifestation during eclipses — observe and receive instead.'
        intro='Eclipses occur when the Sun, Moon, and Earth align. They happen in pairs or sometimes trios, with a solar and lunar eclipse occurring about two weeks apart. Eclipse seasons happen roughly every 6 months. In astrology, eclipses are like cosmic wild cards — they can bring sudden changes, revelations, or new paths. Events set in motion during eclipses often unfold over the following 6 months.'
        meaning={`Eclipses mark fated turning points. They compress time, reveal hidden information, and redirect your path. If you feel emotional or unsettled, that’s normal — eclipses heighten sensitivity and accelerate lessons.

Use eclipse seasons to reflect on patterns, not to force outcomes. The clearest guidance often appears in hindsight, once the change has settled.

Each eclipse activates a house in your birth chart, which is why two people experience the same eclipse differently. Knowing which house is triggered helps you understand the life area being highlighted.

Solar eclipses are forward‑moving; they invite new chapters. Lunar eclipses are releasing; they highlight what is ready to end. If you want to work with eclipse energy in a grounded way, focus on awareness rather than outcomes.

Eclipses can feel like curveballs, but they often reveal what has been building beneath the surface. The more you observe recurring themes, the more useful the eclipse season becomes.

If you are unsure what to do, do less. Rest, reflect, and allow the message to arrive on its own timing.`}
        howToWorkWith={[
          "Don't manifest during eclipses: The energy is too chaotic. Observe what unfolds instead.",
          'Pay attention to themes: Notice what comes up 2 weeks before and after an eclipse.',
          'Check your chart: Eclipses hitting personal planets bring more noticeable effects.',
          'Stay flexible: Eclipses can bring unexpected changes — go with the flow.',
        ]}
        rituals={[
          'Journal what is surfacing without trying to solve it immediately.',
          'Take a cleansing bath or shower to reset your energy.',
          'Light a single candle and ask for clarity rather than outcomes.',
          'Rest more than usual and keep your schedule light.',
        ]}
        journalPrompts={[
          'What is ending naturally in my life right now?',
          'What is asking to begin even if it feels scary?',
          'Where do I feel resistance, and why?',
          'What truth has become impossible to ignore?',
        ]}
        emotionalThemes={[
          'Uncertainty and change',
          'Revelations',
          'Letting go',
          'Redirection',
        ]}
        tables={[
          {
            title: 'Eclipse Season Rhythm',
            headers: ['Phase', 'What to Do'],
            rows: [
              ['Before', 'Notice repeating themes and slow down.'],
              ['During', 'Observe, rest, and avoid forcing decisions.'],
              ['After', 'Act on clarity and integrate lessons.'],
            ],
          },
        ]}
        faqs={[
          {
            question: 'Should I do rituals during an eclipse?',
            answer:
              'Most astrologers recommend against active manifestation or spell work during eclipses. The energy is too unpredictable. Instead, use eclipse time for reflection, journaling, and receiving insights.',
          },
          {
            question: 'How long do eclipse effects last?',
            answer:
              'Eclipse effects typically unfold over 6 months, from one eclipse season to the next. Major themes introduced during an eclipse may continue developing for up to 18 months as the lunar nodes transit.',
          },
          {
            question: 'Why do eclipses happen in pairs?',
            answer:
              'Eclipses occur when the Sun and Moon align near the lunar nodes. Since the nodes are opposite each other, we get both a solar eclipse (New Moon) and lunar eclipse (Full Moon) about two weeks apart during each eclipse season.',
          },
          {
            question: 'Do eclipses affect everyone the same way?',
            answer:
              'Everyone feels the collective tone, but the strongest effects happen when an eclipse activates personal chart placements.',
          },
        ]}
        internalLinks={[
          { text: 'Lunar Nodes', href: '/grimoire/lunar-nodes' },
          { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
        ]}
        relatedItems={[
          {
            name: 'Astrological Events',
            href: '/grimoire/events',
            type: 'section',
          },
          { name: 'Lunar Nodes', href: '/grimoire/lunar-nodes', type: 'topic' },
          { name: 'Moon Phases', href: '/grimoire/moon/phases', type: 'topic' },
          { name: 'Transits', href: '/grimoire/transits', type: 'topic' },
        ]}
      >
        <div className='space-y-12'>
          <section>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Types of Eclipses
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {eclipseTypes.map((eclipse) => (
                <Link
                  key={eclipse.slug}
                  href={`/grimoire/eclipses/${eclipse.slug}`}
                  className={`group rounded-xl border p-6 transition-all ${
                    eclipse.slug === 'solar'
                      ? 'border-amber-900/50 bg-amber-950/20 hover:bg-amber-950/30 hover:border-amber-600'
                      : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/70 hover:border-zinc-500'
                  }`}
                >
                  <div className='flex items-center gap-4 mb-4'>
                    <span
                      className={
                        eclipse.slug === 'solar'
                          ? 'text-amber-400'
                          : 'text-zinc-300'
                      }
                    >
                      {eclipse.icon}
                    </span>
                    <h3
                      className={`text-xl font-medium ${
                        eclipse.slug === 'solar'
                          ? 'text-zinc-100 group-hover:text-amber-300'
                          : 'text-zinc-100 group-hover:text-zinc-200'
                      } transition-colors`}
                    >
                      {eclipse.name}
                    </h3>
                  </div>
                  <p className='text-zinc-400 mb-3'>{eclipse.description}</p>
                  <div className='text-sm text-zinc-400 mb-3'>
                    <span className='font-medium text-zinc-400'>Occurs: </span>
                    {eclipse.occurs}
                  </div>
                  <div className='text-sm text-zinc-400 mb-4'>
                    <span className='font-medium text-zinc-400'>Energy: </span>
                    {eclipse.energy}
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {eclipse.themes.map((theme) => (
                      <span
                        key={theme}
                        className={`text-xs px-2 py-1 rounded ${
                          eclipse.slug === 'solar'
                            ? 'bg-amber-900/30 text-amber-300/70'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
              Eclipse Season Checklist
            </h2>
            <p className='text-sm text-zinc-300 mb-4'>
              Eclipse energy is intense but manageable when you move slowly. Use
              this short checklist to stay grounded and focused.
            </p>
            <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
              <li>Keep your schedule flexible and avoid big commitments.</li>
              <li>Journal what repeats rather than forcing new plans.</li>
              <li>Sleep and hydration become non‑negotiable.</li>
              <li>Wait a few days before making major decisions.</li>
            </ul>
          </section>
          <section className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
              Solar vs. Lunar Eclipses
            </h2>
            <p className='text-sm text-zinc-300 mb-4'>
              Solar eclipses emphasize beginnings, action, and new direction.
              Lunar eclipses emphasize endings, truth, and emotional release.
              Think of solar as a doorway opening, and lunar as a doorway
              closing.
            </p>
            <p className='text-sm text-zinc-300'>
              If you are unsure which is happening, check the Moon phase: new
              moon eclipses are solar, full moon eclipses are lunar. Both are
              powerful, but they ask for different responses.
            </p>
          </section>
        </div>
      </SEOContentTemplate>
    </>
  );
}
