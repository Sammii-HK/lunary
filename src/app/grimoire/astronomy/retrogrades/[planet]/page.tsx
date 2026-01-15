import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { retrogradeInfo } from '@/constants/grimoire/seo-data';
import { createEventSchema, renderJsonLd } from '@/lib/schema';

const retrogradeKeys = Object.keys(retrogradeInfo);
const year = new Date().getFullYear();

export async function generateStaticParams() {
  return retrogradeKeys.map((planet) => ({
    planet: planet,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet: string }>;
}): Promise<Metadata> {
  const { planet } = await params;
  const retrogradeData = retrogradeInfo[planet as keyof typeof retrogradeInfo];

  if (!retrogradeData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${retrogradeData.name} ${year}: Dates, Meaning & Survival Guide - Lunary`;
  const description = `${retrogradeData.name} ${year} dates & effects. Occurs ${retrogradeData.frequency.toLowerCase()}, lasts ${retrogradeData.duration.toLowerCase()}. What to do (and avoid) during ${planet} retrograde.`;

  return {
    title,
    description,
    keywords: [
      `${retrogradeData.name}`,
      `${retrogradeData.name.toLowerCase()} meaning`,
      `${retrogradeData.name.toLowerCase()} dates`,
      `${retrogradeData.name.toLowerCase()} effects`,
      `when is ${retrogradeData.name.toLowerCase()}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/astronomy/retrogrades/${planet}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/retrogrades',
          width: 1200,
          height: 630,
          alt: `${retrogradeData.name}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/grimoire/retrogrades'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/astronomy/retrogrades/${planet}`,
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
}

export default async function RetrogradePage({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;
  const retrogradeData = retrogradeInfo[planet as keyof typeof retrogradeInfo];

  if (!retrogradeData) {
    notFound();
  }

  const tableOfContents = [
    { label: 'Retrograde Essentials', href: '#retrograde-essentials' },
    { label: 'Timeline & Symptoms', href: '#retrograde-timeline' },
    { label: 'Ritual & Practice', href: '#retrograde-rituals' },
    { label: 'Journal Prompts', href: '#retrograde-journal' },
    { label: 'Frequently Asked Questions', href: '#faq' },
  ];

  const heroContent = (
    <div className='text-center space-y-3'>
      <div className='flex items-center justify-center gap-3 text-4xl text-lunary-primary-300'>
        <span>{retrogradeData.symbol}</span>
        <span>Retrograde Focus</span>
      </div>
      <p className='text-zinc-300 max-w-3xl mx-auto'>
        {retrogradeData.name} draws the planet’s lessons inward. Pause, pause,
        and plan while you decode what needs rewriting.
      </p>
    </div>
  );

  const themes = retrogradeData.themes.split(', ');

  const faqs = [
    {
      question: `How often does ${retrogradeData.name} occur?`,
      answer: `${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} and lasts ${retrogradeData.duration.toLowerCase()}.`,
    },
    {
      question: `What are the effects of ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, you may experience ${retrogradeData.effects.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What should I do during ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, focus on ${retrogradeData.whatToDo.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What should I avoid during ${retrogradeData.name}?`,
      answer: `During ${retrogradeData.name}, avoid ${retrogradeData.whatToAvoid.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
  ];

  const retrogradeSchema = createEventSchema({
    name: `${retrogradeData.name} ${year}`,
    description: `${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} and lasts ${retrogradeData.duration.toLowerCase()}. ${retrogradeData.description.slice(0, 150)}...`,
    url: `/grimoire/astronomy/retrogrades/${planet}`,
    startDate: `${year}-01-01`,
    eventType: 'Event',
    keywords: [
      retrogradeData.name.toLowerCase(),
      `${planet} retrograde ${year}`,
      'retrograde',
      'planetary retrograde',
      'astrology events',
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(retrogradeSchema)}
      <SEOContentTemplate
        title={`${retrogradeData.name} - Lunary`}
        h1={`${retrogradeData.name}: Complete Guide`}
        description={`Discover everything about ${retrogradeData.name}. Learn about frequency, duration, effects, and how to navigate this retrograde period.`}
        keywords={[
          `${retrogradeData.name}`,
          `${retrogradeData.name.toLowerCase()} meaning`,
          `${retrogradeData.name.toLowerCase()} dates`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/astronomy/retrogrades/${planet}`}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro={`${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} and lasts ${retrogradeData.duration.toLowerCase()}. ${retrogradeData.description}`}
        tldr={`${retrogradeData.name} occurs ${retrogradeData.frequency.toLowerCase()} for ${retrogradeData.duration.toLowerCase()}.`}
        meaning={`A retrograde occurs when a planet appears to move backward in the sky from our perspective on Earth. While planets don't actually move backward, this optical illusion creates a powerful astrological influence. ${retrogradeData.name} is one of the most significant retrograde periods.

${retrogradeData.description}

During retrograde periods, the planet's energy turns inward, creating opportunities for reflection, review, and re-evaluation. This is a time to work with internal processes rather than external actions.

Understanding ${retrogradeData.name} helps you navigate this period consciously, making the most of its reflective energy while avoiding common pitfalls.

Retrogrades often include a “shadow” period before and after the exact retrograde dates. You may notice similar themes appearing early or lingering after the station direct day. Treat the entire window as a slow‑down and refinement phase.`}
        howToWorkWith={[
          ...retrogradeData.whatToDo,
          'Keep your inbox organized and labeled for retrograde follow-ups.',
          'Pause before hitting send during Mercury retrograde—wait a day.',
          'Use the shadow period to double‑check plans and commitments.',
        ]}
        tables={[
          {
            title: `${retrogradeData.name} Overview`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Frequency', retrogradeData.frequency],
              ['Duration', retrogradeData.duration],
              ['Key Effects', retrogradeData.effects.slice(0, 3).join(', ')],
            ],
          },
          {
            title: 'Retrograde Dos & Don’ts',
            headers: ['Do', 'Avoid'],
            rows: [
              [
                retrogradeData.whatToDo[0] || 'Review and refine',
                retrogradeData.whatToAvoid[0] || 'Rushing decisions',
              ],
              [
                retrogradeData.whatToDo[1] || 'Revisit old plans',
                retrogradeData.whatToAvoid[1] || 'Signing under pressure',
              ],
            ],
          },
        ]}
        rituals={[
          `During ${retrogradeData.name}, focus on ${retrogradeData.whatToDo.join(', ').toLowerCase()}. This is a time for internal work and reflection.`,
          `Write a short list of what needs revision, then choose one small fix to complete this week.`,
          `Clean up one area of your digital or physical workspace to clear retrograde clutter.`,
        ]}
        journalPrompts={[
          `What does ${retrogradeData.name} mean for me?`,
          `What areas need review during this retrograde?`,
          `How can I work with ${retrogradeData.name} energy?`,
          `What should I focus on during this period?`,
          `What past theme keeps returning, and what is it teaching me now?`,
        ]}
        relatedItems={[
          {
            name: retrogradeData.name.split(' ')[0] || 'Planets',
            href: `/grimoire/astronomy/planets/${planet}`,
            type: 'Planet',
          },
          {
            name: 'Birth Chart',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy', href: '/grimoire/astronomy' },
          { label: 'Retrogrades', href: '/grimoire/astronomy/retrogrades' },
          {
            label: retrogradeData.name,
            href: `/grimoire/astronomy/retrogrades/${planet}`,
          },
        ]}
        internalLinks={[
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
          { text: 'All Retrogrades', href: '/grimoire/astronomy/retrogrades' },
        ]}
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-astronomy'
            entityKey='retrogrades'
            title='Retrograde Connections'
          />
        }
        ctaText='Add retrograde alerts to your ritual journal'
        ctaHref='/journal'
      >
        <div className='space-y-10'>
          <section
            id='retrograde-essentials'
            className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Retrograde Essentials
            </h2>
            <p className='text-zinc-300'>
              {retrogradeData.name} turns{' '}
              {retrogradeData.name.split(' ')[0] || 'the planet'} energy inward
              for reflection, review, and repair. This{' '}
              {retrogradeData.frequency} rewind gives you a chance to pour love
              over the themes already in motion rather than launching something
              new.
            </p>
            <ul className='list-disc list-inside text-zinc-300 space-y-1'>
              <li>Monitor the station retrograde and station direct days.</li>
              <li>Use the planet’s correspondences to guide rituals.</li>
              <li>
                Reframe frustration as feedback and clean up what is already in
                motion.
              </li>
            </ul>
          </section>

          <section
            id='retrograde-timeline'
            className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Timeline & Symptoms
            </h2>
            <p className='text-zinc-300'>
              Retrogrades arrive slowly. Track your planner for the start,
              opposition, and direct days. Use the list below to translate
              symptoms into planetary lessons.
            </p>
            <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
                <p className='font-semibold text-zinc-100'>What to Expect</p>
                <ul className='list-disc list-inside mt-2 space-y-1'>
                  {themes.map((theme) => (
                    <li key={theme}>{theme}</li>
                  ))}
                </ul>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
                <p className='font-semibold text-zinc-100'>Timing Checklist</p>
                <ul className='list-disc list-inside mt-2 space-y-1'>
                  <li>Station retrograde: pause.</li>
                  <li>Opposition to the Sun: emotions flare.</li>
                  <li>Station direct + 3 days: clear the backlog.</li>
                </ul>
              </div>
            </div>
          </section>
          <section
            id='retrograde-shadow'
            className='bg-zinc-900/35 border border-zinc-800 rounded-xl p-6 space-y-4'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Shadow Period: Before & After
            </h2>
            <p className='text-zinc-300'>
              The shadow period starts before the official retrograde and ends
              after the planet stations direct. You may feel a buildup of the
              same themes, like recurring conversations or unfinished tasks.
            </p>
            <p className='text-zinc-300'>
              Use this window to review plans, back up files, and give yourself
              extra time. The goal is not to stop life, but to move
              deliberately.
            </p>
          </section>

          <section
            id='retrograde-rituals'
            className='bg-zinc-900/35 border border-zinc-800 rounded-xl p-6 space-y-4'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Ritual & Practice
            </h2>
            <p className='text-zinc-300'>
              Match the planet’s flavor to reinvent how you work with this
              energy.
            </p>
            <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
              <div className='space-y-2'>
                <p className='font-semibold text-zinc-100'>Ritual Mini-List</p>
                <ul className='list-disc list-inside space-y-1'>
                  <li>Light corresponding candle or incense.</li>
                  <li>
                    Review documents related to the planet (Mercury = messages,
                    Venus = wallets).
                  </li>
                  <li>Journal about lessons the planet is readdressing.</li>
                </ul>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold text-zinc-100'>Slowdown Actions</p>
                <ul className='list-disc list-inside space-y-1'>
                  <li>
                    Delay expensive purchases for 3 days after station direct.
                  </li>
                  <li>Move slowly—retrogrades are NOT about hustle.</li>
                  <li>
                    Rehearse conversations instead of launching them
                    impulsively.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section
            id='retrograde-journal'
            className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-3'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Journal Prompts
            </h2>
            <ul className='list-decimal list-inside text-zinc-300 space-y-2'>
              <li>What has resurfaced that needs completion?</li>
              <li>How can I reframe my reaction to retrograde dialogue?</li>
              <li>
                What gratitude can I offer retrograde for the clarity it brings?
              </li>
            </ul>
          </section>
        </div>
      </SEOContentTemplate>
    </div>
  );
}
