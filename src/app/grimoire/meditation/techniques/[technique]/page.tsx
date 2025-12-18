import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const meditationTechniques = {
  'guided-meditation': {
    name: 'Guided Meditation',
    description:
      'A meditation practice led by a teacher or recording, providing verbal guidance throughout the session.',
    benefits: [
      'Easy for beginners',
      'Structured practice',
      'Variety of focuses',
      'Reduces mental effort',
    ],
    howTo: [
      'Find a quiet, comfortable space',
      'Choose a guided meditation recording or teacher',
      'Close your eyes and follow the instructions',
      'Allow the guide to lead your attention',
      'Return gently when your mind wanders',
    ],
  },
  'mindfulness-meditation': {
    name: 'Mindfulness Meditation',
    description:
      'A practice of maintaining present-moment awareness without judgment, observing thoughts and sensations as they arise.',
    benefits: [
      'Reduces stress',
      'Improves focus',
      'Enhances emotional regulation',
      'Increases self-awareness',
    ],
    howTo: [
      'Sit comfortably with eyes closed or softly focused',
      'Bring attention to your breath',
      'Notice thoughts without engaging',
      'Gently return focus to the present moment',
      'Practice non-judgmental awareness',
    ],
  },
  'visualization-meditation': {
    name: 'Visualization Meditation',
    description:
      'A technique using mental imagery to create peaceful scenes, achieve goals, or work with spiritual energies.',
    benefits: [
      'Enhances creativity',
      'Supports manifestation',
      'Reduces anxiety',
      'Improves performance',
    ],
    howTo: [
      'Relax your body and close your eyes',
      'Create a detailed mental image',
      'Engage all senses in the visualization',
      'Hold the image with focused attention',
      'Allow the practice to unfold naturally',
    ],
  },
  'walking-meditation': {
    name: 'Walking Meditation',
    description:
      'A mindful practice combining slow, deliberate walking with present-moment awareness.',
    benefits: [
      'Combines movement with meditation',
      'Grounds energy',
      'Accessible practice',
      'Connects with nature',
    ],
    howTo: [
      'Choose a quiet path or space',
      'Walk slowly and deliberately',
      'Focus on each step and sensation',
      'Coordinate breath with movement',
      'Maintain present-moment awareness',
    ],
  },
  'mantra-meditation': {
    name: 'Mantra Meditation',
    description:
      'A practice using repeated words, phrases, or sounds to focus the mind and invoke specific energies.',
    benefits: [
      'Deepens focus',
      'Raises vibration',
      'Invokes specific energies',
      'Ancient tradition',
    ],
    howTo: [
      'Choose a meaningful mantra',
      'Sit comfortably and relax',
      'Repeat the mantra silently or aloud',
      'Synchronize with breath if desired',
      'Let the vibration permeate your being',
    ],
  },
};

const techniqueKeys = Object.keys(meditationTechniques);

export async function generateStaticParams() {
  return techniqueKeys.map((technique) => ({
    technique: technique,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ technique: string }>;
}): Promise<Metadata> {
  const { technique } = await params;
  const techniqueData =
    meditationTechniques[technique as keyof typeof meditationTechniques];

  if (!techniqueData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${techniqueData.name}: Complete Guide & Benefits - Lunary`;
  const description = `Learn ${techniqueData.name} techniques and benefits. Discover how to practice ${techniqueData.name.toLowerCase()} for stress relief, focus, and spiritual growth.`;

  return {
    title,
    description,
    keywords: [
      techniqueData.name.toLowerCase(),
      `${techniqueData.name.toLowerCase()} techniques`,
      `how to ${techniqueData.name.toLowerCase()}`,
      'meditation practice',
      'mindfulness',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/meditation/techniques/${technique}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/meditation',
          width: 1200,
          height: 630,
          alt: techniqueData.name,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/cosmic'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/meditation/techniques/${technique}`,
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

export default async function MeditationTechniquePage({
  params,
}: {
  params: Promise<{ technique: string }>;
}) {
  const { technique } = await params;
  const techniqueData =
    meditationTechniques[technique as keyof typeof meditationTechniques];

  if (!techniqueData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is ${techniqueData.name}?`,
      answer: techniqueData.description,
    },
    {
      question: `What are the benefits of ${techniqueData.name}?`,
      answer: `${techniqueData.name} benefits include ${techniqueData.benefits.join(', ').toLowerCase()}.`,
    },
    {
      question: `How do I practice ${techniqueData.name}?`,
      answer: `To practice ${techniqueData.name}, ${techniqueData.howTo[0].toLowerCase()}. ${techniqueData.howTo[1]}.`,
    },
    {
      question: `Is ${techniqueData.name} good for beginners?`,
      answer: `${techniqueData.name} can be practiced by beginners with guidance. Start with short sessions and gradually increase duration as you become more comfortable.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${techniqueData.name} - Lunary`}
        h1={`${techniqueData.name}: Complete Guide`}
        description={`Learn ${techniqueData.name} techniques and benefits for stress relief and spiritual growth.`}
        keywords={[
          techniqueData.name.toLowerCase(),
          'meditation',
          'mindfulness',
          'spiritual practice',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/meditation/techniques/${technique}`}
        intro={techniqueData.description}
        tldr={`${techniqueData.name} ${techniqueData.benefits[0].toLowerCase()}. Practice regularly for best results.`}
        meaning={`Meditation is a powerful practice for cultivating inner peace, focus, and spiritual connection. ${techniqueData.name} offers a specific approach to this ancient practice.

${techniqueData.description}

The benefits of ${techniqueData.name} include:
${techniqueData.benefits.map((b) => `- ${b}`).join('\n')}

Regular practice of ${techniqueData.name} can transform your mental clarity, emotional balance, and spiritual awareness. Even short daily sessions can create significant positive changes over time.

This technique is suitable for practitioners of all levels, though beginners may want to start with shorter sessions and gradually build duration. Consistency is more important than length—a daily 10-minute practice is more beneficial than occasional hour-long sessions.`}
        emotionalThemes={['Peace', 'Clarity', 'Focus', 'Awareness']}
        howToWorkWith={techniqueData.howTo}
        tables={[
          {
            title: `${techniqueData.name} Overview`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Type', techniqueData.name],
              ['Benefits', techniqueData.benefits.join(', ')],
              ['Duration', '10-30 minutes recommended'],
              ['Frequency', 'Daily practice ideal'],
            ],
          },
        ]}
        journalPrompts={[
          'What drew me to this meditation technique?',
          'How do I feel before and after practice?',
          'What insights arose during meditation?',
          'How can I deepen my practice?',
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
            label: techniqueData.name,
            href: `/grimoire/meditation/techniques/${technique}`,
          },
        ]}
        internalLinks={[
          { text: 'Meditation Guide', href: '/grimoire/meditation' },
          {
            text: 'Breathwork Techniques',
            href: '/grimoire/meditation/breathwork',
          },
          { text: 'Chakra Balancing', href: '/grimoire/chakras' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Start your ${techniqueData.name} practice`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
