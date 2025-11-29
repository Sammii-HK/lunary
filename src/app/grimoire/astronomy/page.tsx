import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Astronomy from '../components/Astronomy';

export const metadata: Metadata = {
  title: 'Astronomy & Astrology: Planets & Zodiac Signs - Lunary',
  description:
    'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world and influence magical practice. Comprehensive guide to planetary magic, zodiac sign meanings, and astrological correspondences.',
  keywords: [
    'astronomy',
    'planets',
    'zodiac signs',
    'astronomical data',
    'celestial bodies',
    'astronomical calculations',
    'planetary magic',
    'astrology guide',
    'zodiac meanings',
  ],
  openGraph: {
    title: 'Astronomy & Astrology: Planets & Zodiac Signs - Lunary',
    description:
      'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Astronomy & Astrology: Planets & Zodiac Signs - Lunary',
    description:
      'Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astronomy',
  },
};

export default function AstronomyPage() {
  return (
    <>
      <SEOContentTemplate
        title='Astronomy & Astrology: Planets & Zodiac Signs - Lunary'
        h1='Astronomy & Astrology'
        description='Learn about planets, zodiac signs, and astronomical knowledge. Understand the cosmic forces that shape our world and influence magical practice.'
        keywords={[
          'astronomy',
          'planets',
          'zodiac signs',
          'astronomical data',
          'celestial bodies',
          'astronomical calculations',
          'planetary magic',
        ]}
        canonicalUrl='https://lunary.app/grimoire/astronomy'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
        ]}
        intro='Astronomy and astrology connect us to the cosmos. Understanding planetary movements, zodiac signs, and celestial correspondences helps practitioners align their magic with cosmic energies and deepen their connection to the universe. This comprehensive guide covers planetary influences, zodiac sign meanings, and how to work with celestial energies in your magical practice.'
        meaning='Astronomy is the scientific study of celestial objects, while astrology interprets their influence on human affairs and natural phenomena. Both disciplines offer valuable insights for magical practitioners.

Planets represent different aspects of life and consciousness. Each planet rules specific signs, houses, and areas of life. Understanding planetary energies helps you choose optimal timing for spells and rituals, select appropriate correspondences, and align your practice with cosmic rhythms.

Zodiac signs represent twelve archetypal energies that influence personality, behavior, and life experiences. Each sign belongs to an element (Fire, Earth, Air, Water) and a quality (Cardinal, Fixed, Mutable), creating a complex system of correspondences that enhances magical work.

Working with planetary and zodiac energies creates powerful alignment between your intentions and cosmic forces, amplifying the effectiveness of your magical practice.'
        howToWorkWith={[
          'Learn planetary correspondences for timing spells',
          'Use zodiac signs to understand energy influences',
          'Align spellwork with planetary days and hours',
          'Work with planetary retrogrades consciously',
          'Use zodiac sign correspondences in spell ingredients',
          'Track planetary transits for optimal timing',
          'Combine planetary and zodiac energies for power',
          'Study your birth chart for personal correspondences',
        ]}
        faqs={[
          {
            question: 'How do planets influence magic?',
            answer:
              'Each planet rules specific areas of life and carries unique energy. For example, Venus rules love and beauty, so love spells work best on Venus day (Friday) or when Venus is strong. Understanding planetary influences helps you time spells optimally.',
          },
          {
            question: 'What are planetary correspondences?',
            answer:
              'Planetary correspondences link planets to colors, herbs, crystals, days, and magical purposes. For example, Mercury corresponds to yellow, communication herbs, Wednesday, and mental work. Using these correspondences aligns your magic with planetary energy.',
          },
          {
            question: 'How do zodiac signs affect daily magic?',
            answer:
              'The moon moves through zodiac signs every 2-3 days, influencing emotional energy. Moon in Fire signs supports action and passion. Moon in Water signs enhances intuition and emotions. Aligning your practice with moon signs adds another layer of power.',
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
        ]}
      />
      <div className='max-w-4xl p-4'>
        <Astronomy />
      </div>
    </>
  );
}
