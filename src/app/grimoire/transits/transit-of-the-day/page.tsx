import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { getTransitOfDay } from '@/lib/astro/transit-of-day';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Today’s Astrology Transit: Planetary Highlights & Guidance | Lunary',
  description:
    'See today’s most influential planetary transit with real-time insights, timing, and interpretation from Lunary’s astrologers.',
  alternates: {
    canonical: 'https://lunary.app/grimoire/transits/transit-of-the-day',
  },
  openGraph: {
    title: 'Today’s Astrology Transit | Lunary',
    description:
      'See the most influential transit today with quick highlights and daily timing guidance.',
    url: 'https://lunary.app/grimoire/transits/transit-of-the-day',
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Today’s Astrology Transit | Lunary',
    description:
      'See the most influential transit today with quick highlights and daily timing guidance.',
    images: ['/api/og/cosmic-post/2026-01-15'],
  },
};

export default async function TransitOfTheDayPage() {
  const data = await getTransitOfDay();
  const headline = data.primaryEvent.name;
  const energy = data.primaryEvent.energy;
  const highlights = data.highlights;
  const guidance = data.horoscopeSnippet;
  const dateLabel = data.date;
  const introEnergy = energy.replace(/[.!?]+$/, '');

  return (
    <div className='min-h-fit bg-surface-base text-content-primary'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <SEOContentTemplate
          title='Transit of the Day | Daily Astrology Timing'
          h1='Transit of the Day'
          description='The most influential transit today, plus quick highlights and daily timing guidance.'
          keywords={[
            'transit of the day',
            'daily transits',
            'current transit',
            'astrology timing',
            'planetary transits',
          ]}
          canonicalUrl='https://lunary.app/grimoire/transits/transit-of-the-day'
          intro={`${headline} — ${introEnergy}. Updated daily with the most relevant transit for timing and awareness.`}
          whatIs={{
            question: "What is today's transit of the day?",
            answer: `Today's headline transit is ${headline}. ${introEnergy}. The transit of the day is the single most influential planetary movement in the current sky, chosen for timing and awareness.`,
          }}
          tldr={`Today's transit of the day is ${headline}. ${introEnergy}.`}
          faqs={[
            {
              question: "What is today's transit of the day?",
              answer: `Today's most influential transit is ${headline}. ${introEnergy}.`,
            },
            {
              question: 'What is a transit in astrology?',
              answer:
                'A transit is the movement of a planet in the current sky as it forms an aspect to another planet or to a placement in your birth chart. Transits are how astrologers read timing: when an event is likely to feel active.',
            },
            {
              question: 'How often does the transit of the day change?',
              answer:
                'The transit of the day updates daily as the sky shifts. The fast-moving Moon changes the picture most, while slower planets keep a theme active for days or weeks.',
            },
          ]}
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Transits', href: '/grimoire/transits' },
            { label: 'Transit of the Day' },
          ]}
          relatedItems={[
            { name: 'Transits Hub', href: '/grimoire/transits', type: 'topic' },
            {
              name: 'Retrogrades Calendar',
              href: '/grimoire/astronomy/retrogrades',
              type: 'topic',
            },
            {
              name: 'Monthly Horoscopes',
              href: '/grimoire/horoscopes',
              type: 'topic',
            },
            {
              name: 'Transits by Year',
              href: '/grimoire/transits',
              type: 'topic',
            },
          ]}
        >
          <section className='rounded-2xl border border-stroke-subtle bg-surface-elevated/50 p-6 mb-10'>
            <p className='text-xs uppercase tracking-[0.3em] text-content-muted mb-2'>
              {dateLabel}
            </p>
            <h2 className='text-2xl font-semibold text-content-primary mb-3'>
              {headline}
            </h2>
            <p className='text-sm text-content-secondary'>{energy}</p>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-semibold text-content-primary mb-4'>
              Daily highlights
            </h2>
            <ul className='space-y-2 text-sm text-content-secondary'>
              {highlights.length > 0 ? (
                highlights.map((item, index) => (
                  <li key={index} className='flex items-start gap-2'>
                    <span className='text-content-brand'>•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className='text-content-muted'>
                  Highlights will update soon—check back for today’s transit
                  details.
                </li>
              )}
            </ul>
          </section>

          <section className='rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-6'>
            <h2 className='text-xl font-semibold text-content-primary mb-3'>
              Daily timing guidance
            </h2>
            <p className='text-sm text-content-secondary leading-relaxed'>
              {guidance}
            </p>
          </section>
        </SEOContentTemplate>
      </div>
    </div>
  );
}
