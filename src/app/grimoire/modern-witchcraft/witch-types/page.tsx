import { Metadata } from 'next';
import Link from 'next/link';
import { Wand2 } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
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
  const tableOfContents = [
    { label: 'What Types of Witches Means', href: '#what-witch-types-means' },
    { label: 'Explore Witch Types', href: '#explore-witch-types' },
    { label: 'You Don’t Have to Pick One Path', href: '#mix-paths' },
    { label: 'Continue Exploring', href: '#continue-exploring' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Wand2 className='w-16 h-16 text-violet-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        There are many paths in modern witchcraft. Explore different types to
        find the practice that resonates with your nature and interests.
      </p>
    </div>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Types of Witches'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/modern-witchcraft/witch-types'
        }
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { label: 'Witch Types' },
        ]}
      >
        <section id='what-witch-types-means' className='mb-10'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            What "Types of Witches" Actually Means
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            When people ask "what type of witch am I?" they’re usually looking
            for a way to understand their natural affinities and interests
            within the vast world of magical practice. These categories describe
            where a practitioner focuses their energy—not who they are as a
            person.
          </p>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            A "Green Witch" feels called to work with plants and herbs. A
            "Cosmic Witch" is drawn to astrology and planetary magic. A "Kitchen
            Witch" weaves magic into everyday domestic life. These are
            orientations, not limitations.
          </p>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Important Context
            </h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                • These categories are modern constructs—most historical witches
                simply practiced what worked for them.
              </li>
              <li>
                • Labels are tools for exploration, not boxes to confine
                yourself to.
              </li>
              <li>
                • Your practice will likely evolve over time, and that’s
                completely normal.
              </li>
              <li>
                • Some traditions have specific initiatory paths; these
                descriptions focus on self-defined practice.
              </li>
            </ul>
          </div>
        </section>

        <section id='explore-witch-types' className='mb-12'>
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

        <section id='mix-paths' className='mb-10'>
          <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
            <h2 className='text-xl font-medium text-lunary-primary-300 mb-3'>
              You Don’t Have to Pick Just One Path
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Many practitioners identify with multiple types, and most blend
              techniques from various paths. You might be a "Cosmic Kitchen
              Witch" who uses planetary timing while baking, or a "Green Hedge
              Witch" who works with herbs and spirit communication.
            </p>
            <p className='text-zinc-400 text-sm'>
              The most important thing is not the label—it’s developing a
              practice that feels authentic to you. Let your curiosity guide
              you, respect the traditions you draw from, and remember that every
              experienced witch was once a beginner figuring things out.
            </p>
          </div>
        </section>

        <section
          id='continue-exploring'
          className='border-t border-zinc-800 pt-8 mb-12'
        >
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
        </section>
      </SEOContentTemplate>
    </div>
  );
}
