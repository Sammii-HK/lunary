import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Wand2 } from 'lucide-react';

const witchTypes = [
  {
    slug: 'green-witch',
    name: 'Green Witch',
    emoji: '🌿',
    description: 'Works with plants, herbs, and nature magic',
  },
  {
    slug: 'kitchen-witch',
    name: 'Kitchen Witch',
    emoji: '🍳',
    description: 'Practices magic through cooking and home',
  },
  {
    slug: 'hedge-witch',
    name: 'Hedge Witch',
    emoji: '🌙',
    description: 'Works between worlds, spirit communication',
  },
  {
    slug: 'sea-witch',
    name: 'Sea Witch',
    emoji: '🌊',
    description: 'Connected to ocean, water magic',
  },
  {
    slug: 'cosmic-witch',
    name: 'Cosmic Witch',
    emoji: '✨',
    description: 'Works with astrology, planets, stars',
  },
  {
    slug: 'crystal-witch',
    name: 'Crystal Witch',
    emoji: '💎',
    description: 'Uses crystals and stones in their practice',
  },
  {
    slug: 'eclectic-witch',
    name: 'Eclectic Witch',
    emoji: '🔮',
    description: 'Draws from multiple traditions',
  },
  {
    slug: 'hereditary-witch',
    name: 'Hereditary Witch',
    emoji: '👵',
    description: 'Family tradition passed down generations',
  },
  {
    slug: 'solitary-witch',
    name: 'Solitary Witch',
    emoji: '🧙‍♀️',
    description: 'Practices alone, self-initiated',
  },
  {
    slug: 'ceremonial-witch',
    name: 'Ceremonial Witch',
    emoji: '⭐',
    description: 'Formal ritual magic traditions',
  },
];

export const metadata: Metadata = {
  title: 'Types of Witches: Hedge, Kitchen, Green, Eclectic & More | Lunary',
  description:
    'Explore different types of witches and magical paths. From Green Witch to Cosmic Witch, find the practice that resonates with you.',
  keywords: [
    'types of witches',
    'witch types',
    'green witch',
    'kitchen witch',
    'hedge witch',
    'what kind of witch am i',
  ],
  openGraph: {
    title: 'Types of Witches | Lunary',
    description: 'Explore different types of witches and magical paths.',
    url: 'https://lunary.app/grimoire/modern-witchcraft/witch-types',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft/witch-types',
  },
};

export default function WitchTypesIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Wand2 className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Types of Witches
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            There are many paths in modern witchcraft. Explore different types
            to find the practice that resonates with your nature and interests.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Finding Your Path
          </h2>
          <p className='text-zinc-400 mb-4'>
            These categories aren&apos;t rigid boxes — most witches blend
            multiple types or evolve their practice over time. Think of them as
            starting points for exploration rather than fixed identities.
          </p>
          <p className='text-zinc-400'>
            You might feel drawn to one type immediately, or you might identify
            with several. Trust your intuition and let your practice develop
            organically.
          </p>
        </div>

        {/* Witch Types Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Explore Witch Types
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {witchTypes.map((witch) => (
              <Link
                key={witch.slug}
                href={`/grimoire/modern-witchcraft/witch-types/${witch.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <div className='flex items-center gap-4 mb-2'>
                  <span className='text-3xl'>{witch.emoji}</span>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                    {witch.name}
                  </h3>
                </div>
                <p className='text-sm text-zinc-400'>{witch.description}</p>
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
              href='/grimoire/modern-witchcraft'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Modern Witchcraft
            </Link>
            <Link
              href='/grimoire/modern-witchcraft/tools'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Witchcraft Tools
            </Link>
            <Link
              href='/grimoire/witchcraft-ethics'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Witchcraft Ethics
            </Link>
            <Link
              href='/grimoire/practices'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Spellcraft
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
