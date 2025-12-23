export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

const astrologyItems = [
  {
    name: 'Birth Chart',
    href: '/grimoire/birth-chart',
    description: 'Your natal chart and how to read it.',
  },
  {
    name: 'Astrological Houses',
    href: '/grimoire/houses',
    description: 'The 12 life areas and their meanings.',
  },
  {
    name: 'Aspects',
    href: '/grimoire/aspects',
    description: 'Planetary relationships and patterns.',
  },
  {
    name: 'Planet Placements',
    href: '/grimoire/placements',
    description: 'Planets in signs and how they express.',
  },
  {
    name: 'Rising Sign',
    href: '/grimoire/rising-sign',
    description: 'Your ascendant and first impression.',
  },
  {
    name: 'Synastry',
    href: '/grimoire/synastry',
    description: 'Relationship astrology and compatibility.',
  },
  {
    name: 'Lunar Nodes',
    href: '/grimoire/lunar-nodes',
    description: 'North and South Node meanings.',
  },
  {
    name: 'Retrogrades',
    href: '/grimoire/astronomy/retrogrades',
    description: 'How retrogrades shape timing and focus.',
  },
  {
    name: 'Transits',
    href: '/grimoire/transits',
    description: 'Current planetary transits and themes.',
  },
  {
    name: 'Monthly Horoscopes',
    href: '/grimoire/horoscopes',
    description: 'Forecasts for all 12 zodiac signs.',
  },
  {
    name: 'Astronomy',
    href: '/grimoire/astronomy',
    description: 'Planets, zodiac, and celestial mechanics.',
  },
  {
    name: 'Astronomy vs Astrology',
    href: '/grimoire/astronomy-vs-astrology',
    description: 'How the two disciplines relate.',
  },
];

const astrologyGroups = [
  {
    title: 'Foundations',
    description:
      'Start with the birth chart, then deepen your understanding through houses, aspects, and placements.',
    items: [
      'Birth Chart',
      'Astrological Houses',
      'Aspects',
      'Planet Placements',
    ],
  },
  {
    title: 'Identity & Relationships',
    description:
      'Explore how astrology shapes personality, connection, and growth.',
    items: ['Rising Sign', 'Synastry', 'Lunar Nodes'],
  },
  {
    title: 'Timing & Cycles',
    description:
      'Track the sky in motion and learn how to work with planetary timing.',
    items: ['Retrogrades', 'Transits', 'Monthly Horoscopes'],
  },
  {
    title: 'Context & Method',
    description:
      'Understand the celestial mechanics and how astrology differs from astronomy.',
    items: ['Astronomy', 'Astronomy vs Astrology'],
  },
];

