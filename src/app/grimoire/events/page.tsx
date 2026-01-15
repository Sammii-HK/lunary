import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema } from '@/lib/schema';

export const revalidate = 86400;

export async function generateMetadata() {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  return {
    title: `Astrology Events Calendar ${currentYear}-${nextYear} | Lunary`,
    description:
      'Astrology events calendar with retrogrades, eclipses, lunar events, and planetary transits. Navigate cosmic events with guidance and rituals.',
    keywords: [
      'astrology events',
      'astrology calendar',
      'mercury retrograde',
      'venus retrograde',
      'eclipses',
      'lunar events',
      'planetary transits',
    ],
    openGraph: {
      title: `Astrology Events Calendar ${currentYear}-${nextYear} | Lunary`,
      description:
        'Astrology events calendar with retrogrades, eclipses, lunar events, and transits.',
      url: 'https://lunary.app/grimoire/events',
      siteName: 'Lunary',
    },
    alternates: {
      canonical: 'https://lunary.app/grimoire/events',
    },
  };
}

const otherYears = [2025, 2027, 2028, 2029, 2030];

export default function EventsIndexPage() {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const eventsListSchema = createItemListSchema({
    name: 'Astrology Events Calendar',
    description:
      'Complete guide to astrological events including retrogrades, eclipses, lunar events, and planetary transits.',
    url: 'https://lunary.app/grimoire/events',
    items: [
      {
        name: `${currentYear} Astrology Events`,
        url: `https://lunary.app/grimoire/events/${currentYear}`,
        description: `Complete guide to Mercury retrogrades, Venus retrograde, eclipses, and more for ${currentYear}`,
      },
      {
        name: `${nextYear} Astrology Events`,
        url: `https://lunary.app/grimoire/events/${nextYear}`,
        description: `Upcoming astrological events and transits for ${nextYear}`,
      },
      {
        name: `Mercury Retrograde ${currentYear}`,
        url: `https://lunary.app/grimoire/events/${currentYear}/mercury-retrograde`,
        description:
          'Retrograde periods with dates, meanings, and survival tips',
      },
      {
        name: `Venus Retrograde ${currentYear}`,
        url: `https://lunary.app/grimoire/events/${currentYear}/venus-retrograde`,
        description: 'Love, relationships, and self-worth themes',
      },
      {
        name: `${currentYear} Eclipses`,
        url: `https://lunary.app/grimoire/events/${currentYear}/eclipses`,
        description: 'Solar and lunar eclipses, meanings, and rituals',
      },
      {
        name: `${currentYear} Full & New Moons`,
        url: `https://lunary.app/grimoire/moon/${currentYear}`,
        description: 'Full moon dates, names, and lunar themes',
      },
    ],
  });

  return (
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
      additionalSchemas={[eventsListSchema]}
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
          href: '/grimoire/astronomy/retrogrades',
          type: 'topic',
        },
        { name: 'Eclipses', href: '/grimoire/eclipses', type: 'topic' },
        { name: 'Transits', href: '/grimoire/transits', type: 'topic' },
        {
          name: 'Moon Rituals',
          href: '/grimoire/moon/rituals',
          type: 'guide',
        },
      ]}
    >
      <div className='space-y-8'>
        <Link
          href={`/grimoire/events/${currentYear}`}
          className='group block p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 hover:bg-lunary-primary-900/20 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-lg bg-lunary-primary-900/20'>
                <Calendar className='h-8 w-8 text-lunary-primary-400' />
              </div>
              <div>
                <h2 className='text-xl font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {currentYear} Astrology Events
                </h2>
                <p className='text-zinc-400'>
                  Complete guide to retrogrades, eclipses, lunar events, and
                  more
                </p>
              </div>
            </div>
            <ArrowRight className='h-6 w-6 text-zinc-400 group-hover:text-lunary-primary-400 transition-colors' />
          </div>
        </Link>

        <div className='grid md:grid-cols-2 gap-4'>
          <Link
            href={`/grimoire/events/${currentYear}/mercury-retrograde`}
            className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose-950 hover:bg-lunary-rose-900 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
              Mercury Retrograde {currentYear}
            </h3>
            <p className='text-sm text-zinc-400'>
              Retrograde periods: dates, meanings, survival tips
            </p>
          </Link>

          <Link
            href={`/grimoire/events/${currentYear}/venus-retrograde`}
            className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose-950 hover:bg-lunary-rose-900 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
              Venus Retrograde {currentYear}
            </h3>
            <p className='text-sm text-zinc-400'>
              Love, relationships, self-worth themes
            </p>
          </Link>

          <Link
            href={`/grimoire/events/${currentYear}/eclipses`}
            className='group p-4 rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 hover:bg-lunary-accent-900 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 group-hover:text-lunary-accent-300 mb-1'>
              {currentYear} Eclipses
            </h3>
            <p className='text-sm text-zinc-400'>
              Solar & lunar eclipses, meanings, rituals
            </p>
          </Link>

          <Link
            href='/grimoire/moon/full-moons'
            className='group p-4 rounded-lg border border-lunary-secondary-700 bg-lunary-secondary-950 hover:bg-lunary-secondary-900 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 group-hover:text-lunary-secondary-300 mb-1'>
              Full Moons & Lunar Events
            </h3>
            <p className='text-sm text-zinc-400'>
              Full moon dates, lunar themes, and moon phase guidance
            </p>
          </Link>
        </div>

        <div>
          <h2 className='text-2xl font-medium text-white mb-3 flex items-center gap-2'>
            Other Years
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {otherYears.map((year) => (
              <Link
                key={year}
                href={`/grimoire/events/${year}`}
                className='group p-4 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 hover:bg-lunary-primary-900/20 transition-colors'
              >
                <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {year} Astrology Events
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SEOContentTemplate>
  );
}
