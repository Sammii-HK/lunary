import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Circle } from 'lucide-react';

const aspectTypes = [
  {
    slug: 'conjunction',
    name: 'Conjunction',
    symbol: '☌',
    degrees: '0°',
    nature: 'Neutral/Powerful',
    description:
      'Planets merge their energies, creating intensity and new beginnings',
  },
  {
    slug: 'opposition',
    name: 'Opposition',
    symbol: '☍',
    degrees: '180°',
    nature: 'Challenging',
    description:
      'Creates tension and awareness, requiring balance between opposing forces',
  },
  {
    slug: 'trine',
    name: 'Trine',
    symbol: '△',
    degrees: '120°',
    nature: 'Harmonious',
    description:
      'Natural talent and ease, gifts that flow effortlessly between planets',
  },
  {
    slug: 'square',
    name: 'Square',
    symbol: '□',
    degrees: '90°',
    nature: 'Challenging',
    description:
      'Creates friction and motivation, pushing for growth through obstacles',
  },
  {
    slug: 'sextile',
    name: 'Sextile',
    symbol: '⚹',
    degrees: '60°',
    nature: 'Harmonious',
    description:
      'Opportunities and cooperation, requiring effort to activate the potential',
  },
];

export const metadata: Metadata = {
  title: 'Astrological Aspects: Types & Meanings | Lunary',
  description:
    'Learn about the five major aspects in astrology: Conjunction, Opposition, Trine, Square, and Sextile. Understand how planetary relationships shape your chart.',
  keywords: [
    'astrological aspects',
    'conjunction',
    'opposition',
    'trine',
    'square',
    'sextile',
    'aspect meanings',
  ],
  openGraph: {
    title: 'Astrological Aspects | Lunary',
    description:
      'Learn about the five major aspects and how planetary relationships work.',
    url: 'https://lunary.app/grimoire/aspects/types',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/aspects/types',
  },
};

export default function AspectTypesIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Circle className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Astrological Aspects
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Aspects describe the angular relationships between planets. They
            reveal how different parts of your chart interact and influence each
            other.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding Aspects
          </h2>
          <p className='text-zinc-400'>
            The five major aspects are based on geometric divisions of the
            circle. Hard aspects (Square, Opposition) create tension and drive
            change. Soft aspects (Trine, Sextile) bring harmony and ease.
            Conjunctions intensify and merge energies.
          </p>
        </div>

        <section className='mb-12'>
          <div className='space-y-4'>
            {aspectTypes.map((aspect) => (
              <Link
                key={aspect.slug}
                href={`/grimoire/aspects/types/${aspect.slug}`}
                className='group block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='flex items-center gap-4 mb-3'>
                  <span className='text-3xl'>{aspect.symbol}</span>
                  <div>
                    <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                      {aspect.name}
                    </h3>
                    <div className='flex items-center gap-3 text-sm text-zinc-400'>
                      <span>{aspect.degrees}</span>
                      <span>•</span>
                      <span>{aspect.nature}</span>
                    </div>
                  </div>
                </div>
                <p className='text-sm text-zinc-400'>{aspect.description}</p>
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
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Aspects
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Planets
            </Link>
            <Link
              href='/grimoire/houses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Houses
            </Link>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
            >
              Calculate Your Chart
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