export const metadata: Metadata = {
  title: 'Astrology Guide: Birth Charts, Houses, Aspects & Transits | Lunary',
  description:
    'Learn astrology with clarity: birth charts, houses, aspects, placements, transits, and timing. A grounded guide to understanding how the sky connects to lived experience.',
  keywords: [
    'astrology guide',
    'birth chart',
    'natal chart',
    'astrological houses',
    'astrology aspects',
    'planet placements',
    'transits',
    'retrogrades',
    'rising sign',
    'synastry',
    'lunar nodes',
  ],
  openGraph: {
    title: 'Astrology Guide: Birth Charts, Houses, Aspects & Transits | Lunary',
    description:
      'Learn astrology with clarity: birth charts, houses, aspects, placements, transits, and timing.',
    url: 'https://lunary.app/grimoire/astrology',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: '/api/og/grimoire/astrology',
        width: 1200,
        height: 630,
        alt: 'Astrology Guide - Lunary Grimoire',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrology Guide: Birth Charts, Houses, Aspects & Transits | Lunary',
    description:
      'Learn astrology with clarity: birth charts, houses, aspects, placements, transits, and timing.',
    images: ['/api/og/grimoire/astrology'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astrology',
  },
};

export default function AstrologyIndexPage() {
  const astrologyListSchema = createItemListSchema({
    name: 'Astrology Guide',
    description:
      'Learn astrology fundamentals: birth charts, houses, aspects, placements, transits, and timing.',
    url: 'https://lunary.app/grimoire/astrology',
    items: astrologyItems.map((item) => ({
      name: item.name,
      url: `https://lunary.app${item.href}`,
      description: item.description,
    })),
  });

  return (
    <>
      {renderJsonLd(astrologyListSchema)}
      <SEOContentTemplate
        title='Astrology Guide: Birth Charts, Houses, Aspects & Transits'
        h1='Astrology'
        description='A grounded guide to astrology fundamentals: birth charts, houses, aspects, placements, and timing.'
        keywords={[
          'astrology guide',
          'birth chart',
          'natal chart',
          'astrological houses',
          'astrology aspects',
          'planet placements',
          'transits',
          'retrogrades',
          'rising sign',
          'synastry',
        ]}
        canonicalUrl='https://lunary.app/grimoire/astrology'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astrology', href: '/grimoire/astrology' },
        ]}
        whatIs={{
          question: 'What is astrology?',
          answer:
            'Astrology is a symbolic system that maps planetary positions to human experience. A birth chart captures the sky at your birth, and its placements, houses, and aspects describe patterns of personality, timing, and growth.',
        }}
        tldr='Astrology interprets the sky as a map of patterns. Your birth chart shows planetary placements, houses show life areas, and aspects show how energies interact. Transits and retrogrades describe how timing unfolds over time.'
        intro='Astrology is best understood as a language of patterns rather than a set of fixed predictions. It uses the positions of the Sun, Moon, and planets at a given moment to describe tendencies, themes, and timing. Your birth chart is a snapshot of the sky at the moment you were born. It does not tell you who you must be, but it can explain why certain experiences feel familiar, where your energy naturally flows, and what kinds of lessons repeat over time. When you learn the structure of astrology, you gain a way to name the cycles you already sense in your life. That is why this Grimoire section focuses on clarity: the basics are explained cleanly, and each topic links out to deeper guides so you can build understanding step by step.'
        meaning='Astrology works through three main building blocks: planets, signs, and houses. Planets describe *what* energy is active, signs describe *how* that energy expresses, and houses describe *where* it shows up in life. A placement such as "Venus in Taurus in the 7th House" is a complete sentence: Venus (love, values) in Taurus (steady, sensual) expressed through the 7th House (relationships).\n\nAspects are the relationships between planets. They show how parts of your chart support, challenge, or intensify each other. A trine indicates ease and flow, a square indicates tension that pushes growth, and an opposition shows polarity that seeks balance. Aspects do not cancel each other out; they describe the way your inner world moves.\n\nTiming comes from transits and cycles. Transits show how the current sky interacts with your birth chart, revealing seasons of change, reflection, or momentum. Retrogrades highlight review periods rather than failure. Lunar nodes point to long-term growth themes, while eclipses and major transits mark turning points. Astrology becomes most helpful when you see these timing layers as context for choices, not a script to follow.\n\nThis page gathers the core topics that make astrology practical: understanding the birth chart, learning houses and aspects, exploring placements, and tracking cycles. Use it as a map to navigate the deeper guides below.'
        howToWorkWith={[
          'Start with your birth chart and identify your Sun, Moon, and Rising placements.',
          'Learn the 12 houses to understand the life areas each placement touches.',
          'Study aspects to see how your planets interact and create themes.',
          'Track the current Moon sign for daily emotional tone and focus.',
          'Notice slower transits (Saturn, Uranus, Neptune, Pluto) for long-term shifts.',
          'Use retrogrades to review, refine, and return to unfinished lessons.',
          'Compare charts in synastry to understand relationship dynamics.',
          'Return to this hub as you move from beginner understanding to confident reading.',
        ]}
        faqs={[
          {
            question: 'What do I need to calculate a birth chart?',
            answer:
              'Your birth date, exact birth time, and birthplace. Time and location are essential for accurate house and rising sign calculations.',
          },
          {
            question: 'What is the difference between houses and signs?',
            answer:
              'Signs describe the style or energy of expression. Houses describe the life area where that energy shows up. A placement combines both.',
          },
          {
            question: 'What are transits in astrology?',
            answer:
              'Transits are the current positions of planets compared to your birth chart. They show timing, shifts, and themes moving through your life.',
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
          { text: 'Astrological Houses', href: '/grimoire/houses' },
          { text: 'Aspects', href: '/grimoire/aspects' },
          { text: 'Transits', href: '/grimoire/transits' },
        ]}
      >
        <div className='space-y-12'>
          {astrologyGroups.map((group) => (
            <section key={group.title}>
              <h2 className='text-2xl font-medium text-zinc-100 mb-3'>
                {group.title}
              </h2>
              <p className='text-sm text-zinc-400 mb-6 max-w-2xl'>
                {group.description}
              </p>
              <div className='grid md:grid-cols-2 gap-4'>
                {group.items.map((itemName) => {
                  const item = astrologyItems.find(
                    (entry) => entry.name === itemName,
                  );

                  if (!item) {
                    return null;
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all group'
                    >
                      <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                        {item.name}
                      </h3>
                      <p className='text-sm text-zinc-400 mt-2'>
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </SEOContentTemplate>
    </>
  );
}
