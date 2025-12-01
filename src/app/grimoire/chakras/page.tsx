export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Chakras from '../components/Chakras';

export const metadata: Metadata = {
  title: 'Chakras: Seven Energy Centers Guide - Lunary',
  description:
    'Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers for healing, spiritual growth, and magical work. Complete chakra system guide.',
  keywords: [
    'chakras',
    'energy centers',
    'chakra balancing',
    'seven chakras',
    'chakra colors',
    'chakra healing',
    'energy work',
    'chakra system',
  ],
  openGraph: {
    title: 'Chakras: Seven Energy Centers Guide - Lunary',
    description:
      'Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Chakras: Seven Energy Centers Guide - Lunary',
    description:
      'Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/chakras',
  },
};

export default function ChakrasPage() {
  return (
    <>
      <SEOContentTemplate
        title='Chakras: Seven Energy Centers Guide - Lunary'
        h1='Chakras'
        description='Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers for healing, spiritual growth, and magical work.'
        keywords={[
          'chakras',
          'energy centers',
          'chakra balancing',
          'seven chakras',
          'chakra colors',
          'chakra healing',
        ]}
        canonicalUrl='https://lunary.app/grimoire/chakras'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Chakras', href: '/grimoire/chakras' },
        ]}
        intro='Chakras are energy centers located along the spine that regulate the flow of life force energy through your body. There are seven main chakras, each associated with specific colors, elements, and aspects of life. Understanding and balancing your chakras is essential for physical health, emotional well-being, and effective magical work. This comprehensive guide covers each chakra, its meaning, and practices for balancing and healing.'
        meaning='Chakras are spinning wheels of energy that connect your physical body with your spiritual self. Each chakra governs specific physical organs, emotional patterns, and spiritual lessons. When chakras are balanced and open, energy flows freely, supporting health and spiritual growth. When blocked or imbalanced, they can cause physical, emotional, or spiritual issues.

The seven main chakras run from the base of the spine to the crown of the head: Root (survival, grounding), Sacral (creativity, sexuality), Solar Plexus (power, will), Heart (love, compassion), Throat (communication, truth), Third Eye (intuition, insight), and Crown (spiritual connection, enlightenment).

Each chakra has specific correspondences—colors, elements, crystals, sounds, and practices—that help balance and activate it. Working with chakras enhances your magical practice by ensuring your energy centers are clear and aligned.'
        howToWorkWith={[
          'Learn the location and meaning of each chakra',
          'Use color correspondences for chakra work',
          'Meditate on each chakra individually',
          'Use crystals aligned with specific chakras',
          'Practice chakra breathing exercises',
          'Use sound (mantras or singing bowls) for activation',
          'Visualize chakras spinning and glowing',
          'Balance chakras regularly through meditation and energy work',
        ]}
        faqs={[
          {
            question: 'How do I know if my chakras are blocked?',
            answer:
              "Blocked chakras manifest as physical, emotional, or spiritual issues related to that chakra's domain. For example, blocked throat chakra may cause communication issues or throat problems. Blocked root chakra may cause anxiety or financial insecurity. Regular meditation and self-reflection help identify imbalances.",
          },
          {
            question: 'How do I balance my chakras?',
            answer:
              "Balance chakras through meditation, visualization, crystals, color therapy, sound healing, yoga, and energy work. Focus on the specific chakra's color, element, and associated practices. Regular practice maintains balance, but deep healing may require addressing underlying emotional or spiritual issues.",
          },
          {
            question: 'Can I work with multiple chakras at once?',
            answer:
              'Yes! Many practices work with all chakras simultaneously, such as chakra meditation that moves energy through all seven centers, or wearing crystals for multiple chakras. However, focusing on one chakra at a time can provide deeper healing for specific issues.',
          },
        ]}
        internalLinks={[
          { text: 'Crystals', href: '/grimoire/crystals' },
          { text: 'Meditation', href: '/grimoire/meditation' },
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <Chakras />
      </div>
    </>
  );
}
