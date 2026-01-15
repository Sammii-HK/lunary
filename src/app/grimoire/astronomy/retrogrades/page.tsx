import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const retrogrades = [
  {
    slug: 'mercury',
    name: 'Mercury Retrograde',
    symbol: '☿',
    frequency: '3-4 times/year',
    duration: '~3 weeks',
    themes: 'Communication, travel, technology, contracts',
  },
  {
    slug: 'venus',
    name: 'Venus Retrograde',
    symbol: '♀',
    frequency: 'Every 18 months',
    duration: '~6 weeks',
    themes: 'Love, beauty, values, money, relationships',
  },
  {
    slug: 'mars',
    name: 'Mars Retrograde',
    symbol: '♂',
    frequency: 'Every 2 years',
    duration: '~2.5 months',
    themes: 'Action, energy, desire, anger, motivation',
  },
  {
    slug: 'jupiter',
    name: 'Jupiter Retrograde',
    symbol: '♃',
    frequency: 'Yearly',
    duration: '~4 months',
    themes: 'Growth, luck, expansion, beliefs, travel',
  },
  {
    slug: 'saturn',
    name: 'Saturn Retrograde',
    symbol: '♄',
    frequency: 'Yearly',
    duration: '~4.5 months',
    themes: 'Responsibility, structure, karma, limitations',
  },
  {
    slug: 'uranus',
    name: 'Uranus Retrograde',
    symbol: '♅',
    frequency: 'Yearly',
    duration: '~5 months',
    themes: 'Innovation, rebellion, change, technology',
  },
  {
    slug: 'neptune',
    name: 'Neptune Retrograde',
    symbol: '♆',
    frequency: 'Yearly',
    duration: '~5 months',
    themes: 'Dreams, illusions, spirituality, creativity',
  },
  {
    slug: 'pluto',
    name: 'Pluto Retrograde',
    symbol: '♇',
    frequency: 'Yearly',
    duration: '~5-6 months',
    themes: 'Transformation, power, death/rebirth, secrets',
  },
];

const faqs = [
  {
    question: 'Are retrogrades actually bad?',
    answer:
      'Not inherently. Retrogrades often feel slower or more reflective because they emphasize review. If you treat them like “maintenance windows” for edits, repairs, and renegotiation, they become productive instead of stressful.',
  },
  {
    question: 'What should I avoid during Mercury retrograde?',
    answer:
      'Avoid rushing contracts, skipping backups, and assuming messages were received. Double-check travel details, confirm plans in writing, and build buffer time for delays.',
  },
  {
    question: 'Do retrogrades affect everyone the same way?',
    answer:
      'No. The strongest effects show up where the retrograde lands in your birth chart (house) and which natal planets it aspects. That’s why two people can experience the same retrograde very differently.',
  },
  {
    question: 'What are the most important retrograde dates to track?',
    answer:
      'Track the station retrograde (start), the midpoint/solar conjunction (clarity), and the station direct (release). Those are the “turning points” where the story shifts.',
  },
];

export const metadata: Metadata = {
  title: 'Planetary Retrogrades 2025: Mercury, Venus, Mars & More | Lunary',
  description:
    'Understand all planetary retrogrades from Mercury to Pluto. Learn when they occur, how long they last, and how to navigate their energies.',
  keywords: [
    'planetary retrograde',
    'mercury retrograde',
    'venus retrograde',
    'retrograde meaning',
    'retrograde effects',
  ],
  openGraph: {
    title: 'Planetary Retrogrades Guide | Lunary',
    description:
      'Understand all planetary retrogrades and how to navigate their energies.',
    url: 'https://lunary.app/grimoire/astronomy/retrogrades',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astronomy/retrogrades',
  },
};

