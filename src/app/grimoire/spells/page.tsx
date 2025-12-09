import { Metadata } from 'next';
import Link from 'next/link';
import { Wand2 } from 'lucide-react';
import { spellDatabase, spellCategories } from '@/constants/grimoire/spells';

export const metadata: Metadata = {
  title: 'Spells: Complete Spell Collection | Lunary',
  description:
    'Explore our collection of spells for protection, love, prosperity, healing, and more. Find detailed instructions, correspondences, and guidance for your magical practice.',
  keywords: [
    'spells',
    'magic spells',
    'witchcraft spells',
    'protection spells',
    'love spells',
    'healing spells',
    'spell collection',
  ],
  openGraph: {
    title: 'Spell Collection | Lunary',
    description:
      'Explore our collection of spells for protection, love, prosperity, healing, and more.',
    url: 'https://lunary.app/grimoire/spells',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/spells',
  },
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-emerald-400 bg-emerald-900/20',
  intermediate: 'text-amber-400 bg-amber-900/20',
  advanced: 'text-orange-400 bg-orange-900/20',
  master: 'text-red-400 bg-red-900/20',
};

export default function SpellsIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Wand2 className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Spells
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Explore our curated collection of spells. Each includes detailed
            instructions, materials, correspondences, and guidance for safe,
            ethical practice.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Before You Begin
          </h2>
          <p className='text-zinc-400 mb-4'>
            Spellwork requires intention, focus, and respect for magical
            practice. Always read through a spell completely before starting,
            gather your materials, and create sacred space. Remember that magic
            works best when aligned with ethical principles and genuine need.
          </p>
          <Link
            href='/grimoire/spellcraft-fundamentals'
            className='text-violet-400 hover:text-violet-300 text-sm'
          >
            Learn Spellcraft Fundamentals →
          </Link>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Spell Categories
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Object.entries(spellCategories).map(([key, category]) => (
              <div
                key={key}
                className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                  {category.name}
                </h3>
                <p className='text-sm text-zinc-400 mb-3'>
                  {category.description}
                </p>
                <div className='flex flex-wrap gap-1'>
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className='text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded'
                    >
                      {sub.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {spellDatabase.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Featured Spells
            </h2>
            <div className='space-y-4'>
              {spellDatabase.slice(0, 5).map((spell) => (
                <Link
                  key={spell.id}
                  href={`/grimoire/spells/${spell.id}`}
                  className='group block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                      {spell.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${difficultyColors[spell.difficulty]}`}
                    >
                      {spell.difficulty}
                    </span>
                  </div>
                  <p className='text-sm text-zinc-400 mb-3'>
                    {spell.description}
                  </p>
                  <div className='flex items-center gap-4 text-xs text-zinc-500'>
                    <span>{spell.duration}</span>
                    <span>{spell.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/spellcraft-fundamentals'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Spellcraft Fundamentals
            </Link>
            <Link
              href='/grimoire/practices'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Practices
            </Link>
            <Link
              href='/grimoire/candle-magic'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Candle Magic
            </Link>
            <Link
              href='/grimoire/correspondences'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Correspondences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
