import { Metadata } from 'next';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
const meditationTechniques = [
  {
    slug: 'guided-meditation',
    name: 'Guided Meditation',
    description: 'Following verbal instructions or imagery',
    duration: '10-30 min',
    type: 'Beginner-friendly',
  },
  {
    slug: 'mindfulness',
    name: 'Mindfulness Meditation',
    description: 'Present-moment awareness without judgment',
    duration: '5-20 min',
    type: 'Universal',
  },
  {
    slug: 'body-scan',
    name: 'Body Scan',
    description: 'Systematic attention to each body part',
    duration: '15-45 min',
    type: 'Relaxation',
  },
  {
    slug: 'loving-kindness',
    name: 'Loving-Kindness (Metta)',
    description: 'Cultivating compassion for self and others',
    duration: '10-20 min',
    type: 'Heart-centered',
  },
  {
    slug: 'visualization',
    name: 'Visualization',
    description: 'Creating mental imagery for manifestation',
    duration: '10-30 min',
    type: 'Manifestation',
  },
  {
    slug: 'mantra',
    name: 'Mantra Meditation',
    description: 'Repeating sacred words or sounds',
    duration: '10-30 min',
    type: 'Focus',
  },
  {
    slug: 'walking',
    name: 'Walking Meditation',
    description: 'Mindful movement and awareness',
    duration: '10-30 min',
    type: 'Active',
  },
  {
    slug: 'transcendental',
    name: 'Transcendental Meditation',
    description: 'Silent mantra technique for deep rest',
    duration: '20 min',
    type: 'Advanced',
  },
];

export const metadata: Metadata = {
  title: 'Meditation Techniques: Chakra, Guided & Visualization | Lunary',
  description:
    'Explore different meditation techniques from mindfulness to visualization. Find the perfect practice for your spiritual journey.',
  keywords: [
    'meditation techniques',
    'types of meditation',
    'how to meditate',
    'mindfulness meditation',
    'guided meditation',
  ],
  openGraph: {
    title: 'Meditation Techniques | Lunary',
    description:
      'Explore different meditation techniques for your spiritual practice.',
    url: 'https://lunary.app/grimoire/meditation/techniques',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/meditation/techniques',
  },
};

