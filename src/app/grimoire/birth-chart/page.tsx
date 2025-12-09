export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import BirthChart from '../components/BirthChart';
import { createQAPageSchema, renderJsonLd } from '@/lib/schema';
import {
  PeopleAlsoAsk,
  BIRTH_CHART_PAA,
} from '@/components/grimoire/PeopleAlsoAsk';

export const metadata: Metadata = {
  title: 'Birth Chart: Planets, Houses & Astrology Guide - Lunary',
  description:
    'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted. Discover your astrological blueprint and how it influences your life.',
  keywords: [
    'birth chart',
    'natal chart',
    'astrological chart',
    'birth chart reading',
    'planets in astrology',
    'astrological houses',
    'birth chart interpretation',
    'how to read birth chart',
  ],
  openGraph: {
    title: 'Birth Chart: Planets, Houses & Astrology Guide - Lunary',
    description:
      'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Birth Chart: Planets, Houses & Astrology Guide - Lunary',
    description:
      'Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/birth-chart',
  },
};

export default function BirthChartPage() {
  const qaSchema = createQAPageSchema({
    question: 'What is a birth chart?',
    answer:
      'A birth chart (also called a natal chart) is a map of the sky at the exact moment you were born. It shows the positions of all planets, the zodiac signs they were in, and the houses they occupied. Your birth chart reveals your personality, strengths, challenges, and life path. The most important elements are your Sun sign (core identity), Moon sign (emotional nature), and Rising sign (outer personality). To create an accurate birth chart, you need your exact birth time, date, and location.',
    url: 'https://lunary.app/grimoire/birth-chart',
  });

  return (
    <>
      {renderJsonLd(qaSchema)}
      <SEOContentTemplate
        title='Birth Chart: Planets, Houses & Astrology Guide - Lunary'
        h1='Birth Chart'
        description='Learn about planets, houses, and astrological components. Understand how birth charts are calculated and interpreted. Discover your astrological blueprint.'
        keywords={[
          'birth chart',
          'natal chart',
          'astrological chart',
          'birth chart reading',
          'planets in astrology',
          'astrological houses',
        ]}
        canonicalUrl='https://lunary.app/grimoire/birth-chart'
        intro='Your birth chart (natal chart) is a snapshot of the sky at the moment you were born. It reveals your astrological blueprint—the positions of planets, signs, houses, and aspects that influence your personality, life path, and potential. Understanding your birth chart helps you understand yourself deeply, recognize your strengths and challenges, and align with your true purpose. This comprehensive guide covers all components of birth charts and how to interpret them.'
        meaning={`A birth chart maps the positions of planets, signs, and houses at your exact moment of birth. Each component reveals different aspects of your personality and life experience. Planets represent different parts of your psyche and life areas. Signs show how those planets express themselves. Houses indicate where in your life these energies manifest. Aspects show how planets interact with each other.

The Big Three—Sun, Moon, and Rising (Ascendant)—form the foundation of your personality. Your Sun sign represents your core identity and ego. Your Moon sign shows your emotional nature and inner needs. Your Rising sign reveals how others see you and your outer personality.

Understanding your birth chart helps you recognize your natural talents, work with your challenges, and make choices aligned with your authentic self. It's a tool for self-discovery and personal growth.`}
        howToWorkWith={[
          'Calculate your birth chart with exact birth time and location',
          'Learn the meaning of each planet in your chart',
          'Understand your Sun, Moon, and Rising signs',
          'Study the houses and what they represent',
          'Learn about aspects between planets',
          'Understand planetary retrogrades in your chart',
          'Use your chart for timing important decisions',
          'Combine astrology with other divination methods',
        ]}
        faqs={[
          {
            question: 'Do I need my exact birth time for a birth chart?',
            answer:
              'Yes! Your exact birth time determines your Rising sign and house cusps, which are crucial for accurate chart interpretation. Without it, you can still see planet and sign positions, but houses will be approximate. Check your birth certificate or ask family members.',
          },
          {
            question:
              'What is the difference between Sun, Moon, and Rising signs?',
            answer:
              'Your Sun sign is your core identity—who you are at your essence. Your Moon sign is your emotional nature and inner needs—how you feel. Your Rising sign (Ascendant) is your outer personality and how others see you—your mask and first impression. All three work together to create your complete personality.',
          },
          {
            question: 'Can my birth chart change?',
            answer:
              "Your birth chart never changes—it's fixed at your moment of birth. However, transits (current planetary positions) aspect your natal chart, creating different influences over time. Progressions and solar returns also show how you evolve while your natal chart remains constant.",
          },
        ]}
        internalLinks={[
          { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Numerology', href: '/grimoire/numerology' },
        ]}
      >
        <PeopleAlsoAsk questions={BIRTH_CHART_PAA} />
      </SEOContentTemplate>
      <div className='max-w-4xl mx-auto p-4'>
        <BirthChart />
      </div>
    </>
  );
}
