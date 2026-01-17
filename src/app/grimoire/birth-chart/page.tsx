export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import BirthChart from '../components/BirthChart';
import { createQAPageSchema } from '@/lib/schema';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';

export const metadata: Metadata = {
  title: 'Free Birth Chart Calculator & Astrology Guide | Lunary',
  description:
    'Learn how planets, houses, and signs shape your astrology chart. Generate your free birth chart with Lunary — sign in to unlock your personalised placements and insights.',
  keywords: [
    'birth chart',
    'free birth chart calculator',
    'astrology chart',
    'natal chart',
    'planets and houses',
    'birth chart reading',
    'astrology guide',
    'zodiac',
    'Lunary',
  ],
  openGraph: {
    title: 'Free Birth Chart Calculator & Astrology Guide | Lunary',
    description:
      'Generate your free birth chart with Lunary’s astrology calculator. Learn about planets, houses, and signs — sign in to reveal your personal placements.',
    type: 'website',
    url: 'https://lunary.app/grimoire/birth-chart',
    images: [
      {
        url: 'https://lunary.app/api/og/cosmic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Birth Chart Calculator & Astrology Guide | Lunary',
    description:
      'Discover your free astrology birth chart. Learn about planets, houses, and signs — sign in to see your personalised cosmic blueprint.',
    images: ['https://lunary.app/api/og/cosmic'],
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

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Lunary Birth Chart Calculator',
    url: 'https://lunary.app/grimoire/birth-chart',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    description:
      'Free interactive birth chart calculator with personalised astrology insights. Sign in required for full chart access.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Lunary',
      url: 'https://lunary.app',
    },
    isAccessibleForFree: true,
    requiresAuthentication: 'Sign-in required for personalised chart results',
  };

  return (
    <SEOContentTemplate
      title='Free Birth Chart Calculator & Astrology Guide | Lunary'
      h1='Birth Chart'
      description='Learn how planets, houses, and signs shape your astrology chart. Generate your free birth chart with Lunary — sign in to unlock your personalised placements and insights.'
      keywords={[
        'birth chart',
        'free birth chart calculator',
        'astrology chart',
        'natal chart',
        'planets and houses',
        'birth chart reading',
        'astrology guide',
        'zodiac',
        'Lunary',
      ]}
      canonicalUrl='https://lunary.app/grimoire/birth-chart'
      image='https://lunary.app/api/og/cosmic'
      imageAlt='Lunary Birth Chart Calculator'
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
          question: 'What information do I need to calculate my birth chart?',
          answer:
            'You’ll need your date, time, and place of birth. Exact time gives the most accurate rising sign and house placements, but you can still get a general chart without it.',
        },
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
        {
          question: 'What are the most important parts of a birth chart?',
          answer:
            'The most important parts are typically: Sun sign (core identity), Moon sign (emotions), Rising sign (outer personality), and personal planets (Mercury, Venus, Mars). The aspects between planets and any planets near angles (Ascendant, Midheaven) are also significant.',
        },
        {
          question: "Is Lunary's birth chart calculator free?",
          answer:
            'Yes. Lunary’s birth chart calculator is completely free to use. You simply need to sign in to access your personalised astrology chart and save your results.',
        },
        {
          question:
            'Why do I need to sign in to use the birth chart calculator?',
          answer:
            'Signing in allows Lunary to securely save your birth details and chart interpretations, so you can revisit your placements, track transits, and receive personalised updates.',
        },
        {
          question: 'Can I learn about birth charts without signing in?',
          answer:
            'Yes. The Birth Chart Guide explains planets, houses, and aspects for anyone to explore freely. Signing in simply unlocks your personal chart data for deeper insight.',
        },
      ]}
      additionalSchemas={[qaSchema, webAppSchema]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-placements'
          entityKey='birth-chart'
          title='Birth Chart Connections'
        />
      }
    >
      <div className='py-8'>
        <BirthChart />
      </div>
    </SEOContentTemplate>
  );
}
