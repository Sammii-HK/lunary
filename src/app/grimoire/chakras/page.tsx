export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import Chakras from '../components/Chakras';

export const metadata: Metadata = {
  title: '7 Chakras Explained: Root to Crown Energy Centers - Lunary',
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
    title: '7 Chakras Explained: Root to Crown Energy Centers - Lunary',
    description:
      'Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: '7 Chakras Explained: Root to Crown Energy Centers - Lunary',
    description:
      'Understanding the seven chakras, their colors, meanings, and balancing practices. Align your energy centers.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/chakras',
  },
};

export default function ChakrasPage() {
  return (
    <SEOContentTemplate
      title='7 Chakras Explained: Root to Crown Energy Centers - Lunary'
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
      tldr='The seven chakras are energy centers that map to life themes like safety, creativity, power, love, communication, insight, and spiritual connection. Each chakra has unique correspondences—colors, elements, crystals, and practices—that help you restore balance. Working through them in order creates stability, while targeted work helps heal specific blockages. Use gentle daily rituals to keep your energy system clear and responsive.'
      intro='Chakras are energy centers located along the spine that regulate the flow of life force energy through your body. There are seven main chakras, each associated with specific colors, elements, and aspects of life. Understanding and balancing your chakras is essential for physical health, emotional well-being, and effective magical work. This comprehensive guide covers each chakra, its meaning, and practices for balancing and healing.'
      meaning='Chakras are spinning wheels of energy that connect your physical body with your spiritual self. Each chakra governs specific physical organs, emotional patterns, and spiritual lessons. When chakras are balanced and open, energy flows freely, supporting health and spiritual growth. When blocked or imbalanced, they can cause physical, emotional, or spiritual issues.

The seven main chakras run from the base of the spine to the crown of the head: Root (survival, grounding), Sacral (creativity, sexuality), Solar Plexus (power, will), Heart (love, compassion), Throat (communication, truth), Third Eye (intuition, insight), and Crown (spiritual connection, enlightenment).

Each chakra has specific correspondences—colors, elements, crystals, sounds, and practices—that help balance and activate it. Working with chakras enhances your magical practice by ensuring your energy centers are clear and aligned.

Think of the chakra system as a ladder: stability at the root supports creativity, confidence, and openness to love. When higher chakras feel disconnected, returning to grounding practices often restores flow. Consistent, gentle work tends to create deeper change than intense, sporadic sessions.'
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
      tables={[
        {
          title: 'Seven Chakra Overview',
          rows: [
            ['Chakra', 'Focus', 'Color', 'Element'],
            ['Root', 'Safety & stability', 'Red', 'Earth'],
            ['Sacral', 'Creativity & intimacy', 'Orange', 'Water'],
            ['Solar Plexus', 'Confidence & will', 'Yellow', 'Fire'],
            ['Heart', 'Love & compassion', 'Green', 'Air'],
            ['Throat', 'Expression & truth', 'Blue', 'Ether'],
            ['Third Eye', 'Insight & intuition', 'Indigo', 'Light'],
            ['Crown', 'Spiritual connection', 'Violet/White', 'Cosmic'],
          ],
        },
      ]}
      rituals={[
        'Do a 7-breath scan from root to crown, naming one intention per chakra.',
        'Light a candle in a matching chakra color and meditate for 3 minutes.',
        'Wear a crystal aligned with the chakra you are balancing for the day.',
        'End your day with a short body scan to notice where energy feels tight.',
      ]}
      journalPrompts={[
        'Where do I feel most grounded, and where do I feel unsteady?',
        'Which chakra feels overactive, and what boundary would bring balance?',
        'What truth am I holding back, and how can I express it kindly?',
        'When I feel disconnected spiritually, what helps me return to center?',
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
      relatedItems={[
        {
          name: 'Chakra Meditation',
          href: '/grimoire/meditation/techniques',
          type: 'Practice',
        },
        {
          name: 'Crystals per Chakra',
          href: '/grimoire/crystals',
          type: 'Guide',
        },
      ]}
      tableOfContents={[
        { label: 'Chakra Overview', href: '#overview' },
        { label: 'Balancing Practices', href: '#practices' },
        { label: 'Support & Tools', href: '#support' },
        { label: 'FAQ', href: '#faq' },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-chakras'
          entityKey='chakras'
          title='Chakra Connections'
        />
      }
      ctaText='Balance your chakras with a guided practice'
      ctaHref='/grimoire/meditation/techniques'
    >
      <div className='space-y-10'>
        <section id='overview' className='space-y-3'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Overview of the Chakra System
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Chakras are energetic intersections that bridge your body, emotions,
            and spirit. Each chakra supports distinct life areas—from the rooted
            stability of the Root Chakra to the spiritual attunement of the
            Crown. Working with them intentionally harmonizes your inner
            landscape and supports deeper magical work.
          </p>
        </section>
        <section id='practices' className='space-y-3'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Balancing Practices
          </h2>
          <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
            <li>Use color therapy and breathing to awaken each chakra.</li>
            <li>
              Pair crystals, essential oils, and mantras with each center.
            </li>
            <li>
              Practice gentle yoga poses that open the spine and subtle body.
            </li>
            <li>
              Journal through each chakra to release blockages and invite flow.
            </li>
          </ul>
        </section>
        <section id='support' className='space-y-3'>
          <h2 className='text-3xl font-light text-zinc-100'>Support & Tools</h2>
          <p className='text-sm text-zinc-300'>
            Use the chakra map below to explore each center, note which ones
            feel heavy or light, and follow the linked sections for deeper
            guides. The chakras component highlights correspondences you can
            layer into rituals and healing routines.
          </p>
          <div className='max-w-4xl mx-auto p-4'>
            <Chakras />
          </div>
        </section>
        <section id='imbalance' className='space-y-3'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Common Imbalance Patterns
          </h2>
          <p className='text-sm text-zinc-300'>
            If the Root Chakra feels unstable, you may notice fear,
            restlessness, or difficulty establishing routines. When the Sacral
            Chakra is blocked, creativity and intimacy can feel muted, while the
            Solar Plexus may show up as self-doubt or a lack of motivation.
          </p>
          <p className='text-sm text-zinc-300'>
            A tight Heart Chakra often feels like guardedness or difficulty
            receiving support. Throat imbalance can make you over-explain or
            stay silent. With the Third Eye, confusion or overthinking can block
            intuition. The Crown may feel foggy or disconnected when you are
            spiritually depleted.
          </p>
        </section>
      </div>
    </SEOContentTemplate>
  );
}
