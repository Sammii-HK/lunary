import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Wand2 } from 'lucide-react';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

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
  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Modern Witchcraft', url: '/grimoire/modern-witchcraft' },
    { name: 'Witch Types', url: '/grimoire/modern-witchcraft/witch-types' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
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

        {/* What Types of Witches Means */}
        <section className='mb-10'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            What &quot;Types of Witches&quot; Actually Means
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            When people ask &quot;what type of witch am I?&quot; they&apos;re
            usually looking for a way to understand their natural affinities and
            interests within the vast world of magical practice. These
            categories describe where a practitioner focuses their energy—not
            who they are as a person.
          </p>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            A &quot;Green Witch&quot; feels called to work with plants and
            herbs. A &quot;Cosmic Witch&quot; is drawn to astrology and
            planetary magic. A &quot;Kitchen Witch&quot; weaves magic into
            everyday domestic life. These are orientations, not limitations.
          </p>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Important Context
            </h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                • These categories are <strong>modern</strong> constructs—most
                historical witches simply practiced what worked for them.
              </li>
              <li>
                • Labels are tools for exploration, not boxes to confine
                yourself to.
              </li>
              <li>
                • Your practice will likely evolve over time, and that&apos;s
                completely normal.
              </li>
              <li>
                • Some traditions have specific initiatory paths; these
                descriptions focus on self-defined practice.
              </li>
            </ul>
          </div>
        </section>

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

        {/* You Don't Have to Pick Just One Path */}
        <section className='mb-10'>
          <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
            <h2 className='text-xl font-medium text-lunary-primary-300 mb-3'>
              You Don&apos;t Have to Pick Just One Path
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Many practitioners identify with multiple types, and most blend
              techniques from various paths. You might be a &quot;Cosmic Kitchen
              Witch&quot; who uses planetary timing while baking, or a
              &quot;Green Hedge Witch&quot; who works with herbs and spirit
              communication.
            </p>
            <p className='text-zinc-400 text-sm'>
              The most important thing is not the label—it&apos;s developing a
              practice that feels authentic to you. Let your curiosity guide
              you, respect the traditions you draw from, and remember that every
              experienced witch was once a beginner figuring things out.
            </p>
          </div>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Continue Exploring
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/modern-witchcraft'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Modern Witchcraft Overview
            </Link>
            <Link
              href='/grimoire/modern-witchcraft/ethics'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Witchcraft Ethics
            </Link>
            <Link
              href='/grimoire/beginners'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Beginners Guide
            </Link>
            <Link
              href='/grimoire/spells/fundamentals'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Spellcraft Fundamentals
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
