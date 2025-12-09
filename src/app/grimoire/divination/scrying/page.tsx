import { Metadata } from 'next';
import Link from 'next/link';
import { Eye } from 'lucide-react';

const scryingMethods = [
  {
    slug: 'crystal-ball',
    name: 'Crystal Ball',
    description: 'Classic divination using a clear sphere to receive visions',
  },
  {
    slug: 'mirror',
    name: 'Mirror Scrying',
    description: 'Using a black mirror or reflective surface for visions',
  },
  {
    slug: 'water',
    name: 'Water Scrying',
    description: 'Gazing into still water to perceive images and messages',
  },
  {
    slug: 'fire',
    name: 'Fire Scrying',
    description: 'Reading flames and embers for divination and insight',
  },
  {
    slug: 'smoke',
    name: 'Smoke Scrying',
    description: 'Interpreting patterns in rising smoke from incense or fire',
  },
];

export const metadata: Metadata = {
  title: 'Scrying: Methods & Techniques | Lunary',
  description:
    'Learn different scrying methods for divination. From crystal ball gazing to mirror and water scrying, discover how to receive psychic visions.',
  keywords: [
    'scrying',
    'crystal ball',
    'mirror scrying',
    'water scrying',
    'divination methods',
    'psychic vision',
  ],
  openGraph: {
    title: 'Scrying Methods | Lunary',
    description:
      'Learn different scrying methods for divination and psychic vision.',
    url: 'https://lunary.app/grimoire/divination/scrying',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/divination/scrying',
  },
};

export default function ScryingIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Eye className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Scrying
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Scrying is the ancient practice of gazing into a reflective or
            translucent surface to receive psychic visions and messages.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            The Art of Scrying
          </h2>
          <p className='text-zinc-400 mb-4'>
            Scrying works by relaxing the conscious mind and allowing images to
            arise from the subconscious or psychic senses. The reflective
            surface serves as a focus point, not the source of the visions
            themselves.
          </p>
          <p className='text-zinc-400'>
            Success requires patience, practice, and the right mental state. A
            dimly lit room, relaxed breathing, and unfocused gaze help access
            the visionary state.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Scrying Methods
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {scryingMethods.map((method) => (
              <Link
                key={method.slug}
                href={`/grimoire/divination/scrying/${method.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-violet-300 transition-colors mb-2'>
                  {method.name}
                </h3>
                <p className='text-sm text-zinc-400'>{method.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/divination'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Divination Overview
            </Link>
            <Link
              href='/grimoire/divination/pendulum'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Pendulum
            </Link>
            <Link
              href='/grimoire/tarot'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Tarot
            </Link>
            <Link
              href='/grimoire/runes'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Runes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