export default function RetrogradesIndexPage() {
  const retrogradesListSchema = createItemListSchema({
    name: 'Planetary Retrogrades Guide',
    description:
      'Complete guide to all planetary retrogrades from Mercury to Pluto.',
    url: 'https://lunary.app/grimoire/astronomy/retrogrades',
    items: retrogrades.map((r) => ({
      name: r.name,
      url: `https://lunary.app/grimoire/astronomy/retrogrades/${r.slug}`,
      description: r.themes,
    })),
  });

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <RotateCcw className='w-16 h-16 text-lunary-primary-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        When a planet appears to move backward in the sky, it&apos;s retrograde.
        Each planet&apos;s retrograde brings opportunities for review,
        reflection, and revision.
      </p>
    </div>
  );

  const tableOfContents = [
    { label: 'What is Retrograde?', href: '#what-is-retrograde' },
    { label: 'All Planetary Retrogrades', href: '#all-retrogrades' },
    { label: 'Retrograde Playbook', href: '#retrograde-playbook' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Explore More Astrology', href: '#explore-astrology' },
  ];

  const sections = (
    <>
      <section
        id='what-is-retrograde'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          What is Retrograde?
        </h2>
        <p className='text-zinc-400 mb-4'>
          Retrograde is an optical illusion caused by the relative positions and
          speeds of Earth and other planets. When a planet is retrograde, its
          energy turns inward — a time for reflection rather than new
          beginnings.
        </p>
        <p className='text-zinc-400'>
          Rather than fearing retrogrades, use them as opportunities to revisit,
          revise, and reflect on the themes each planet represents.
        </p>
      </section>

      <section id='all-retrogrades' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          All Planetary Retrogrades
        </h2>
        <div className='space-y-4'>
          {retrogrades.map((retrograde) => (
            <Link
              key={retrograde.slug}
              href={`/grimoire/astronomy/retrogrades/${retrograde.slug}`}
              className='group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='text-3xl font-astro text-lunary-primary-400'>
                {retrograde.symbol}
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-1'>
                  <h3 className='text-xl font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {retrograde.name}
                  </h3>
                </div>
                <div className='flex gap-4 text-sm text-zinc-400 mb-2'>
                  <span>{retrograde.frequency}</span>
                  <span>•</span>
                  <span>{retrograde.duration}</span>
                </div>
                <p className='text-sm text-zinc-400'>
                  Themes: {retrograde.themes}
                </p>
              </div>
              <div className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors'>
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id='retrograde-playbook'
        className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          Retrograde Survival Playbook
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>
            <strong>Review your planner.</strong> Scan upcoming dates and mark
            when retrogrades begin, station direct, and hit sensitive chart
            points.
          </li>
          <li>
            <strong>Embrace the “Re-” verbs.</strong> Revisit unfinished
            projects, renegotiate agreements, or repair routines connected to
            the planet’s themes.
          </li>
          <li>
            <strong>Back everything up.</strong> Mercury retrograde loves
            misplaced files; keep digital and emotional receipts handy.
          </li>
          <li>
            <strong>Journal the data.</strong> Track what actually happens so
            you have personalized evidence instead of collective panic.
          </li>
        </ol>
        <p className='text-zinc-400 text-sm'>
          The more mindful you are about these cycles, the less chaotic they
          feel—and the easier it becomes to leverage them for intentional course
          corrections.
        </p>
      </section>

      <section id='faq' className='mb-12 space-y-4'>
        <h2 className='text-2xl font-medium text-zinc-100'>FAQ</h2>
        <div className='space-y-3'>
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
                {faq.question}
              </h3>
              <p className='text-sm text-zinc-300'>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <div id='explore-astrology' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>
          Explore More Astrology
        </h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/transits'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Transits
          </Link>
          <Link
            href='/grimoire/astronomy'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Astronomy
          </Link>
          <Link
            href='/grimoire/events'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Astrological Events
          </Link>
          <Link
            href='/grimoire/horoscopes'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Horoscopes
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(retrogradesListSchema)}
      <SEOContentTemplate
        title='Planetary Retrogrades 2025: Mercury, Venus, Mars & More | Lunary'
        h1='Planetary Retrogrades'
        description='Understand all planetary retrogrades from Mercury to Pluto, including their frequencies, durations, and energetic themes.'
        keywords={[
          'planetary retrograde',
          'mercury retrograde',
          'venus retrograde',
          'retrograde meaning',
          'retrograde effects',
        ]}
        canonicalUrl='https://lunary.app/grimoire/astronomy/retrogrades'
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro='When a planet appears to move backward, it signals a cosmic review period. Retrogrades ask us to slow down, revisit unfinished business, and integrate lessons. This guide breaks down every planetary retrograde so you can plan ahead rather than panic.'
        tldr='Retrogrades aren’t curses—they’re invitations to pause and refine. Mercury revisits communication, Venus reevaluates relationships, Mars edits motivation, and slow outer planets guide collective course corrections.'
        meaning='Each retrograde shifts the flow of energy from external action to inner recalibration. Understanding the timing and themes of these cycles helps you schedule launches, conversations, and ritual work in harmony with the sky.'
        whatIs={{
          question: 'Why do retrogrades matter?',
          answer:
            'They highlight the areas of life that need revision. Instead of forcing forward momentum, we edit, renegotiate, and heal. Treat retrogrades as cosmic maintenance windows.',
        }}
        howToWorkWith={[
          'Track start, midpoint (solar conjunction), and direct dates for each retrograde.',
          'Build extra buffers around travel, contracts, and tech during Mercury retrograde.',
          'Use Venus retrograde for heart check-ins, money auditing, and style refreshes.',
          'Let Mars retrograde redirect your energy toward strategy instead of sprinting.',
          'Meditate, journal, or do shadow work when Jupiter–Pluto retrogrades stir deeper healing.',
        ]}
        faqs={faqs}
        internalLinks={[
          { text: 'Transits', href: '/grimoire/transits' },
          { text: 'Birth Chart', href: '/birth-chart' },
          { text: 'Astronomy Hub', href: '/grimoire/astronomy' },
          { text: 'Daily Horoscope', href: '/horoscope' },
        ]}
        relatedItems={[
          {
            name: 'Planets in Astrology',
            href: '/grimoire/astronomy/planets',
            type: 'Guide',
          },
          {
            name: 'Mercury Retrograde Guide',
            href: '/grimoire/astronomy/retrogrades/mercury',
            type: 'Deep Dive',
          },
          {
            name: 'Transits Tracker',
            href: '/grimoire/transits',
            type: 'Tool',
          },
        ]}
        cosmicConnectionsParams={{
          entityType: 'hub-astronomy',
          entityKey: 'retrogrades',
        }}
        ctaText='Want retrograde alerts in your inbox?'
        ctaHref='/newsletter'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy', href: '/grimoire/astronomy' },
          { label: 'Retrogrades', href: '/grimoire/astronomy/retrogrades' },
        ]}
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
