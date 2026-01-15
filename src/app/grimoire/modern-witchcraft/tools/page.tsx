import { Metadata } from 'next';
import Link from 'next/link';
import { Wand2 } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

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
  const tableOfContents = [
    { label: 'About Magical Tools', href: '#about-magical-tools' },
    { label: 'Essential Tools', href: '#essential-tools' },
    { label: 'Explore More', href: '#explore-more' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Wand2 className='w-16 h-16 text-amber-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Tools are extensions of your will and help focus magical energy. Learn
        about traditional tools and how to incorporate them into your witchcraft
        practice.
      </p>
    </div>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Witchcraft Tools'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/modern-witchcraft/tools'
        }
        intro='Witchcraft tools help you focus intention and create ritual structure. You do not need every tool to practice, but each item can deepen your work.'
        tldr='Tools are optional but useful. Start with one or two items that match your style and build from there.'
        meaning={`Magical tools are symbols of focus. They help you enter ritual space, direct energy, and create consistent practice. The tool matters less than your relationship with it.

Start with a candle, a journal, or a small altar. As your practice grows, add tools that support your goals. Keep them clean, stored respectfully, and used with intention.

You can also treat tools as training wheels. Use them to build focus, then notice how your intention carries the ritual even without them.

If a tool feels overwhelming, simplify. One well-used tool is more powerful than a shelf of unused items.

Let usefulness guide you more than aesthetics. A tool that supports your daily ritual is the best choice.`}
        howToWorkWith={[
          'Choose one tool and learn its traditional purpose.',
          'Use it consistently for a week to build familiarity.',
          'Notice how your focus changes with or without the tool.',
          'Cleanse and store it after each use.',
        ]}
        rituals={[
          'Cleanse a new tool with smoke or salt before first use.',
          'Dedicate one tool for a single purpose for a month.',
          'Set a short intention before each ritual.',
        ]}
        journalPrompts={[
          'Which tool feels most natural for me to use?',
          'What tool do I reach for when I need clarity?',
          'How can I keep my tools simple and intentional?',
        ]}
        tables={[
          {
            title: 'Tool Essentials',
            headers: ['Tool', 'Primary Use'],
            rows: [
              ['Candle', 'Focus and intention'],
              ['Altar', 'Sacred workspace'],
              ['Journal', 'Tracking and reflection'],
              ['Crystals', 'Amplifying energy'],
            ],
          },
          {
            title: 'Choosing Your First Tools',
            headers: ['Goal', 'Suggested Tool'],
            rows: [
              ['Clarity', 'Journal or tarot cards'],
              ['Protection', 'Salt or candle'],
              ['Grounding', 'Pentacle or stone'],
              ['Healing', 'Chalice or water bowl'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { text: 'Candle Magic', href: '/grimoire/candle-magic' },
          { text: 'Crystals', href: '/grimoire/crystals' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { label: 'Tools' },
        ]}
      >
        <section
          id='about-magical-tools'
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            About Magical Tools
          </h2>
          <p className='text-zinc-400 mb-4'>
            While tools aren&apos;t strictly necessary (your intention is the
            real magic), they help focus energy and create sacred space. Many
            tools correspond to elements and directions.
          </p>
          <p className='text-zinc-400'>
            Start simple — you don&apos;t need everything at once. Build your
            collection gradually as you discover what resonates with your
            practice.
          </p>
        </section>

        <section id='essential-tools' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Essential Tools
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {witchcraftTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/grimoire/modern-witchcraft/tools/${tool.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-3xl'>{tool.emoji}</span>
                  <span className='text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400'>
                    {tool.element}
                  </span>
                </div>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-1'>
                  {tool.name}
                </h3>
                <p className='text-sm text-zinc-400'>{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id='explore-more' className='border-t border-zinc-800 pt-8'>
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
              href='/grimoire/modern-witchcraft/witch-types'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Witch Types
            </Link>
            <Link
              href='/grimoire/candle-magic'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Candle Magic
            </Link>
            <Link
              href='/grimoire/crystals'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Crystals
            </Link>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
