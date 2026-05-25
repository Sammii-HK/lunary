export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import BirthChart from '../components/BirthChart';
import { createQAPageSchema } from '@/lib/schema';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';

export const metadata: Metadata = {
  title: 'Free Birth Chart Calculator & Astrology Guide | Lunary',
  description:
    'Learn how planets, houses, and signs shape your astrology chart. Generate your free birth chart with Lunary — choose your zodiac system (tropical, sidereal, equatorial) and house system. Sign in to unlock your personalised placements and insights.',
  keywords: [
    'birth chart',
    'free birth chart calculator',
    'astrology chart',
    'natal chart',
    'planets and houses',
    'birth chart reading',
    'astrology guide',
    'zodiac',
    'tropical zodiac',
    'sidereal zodiac',
    'house systems',
    'placidus houses',
    'whole sign houses',
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
        'tropical zodiac',
        'sidereal zodiac',
        'house systems',
        'Lunary',
      ]}
      canonicalUrl='https://lunary.app/grimoire/birth-chart'
      image='https://lunary.app/api/og/cosmic'
      imageAlt='Lunary Birth Chart Calculator'
      whatIs={{
        question: 'What is a birth chart?',
        answer:
          'A birth chart is a map of the sky for the moment and place someone was born. It shows planet positions, zodiac signs, houses, chart angles, and aspects so the chart can be read as a structured symbolic snapshot rather than a single Sun sign.',
      }}
      structuredSummary={[
        {
          label: 'Inputs needed',
          value:
            'Birth date, exact birth time, and birth location give the most accurate chart angles, houses, and rising sign.',
        },
        {
          label: 'Core pieces',
          value:
            'A birth chart combines planets, signs, houses, aspects, chart angles, rulers, and timing layers.',
        },
        {
          label: 'Reading order',
          value:
            'Start with the Big Three and chart angles, then the Ascendant ruler, house clusters, strongest aspects, and timing.',
        },
        {
          label: 'Calculation method',
          value:
            'Lunary calculates chart positions first, then applies interpretation separately.',
          href: '/about/methodology',
        },
      ]}
      conceptComparisons={[
        {
          label: 'Birth chart vs horoscope',
          description:
            'A birth chart is fixed to a birth moment; a horoscope reads current or future sky patterns against signs or chart placements.',
          href: '/grimoire/horoscopes',
        },
        {
          label: 'Sun sign vs full chart',
          description:
            'A Sun sign describes one placement. A full chart includes Moon, Rising, houses, aspects, rulers, and timing.',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
        {
          label: 'Tropical vs sidereal',
          description:
            'Tropical astrology anchors the zodiac to the equinox; sidereal astrology accounts for the precession of fixed stars.',
        },
      ]}
      whyThisWorks={{
        title: 'Why a chart needs layers',
        points: [
          'A planet without a house can describe a theme, but not where that theme shows up in life.',
          'A sign without a planet can describe style, but not what function is expressing that style.',
          'Aspects turn isolated placements into a pattern, showing which parts of the chart cooperate or create pressure.',
        ],
      }}
      learningPath={[
        {
          title: 'Learn the Big Three',
          href: '/grimoire/guides/learn-birth-chart',
          description:
            'Start with Sun, Moon, Rising, and the chart-reading order.',
        },
        {
          title: 'Study planets',
          href: '/grimoire/astronomy/planets',
          description: 'Understand what each planet contributes to the chart.',
        },
        {
          title: 'Map houses',
          href: '/grimoire/houses',
          description:
            'Connect placements to life areas before interpreting details.',
        },
        {
          title: 'Read aspects',
          href: '/grimoire/aspects',
          description:
            'Find the relationships and repeated patterns in the chart.',
        },
      ]}
      intro='Your birth chart (natal chart) is a snapshot of the sky at the moment you were born. It reveals your astrological blueprint—the positions of planets, signs, houses, and aspects that influence your personality, life path, and potential. Lunary lets you view your chart in multiple zodiac systems (tropical, sidereal, equatorial) and house systems (whole sign, Placidus, Koch, Porphyry, Alcabitius) to deepen your understanding. Understanding your birth chart helps you understand yourself deeply, recognize your strengths and challenges, and align with your true purpose. This comprehensive guide covers all components of birth charts and how to interpret them.'
      meaning={`A birth chart maps the positions of planets, signs, and houses at your exact moment of birth. Each component reveals different aspects of your personality and life experience. Planets represent different parts of your psyche and life areas. Signs show how those planets express themselves. Houses indicate where in your life these energies manifest. Aspects show how planets interact with each other.

The Big Three—Sun, Moon, and Rising (Ascendant)—form the foundation of your personality. Your Sun sign represents your core identity and ego. Your Moon sign shows your emotional nature and inner needs. Your Rising sign reveals how others see you and your outer personality.

Zodiac systems shift the perspective on your chart. Tropical astrology (the Western standard) uses the Spring Equinox as 0° Aries. Sidereal astrology (used in Vedic traditions) adjusts for the precession of the equinoxes, typically showing signs about 24 degrees earlier. Equatorial astrology uses the celestial equator rather than the ecliptic plane. Each system reveals different sign placements and interpretations. Lunary allows you to explore all three to find the system that resonates most with you.

Similarly, different house systems divide your chart's 12 houses based on different mathematical principles. Placidus is the most common in Western astrology, while whole sign houses are increasingly popular for their simplicity and accuracy. Exploring multiple house systems can deepen your chart interpretation.

Understanding your birth chart helps you recognize your natural talents, work with your challenges, and make choices aligned with your authentic self. It's a tool for self-discovery and personal growth.

Lunary reads a chart in layers rather than isolated placements. Start with the chart angles and the Big Three. Then look at the ruler of the Ascendant, the planets clustered by house, and the strongest aspects repeating the same theme. After that, refine the reading with decans, house systems, sect, retrogrades, and timing techniques. That is how a chart turns from a pile of placements into a coherent story.`}
      howToWorkWith={[
        'Calculate your birth chart with exact birth time and location',
        'Start with your Sun, Moon, and Rising signs before layering in the rest of the chart',
        'Study the ruler of your Ascendant to see how your chart actually operates in daily life',
        'Learn the meaning of each planet in your chart and the house it occupies',
        'Study the houses and what they represent before judging single placements in isolation',
        'Explore different house systems (Placidus, Whole Sign, Koch, etc.)',
        'Learn about aspects between planets and note repeated patterns instead of one-off keywords',
        'Use decans and dignities to refine chart nuance when two people share the same Sun sign',
        'Discover how your chart appears in different zodiac systems (tropical, sidereal, equatorial)',
        'Understand planetary retrogrades in your chart',
        'Use your chart for timing important decisions',
        'Build your reading from the chart structure first, then add intuition and symbolism',
      ]}
      followUpIntent={[
        {
          title: 'Planets',
          description:
            'Learn what each planet represents before reading its sign, house, and aspect pattern.',
          href: '/grimoire/astronomy/planets',
        },
        {
          title: 'Houses',
          description:
            'Use houses to locate where a chart theme shows up in lived experience.',
          href: '/grimoire/houses',
        },
        {
          title: 'Aspects',
          description:
            'Read the relationships between placements so the chart becomes a coherent pattern.',
          href: '/grimoire/aspects',
        },
        {
          title: 'Natal vs transit',
          description:
            'Compare your fixed birth chart with the current sky to understand timing.',
          href: '/grimoire/transits',
        },
        {
          title: 'Chart examples',
          description:
            'Move from single placements into a full reading order with examples and nuance.',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
      ]}
      internalLinks={[
        {
          text: 'Learn to Read a Birth Chart',
          href: '/grimoire/guides/learn-birth-chart',
        },
        { text: 'Rising Sign Guide', href: '/grimoire/rising' },
        { text: '1st House Meaning', href: '/grimoire/houses/1st-house' },
        { text: 'Decans Guide', href: '/grimoire/decans' },
        { text: 'Planetary Placements', href: '/grimoire/placements' },
        {
          text: 'Complete Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
      ]}
      sources={[
        {
          name: 'Lunary natal chart calculation methodology',
          url: 'https://lunary.app/about/methodology',
        },
        {
          name: 'Astronomy Engine planetary calculations',
          url: 'https://github.com/cosinekitty/astronomy',
        },
        {
          name: 'Traditional Hellenistic house and sect doctrine',
        },
      ]}
      citationMetadata={{
        summary:
          'Use this page as Lunary’s canonical source for birth chart basics, calculation inputs, and the layered chart-reading order.',
        methodologyUrl: 'https://lunary.app/about/methodology',
        datasetUrl: 'https://lunary.app/grimoire/datasets/core-astrology.json',
        citationUrl: 'https://lunary.app/about/citations',
      }}
      citableFacts={[
        {
          claim:
            'A birth chart is a map of the sky for a birth moment; the most accuracy-sensitive inputs are birth date, exact birth time, and birth location.',
          sourceName: 'Lunary natal chart calculation methodology',
          sourceUrl: 'https://lunary.app/about/methodology',
        },
        {
          claim:
            'Lunary separates calculation from interpretation: the calculation layer determines positions, signs, houses, aspects, retrograde state, and orbs before symbolic meaning is applied.',
          sourceName: 'Lunary methodology',
          sourceUrl: 'https://lunary.app/about/methodology',
        },
        {
          claim:
            'Lunary reads a chart in layers: chart angles and the Big Three first, then the Ascendant ruler, house clusters, strongest repeating aspects, and refinement techniques such as decans, dignities, sect, retrogrades, and timing.',
          sourceName: 'Lunary birth chart guide',
          sourceUrl: 'https://lunary.app/grimoire/birth-chart',
        },
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
        {
          question:
            'Why might my Part of Fortune placement differ from other astrology apps?',
          answer:
            'Lunary uses the traditional Hellenistic sect-based formula which reverses the Part of Fortune calculation for night charts (when the Sun was below the horizon at birth). Many modern apps use a simplified single formula. Both are valid approaches — ours is the historically original method.',
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
