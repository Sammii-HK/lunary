export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Transits: Current Planetary Movements Guide - Lunary',
  description:
    'Learn about planetary transits and how current planetary positions affect your birth chart. Understand major transits like Saturn Return and Jupiter Return, and how to work with daily transits for timing and personal growth.',
  keywords: [
    'planetary transits',
    'astrological transits',
    'current transits',
    'saturn return',
    'jupiter return',
    'transit astrology',
    'planetary movements',
    'how transits affect birth chart',
  ],
  openGraph: {
    title: 'Transits: Current Planetary Movements Guide - Lunary',
    description:
      'Learn about planetary transits and how current planetary positions affect your birth chart. Understand major transits and daily influences.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Transits: Current Planetary Movements Guide - Lunary',
    description:
      'Learn about planetary transits and how current planetary positions affect your birth chart.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/transits',
  },
};

export default function TransitsPage() {
  return (
    <SEOContentTemplate
      title='Transits: Current Planetary Movements Guide - Lunary'
      h1='Transits — Current Planetary Movements'
      description='Learn about planetary transits and how current planetary positions affect your birth chart. Understand major transits like Saturn Return and Jupiter Return, and how to work with daily transits for timing and personal growth.'
      keywords={[
        'planetary transits',
        'astrological transits',
        'current transits',
        'saturn return',
        'jupiter return',
        'transit astrology',
        'planetary movements',
      ]}
      canonicalUrl='https://lunary.app/grimoire/transits'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Birth Chart', href: '/grimoire/birth-chart' },
        { label: 'Transits', href: '/grimoire/transits' },
      ]}
      intro='Transits are current planetary positions in relation to your birth chart. They show current influences and timing for events and personal growth. Understanding transits helps you navigate life changes, recognize opportunities, and work with cosmic timing for optimal results.'
      meaning={`Transits activate different parts of your chart at different times. Major transits (like Saturn Return, Jupiter Return) mark significant life periods. Daily transits show day-to-day influences and opportunities.

**Understanding Transits:**
Transits occur when a currently moving planet forms an aspect (conjunction, square, trine, etc.) to a planet or point in your birth chart. These aspects activate the natal planet's energy, bringing its themes to the forefront of your life.

**Major Transits:**
- **Saturn Return (Age 27-30, 57-60):** A major life transition marking adulthood and responsibility. A time of restructuring, facing reality, and building lasting foundations. Often brings challenges that lead to maturity.
- **Jupiter Return (Every 12 years):** A period of expansion, growth, and opportunity. New opportunities emerge, and you may feel more optimistic and adventurous. A good time to take risks and expand horizons.
- **Uranus Opposition (Age 42-45):** A time of liberation and breaking free from restrictions. Often brings sudden changes and the desire for freedom and authenticity.
- **Chiron Return (Age 50-51):** A period of deep healing and addressing core wounds. An opportunity to transform pain into wisdom.

**Daily Transits:**
Daily transits show day-to-day influences. For example, when transiting Venus aspects your natal Sun, you may feel more confident and attractive. When transiting Mars squares your natal Moon, you may experience emotional intensity or conflict.`}
      howToWorkWith={[
        'Track current transits to your birth chart',
        'Use major transits for life planning and preparation',
        'Work with daily transits for optimal timing',
        'Understand which transits activate which areas of your life',
        'Use harmonious transits (trines, sextiles) for opportunities',
        'Navigate challenging transits (squares, oppositions) consciously',
        'Combine transits with moon phases for powerful timing',
        'Keep a transit journal to track patterns and effects',
      ]}
      faqs={[
        {
          question: 'What is a Saturn Return?',
          answer:
            'Saturn Return occurs when transiting Saturn returns to its natal position in your birth chart, around ages 27-30 and 57-60. It marks major life transitions, bringing lessons about responsibility, structure, and maturity. It often involves restructuring your life, facing reality, and building lasting foundations.',
        },
        {
          question: 'How do I know what transits are affecting me?',
          answer:
            'You need to know your birth chart and compare it with current planetary positions. Many astrology apps and websites calculate transits automatically. Look for aspects between transiting planets and your natal planets, especially conjunctions, squares, trines, and oppositions.',
        },
        {
          question: 'Are challenging transits bad?',
          answer:
            'Challenging transits (squares, oppositions) bring tension and friction, but they also create growth opportunities. They force you to address issues and make necessary changes. Harmonious transits (trines, sextiles) feel easier but may not push you to grow. Both types are valuable.',
        },
      ]}
      internalLinks={[
        { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        { text: 'Rising Sign', href: '/grimoire/rising-sign' },
        { text: 'Synastry', href: '/grimoire/synastry' },
        { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
      ]}
    />
  );
}
