import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Meditation from '../components/Meditation';

export const metadata: Metadata = {
  title: 'Meditation & Mindfulness: Complete Guide - Lunary',
  description:
    'Meditation and mindfulness practices for spiritual growth: techniques, breathwork, grounding exercises, centering, and magical journaling. Essential skills for any magical practice. Comprehensive meditation guide.',
  keywords: [
    'meditation',
    'mindfulness',
    'spiritual meditation',
    'grounding exercises',
    'meditation techniques',
    'breathwork',
    'magical meditation',
    'how to meditate',
  ],
  openGraph: {
    title: 'Meditation & Mindfulness: Complete Guide - Lunary',
    description:
      'Meditation and mindfulness practices for spiritual growth: techniques, breathwork, grounding exercises, centering, and magical journaling.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Meditation & Mindfulness: Complete Guide - Lunary',
    description:
      'Meditation and mindfulness practices for spiritual growth: techniques, breathwork, grounding exercises, centering, and magical journaling.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/meditation',
  },
};

export default function MeditationPage() {
  return (
    <>
      <SEOContentTemplate
        title='Meditation & Mindfulness: Complete Guide - Lunary'
        h1='Meditation & Mindfulness'
        description='Meditation and mindfulness practices for spiritual growth: techniques, breathwork, grounding exercises, centering, and magical journaling. Essential skills for any magical practice.'
        keywords={[
          'meditation',
          'mindfulness',
          'spiritual meditation',
          'grounding exercises',
          'meditation techniques',
          'breathwork',
        ]}
        canonicalUrl='https://lunary.app/grimoire/meditation'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Meditation & Mindfulness', href: '/grimoire/meditation' },
        ]}
        intro='Meditation and mindfulness are foundational practices for any magical or spiritual path. They develop focus, awareness, and the ability to work with energy effectively. Regular meditation practice enhances your magical work, improves intuition, reduces stress, and deepens your spiritual connection. This comprehensive guide covers various meditation techniques, breathwork, grounding exercises, and how to integrate mindfulness into your daily practice.'
        meaning='Meditation is the practice of training your mind to focus and achieve mental clarity. It helps you quiet the mental chatter, connect with your inner wisdom, and develop the focus necessary for effective magical work. Mindfulness is the practice of present-moment awareness—observing thoughts, feelings, and sensations without judgment.

Different meditation techniques serve different purposes. Mindfulness meditation develops awareness and emotional regulation. Visualization meditation enhances manifestation and spiritual journeying. Guided meditation provides structure for beginners. Walking meditation combines movement with mindfulness. Mantra meditation focuses the mind through repetition.

Regular meditation practice strengthens your ability to raise and direct energy, enhances intuition, reduces stress, and creates the mental clarity needed for effective spellwork and ritual. It is one of the most important skills for any practitioner.'
        howToWorkWith={[
          'Start with short daily sessions (5-10 minutes)',
          'Try different techniques to find what works',
          'Create a dedicated meditation space',
          'Use meditation before spellwork or rituals',
          'Practice grounding and centering regularly',
          'Combine meditation with breathwork',
          'Use visualization for manifestation',
          'Keep a meditation journal to track progress',
        ]}
        faqs={[
          {
            question: 'How long should I meditate?',
            answer:
              'Start with 5-10 minutes daily. Consistency matters more than duration. As you build your practice, gradually increase to 20-30 minutes. Even short sessions provide benefits. The key is regular practice, not perfect sessions.',
          },
          {
            question: "What if I can't stop thinking during meditation?",
            answer:
              "Thinking is normal! Meditation isn't about stopping thoughts—it's about noticing them without judgment and returning to your focus (breath, mantra, etc.). The practice IS the noticing and returning. Be patient with yourself.",
          },
          {
            question: 'Can meditation help with my magical practice?',
            answer:
              'Absolutely! Meditation develops the focus, awareness, and energy control needed for effective spellwork. It enhances intuition, helps you connect with spiritual guidance, and creates the mental clarity necessary for raising and directing energy. Many practitioners meditate before rituals.',
          },
        ]}
        internalLinks={[
          { text: 'Breathwork Techniques', href: '/grimoire/breathwork' },
          { text: 'Chakras', href: '/grimoire/chakras' },
          {
            text: 'Spellcraft Fundamentals',
            href: '/grimoire/spellcraft-fundamentals',
          },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <Meditation />
      </div>
    </>
  );
}
