import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const breathworkMethods = {
  'deep-belly-breathing': {
    name: 'Deep Belly Breathing',
    description:
      'A foundational breathwork technique that uses the diaphragm to create deep, calming breaths. Also known as diaphragmatic breathing.',
    benefits: [
      'Reduces stress and anxiety',
      'Activates parasympathetic nervous system',
      'Improves focus',
      'Increases oxygen intake',
    ],
    steps: [
      'Sit or lie in a comfortable position',
      'Place one hand on your chest, one on your belly',
      'Breathe in slowly through your nose, feeling your belly rise',
      'Your chest should remain relatively still',
      'Exhale slowly through your mouth, feeling your belly fall',
      'Repeat for 5-10 minutes',
    ],
    duration: '5-20 minutes',
    bestFor: ['Beginners', 'Stress relief', 'Before sleep', 'Daily practice'],
  },
  'box-breathing': {
    name: 'Box Breathing',
    description:
      'A powerful technique using equal counts for inhaling, holding, exhaling, and holding again. Used by Navy SEALs for stress management.',
    benefits: [
      'Reduces stress quickly',
      'Improves concentration',
      'Balances nervous system',
      'Enhances mental clarity',
    ],
    steps: [
      'Sit comfortably with back straight',
      'Exhale completely through your mouth',
      'Inhale through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat 4-6 cycles',
    ],
    duration: '4-10 minutes',
    bestFor: [
      'Quick stress relief',
      'Before important events',
      'Focus enhancement',
      'Anxiety management',
    ],
  },
  pranayama: {
    name: 'Pranayama',
    description:
      'Ancient yogic breathing techniques that control prana (life force energy). Includes various practices like alternate nostril breathing and breath of fire.',
    benefits: [
      'Balances energy',
      'Clears energy channels',
      'Enhances meditation',
      'Spiritual development',
    ],
    steps: [
      'Sit in a comfortable meditation posture',
      'For Alternate Nostril: Close right nostril, inhale left',
      'Close both nostrils, hold briefly',
      'Close left nostril, exhale right',
      'Inhale right, hold, exhale left',
      'Continue alternating for 5-10 minutes',
    ],
    duration: '10-30 minutes',
    bestFor: [
      'Meditation preparation',
      'Energy balancing',
      'Spiritual practice',
      'Advanced practitioners',
    ],
  },
};

