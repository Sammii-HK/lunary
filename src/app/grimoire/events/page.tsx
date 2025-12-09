import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Astrology Events Calendar 2025-2026 - Lunary',
  description:
    'Astrology events calendar with retrogrades, eclipses, and planetary transits. Navigate cosmic events with guidance and rituals.',
  keywords: [
    'astrology events',
    'astrology calendar',
    'mercury retrograde',
    'venus retrograde',
    'eclipses 2025',
    'planetary transits',
  ],
  openGraph: {
    title: 'Astrology Events Calendar - Lunary',
    description:
      'Astrology events calendar with retrogrades, eclipses, and transits.',
    url: 'https://lunary.app/grimoire/events',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/events',
  },
};

export default function EventsIndexPage() {
  const eventsListSchema = createItemListSchema({
    name: 'Astrology Events Calendar',
    description:
      'Complete guide to astrological events including retrogrades, eclipses, and planetary transits.',
    url: 'https://lunary.app/grimoire/events',
    items: [
      {
        name: '2025 Astrology Events',
        url: 'https://lunary.app/grimoire/events/2025',
        description:
          'Complete guide to Mercury retrogrades, Venus retrograde, eclipses, and more for 2025',
      },
      {
        name: '2026 Astrology Events',
        url: 'https://lunary.app/grimoire/events/2026',
        description: 'Upcoming astrological events and transits for 2026',
      },
      {
        name: 'Mercury Retrograde 2025',
        url: 'https://lunary.app/grimoire/events/2025/mercury-retrograde',
        description:
          '3 retrograde periods with dates, meanings, and survival tips',
      },
      {
        name: 'Venus Retrograde 2025',
        url: 'https://lunary.app/grimoire/events/2025/venus-retrograde',
        description: 'March 1 - April 12: love, relationships, self-worth',
      },
      {
        name: '2025 Eclipses',
        url: 'https://lunary.app/grimoire/events/2025/eclipses',
        description: '4 powerful eclipses: solar & lunar, meanings, rituals',
      },
    ],
  });

  return (
    <>
      {renderJsonLd(eventsListSchema)}
      <SEOContentTemplate
        title='Astrology Events Calendar'
        h1='Astrology Events'
        description='Navigate cosmic events with our comprehensive guides to retrogrades, eclipses, and planetary transits.'
        keywords={[
          'astrology events',
          'astrology calendar',
          'mercury retrograde',
          'eclipses',
          'planetary transits',
        ]}
        canonicalUrl='https://lunary.app/grimoire/events'
        whatIs={{
          question: 'What are astrological events?',
          answer:
            'Astrological events are significant planetary movements that influence energy on Earth. These include retrogrades (when planets appear to move backward), eclipses (powerful solar and lunar alignments), and major transits (planets changing signs or forming significant aspects). Understanding these events helps you navigate their energy and plan accordingly.',
        }}
        tldr='Major astrological events include retrogrades (Mercury 3x/year, Venus every 18 months), eclipses (4-6/year), and planetary sign changes. Each brings specific themes and opportunities. Mercury retrograde affects communication; Venus retrograde affects love; eclipses bring major life changes.'
        intro='Astrological events mark significant cosmic shifts that affect collective and personal energy. From the infamous Mercury retrograde to transformative eclipses, understanding these cycles helps you work with cosmic rhythms rather than against them. Our guides provide dates, meanings, and practical tips for navigating each event.'
        faqs={[
          {
            question: 'How often does Mercury go retrograde?',
            answer:
              'Mercury goes retrograde about 3-4 times per year, each period lasting approximately 3 weeks. The shadow periods (when effects begin and fade) extend this influence by about 2 weeks on each end.',
          },
          {
            question: 'Are eclipses good or bad?',
            answer:
              "Eclipses are neither good nor bad — they're catalysts for change. They accelerate events that were already building and can bring sudden revelations or endings. The effects depend on how the eclipse aspects your natal chart.",
          },
          {
            question: 'How do I know if an event affects me?',
            answer:
              "Compare the event's zodiac sign and degree to your birth chart. Events in your Sun, Moon, or Rising sign, or aspecting personal planets, will be more noticeable. Get your birth chart to see your specific placements.",
          },
        ]}
        relatedItems={[
          {
            name: 'Retrogrades',
            href: '/grimoire/retrogrades',
            type: 'topic',
          },
          { name: 'Eclipses', href: '/grimoire/eclipses', type: 'topic' },
          { name: 'Transits', href: '/grimoire/transits', type: 'topic' },
          {
            name: 'Moon Rituals',
            href: '/grimoire/moon-rituals',
            type: 'guide',
          },
        ]}
      >
        <div className='space-y-8'>
          <Link
            href='/grimoire/events/2025'
            className='group block p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 hover:bg-lunary-primary-900/20 transition-colors'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-lg bg-lunary-primary-900/20'>
                  <Calendar className='h-8 w-8 text-lunary-primary-400' />
                </div>
                <div>
                  <h2 className='text-xl font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    2025 Astrology Events
                  </h2>
                  <p className='text-zinc-400'>
                    Complete guide to Mercury retrogrades, Venus retrograde,
                    eclipses, and more
                  </p>
                </div>
              </div>
              <ArrowRight className='h-6 w-6 text-zinc-500 group-hover:text-lunary-primary-400 transition-colors' />
            </div>
          </Link>

          <div className='grid md:grid-cols-2 gap-4'>
            <Link
              href='/grimoire/events/2025/mercury-retrograde'
              className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose-950 hover:bg-lunary-rose-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
                Mercury Retrograde 2025
              </h3>
              <p className='text-sm text-zinc-400'>
                3 retrograde periods: dates, meanings, survival tips
              </p>
            </Link>

            <Link
              href='/grimoire/events/2025/venus-retrograde'
              className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose-950 hover:bg-lunary-rose-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
                Venus Retrograde 2025
              </h3>
              <p className='text-sm text-zinc-400'>
                March 1 - April 12: love, relationships, self-worth
              </p>
            </Link>

            <Link
              href='/grimoire/events/2025/eclipses'
              className='group p-4 rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 hover:bg-lunary-accent-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-accent-300 mb-1'>
                2025 Eclipses
              </h3>
              <p className='text-sm text-zinc-400'>
                4 powerful eclipses: solar & lunar, meanings, rituals
              </p>
            </Link>

            <Link
              href='/grimoire/moon-rituals'
              className='group p-4 rounded-lg border border-lunary-secondary-700 bg-lunary-secondary-950 hover:bg-lunary-secondary-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-secondary-300 mb-1'>
                Moon Rituals
              </h3>
              <p className='text-sm text-zinc-400'>
                Rituals for every moon phase and lunar event
              </p>
            </Link>
          </div>

          <div className='text-center pt-4'>
            <Link
              href='/horoscope'
              className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
            >
              See How Events Affect Your Chart
              <ArrowRight className='h-5 w-5' />
            </Link>
          </div>
        </div>
      </SEOContentTemplate>
    </>
  );
}
