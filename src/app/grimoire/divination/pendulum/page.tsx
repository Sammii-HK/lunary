import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Pendulum Divination: Complete Guide to Dowsing - Lunary',
  description:
    'Learn pendulum divination techniques for answers and guidance. Discover how to use a pendulum for dowsing, yes/no questions, and spiritual communication.',
  keywords: [
    'pendulum divination',
    'dowsing',
    'pendulum reading',
    'how to use a pendulum',
    'divination tools',
  ],
  openGraph: {
    title: 'Pendulum Divination: Complete Guide to Dowsing - Lunary',
    description:
      'Learn pendulum divination techniques for answers and guidance.',
    url: 'https://lunary.app/grimoire/divination/pendulum',
    siteName: 'Lunary',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pendulum Divination: Complete Guide - Lunary',
    description:
      'Learn pendulum divination techniques for answers and guidance.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/divination/pendulum',
  },
};

export default function PendulumDivinationPage() {
  const faqs = [
    {
      question: 'What is pendulum divination?',
      answer:
        'Pendulum divination is a form of dowsing that uses a weighted object suspended from a chain or string to answer questions and receive guidance. The pendulum moves in specific patterns to indicate yes, no, or other responses.',
    },
    {
      question: 'How do I choose a pendulum?',
      answer:
        'Choose a pendulum that feels right to you. Crystal pendulums are popular for their energetic properties, but metal or wood pendulums work well too. Hold different pendulums and notice which one feels most responsive.',
    },
    {
      question: 'How do I program my pendulum?',
      answer:
        'To program your pendulum, hold it still and ask it to show you "yes." Observe its movement. Then ask for "no" and "maybe." These movements become your personal pendulum language.',
    },
    {
      question: 'What questions can I ask a pendulum?',
      answer:
        'Pendulums work best for yes/no questions. Ask clear, specific questions with definite answers. Avoid questions about the future or other people without their permission.',
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Pendulum Divination - Lunary'
        h1='Pendulum Divination: Complete Guide'
        description='Learn pendulum divination techniques for answers and guidance. Discover how to use a pendulum for dowsing and spiritual communication.'
        keywords={[
          'pendulum divination',
          'dowsing',
          'pendulum reading',
          'divination',
        ]}
        canonicalUrl='https://lunary.app/grimoire/divination/pendulum'
        intro='Pendulum divination is an ancient practice of using a weighted object to receive answers and guidance. This simple yet powerful tool connects you to your intuition and higher wisdom.'
        tldr='Use a pendulum for yes/no questions by programming it to show specific movements for each response.'
        meaning={`Pendulum divination, also known as dowsing, is one of the most accessible forms of divination. Using a weighted object suspended from a chain or string, practitioners can receive answers to questions and guidance on various matters.

The pendulum works by amplifying subtle energy movements from your subconscious mind or higher guidance. When you ask a question, your energy influences the pendulum's movement, creating visible responses that can be interpreted.

Pendulums have been used throughout history for finding water, locating lost objects, making decisions, and receiving spiritual guidance. Today, they remain popular tools for personal development and spiritual practice.

Common pendulum movements include:
- Clockwise circle: Often indicates "yes"
- Counterclockwise circle: Often indicates "no"
- Back and forth swing: Can indicate "maybe" or "ask later"
- Side to side swing: Alternative for yes or no

These movements can vary by practitioner, so it's important to program your own pendulum before using it for readings.`}
        emotionalThemes={[
          'Guidance',
          'Clarity',
          'Intuition',
          'Decision-making',
        ]}
        howToWorkWith={[
          'Choose a pendulum that resonates with you',
          'Cleanse and program your pendulum',
          'Hold the chain between thumb and forefinger',
          'Ask clear yes/no questions',
          'Trust the responses you receive',
          'Practice regularly to strengthen connection',
        ]}
        rituals={[
          'Cleanse your pendulum before first use',
          'Program yes/no/maybe responses',
          'Create a pendulum board for complex questions',
          'Use pendulum for chakra balancing',
          'Combine with meditation for deeper insights',
        ]}
        journalPrompts={[
          'What questions do I want to ask my pendulum?',
          'How does my pendulum respond to yes/no?',
          'What patterns do I notice in my readings?',
          'How can I strengthen my pendulum connection?',
        ]}
        relatedItems={[
          {
            name: 'Divination Guide',
            href: '/grimoire/divination',
            type: 'Guide',
          },
          { name: 'Tarot Reading', href: '/tarot', type: 'Tool' },
          { name: 'Scrying', href: '/grimoire/scrying', type: 'Practice' },
        ]}
        internalLinks={[
          { text: 'Divination Guide', href: '/grimoire/divination' },
          { text: 'Tarot Reading', href: '/tarot' },
          { text: 'Runes', href: '/grimoire/runes' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more divination methods'
        ctaHref='/grimoire/divination'
        faqs={faqs}
      />
    </div>
  );
}
