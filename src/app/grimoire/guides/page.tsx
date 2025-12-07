import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Complete Astrology & Spiritual Guides - Lunary',
  description:
    'In-depth guides to astrology, tarot, crystals, and moon phases. Comprehensive pillar content for beginners and advanced practitioners. Your complete reference library.',
  keywords: [
    'astrology guides',
    'tarot guide',
    'crystal healing guide',
    'moon phases guide',
    'birth chart guide',
    'complete astrology',
    'spiritual guides',
  ],
  openGraph: {
    title: 'Complete Astrology & Spiritual Guides - Lunary',
    description:
      'In-depth guides to astrology, tarot, crystals, and moon phases.',
    url: 'https://lunary.app/grimoire/guides',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/guides',
  },
};

const GUIDES = [
  {
    title: 'Birth Chart: The Complete Guide',
    slug: 'birth-chart-complete-guide',
    description:
      'Everything you need to know about natal charts. Learn to read planetary placements, houses, aspects, and interpret your cosmic blueprint.',
    icon: '🌟',
    wordCount: '5,000+',
    topics: [
      'Planetary placements',
      'House meanings',
      'Aspect interpretation',
      'The Big Three',
    ],
  },
  {
    title: 'Tarot: The Complete 78-Card Guide',
    slug: 'tarot-complete-guide',
    description:
      'Master all 78 tarot cards. Comprehensive meanings for Major and Minor Arcana, spreads, reading techniques, and interpretation methods.',
    icon: '🎴',
    wordCount: '8,000+',
    topics: [
      'Major Arcana meanings',
      'Minor Arcana suits',
      'Tarot spreads',
      'Reading techniques',
    ],
  },
  {
    title: 'Crystal Healing: Complete Guide',
    slug: 'crystal-healing-guide',
    description:
      'Discover the healing properties of crystals. Learn cleansing, charging, and using crystals for meditation, healing, and manifestation.',
    icon: '💎',
    wordCount: '6,000+',
    topics: [
      'Crystal properties',
      'Cleansing methods',
      'Chakra correspondences',
      'Crystal grids',
    ],
  },
  {
    title: 'Moon Phases: Complete Guide',
    slug: 'moon-phases-guide',
    description:
      'Master lunar cycles and rituals. Learn the meaning of each phase, manifestation timing, and how to align your life with the Moon.',
    icon: '🌙',
    wordCount: '7,000+',
    topics: [
      'Phase meanings',
      'Moon rituals',
      'Manifestation timing',
      'Full moon names',
    ],
  },
];

export default function GuidesIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-5xl mx-auto px-4 py-12'>
        {/* Breadcrumbs */}
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>Complete Guides</span>
        </nav>

        {/* Header */}
        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
            Complete Guides
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed max-w-3xl'>
            In-depth pillar content covering the essential topics in astrology
            and spiritual practice. Each guide is designed to take you from
            beginner to confident practitioner.
          </p>
        </header>

        {/* Guide Cards */}
        <div className='grid md:grid-cols-2 gap-6'>
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/grimoire/guides/${guide.slug}`}
              className='group block p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-purple-500/50 transition-all duration-300'
            >
              <div className='flex items-start gap-4'>
                <span className='text-4xl'>{guide.icon}</span>
                <div className='flex-1'>
                  <h2 className='text-xl font-medium text-zinc-100 group-hover:text-purple-300 transition-colors mb-2'>
                    {guide.title}
                  </h2>
                  <p className='text-zinc-400 text-sm mb-4'>
                    {guide.description}
                  </p>
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {guide.topics.map((topic) => (
                      <span
                        key={topic}
                        className='text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400'
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-zinc-500'>
                      {guide.wordCount} words
                    </span>
                    <span className='text-purple-400 text-sm group-hover:translate-x-1 transition-transform'>
                      Read guide →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* What's in a Guide */}
        <section className='mt-16 p-8 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h2 className='text-2xl font-light text-zinc-100 mb-6'>
            What Makes These Guides Complete?
          </h2>
          <div className='grid md:grid-cols-3 gap-6'>
            <div>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Comprehensive Coverage
              </h3>
              <p className='text-sm text-zinc-400'>
                Each guide covers the topic from foundations to advanced
                concepts, so you never need to look elsewhere.
              </p>
            </div>
            <div>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Practical Application
              </h3>
              <p className='text-sm text-zinc-400'>
                Beyond theory, each guide includes actionable techniques,
                rituals, and exercises you can use immediately.
              </p>
            </div>
            <div>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Cross-Referenced
              </h3>
              <p className='text-sm text-zinc-400'>
                Guides link to related grimoire entries, giving you a complete
                web of interconnected knowledge.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='mt-12 text-center'>
          <p className='text-zinc-400 mb-4'>
            Want personalized insights based on your birth chart?
          </p>
          <Link
            href='/birth-chart'
            className='inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Calculate Your Birth Chart Free
          </Link>
        </section>
      </div>
    </div>
  );
}
