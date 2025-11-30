export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Numerology } from '../components/Numerology';

export const metadata: Metadata = {
  title: 'Numerology: Life Path Numbers & Meanings - Lunary',
  description:
    'Discover core numbers, master numbers, planetary days, and numerological calculations. Understand the power of numbers and their influence on your life path. Comprehensive numerology guide for beginners and advanced practitioners.',
  keywords: [
    'numerology',
    'life path number',
    'master numbers',
    'numerological calculations',
    'number meanings',
    'numerology guide',
    'how to calculate life path number',
  ],
  openGraph: {
    title: 'Numerology: Life Path Numbers & Meanings - Lunary',
    description:
      'Discover core numbers, master numbers, planetary days, and numerological calculations. Understand the power of numbers.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Numerology: Life Path Numbers & Meanings - Lunary',
    description:
      'Discover core numbers, master numbers, planetary days, and numerological calculations. Understand the power of numbers.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology',
  },
};

export default function NumerologyPage() {
  return (
    <>
      <SEOContentTemplate
        title='Numerology: Life Path Numbers & Meanings - Lunary'
        h1='Numerology'
        description='Discover core numbers, master numbers, planetary days, and numerological calculations. Understand the power of numbers and their influence on your life path.'
        keywords={[
          'numerology',
          'life path number',
          'master numbers',
          'numerological calculations',
          'number meanings',
        ]}
        canonicalUrl='https://lunary.app/grimoire/numerology'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
        ]}
        intro='Numerology is the study of numbers and their mystical significance. Each number carries unique vibrational energy that influences personality, life path, and destiny. Understanding numerology helps you discover your life path number, understand your strengths and challenges, and align with your true purpose. This comprehensive guide covers core numbers, master numbers, planetary days, and how to calculate and interpret numerological meanings.'
        meaning='Numbers are more than mathematical symbols—they carry vibrational energy that influences every aspect of life. In numerology, your birth date and name reveal profound insights about your personality, life purpose, and spiritual path.
        Core numbers (1-9) represent fundamental life energies and archetypes. Each number has specific traits, strengths, and challenges. Master numbers (11, 22, 33) carry intensified spiritual energy and represent higher potential, though they also bring greater challenges.
        Your Life Path Number, calculated from your birth date, reveals your life purpose and the lessons you are here to learn. It shows your natural talents, challenges, and the path you are meant to walk. Understanding your numbers helps you make aligned decisions and live authentically.'
        howToWorkWith={[
          'Calculate your Life Path Number from your birth date',
          'Understand your core number meanings and traits',
          'Use planetary days aligned with your numbers',
          'Work with master numbers consciously',
          'Apply numerology to timing important decisions',
          'Use number correspondences in spellwork',
          'Track repeating numbers as messages',
          'Combine numerology with other divination methods',
        ]}
        faqs={[
          {
            question: 'How do I calculate my Life Path Number?',
            answer:
              'Add all digits of your birth date (month, day, year) together. Keep reducing until you get a single digit (1-9) or a master number (11, 22, 33). For example, if born 12/25/1990: 1+2+2+5+1+9+9+0 = 29, then 2+9 = 11 (master number).',
          },
          {
            question: 'What are master numbers?',
            answer:
              "Master numbers (11, 22, 33) carry intensified spiritual energy. They represent higher potential but also greater challenges. Master numbers aren't reduced to single digits—they're kept as-is for their powerful energy.",
          },
          {
            question: 'Can numerology predict the future?',
            answer:
              'Numerology reveals patterns, potentials, and life lessons rather than fixed outcomes. It helps you understand your path and make aligned choices, but your free will always determines your future.',
          },
        ]}
        internalLinks={[
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
          { text: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <Numerology />
      </div>
    </>
  );
}
