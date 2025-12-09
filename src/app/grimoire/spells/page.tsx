import { Metadata } from 'next';
import Link from 'next/link';
import { Wand2 } from 'lucide-react';
import { spellDatabase, spellCategories } from '@/constants/grimoire/spells';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

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
  const spellListSchema = createItemListSchema({
    name: 'Spell Collection',
    description:
      'Curated collection of spells for protection, love, prosperity, healing, and magical practice.',
    url: 'https://lunary.app/grimoire/spells',
    items: spellDatabase.slice(0, 20).map((spell) => ({
      name: spell.title,
      url: `https://lunary.app/grimoire/spells/${spell.id}`,
      description: spell.description,
    })),
  });

  return (
    <>
      {renderJsonLd(spellListSchema)}
      <SEOContentTemplate
        title='Spells: Complete Spell Collection'
        h1='Spells'
        description='Explore our curated collection of spells. Each includes detailed instructions, materials, correspondences, and guidance for safe, ethical practice.'
        keywords={[
          'spells',
          'magic spells',
          'witchcraft spells',
          'protection spells',
          'love spells',
        ]}
        canonicalUrl='https://lunary.app/grimoire/spells'
        whatIs={{
          question: 'What are spells in witchcraft?',
          answer:
            'Spells are focused rituals that combine intention, symbolism, and energy to create change. They use tools like candles, herbs, crystals, and spoken words to direct willpower toward a specific goal. Effective spellwork requires clear intention, appropriate timing (like moon phases), and ethical consideration of the outcome.',
        }}
        tldr='Spells combine intention, symbolism, and energy to create change. Key elements: clear intention, appropriate materials, timing (moon phases, planetary hours), and ethical practice. Always read through a spell completely before starting and gather all materials first.'
        intro='Spellwork requires intention, focus, and respect for magical practice. Always read through a spell completely before starting, gather your materials, and create sacred space. Remember that magic works best when aligned with ethical principles and genuine need.'
        faqs={[
          {
            question: 'Do spells really work?',
            answer:
              'Spells work by focusing intention and energy toward a goal. They work best when combined with practical action, clear intention, appropriate timing, and genuine need. Results depend on factors including your belief, the spell construction, and alignment with natural energies.',
          },
          {
            question: 'What do I need to cast a spell?',
            answer:
              'Basic spellwork requires intention and focus. Many spells use tools like candles, herbs, crystals, or written words to help focus energy. The most important element is your clear intention and genuine need.',
          },
          {
            question: 'When is the best time to cast spells?',
            answer:
              'Timing matters in magic. New moons favor beginnings and manifestation; full moons favor completion and release. Planetary hours and days add power (Venus for love, Mars for courage). However, urgent needs can override ideal timing.',
          },
        ]}
        relatedItems={[
          {
            name: 'Spellcraft Fundamentals',
            href: '/grimoire/spellcraft-fundamentals',
            type: 'guide',
          },
          {
            name: 'Candle Magic',
            href: '/grimoire/candle-magic',
            type: 'practice',
          },
          {
            name: 'Correspondences',
            href: '/grimoire/correspondences',
            type: 'reference',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'timing',
          },
        ]}
      >
        <div className='space-y-12'>
          <section>
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
            <section>
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
        </div>
      </SEOContentTemplate>
    </>
  );
}