const methodKeys = Object.keys(breathworkMethods);

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
  const methodData =
    breathworkMethods[method as keyof typeof breathworkMethods];

  if (!methodData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${methodData.name}: Technique & Benefits - Lunary`;
  const description = `Learn the ${methodData.name} breathwork technique. Discover step-by-step instructions, benefits, and how to incorporate this practice into your routine.`;

  return {
    title,
    description,
    keywords: [
      methodData.name.toLowerCase(),
      'breathwork',
      'breathing exercises',
      'meditation',
      'stress relief',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/meditation/breathwork/${method}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/meditation/breathwork/${method}`,
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

export default async function BreathworkMethodPage({
  params,
}: {
  params: Promise<{ method: string }>;
}) {
  const { method } = await params;
  const methodData =
    breathworkMethods[method as keyof typeof breathworkMethods];

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
      answer: `${methodData.name} is typically practiced for ${methodData.duration}. Start with shorter sessions and gradually increase as you become comfortable.`,
    },
    {
      question: `When is the best time to practice ${methodData.name}?`,
      answer: `${methodData.name} is best for ${methodData.bestFor.join(', ').toLowerCase()}.`,
    },
    {
      question: `Can I practice ${methodData.name} every day?`,
      answer:
        'Yes. Daily breathwork is safe for most people when done gently. Start with shorter sessions and increase as it feels comfortable.',
    },
    {
      question: `What if I feel anxious during practice?`,
      answer:
        'Slow down, return to normal breathing, and ground yourself. Breathwork should feel supportive, not intense.',
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${methodData.name} - Lunary`}
        h1={`${methodData.name}: Complete Guide`}
        description={`Learn the ${methodData.name} breathwork technique for stress relief and mental clarity.`}
        keywords={[
          methodData.name.toLowerCase(),
          'breathwork',
          'breathing',
          'meditation',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/meditation/breathwork/${method}`}
        intro={methodData.description}
        tldr={`${methodData.name} ${methodData.benefits[0].toLowerCase()}. Practice for ${methodData.duration}.`}
        meaning={`Breathwork is one of the most powerful tools for shifting your mental and physical state. ${methodData.name} is a specific technique with proven benefits.

${methodData.description}

Benefits of ${methodData.name}:
${methodData.benefits.map((b) => `- ${b}`).join('\n')}

This technique is best for ${methodData.bestFor.join(', ').toLowerCase()}. Regular practice amplifies the benefits and creates lasting changes in your nervous system.

The recommended practice duration is ${methodData.duration}, though even a few minutes can be beneficial. Consistency is more important than length - daily practice creates the most significant results.

Use a smooth, steady rhythm and keep your shoulders relaxed. The breath should feel like a slow wave rather than a push or strain. If you are new to breathwork, shorten the practice and build up gradually.

This technique can be used before meditation, before stressful events, or as a quick reset during the day. Try practicing at the same time each day so your body learns the rhythm and responds more quickly.

If you tend toward anxiety, emphasize a longer, softer exhale. If you need energy, keep the rhythm even and alert. Adjusting the pace makes the practice more supportive for your current state.

If you feel lightheaded, return to normal breathing and slow the pace. Breathwork should be comfortable and controlled, not forced. Pairing the practice with a brief grounding check can help you transition back into daily activity. Hydration helps. Over time, the technique becomes easier and more natural.`}
        emotionalThemes={['Calm', 'Focus', 'Balance', 'Clarity']}
        howToWorkWith={methodData.steps}
        rituals={[
          'Set a timer and sit upright with relaxed shoulders.',
          'Place one hand on your belly to track the breath.',
          'Close with a slow exhale and a brief check-in.',
          'Drink a glass of water after practice to reset.',
          'Dim the lights to reduce stimulation.',
          'Write a one-line intention before you begin.',
        ]}
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
          {
            title: 'Breathwork Tips',
            headers: ['Tip', 'Reason'],
            rows: [
              ['Keep the breath smooth', 'Prevents dizziness'],
              ['Relax the jaw', 'Reduces tension'],
              ['Practice at the same time', 'Builds consistency'],
              ['Use a timer', 'Helps you stay relaxed'],
            ],
          },
        ]}
        journalPrompts={[
          'How do I feel before and after practice?',
          'What changes do I notice with regular practice?',
          'What challenges arise during breathwork?',
          'How can I incorporate this into my daily routine?',
          'What time of day feels best for this practice?',
          'What cues remind me to return to calm breathing?',
        ]}
        relatedItems={[
          {
            name: 'Breathwork Guide',
            href: '/grimoire/meditation/breathwork',
            type: 'Guide',
          },
          { name: 'Meditation', href: '/grimoire/meditation', type: 'Guide' },
          {
            name: 'Grounding',
            href: '/grimoire/meditation/grounding',
            type: 'Practice',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Meditation', href: '/grimoire/meditation' },
          {
            label: methodData.name,
            href: `/grimoire/meditation/breathwork/${method}`,
          },
        ]}
        internalLinks={[
          { text: 'Breathwork Guide', href: '/grimoire/meditation/breathwork' },
          { text: 'Meditation Guide', href: '/grimoire/meditation' },
          {
            text: 'Grounding Techniques',
            href: '/grimoire/meditation/grounding',
          },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more breathwork techniques'
        ctaHref='/grimoire/meditation/breathwork'
        faqs={faqs}
      />
    </div>
  );
}
