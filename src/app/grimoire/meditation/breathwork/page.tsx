import { Metadata } from 'next';
import Link from 'next/link';
import { Wind } from 'lucide-react';

const breathworkTechniques = [
  {
    slug: 'deep-belly-breathing',
    name: 'Deep Belly Breathing',
    aka: 'Diaphragmatic Breathing',
    description: 'Foundation technique for stress relief and relaxation',
    difficulty: 'Beginner',
  },
  {
    slug: 'box-breathing',
    name: 'Box Breathing',
    aka: '4-4-4-4 Breathing',
    description: 'Equal counts for inhale, hold, exhale, hold',
    difficulty: 'Beginner',
  },
  {
    slug: '4-7-8-breathing',
    name: '4-7-8 Breathing',
    aka: 'Relaxing Breath',
    description: 'Calming technique for sleep and anxiety',
    difficulty: 'Beginner',
  },
  {
    slug: 'alternate-nostril',
    name: 'Alternate Nostril Breathing',
    aka: 'Nadi Shodhana',
    description: 'Balances left and right brain hemispheres',
    difficulty: 'Intermediate',
  },
  {
    slug: 'breath-of-fire',
    name: 'Breath of Fire',
    aka: 'Kapalabhati',
    description: 'Energizing rapid breathing technique',
    difficulty: 'Intermediate',
  },
  {
    slug: 'holotropic-breathwork',
    name: 'Holotropic Breathwork',
    aka: 'Transformational Breathing',
    description: 'Intense practice for altered states',
    difficulty: 'Advanced',
  },
];

export const metadata: Metadata = {
  title: 'Breathwork Techniques: Complete Guide | Lunary',
  description:
    'Explore powerful breathwork techniques from deep belly breathing to advanced practices. Learn how conscious breathing can transform your mental and spiritual state.',
  keywords: [
    'breathwork',
    'breathing techniques',
    'pranayama',
    'box breathing',
    'meditation breathing',
  ],
  openGraph: {
    title: 'Breathwork Techniques | Lunary',
    description:
      'Explore powerful breathwork techniques for meditation and transformation.',
    url: 'https://lunary.app/grimoire/meditation/breathwork',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/meditation/breathwork',
  },
};

export default function BreathworkIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Wind className='w-16 h-16 text-cyan-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Breathwork Techniques
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Conscious breathing is one of the most powerful tools for
            transformation. Learn techniques to calm anxiety, increase energy,
            and access altered states.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            The Power of Breath
          </h2>
          <p className='text-zinc-400 mb-4'>
            Breathwork practices have been used for thousands of years across
            cultures — from yogic pranayama to modern therapeutic techniques.
            Conscious breathing directly affects your nervous system, allowing
            you to shift from stress to calm.
          </p>
          <p className='text-zinc-400'>
            Whether you&apos;re seeking relaxation, energy, mental clarity, or
            spiritual experience, there&apos;s a breathwork technique for you.
          </p>
        </div>

        {/* Techniques Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Breathwork Techniques
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {breathworkTechniques.map((technique) => (
              <Link
                key={technique.slug}
                href={`/grimoire/meditation/breathwork/${technique.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-cyan-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      technique.difficulty === 'Beginner'
                        ? 'bg-emerald-900/50 text-emerald-300'
                        : technique.difficulty === 'Intermediate'
                          ? 'bg-amber-900/50 text-amber-300'
                          : 'bg-red-900/50 text-red-300'
                    }`}
                  >
                    {technique.difficulty}
                  </span>
                </div>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-cyan-300 transition-colors mb-1'>
                  {technique.name}
                </h3>
                <p className='text-sm text-zinc-500 mb-2'>{technique.aka}</p>
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
      </div>
    </div>
  );
}
