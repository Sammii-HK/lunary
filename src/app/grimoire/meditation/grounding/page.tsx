import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { TreePine } from 'lucide-react';

const groundingTechniques = [
  {
    slug: 'tree-root-visualization',
    name: 'Tree Root Visualization',
    description: 'Imagine roots growing from your feet into the earth',
    time: '5-10 min',
    type: 'Visualization',
  },
  {
    slug: '5-4-3-2-1-senses',
    name: '5-4-3-2-1 Senses',
    description: 'Engage all five senses to anchor to the present',
    time: '2-5 min',
    type: 'Sensory',
  },
  {
    slug: 'earthing',
    name: 'Earthing / Barefoot Walking',
    description: 'Direct physical contact with the earth',
    time: '10-20 min',
    type: 'Physical',
  },
  {
    slug: 'body-scan',
    name: 'Body Scan Grounding',
    description: 'Systematically feel each part of your body',
    time: '10-15 min',
    type: 'Mindfulness',
  },
  {
    slug: 'grounding-cord',
    name: 'Grounding Cord Meditation',
    description: "Visualize an energetic cord connecting you to Earth's core",
    time: '5-10 min',
    type: 'Visualization',
  },
  {
    slug: 'stone-holding',
    name: 'Stone Holding',
    description: 'Hold a grounding crystal to anchor energy',
    time: '5-10 min',
    type: 'Crystal Work',
  },
];

export const metadata: Metadata = {
  title:
    'Grounding Techniques: Earthing, Tree Root & 5-4-3-2-1 Method - Lunary',
  description:
    'Learn powerful grounding techniques to anchor your energy, reduce anxiety, and connect with the earth. Essential practices for empaths and sensitives.',
  keywords: [
    'grounding techniques',
    'grounding meditation',
    'earthing',
    'energy grounding',
    'how to ground yourself',
  ],
  openGraph: {
    title: 'Grounding Techniques | Lunary',
    description:
      'Learn powerful grounding techniques to anchor your energy and reduce anxiety.',
    url: 'https://lunary.app/grimoire/meditation/grounding',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/meditation/grounding',
  },
};

export default function GroundingIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <TreePine className='w-16 h-16 text-emerald-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Grounding Techniques
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Grounding connects you to the earth&apos;s stabilizing energy,
            helping you feel centered, present, and calm. Essential for empaths
            and after spiritual work.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Why Grounding Matters
          </h2>
          <p className='text-zinc-400 mb-4'>
            Grounding is the practice of connecting your energy to the earth.
            When we&apos;re ungrounded, we may feel spacey, anxious, scattered,
            or overwhelmed. Grounding brings us back to center.
          </p>
          <p className='text-zinc-400'>
            Grounding is especially important for: empaths and highly sensitive
            people, after meditation or spiritual work, during times of stress
            or anxiety, and when doing energy healing or magic.
          </p>
        </div>

        {/* Techniques Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Grounding Techniques
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {groundingTechniques.map((technique) => (
              <Link
                key={technique.slug}
                href={`/grimoire/meditation/grounding/${technique.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-emerald-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300'>
                    {technique.type}
                  </span>
                  <span className='text-xs text-zinc-400'>
                    {technique.time}
                  </span>
                </div>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-emerald-300 transition-colors mb-2'>
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
              Meditation
            </Link>
            <Link
              href='/grimoire/meditation/breathwork'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Breathwork
            </Link>
            <Link
              href='/grimoire/crystals'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Crystals
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
