import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { getImageBaseUrl } from '@/lib/urls';

export const revalidate = 3600;

type TransitOfDayData = {
  date?: string;
  primaryEvent?: {
    name?: string;
    energy?: string;
  };
  highlights?: string[];
  horoscopeSnippet?: string;
};

async function getTransitOfDay(): Promise<TransitOfDayData | null> {
  const baseUrl = getImageBaseUrl();
  const dateStr = new Date().toISOString().split('T')[0];
  const response = await fetch(`${baseUrl}/api/og/cosmic-post/${dateStr}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

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
  const headline = data?.primaryEvent?.name || 'Transit of the Day';
  const energy = data?.primaryEvent?.energy || 'Daily cosmic timing';
  const highlights = data?.highlights ?? [];
  const guidance =
    data?.horoscopeSnippet ||
    'Use today’s transit as a timing cue and check back for updated daily context.';
  const dateLabel =
    data?.date ||
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className='min-h-fit bg-zinc-950 text-zinc-100'>
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
          intro={`${headline} — ${energy}. Updated daily with the most relevant transit for timing and awareness.`}
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
              name: "Today's Horoscopes",
              href: '/grimoire/horoscopes/today',
              type: 'topic',
            },
            {
              name: 'Transits by Year',
              href: '/grimoire/transits',
              type: 'topic',
            },
          ]}
        >
          <section className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-10'>
            <p className='text-xs uppercase tracking-[0.3em] text-zinc-500 mb-2'>
              {dateLabel}
            </p>
            <h2 className='text-2xl font-semibold text-zinc-100 mb-3'>
              {headline}
            </h2>
            <p className='text-sm text-zinc-300'>{energy}</p>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-semibold text-zinc-100 mb-4'>
              Daily highlights
            </h2>
            <ul className='space-y-2 text-sm text-zinc-300'>
              {highlights.length > 0 ? (
                highlights.map((item, index) => (
                  <li key={index} className='flex items-start gap-2'>
                    <span className='text-lunary-primary-300'>•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className='text-zinc-400'>
                  Highlights will update soon—check back for today’s transit
                  details.
                </li>
              )}
            </ul>
          </section>

          <section className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6'>
            <h2 className='text-xl font-semibold text-zinc-100 mb-3'>
              Daily timing guidance
            </h2>
            <p className='text-sm text-zinc-300 leading-relaxed'>{guidance}</p>
          </section>
        </SEOContentTemplate>
      </div>
    </div>
  );
}
