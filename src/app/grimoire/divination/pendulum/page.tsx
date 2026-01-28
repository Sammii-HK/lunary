import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createHowToSchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Pendulum Divination: How to Use a Pendulum for Answers | Lunary',
  description:
    'Master pendulum divination for yes/no answers and spiritual guidance. Learn how to choose, cleanse, program, and use a pendulum for dowsing and decision-making.',
  keywords: [
    'pendulum divination',
    'dowsing',
    'pendulum reading',
    'how to use a pendulum',
    'divination tools',
    'pendulum boards',
    'crystal pendulum',
    'pendulum answers',
  ],
  openGraph: {
    title: 'Pendulum Divination: How to Use a Pendulum for Answers | Lunary',
    description:
      'Master pendulum divination for answers and spiritual guidance. Learn to dowse like a pro.',
    url: 'https://lunary.app/grimoire/divination/pendulum',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/divination',
        width: 1200,
        height: 630,
        alt: 'Pendulum Divination Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pendulum Divination Guide | Lunary',
    description: 'Learn pendulum dowsing for answers and spiritual guidance.',
    images: ['/api/og/grimoire/divination'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/divination/pendulum',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const faqs = [
  {
    question: 'What is pendulum divination?',
    answer:
      'Pendulum divination is a form of dowsing that uses a weighted object suspended from a chain or string to answer questions and receive guidance. The pendulum moves in specific patterns to indicate yes, no, or other responses.',
  },
  {
    question: 'How do I choose a pendulum?',
    answer:
      'Choose a pendulum that feels right to you. Crystal pendulums are popular for their energetic properties, but metal or wood pendulums work well too. Hold different pendulums and notice which one feels most responsive to your energy.',
  },
  {
    question: 'How do I program my pendulum?',
    answer:
      'To program your pendulum, hold it still and ask it to show you "yes." Observe its movement. Then ask for "no" and "maybe." These movements become your personal pendulum language. Re-program periodically.',
  },
  {
    question: 'What questions can I ask a pendulum?',
    answer:
      "Pendulums work best for yes/no questions. Ask clear, specific questions with definite answers. Avoid questions about timing, other people's thoughts, or lottery numbers. Focus on what you can influence.",
  },
  {
    question: "Why isn't my pendulum moving?",
    answer:
      "If your pendulum won't move, you may be too tense, the question unclear, or the energy blocked. Relax, rephrase your question, cleanse the pendulum, and try again. Some days readings just don't flow—that's normal.",
  },
];

export default function PendulumDivinationPage() {
  const pendulumHowToSchema = createHowToSchema({
    name: 'How to Use a Pendulum for Divination',
    description:
      'A step-by-step guide to using a pendulum for dowsing, answers, and spiritual guidance.',
    url: 'https://lunary.app/grimoire/divination/pendulum',
    steps: [
      {
        name: 'Choose Your Pendulum',
        text: 'Select a pendulum that feels right to you. Crystal, metal, or wood all work. Hold it and notice if it feels responsive.',
      },
      {
        name: 'Cleanse Your Pendulum',
        text: 'Cleanse with moonlight, sage smoke, salt, or running water before first use and periodically after.',
      },
      {
        name: 'Program Your Responses',
        text: 'Hold the pendulum still and ask it to show you "yes," then "no," then "maybe." Observe and remember each movement.',
      },
      {
        name: 'Ground and Center',
        text: 'Take deep breaths, clear your mind, and connect to your intuition before asking questions.',
      },
      {
        name: 'Ask Clear Questions',
        text: 'Ask specific yes/no questions. Hold the pendulum steady and wait for movement.',
      },
      {
        name: 'Trust and Record',
        text: 'Trust the first response. Record your questions and answers in a journal to track accuracy.',
      },
    ],
  });

  return (
    <>
      {renderJsonLd(pendulumHowToSchema)}
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <SEOContentTemplate
          title='Pendulum Divination | Lunary'
          h1='Pendulum Divination: How to Use a Pendulum for Answers'
          description='Learn pendulum divination techniques for answers and guidance. Discover how to use a pendulum for dowsing and spiritual communication.'
          keywords={[
            'pendulum divination',
            'dowsing',
            'pendulum reading',
            'divination',
          ]}
          canonicalUrl='https://lunary.app/grimoire/divination/pendulum'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Divination', href: '/grimoire/divination' },
            { label: 'Pendulum', href: '/grimoire/divination/pendulum' },
          ]}
          whatIs={{
            question: 'What is pendulum divination?',
            answer:
              "Pendulum divination (also called dowsing) is an ancient practice of using a weighted object suspended from a chain or string to receive answers and guidance. The pendulum amplifies subtle energy movements from your subconscious or higher guidance, creating visible yes/no/maybe responses. It's one of the most accessible divination tools for beginners.",
          }}
          intro='Pendulum divination is an ancient practice of using a weighted object to receive answers and guidance. This simple yet powerful tool connects you to your intuition and higher wisdom.'
          tldr='Choose a pendulum that resonates with you, cleanse it, program yes/no/maybe responses, then ask clear yes/no questions. Trust the first movement you see.'
          meaning={`Pendulum divination, also known as dowsing, is one of the most accessible forms of divination. Using a weighted object suspended from a chain or string, practitioners can receive answers to questions and guidance on various matters.

**How Pendulums Work:**

The pendulum amplifies subtle energy movements from your subconscious mind or higher guidance. When you ask a question, your energy influences the pendulum's movement, creating visible responses that can be interpreted.

Pendulums have been used throughout history for finding water, locating lost objects, making decisions, and receiving spiritual guidance. Today, they remain popular tools for personal development and spiritual practice.

**Common Pendulum Movements:**

- **Clockwise circle:** Often indicates "yes"
- **Counterclockwise circle:** Often indicates "no"
- **Back and forth swing:** Can indicate "maybe" or "ask later"
- **Side to side swing:** Alternative for yes or no
- **Diagonal swing:** Sometimes indicates a conditional answer

These movements can vary by practitioner, so it's essential to program your own pendulum before using it for readings.

**Types of Pendulums:**

- **Crystal Pendulums:** Clear quartz, amethyst, rose quartz. Add specific energetic properties.
- **Metal Pendulums:** Brass, copper, silver. Neutral and responsive.
- **Wood Pendulums:** Natural and grounding. Good for earth-based questions.
- **Specialty Pendulums:** Chamber pendulums (hold items inside), Egyptian pendulums (specific shapes).`}
          emotionalThemes={[
            'Guidance',
            'Clarity',
            'Intuition',
            'Decision-making',
          ]}
          howToWorkWith={[
            'Choose a pendulum that resonates with you',
            'Cleanse before first use (moonlight, sage, salt)',
            'Program your yes/no/maybe responses',
            'Hold chain between thumb and forefinger',
            'Keep elbow steady, let pendulum hang freely',
            'Ask clear, specific yes/no questions',
            'Trust the first response you see',
            'Practice regularly to strengthen connection',
          ]}
          tables={[
            {
              title: 'Pendulum Movement Guide',
              headers: ['Movement', 'Common Meaning', 'Notes'],
              rows: [
                ['Clockwise circle', 'Yes', 'Most common yes response'],
                ['Counterclockwise', 'No', 'Most common no response'],
                ['Back & forth', 'Maybe/Neutral', 'Rephrase question'],
                ['Side to side', 'Ask later', 'Timing not right'],
                ['No movement', 'Unclear', 'Cleanse and retry'],
                ['Diagonal', 'Conditional', 'Depends on circumstances'],
              ],
            },
            {
              title: 'Pendulum Types',
              headers: ['Type', 'Best For', 'Properties'],
              rows: [
                ['Clear Quartz', 'All-purpose', 'Amplifies energy'],
                ['Amethyst', 'Spiritual questions', 'Intuition, calm'],
                ['Rose Quartz', 'Love questions', 'Heart-centered'],
                ['Metal (Brass)', 'General use', 'Neutral, responsive'],
                ['Wood', 'Nature questions', 'Grounding'],
              ],
            },
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
            'How does my pendulum respond to yes/no/maybe?',
            'What patterns do I notice in my readings?',
            'How accurate have my pendulum readings been?',
            'How can I strengthen my pendulum connection?',
          ]}
          relatedItems={[
            {
              name: 'Divination Guide',
              href: '/grimoire/divination',
              type: 'Guide',
            },
            { name: 'Tarot Reading', href: '/tarot', type: 'Tool' },
            {
              name: 'Scrying',
              href: '/grimoire/divination/scrying',
              type: 'Practice',
            },
            { name: 'Crystals', href: '/grimoire/crystals', type: 'Guide' },
          ]}
          internalLinks={[
            { text: 'Divination Guide', href: '/grimoire/divination' },
            { text: 'Tarot Reading', href: '/tarot' },
            { text: 'Crystals Guide', href: '/grimoire/crystals' },
            { text: 'Grimoire Home', href: '/grimoire' },
          ]}
          ctaText='Explore more divination methods'
          ctaHref='/grimoire/divination'
          faqs={faqs}
        />
      </div>
    </>
  );
}
