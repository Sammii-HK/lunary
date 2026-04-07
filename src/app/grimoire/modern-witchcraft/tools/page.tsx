import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Wand2 } from 'lucide-react';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

// 30-day ISR revalidation
export const revalidate = 2592000;
const witchcraftTools = [
  {
    slug: 'athame',
    name: 'Athame',
    emoji: '🗡️',
    description: 'Ritual knife for directing energy',
    element: 'Fire/Air',
  },
  {
    slug: 'wand',
    name: 'Wand',
    emoji: '✨',
    description: 'Channel for directing magical energy',
    element: 'Fire/Air',
  },
  {
    slug: 'cauldron',
    name: 'Cauldron',
    emoji: '⚗️',
    description: 'Symbol of transformation and rebirth',
    element: 'Water',
  },
  {
    slug: 'chalice',
    name: 'Chalice',
    emoji: '🏆',
    description: 'Ritual cup representing the feminine',
    element: 'Water',
  },
  {
    slug: 'pentacle',
    name: 'Pentacle',
    emoji: '⭐',
    description: 'Five-pointed star, earth element tool',
    element: 'Earth',
  },
  {
    slug: 'besom',
    name: 'Besom (Broom)',
    emoji: '🧹',
    description: 'Cleansing tool for sacred space',
    element: 'Air',
  },
  {
    slug: 'candles',
    name: 'Candles',
    emoji: '🕯️',
    description: 'Fire element, spell focus',
    element: 'Fire',
  },
  {
    slug: 'crystals',
    name: 'Crystals',
    emoji: '💎',
    description: 'Natural energy amplifiers',
    element: 'Earth',
  },
  {
    slug: 'incense',
    name: 'Incense',
    emoji: '🌫️',
    description: 'Air element, cleansing, offerings',
    element: 'Air',
  },
  {
    slug: 'altar',
    name: 'Altar',
    emoji: '🛕',
    description: 'Sacred workspace for rituals',
    element: 'All',
  },
  {
    slug: 'book-of-shadows',
    name: 'Book of Shadows',
    emoji: '📕',
    description: 'Personal grimoire of spells and knowledge',
    element: 'Spirit',
  },
  {
    slug: 'tarot',
    name: 'Tarot/Oracle Cards',
    emoji: '🃏',
    description: 'Divination and guidance tools',
    element: 'Spirit',
  },
];

export const metadata: Metadata = {
  title: 'Witchcraft Tools: Athame, Wand, Cauldron & Altar Essentials - Lunary',
  description:
    'Learn about essential witchcraft tools from athame to wand. Understand their uses, symbolism, and how to incorporate them into your practice.',
  keywords: [
    'witchcraft tools',
    'athame',
    'wand',
    'cauldron',
    'altar tools',
    'magical tools',
  ],
  openGraph: {
    title: 'Witchcraft Tools Guide | Lunary',
    description: 'Learn about essential witchcraft tools and how to use them.',
    url: 'https://lunary.app/grimoire/modern-witchcraft/tools',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft/tools',
  },
};

export default function WitchcraftToolsIndexPage() {
  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Modern Witchcraft', url: '/grimoire/modern-witchcraft' },
    { name: 'Tools', url: '/grimoire/modern-witchcraft/tools' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Wand2 className='w-16 h-16 text-amber-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-content-primary mb-4'>
            Witchcraft Tools
          </h1>
          <p className='text-lg text-content-muted max-w-2xl mx-auto'>
            Tools are extensions of your will and help focus magical energy.
            Learn about traditional tools and how to use them in your practice.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-surface-elevated/50 border border-stroke-subtle rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-content-primary mb-3'>
            About Magical Tools
          </h2>
          <p className='text-content-muted mb-4'>
            While tools aren&apos;t strictly necessary (your intention is the
            real magic), they help focus energy and create sacred space. Many
            tools correspond to elements and directions.
          </p>
          <p className='text-content-muted'>
            Start simple — you don&apos;t need everything at once. Build your
            collection gradually as you discover what resonates with your
            practice.
          </p>
        </div>

        {/* Tools Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Essential Tools
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {witchcraftTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/grimoire/modern-witchcraft/tools/${tool.slug}`}
                className='group rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5 hover:bg-surface-elevated/50 hover:border-amber-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-3xl'>{tool.emoji}</span>
                  <span className='text-xs px-2 py-0.5 rounded bg-surface-card text-content-muted'>
                    {tool.element}
                  </span>
                </div>
                <h3 className='text-lg font-medium text-content-primary group-hover:text-amber-300 transition-colors mb-1'>
                  {tool.name}
                </h3>
                <p className='text-sm text-content-muted'>{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <div className='border-t border-stroke-subtle pt-8'>
          <h3 className='text-lg font-medium text-content-primary mb-4'>
            Explore More
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/modern-witchcraft'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Modern Witchcraft
            </Link>
            <Link
              href='/grimoire/modern-witchcraft/witch-types'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Witch Types
            </Link>
            <Link
              href='/grimoire/candle-magic'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Candle Magic
            </Link>
            <Link
              href='/grimoire/crystals'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Crystals
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
