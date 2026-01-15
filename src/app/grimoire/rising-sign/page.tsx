export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createQAPageSchema, renderJsonLd } from '@/lib/schema';
import {
  PeopleAlsoAsk,
  RISING_SIGN_PAA,
} from '@/components/grimoire/PeopleAlsoAsk';

export const metadata: Metadata = {
  title: 'Rising Sign Calculator: Find Your Ascendant Sign - Lunary',
  description:
    'Learn about your rising sign (Ascendant), how it differs from your Sun sign, and how it influences your personality, appearance, and first impressions. Discover how to calculate your rising sign and understand its meaning.',
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
    title: 'Rising Sign Calculator: Find Your Ascendant Sign - Lunary',
    description:
      'Learn about your rising sign (Ascendant), how it differs from your Sun sign, and how it influences your personality and appearance.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Rising Sign Calculator: Find Your Ascendant Sign - Lunary',
    description:
      'Learn about your rising sign (Ascendant), how it differs from your Sun sign, and how it influences your personality.',
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
        title='Rising Sign Calculator: Find Your Ascendant Sign - Lunary'
        h1='Rising Sign (Ascendant)'
        description='Learn about your rising sign (Ascendant), how it differs from your Sun sign, and how it influences your personality, appearance, and first impressions. Discover how to calculate your rising sign.'
        keywords={[
          'rising sign',
          'ascendant',
          'rising sign meaning',
          'ascendant sign',
          'how to find rising sign',
          'rising sign vs sun sign',
        ]}
        canonicalUrl='https://lunary.app/grimoire/rising-sign'
        intro='Your rising sign, also called the Ascendant, is the zodiac sign that was rising on the eastern horizon at your exact moment of birth. It represents your outer personality, how others see you, and your approach to life. Understanding your rising sign helps you understand how you present yourself to the world and how others perceive you.'
        tldr='Your rising sign (Ascendant) changes about every two hours and shapes first impressions, body language, and how you initiate new situations. It does not replace your Sun sign—it adds the outer layer.'
        meaning={`The rising sign changes approximately every 2 hours, making it the most time-sensitive part of your chart. It's calculated using your exact birth time (most important), birth location (latitude/longitude), and birth date.

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
- **Water Rising (Cancer, Scorpio, Pisces):** Intuitive, emotional, sensitive first impression

**Why it feels so immediate:**
The Ascendant is the doorway of your chart. It describes how you enter a room, how you initiate projects, and the kind of environments you naturally gravitate toward. It also colors your physical presence—how you dress, move, and project energy.

If your Sun sign feels “true” but your rising sign feels like how people experience you, that is normal. The two are meant to work together. Learning your Ascendant helps you understand why certain roles or first impressions keep repeating in your life.`}
        tables={[
          {
            title: 'Rising Sign vs Sun Sign',
            headers: ['Factor', 'Rising Sign', 'Sun Sign'],
            rows: [
              ['Core Role', 'Outer personality', 'Core identity'],
              ['Timing', 'Changes every 2 hours', 'Changes monthly'],
              ['Visibility', 'First impressions', 'Long-term character'],
              ['Focus', 'How you begin', 'Who you are becoming'],
            ],
          },
        ]}
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
        journalPrompts={[
          'How do people describe me when they first meet me?',
          'Where do I initiate quickly, and where do I hesitate?',
          'What does my rising sign teach me about self-presentation?',
          'How does my Sun sign differ from my first impressions?',
          'What environment makes my rising sign feel most at ease?',
        ]}
        rituals={[
          'Stand before a mirror and name three qualities you want to project today.',
          'Choose a simple outfit or accessory that aligns with your rising element.',
          'Before a new project, set a one-sentence intention for how you want to start.',
          'Practice a short grounding breath to align your outer energy with your inner values.',
        ]}
        faqs={[
          {
            question: 'What is a rising sign (Ascendant)?',
            answer:
              'Your rising sign is the zodiac sign that was rising on the eastern horizon at your exact time of birth. It represents your outer personality, how others see you, and your approach to life. It changes approximately every 2 hours, making it the most time-sensitive part of your chart.',
          },
          {
            question: 'How do I find my rising sign?',
            answer: `You need your exact birth time, birth date, and birth location. Use an online birth chart calculator or astrology software. The more accurate your birth time, the more precise your rising sign will be. If you don't know your exact birth time, you can use noon as a placeholder, but your rising sign may be inaccurate.`,
          },
          {
            question: 'Is rising sign more important than Sun sign?',
            answer:
              'Neither is more important—they serve different purposes. Your Sun sign represents your core identity and ego, while your Rising sign represents your outer personality and first impressions. Both are essential parts of your astrological profile.',
          },
          {
            question: 'Can my rising sign change over time?',
            answer:
              'No. Your rising sign is fixed based on your birth time and location. What can change is how you consciously express it.',
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
          { text: 'Transits', href: '/grimoire/transits' },
          { text: 'Synastry', href: '/grimoire/synastry' },
          { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
        ]}
      >
        <PeopleAlsoAsk questions={RISING_SIGN_PAA} />
      </SEOContentTemplate>
    </>
  );
}
