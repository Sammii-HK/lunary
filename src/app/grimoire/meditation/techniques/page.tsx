import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Brain } from 'lucide-react';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

// 30-day ISR revalidation
export const revalidate = 2592000;
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
  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Meditation', url: '/grimoire/meditation' },
    { name: 'Techniques', url: '/grimoire/meditation/techniques' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Brain className='w-16 h-16 text-indigo-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Meditation Techniques
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            There are many paths to inner peace. Explore different meditation
            styles to find the practice that resonates with you.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Finding Your Practice
          </h2>
          <p className='text-zinc-400 mb-4'>
            There&apos;s no single &quot;right&quot; way to meditate. Different
            techniques serve different purposes — some calm anxiety, others
            enhance focus, and some facilitate spiritual experiences.
          </p>
          <p className='text-zinc-400'>
            Try several techniques and notice which ones feel natural. Your
            ideal practice may also change based on your current needs and life
            circumstances.
          </p>
        </div>

        {/* Techniques Grid */}
        <section className='mb-12'>
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

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More
          </h3>
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
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
