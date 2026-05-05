import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { Button } from '@/components/ui/button';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Astrology Learning Guides: Birth Charts, Houses & Moon Phases',
  description:
    'In-depth astrology learning paths for birth chart reading, planets, houses, aspects, decans, transits, and moon phase timing.',
  keywords: [
    'astrology guides',
    'birth chart guide',
    'chart reading guide',
    'houses astrology guide',
    'aspects astrology guide',
    'decans astrology',
    'moon phases guide',
    'planetary transits',
  ],
  openGraph: {
    title: 'Astrology Learning Guides: Birth Charts, Houses & Moon Phases',
    description:
      'Structured learning paths for birth chart reading, planets, houses, aspects, decans, transits, and moon phase timing.',
    url: 'https://lunary.app/grimoire/guides',
    images: [
      {
        url: '/api/og/grimoire/guides',
        width: 1200,
        height: 630,
        alt: 'Astrology Learning Guides - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrology Learning Guides: Learn Birth Chart Reading - Lunary',
    description:
      'Structured astrology learning paths for birth charts, houses, aspects, decans, transits, and moon phases.',
    images: ['/api/og/grimoire/guides'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/guides',
  },
};

const GUIDES = [
  {
    title: 'Learn to Read a Birth Chart',
    slug: 'learn-birth-chart',
    description:
      'A step-by-step astrology learning path: calculate your chart, read the Big Three, chart ruler, houses, aspects, decans, transits, and synthesis.',
    icon: '◎',
    wordCount: '4,000+',
    topics: [
      'Chart reading order',
      'Chart ruler',
      'Houses and aspects',
      'Synthesis method',
    ],
  },
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
  const guidesListSchema = createItemListSchema({
    name: 'Astrology Learning Guides',
    description:
      'Structured astrology learning paths and in-depth pillar content covering birth charts, planets, houses, aspects, decans, transits, and moon phases.',
    url: 'https://lunary.app/grimoire/guides',
    items: GUIDES.map((guide) => ({
      name: guide.title,
      url: `https://lunary.app/grimoire/guides/${guide.slug}`,
      description: guide.description,
    })),
  });

  return (
    <>
      {renderJsonLd(guidesListSchema)}
      <SEOContentTemplate
        title='Astrology Learning Guides: Learn Birth Chart Reading'
        h1='Astrology Learning Guides'
        description='Structured learning paths and in-depth pillar content covering birth charts, planets, houses, aspects, decans, transits, and moon phases. Each guide is designed to take you from beginner to confident chart reader.'
        keywords={[
          'astrology guides',
          'birth chart guide',
          'chart reading guide',
          'houses astrology',
          'aspects astrology',
          'moon phases guide',
        ]}
        canonicalUrl='https://lunary.app/grimoire/guides'
        whatIs={{
          question: 'What are these complete guides?',
          answer:
            'These complete guides are comprehensive, in-depth resources for learning astrology and chart reading. They cover foundations, calculation context, chart structure, interpretation order, and practical synthesis.',
        }}
        tldr='Start with the Learn to Read a Birth Chart path, then use the complete guides for deeper references: Birth Chart, Tarot, Crystal Healing, Moon Phases, and archetypes.'
        faqs={[
          {
            question: 'Are these guides suitable for beginners?',
            answer:
              "Absolutely. Each guide starts with foundational concepts and progressively covers more advanced material. Whether you're just starting or deepening existing knowledge, you'll find valuable content.",
          },
          {
            question: 'How are these different from other grimoire pages?',
            answer:
              'These are comprehensive pillar guides that teach full chart-reading systems. Regular grimoire pages explain specific placements, houses, signs, aspects, or timing concepts.',
          },
          {
            question: 'Can I use these guides for reference during readings?',
            answer:
              'Yes. These guides are designed as learning resources and ongoing references for birth chart interpretation, transit timing, house meanings, aspect patterns, and lunar cycles.',
          },
        ]}
        relatedItems={[
          {
            name: 'Learn to Read a Birth Chart',
            href: '/grimoire/guides/learn-birth-chart',
            type: 'learning path',
          },
          {
            name: 'Birth Chart Calculator',
            href: '/birth-chart',
            type: 'tool',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'reference',
          },
        ]}
      >
        <div className='space-y-12'>
          <div className='grid md:grid-cols-2 gap-6'>
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/grimoire/guides/${guide.slug}`}
                className='group block p-6 rounded-xl border border-stroke-subtle bg-surface-elevated/50 hover:bg-surface-elevated hover:border-lunary-primary-600 transition-all duration-300'
              >
                <div className='flex items-start gap-4'>
                  <span className='text-4xl'>{guide.icon}</span>
                  <div className='flex-1'>
                    <h2 className='text-xl font-medium text-content-primary group-hover:text-content-brand transition-colors mb-2'>
                      {guide.title}
                    </h2>
                    <p className='text-content-muted text-sm mb-4'>
                      {guide.description}
                    </p>
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {guide.topics.map((topic) => (
                        <span
                          key={topic}
                          className='text-xs px-2 py-1 rounded bg-surface-card text-content-muted'
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-content-muted'>
                        {guide.wordCount} words
                      </span>
                      <span className='text-lunary-primary-400 text-sm group-hover:translate-x-1 transition-transform'>
                        Read guide →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <section className='p-8 rounded-xl border border-stroke-subtle bg-surface-elevated/30'>
            <h2 className='text-2xl font-light text-content-primary mb-6'>
              What Makes These Guides Complete?
            </h2>
            <div className='grid md:grid-cols-3 gap-6'>
              <div>
                <h3 className='font-medium text-content-primary mb-2'>
                  Comprehensive Coverage
                </h3>
                <p className='text-sm text-content-muted'>
                  Each guide covers the topic from foundations to advanced
                  concepts, so you never need to look elsewhere.
                </p>
              </div>
              <div>
                <h3 className='font-medium text-content-primary mb-2'>
                  Practical Application
                </h3>
                <p className='text-sm text-content-muted'>
                  Beyond theory, each guide includes actionable techniques,
                  rituals, and exercises you can use immediately.
                </p>
              </div>
              <div>
                <h3 className='font-medium text-content-primary mb-2'>
                  Cross-Referenced
                </h3>
                <p className='text-sm text-content-muted'>
                  Guides link to related grimoire entries, giving you a complete
                  web of interconnected knowledge.
                </p>
              </div>
            </div>
          </section>

          <section className='text-center'>
            <p className='text-content-muted mb-4'>
              Want personalized insights based on your birth chart?
            </p>
            <Button asChild variant='lunary-solid' size='lg'>
              <Link href='/birth-chart'>Calculate Your Birth Chart Free</Link>
            </Button>
          </section>
        </div>
      </SEOContentTemplate>
    </>
  );
}
