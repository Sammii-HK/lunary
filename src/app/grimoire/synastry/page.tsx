export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Synastry: Relationship Compatibility Guide - Lunary',
  description:
    'Learn about synastry, the comparison of two birth charts to understand relationship dynamics and compatibility. Discover how planets interact between charts and how to read synastry aspects.',
  keywords: [
    'synastry',
    'relationship compatibility',
    'astrological compatibility',
    'synastry chart',
    'relationship astrology',
    'compatibility reading',
    'synastry aspects',
    'how to read synastry',
  ],
  openGraph: {
    title: 'Synastry: Relationship Compatibility Guide - Lunary',
    description:
      'Learn about synastry, the comparison of two birth charts to understand relationship dynamics and compatibility.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Synastry: Relationship Compatibility Guide - Lunary',
    description:
      'Learn about synastry, the comparison of two birth charts to understand relationship dynamics.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/synastry',
  },
};

export default function SynastryPage() {
  return (
    <SEOContentTemplate
      title='Synastry: Relationship Compatibility Guide - Lunary'
      h1='Synastry: Relationship Compatibility'
      description='Learn about synastry, the comparison of two birth charts to understand relationship dynamics, compatibility, and how two people interact. Discover how planets interact between charts.'
      keywords={[
        'synastry',
        'relationship compatibility',
        'astrological compatibility',
        'synastry chart',
        'relationship astrology',
        'compatibility reading',
      ]}
      canonicalUrl='https://lunary.app/grimoire/synastry'
      intro={`Synastry is the comparison of two birth charts to understand relationship dynamics, compatibility, and how two people interact. It reveals how planets in one person's chart interact with planets in another person's chart, showing areas of harmony, challenge, and growth potential.`}
      ctaText='Generate Synastry Chart'
      ctaHref='/grimoire/synastry/generate'
      meaning={`Synastry looks at how planets in one person's chart interact with planets in another person's chart. Key areas to examine:

**Understanding Synastry:**
- **Sun-Moon aspects:** Emotional compatibility and understanding
- **Venus-Mars aspects:** Romantic and sexual attraction
- **Mercury aspects:** Communication style and mental connection
- **Saturn aspects:** Long-term stability and commitment
- **Jupiter aspects:** Growth, expansion, and shared values

**Compatible Aspects:**
- **Trines (120°):** Easy, harmonious connection. Natural understanding.
- **Sextiles (60°):** Supportive, friendly energy. Growth opportunities.
- **Conjunctions (0°):** Intense connection. Can be harmonious or challenging.

**Challenging Aspects:**
- **Squares (90°):** Tension and friction, but also growth through challenge.
- **Oppositions (180°):** Attraction and repulsion. Balance needed.

Remember: Challenging aspects don't mean incompatibility. They often create the most dynamic and growth-oriented relationships.

**How to Read Synastry:**
1. Compare both charts side by side
2. Look for aspects between planets (especially personal planets)
3. Note which houses each person's planets fall into in the other person's chart
4. Consider the overall balance of harmonious vs challenging aspects
5. Remember: No relationship is perfect—challenges create growth`}
      howToWorkWith={[
        'Compare two birth charts side by side',
        'Identify aspects between planets in both charts',
        'Look for Sun-Moon connections for emotional compatibility',
        'Examine Venus-Mars aspects for romantic attraction',
        'Check Mercury aspects for communication compatibility',
        'Consider Saturn aspects for long-term potential',
        'Understand that challenging aspects can create growth',
        'Use synastry as a tool for understanding, not prediction',
      ]}
      faqs={[
        {
          question: 'What is synastry?',
          answer: `Synastry is the comparison of two birth charts to understand relationship dynamics and compatibility. It shows how planets in one person's chart interact with planets in another person's chart, revealing areas of harmony, challenge, and growth potential.`,
        },
        {
          question: 'Do challenging aspects mean incompatibility?',
          answer:
            'No! Challenging aspects (squares, oppositions) create tension and friction, but they also create growth opportunities. Many successful relationships have challenging aspects that force partners to grow and evolve together. Harmonious aspects feel easier but may not push growth.',
        },
        {
          question: 'Which aspects are most important in synastry?',
          answer:
            'Sun-Moon aspects show emotional compatibility, Venus-Mars aspects show romantic attraction, Mercury aspects show communication style, and Saturn aspects show long-term potential. However, all aspects contribute to the overall relationship dynamic.',
        },
      ]}
      internalLinks={[
        { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        { text: 'Rising Sign', href: '/grimoire/rising-sign' },
        { text: 'Transits', href: '/grimoire/transits' },
        { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
      ]}
    />
  );
}
