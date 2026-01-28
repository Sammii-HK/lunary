import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
const lunarNodes = [
  {
    slug: 'north-node',
    name: 'North Node',
    symbol: '☊',
    aka: "Dragon's Head",
    description: "Your soul's purpose and destiny in this lifetime",
    themes: [
      'Soul purpose',
      'Destiny',
      'Growth direction',
      'Life lessons to learn',
      'Future evolution',
    ],
  },
  {
    slug: 'south-node',
    name: 'South Node',
    symbol: '☋',
    aka: "Dragon's Tail",
    description: 'Your past life karma and natural talents',
    themes: [
      'Past lives',
      'Karmic patterns',
      'Natural talents',
      'Comfort zone',
      'What to release',
    ],
  },
];

export const metadata: Metadata = {
  title: 'Lunar Nodes: North Node & South Node Guide | Lunary',
  description:
    'Discover the meaning of the Lunar Nodes in your birth chart. Learn about the North Node (your destiny) and South Node (your past) and how they shape your life path.',
  keywords: [
    'lunar nodes',
    'north node',
    'south node',
    'rahu',
    'ketu',
    'nodes of destiny',
  ],
  openGraph: {
    title: 'Lunar Nodes Guide | Lunary',
    description:
      'Discover the meaning of the North Node and South Node in your birth chart.',
    url: 'https://lunary.app/grimoire/lunar-nodes',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/lunar-nodes',
  },
};

export default function LunarNodesIndexPage() {
  const nodesListSchema = createItemListSchema({
    name: 'Lunar Nodes Guide',
    description:
      'Complete guide to the North Node and South Node in astrology.',
    url: 'https://lunary.app/grimoire/lunar-nodes',
    items: lunarNodes.map((node) => ({
      name: node.name,
      url: `https://lunary.app/grimoire/lunar-nodes/${node.slug}`,
      description: node.description,
    })),
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(nodesListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Lunar Nodes', url: '/grimoire/lunar-nodes' },
        ]),
      )}
      <div className='max-w-5xl mx-auto'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Lunar Nodes' },
          ]}
        />
        <div className='text-center mb-12'>
          <div className='flex justify-center gap-4 mb-4'>
            <span className='text-4xl font-astro text-emerald-400'>☊</span>
            <span className='text-4xl font-astro text-violet-400'>☋</span>
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Lunar Nodes
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            The Lunar Nodes are powerful points in your birth chart that reveal
            your soul&apos;s journey — where you&apos;ve been and where
            you&apos;re headed.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding the Lunar Nodes
          </h2>
          <p className='text-zinc-400 mb-4'>
            The Lunar Nodes are the points where the Moon&apos;s orbit crosses
            the ecliptic (the Sun&apos;s apparent path). They are always exactly
            opposite each other in the zodiac and move backward through the
            signs over an 18.6-year cycle.
          </p>
          <p className='text-zinc-400'>
            In Vedic astrology, they are called Rahu (North Node) and Ketu
            (South Node) and are considered shadow planets with powerful karmic
            significance.
          </p>
        </div>

        {/* Lunar Nodes */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            The Two Nodes
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {lunarNodes.map((node) => (
              <Link
                key={node.slug}
                href={`/grimoire/lunar-nodes/${node.slug}`}
                className={`group rounded-xl border p-6 transition-all ${
                  node.slug === 'north-node'
                    ? 'border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/30 hover:border-emerald-600'
                    : 'border-violet-900/50 bg-violet-950/20 hover:bg-violet-950/30 hover:border-violet-600'
                }`}
              >
                <div className='flex items-center gap-4 mb-4'>
                  <span
                    className={`text-4xl font-astro ${node.slug === 'north-node' ? 'text-emerald-400' : 'text-violet-400'}`}
                  >
                    {node.symbol}
                  </span>
                  <div>
                    <h3
                      className={`text-xl font-medium ${
                        node.slug === 'north-node'
                          ? 'text-zinc-100 group-hover:text-emerald-300'
                          : 'text-zinc-100 group-hover:text-violet-300'
                      } transition-colors`}
                    >
                      {node.name}
                    </h3>
                    <span className='text-sm text-zinc-400'>{node.aka}</span>
                  </div>
                </div>
                <p className='text-zinc-400 mb-4'>{node.description}</p>
                <div className='flex flex-wrap gap-2'>
                  {node.themes.map((theme) => (
                    <span
                      key={theme}
                      className={`text-xs px-2 py-1 rounded ${
                        node.slug === 'north-node'
                          ? 'bg-emerald-900/30 text-emerald-300/70'
                          : 'bg-violet-900/30 text-violet-300/70'
                      }`}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How They Work Together */}
        <section className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            How the Nodes Work Together
          </h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='flex gap-3'>
              <ArrowUpRight className='w-5 h-5 text-emerald-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='font-medium text-zinc-200 mb-1'>
                  North Node = Your Future
                </h3>
                <p className='text-sm text-zinc-400'>
                  Points to what your soul wants to develop and experience in
                  this life. It may feel uncomfortable at first but leads to
                  growth and fulfillment.
                </p>
              </div>
            </div>
            <div className='flex gap-3'>
              <ArrowDownLeft className='w-5 h-5 text-violet-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='font-medium text-zinc-200 mb-1'>
                  South Node = Your Past
                </h3>
                <p className='text-sm text-zinc-400'>
                  Represents skills and patterns from past lives. While
                  comfortable, over-reliance on South Node energy can hold you
                  back from growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More Astrology
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/birth-chart'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Birth Chart
            </Link>
            <Link
              href='/grimoire/houses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Houses
            </Link>
            <Link
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Aspects
            </Link>
            <Link
              href='/grimoire/numerology/karmic-debt'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Karmic Debt
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