export default function MeditationTechniquesIndexPage() {
  const tableOfContents = [
    { label: 'Finding Your Practice', href: '#finding-your-practice' },
    { label: 'Meditation Styles', href: '#meditation-styles' },
    { label: 'Explore More', href: '#explore-more' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Brain className='w-16 h-16 text-indigo-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        There are many paths to inner peace. Explore different meditation styles
        to find the practice that resonates with you.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='finding-your-practice'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          Finding Your Practice
        </h2>
        <p className='text-zinc-400 mb-4'>
          There&apos;s no single &quot;right&quot; way to meditate. Different
          techniques serve different purposes - some calm anxiety, others
          enhance focus, and some facilitate spiritual experiences.
        </p>
        <p className='text-zinc-400'>
          Try several techniques and notice which ones feel natural. Your ideal
          practice may also change based on your current needs and life
          circumstances.
        </p>
      </section>

      <section id='meditation-styles' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Meditation Styles
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {meditationTechniques.map((technique) => (
            <Link
              key={technique.slug}
              href={`/grimoire/meditation/techniques/${technique.slug}`}
              className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-indigo-700/50 transition-all'
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300'>
                  {technique.type}
                </span>
                <span className='text-xs text-zinc-400'>
                  {technique.duration}
                </span>
              </div>
              <h3 className='text-lg font-medium text-zinc-100 group-hover:text-indigo-300 transition-colors mb-2'>
                {technique.name}
              </h3>
              <p className='text-sm text-zinc-400'>{technique.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id='explore-more' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>Explore More</h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/meditation'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Meditation Overview
          </Link>
          <Link
            href='/grimoire/meditation/breathwork'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Breathwork
          </Link>
          <Link
            href='/grimoire/meditation/grounding'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Grounding
          </Link>
          <Link
            href='/grimoire/chakras'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Chakras
          </Link>
        </div>
      </section>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='Meditation Techniques: Chakra, Guided & Visualization | Lunary'
        h1='Meditation Techniques'
        description='Explore meditation styles from mindfulness to visualization and find the perfect practice for your spiritual journey.'
        keywords={[
          'meditation techniques',
          'types of meditation',
          'how to meditate',
          'mindfulness meditation',
          'guided meditation',
        ]}
        canonicalUrl='https://lunary.app/grimoire/meditation/techniques'
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro='Meditation techniques vary in focus, posture, and pacing. Some emphasize breath and awareness, while others use sound, movement, or visualization to guide the mind. Exploring a few styles helps you discover what best supports your goals.'
        tldr='Choose a technique that matches your current needs: calm, focus, compassion, or energy. Consistent practice matters more than the style.'
        meaning={`Meditation is not one single practice. It is a family of methods that train attention, regulate the nervous system, and open inner awareness.

Mindfulness builds present-moment awareness. Guided sessions provide structure. Mantra practices steady the mind with sound. Body scans relax the nervous system. Walking and movement-based practices help when sitting still is difficult.

Try each technique for a few sessions before deciding. Notice which practices feel stabilizing, which feel energizing, and which bring insight. You can also rotate techniques to match your day.`}
        howToWorkWith={[
          'Start with 5-10 minutes and extend gradually.',
          'Use guided sessions when attention feels scattered.',
          'Switch to walking or body scan if sitting feels restless.',
          'Keep a simple log of what helps most.',
        ]}
        rituals={[
          'Light a candle and set a single intention before you begin.',
          'Do three slow breaths to signal the start of practice.',
          'Close with a short gratitude phrase or a stretch.',
          'Practice at the same time daily for two weeks.',
        ]}
        journalPrompts={[
          'Which meditation style feels most natural to me?',
          'What changes do I notice after a week of practice?',
          'Where does my mind drift most often?',
          'How can I make my practice more consistent?',
        ]}
        tables={[
          {
            title: 'Meditation Technique Guide',
            headers: ['Style', 'Best For', 'Time'],
            rows: [
              ['Mindfulness', 'Stress reduction', '5-20 min'],
              ['Guided', 'Beginners and focus', '10-30 min'],
              ['Body Scan', 'Relaxation', '15-30 min'],
              ['Mantra', 'Mental clarity', '10-20 min'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Meditation Overview',
            href: '/grimoire/meditation',
            type: 'Guide',
          },
          {
            name: 'Breathwork',
            href: '/grimoire/meditation/breathwork',
            type: 'Practice',
          },
          {
            name: 'Grounding',
            href: '/grimoire/meditation/grounding',
            type: 'Practice',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Meditation', href: '/grimoire/meditation' },
          { label: 'Techniques', href: '/grimoire/meditation/techniques' },
        ]}
        internalLinks={[
          { text: 'Meditation Overview', href: '/grimoire/meditation' },
          {
            text: 'Breathwork Practices',
            href: '/grimoire/meditation/breathwork',
          },
          {
            text: 'Grounding Techniques',
            href: '/grimoire/meditation/grounding',
          },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={[
          {
            question: 'Which meditation style is best for beginners?',
            answer:
              'Guided meditation and mindfulness are both beginner-friendly because they offer structure and a clear focus.',
          },
          {
            question: 'How long should I meditate each day?',
            answer:
              'Five to ten minutes is enough to start. Consistency matters more than duration.',
          },
          {
            question: 'Can I mix different techniques?',
            answer:
              'Yes. Many practitioners alternate styles based on energy levels or goals.',
          },
          {
            question: 'What if I keep getting distracted?',
            answer:
              'Distraction is normal. Gently return to your focus without judging yourself.',
          },
        ]}
        ctaText='Explore meditation techniques'
        ctaHref='/grimoire/meditation/techniques/guided-meditation'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
