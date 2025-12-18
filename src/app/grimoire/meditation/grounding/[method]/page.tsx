import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const groundingMethods = {
  'tree-root-visualization': {
    name: 'Tree Root Visualization',
    description:
      'A powerful grounding meditation that uses the imagery of tree roots extending from your body into the earth to establish energetic connection and stability.',
    benefits: [
      'Deep energetic grounding',
      'Connection to earth energy',
      'Emotional stability',
      'Spiritual centering',
    ],
    steps: [
      'Stand or sit with feet flat on the floor',
      'Close your eyes and take several deep breaths',
      'Visualize roots growing from the base of your spine',
      'See the roots extending deep into the earth',
      'Feel them anchoring into bedrock',
      'Visualize earth energy flowing up through the roots',
      'Let this energy fill your body with stability',
      'When ready, slowly return awareness to your surroundings',
    ],
    duration: '5-15 minutes',
    bestFor: [
      'Before ritual work',
      'When feeling ungrounded',
      'After spiritual practice',
      'Daily centering',
    ],
  },
  'physical-grounding': {
    name: 'Physical Grounding',
    description:
      'Using the physical body and senses to establish presence and connection to the earth. This technique is excellent for anxiety, dissociation, and feeling scattered.',
    benefits: [
      'Immediate grounding',
      'Reduces anxiety',
      'Establishes presence',
      'Simple and accessible',
    ],
    steps: [
      'Stand or sit with feet firmly on the ground',
      'Press your feet into the floor, feeling the connection',
      'Notice 5 things you can see around you',
      'Notice 4 things you can physically feel',
      'Notice 3 things you can hear',
      'Notice 2 things you can smell',
      'Notice 1 thing you can taste',
      'Take a deep breath and feel present in your body',
    ],
    duration: '2-10 minutes',
    bestFor: [
      'Anxiety relief',
      'Quick grounding',
      'Panic attacks',
      'Feeling scattered',
    ],
  },
  'crystal-grounding': {
    name: 'Crystal Grounding',
    description:
      'Using grounding crystals like black tourmaline, hematite, or smoky quartz to establish energetic connection to the earth and clear excess energy.',
    benefits: [
      'Enhanced grounding through crystal energy',
      'Protection',
      'Energy clearing',
      'Stable foundation',
    ],
    steps: [
      'Choose a grounding crystal (black tourmaline, hematite, smoky quartz)',
      'Cleanse the crystal before use',
      'Hold the crystal in your hands or place at your feet',
      'Close your eyes and feel the weight of the crystal',
      'Visualize the crystal drawing excess energy downward',
      'Feel a sense of heaviness and stability developing',
      'Allow the crystal to anchor you to earth energy',
      'When complete, thank the crystal and set it aside',
    ],
    duration: '5-20 minutes',
    bestFor: [
      'After energy work',
      'Feeling overwhelmed',
      'Spiritual protection',
      'Daily practice',
    ],
  },
};

const methodKeys = Object.keys(groundingMethods);

export async function generateStaticParams() {
  return methodKeys.map((method) => ({
    method: method,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ method: string }>;
}): Promise<Metadata> {
  const { method } = await params;
  const methodData = groundingMethods[method as keyof typeof groundingMethods];

  if (!methodData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${methodData.name}: Technique & Benefits - Lunary`;
  const description = `Learn the ${methodData.name} grounding technique. Discover step-by-step instructions, benefits, and how to use this practice for stability and centering.`;

  return {
    title,
    description,
    keywords: [
      methodData.name.toLowerCase(),
      'grounding',
      'grounding meditation',
      'earth connection',
      'centering',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/meditation/grounding/${method}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/meditation/grounding/${method}`,
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
}

export default async function GroundingMethodPage({
  params,
}: {
  params: Promise<{ method: string }>;
}) {
  const { method } = await params;
  const methodData = groundingMethods[method as keyof typeof groundingMethods];

  if (!methodData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is ${methodData.name}?`,
      answer: methodData.description,
    },
    {
      question: `What are the benefits of ${methodData.name}?`,
      answer: `${methodData.name} benefits include ${methodData.benefits.join(', ').toLowerCase()}.`,
    },
    {
      question: `How long should I practice ${methodData.name}?`,
      answer: `${methodData.name} typically takes ${methodData.duration}. Adjust based on your needs and available time.`,
    },
    {
      question: `When should I use ${methodData.name}?`,
      answer: `${methodData.name} is best for ${methodData.bestFor.join(', ').toLowerCase()}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${methodData.name} - Lunary`}
        h1={`${methodData.name}: Complete Guide`}
        description={`Learn the ${methodData.name} grounding technique for stability and centering.`}
        keywords={[
          methodData.name.toLowerCase(),
          'grounding',
          'meditation',
          'centering',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/meditation/grounding/${method}`}
        intro={methodData.description}
        tldr={`${methodData.name} ${methodData.benefits[0].toLowerCase()}. Takes ${methodData.duration}.`}
        meaning={`Grounding is essential for maintaining energetic balance, especially for those who practice meditation, magic, or spiritual work. ${methodData.name} is a specific technique for establishing earth connection.

${methodData.description}

Benefits of ${methodData.name}:
${methodData.benefits.map((b) => `- ${b}`).join('\n')}

This technique is especially useful for ${methodData.bestFor.join(', ').toLowerCase()}. Regular grounding practice helps maintain stability and prevents the scattered, uncentered feeling that can come from intense spiritual work.

The practice typically takes ${methodData.duration}, making it accessible for daily use or as-needed grounding. Even brief grounding can make a significant difference in your sense of stability and presence.`}
        emotionalThemes={['Stability', 'Presence', 'Connection', 'Safety']}
        howToWorkWith={methodData.steps}
        tables={[
          {
            title: `${methodData.name} Overview`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Duration', methodData.duration],
              ['Benefits', methodData.benefits.join(', ')],
              ['Best For', methodData.bestFor.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          'How grounded do I feel before and after practice?',
          'What sensations do I notice during grounding?',
          'When do I most need grounding in my life?',
          'How can I incorporate grounding into my daily routine?',
        ]}
        relatedItems={[
          {
            name: 'Meditation Guide',
            href: '/grimoire/meditation',
            type: 'Guide',
          },
          {
            name: 'Breathwork',
            href: '/grimoire/meditation/breathwork',
            type: 'Practice',
          },
          { name: 'Chakras', href: '/grimoire/chakras', type: 'Guide' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Meditation', href: '/grimoire/meditation' },
          {
            label: methodData.name,
            href: `/grimoire/meditation/grounding/${method}`,
          },
        ]}
        internalLinks={[
          { text: 'Meditation Guide', href: '/grimoire/meditation' },
          { text: 'Breathwork', href: '/grimoire/meditation/breathwork' },
          { text: 'Root Chakra', href: '/grimoire/chakras/root' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more grounding techniques'
        ctaHref='/grimoire/meditation'
        faqs={faqs}
      />
    </div>
  );
}
