export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createQAPageSchema, renderJsonLd } from '@/lib/schema';
import {
  PeopleAlsoAsk,
  RISING_SIGN_PAA,
} from '@/components/grimoire/PeopleAlsoAsk';
import { RisingSignCalculator } from './RisingSignCalculator';

export const metadata: Metadata = {
  title: 'Rising Sign Calculator (Ascendant) | Free & Accurate | Lunary',
  description:
    'Calculate your rising sign (Ascendant) with your birth date, exact time, and location. Learn what your Ascendant means and how it shapes first impressions.',
  keywords: [
    'rising sign',
    'ascendant',
    'rising sign meaning',
    'ascendant sign',
    'how to find rising sign',
    'rising sign vs sun sign',
    'ascendant astrology',
    'rising sign calculator',
  ],
  openGraph: {
    title: 'Rising Sign Calculator (Ascendant) | Free & Accurate | Lunary',
    description:
      'Calculate your rising sign (Ascendant) with your birth date, exact time, and location.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Rising Sign Calculator (Ascendant) | Free & Accurate | Lunary',
    description:
      'Calculate your rising sign (Ascendant) with your birth date, exact time, and location.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/rising-sign',
  },
};

export default function RisingSignPage() {
  const qaSchema = createQAPageSchema({
    question: 'What is my rising sign?',
    answer:
      'Your rising sign (Ascendant) is the zodiac sign that was rising on the eastern horizon at your exact moment of birth. It represents your outer personality, how others see you, and your approach to life. To find your rising sign, you need your exact birth time, birth date, and birth location. The rising sign changes approximately every 2 hours, making it the most time-sensitive part of your chart.',
    url: 'https://lunary.app/grimoire/rising-sign',
  });

  return (
    <>
      {renderJsonLd(qaSchema)}
      <SEOContentTemplate
        title='Rising Sign Calculator (Ascendant) | Free & Accurate | Lunary'
        h1='Rising Sign Calculator (Ascendant)'
        description='Enter your birth date, exact time, and location to calculate your Ascendant. Your rising sign shapes first impressions and how you move through the world.'
        keywords={[
          'rising sign',
          'ascendant',
          'rising sign meaning',
          'ascendant sign',
          'how to find rising sign',
          'rising sign vs sun sign',
        ]}
        canonicalUrl='https://lunary.app/grimoire/rising-sign'
        intro='Your rising sign, also called the Ascendant, is the zodiac sign that was rising on the eastern horizon at your exact moment of birth. It represents your outer personality, how others see you, and your approach to life. Your rising sign sets the tone of your entire chart.'
        meaning={`#### How to calculate your rising sign (ascendant)

The rising sign changes approximately every 2 hours, making it the most time-sensitive part of your chart. It's calculated using your exact birth time (most important), birth location (latitude/longitude), and birth date.

**What Is the Rising Sign?**
The rising sign is the zodiac sign on the eastern horizon at your moment of birth. It represents your outer personality, first impressions, and how you navigate new situations. While your Sun sign shows your core identity, your Rising sign shows how you present yourself to the world.

**Rising Sign Meanings:**
Your rising sign influences:
- **First impressions:** How others initially perceive you
- **Outward personality:** Your social mask and presentation
- **Physical appearance:** Body type, features, and style
- **Approach to life:** How you navigate new situations
- **First house themes:** Self-image, identity, and personal expression

**How Rising Sign Differs from Sun Sign:**
- **Sun Sign:** Your core identity, ego, and life purpose (who you are at your core)
- **Rising Sign:** Your outer personality and how you present yourself (how others see you)

Think of it this way: Your Sun sign is your true self, while your Rising sign is the mask you wear in the world. Both are authentic parts of you, but serve different purposes.

**Rising Sign by Element:**
- **Fire Rising (Aries, Leo, Sagittarius):** Energetic, confident, action-oriented first impression
- **Earth Rising (Taurus, Virgo, Capricorn):** Grounded, practical, reliable first impression
- **Air Rising (Gemini, Libra, Aquarius):** Communicative, social, intellectual first impression
- **Water Rising (Cancer, Scorpio, Pisces):** Intuitive, emotional, sensitive first impression`}
        howToWorkWith={[
          'Calculate your rising sign using your exact birth time',
          'Understand how your rising sign affects first impressions',
          'Use your rising sign to understand your outer personality',
          'Combine rising sign with Sun and Moon for complete picture',
          'Work with rising sign energy in your daily life',
          'Understand how rising sign influences your appearance',
          'Use rising sign to navigate social situations',
          'Explore first house themes related to your rising sign',
        ]}
        faqs={[
          {
            question: 'What is a rising sign?',
            answer:
              'Your rising sign (Ascendant) is the zodiac sign that was rising on the eastern horizon at your exact time of birth. It shapes your first impressions, outward style, and how others see you.',
          },
          {
            question: 'Why does birth time matter?',
            answer:
              'The Ascendant changes roughly every two hours, so even small time differences can shift your rising sign and house placements.',
          },
          {
            question: 'Can my rising sign change?',
            answer:
              'Your rising sign does not change once you are born. It changes across the day, which is why your birth time determines the correct sign.',
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart Calculator', href: '/birth-chart' },
          { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
          { text: 'Transits', href: '/grimoire/transits' },
          { text: 'Synastry', href: '/grimoire/synastry' },
          { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
        ]}
        childrenPosition='after-description'
      >
        <RisingSignCalculator />
        <PeopleAlsoAsk questions={RISING_SIGN_PAA} />
      </SEOContentTemplate>
    </>
  );
}
