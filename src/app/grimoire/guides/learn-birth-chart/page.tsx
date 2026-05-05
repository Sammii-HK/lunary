export const revalidate = 2592000;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleWithSpeakableSchema,
  createBreadcrumbSchema,
  createFAQPageSchema,
  createItemListSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';

export const metadata: Metadata = {
  title: 'Learn to Read a Birth Chart: Step-by-Step Astrology Path | Lunary',
  description:
    'Learn how to read a birth chart in the right order: Big Three, chart ruler, planets, signs, houses, aspects, decans, transits, and synthesis.',
  keywords: [
    'learn birth chart',
    'how to read a birth chart',
    'birth chart learning path',
    'learn astrology chart reading',
    'astrology for beginners',
    'chart ruler',
    'houses and aspects',
    'natal chart reading',
  ],
  openGraph: {
    title: 'Learn to Read a Birth Chart: Step-by-Step Astrology Path | Lunary',
    description:
      'A practical learning path for reading birth charts with planets, signs, houses, aspects, decans, and transits.',
    url: 'https://lunary.app/grimoire/guides/learn-birth-chart',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: 'https://lunary.app/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Learn to read a birth chart with Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn to Read a Birth Chart | Lunary',
    description:
      'A step-by-step astrology learning path from Big Three to chart synthesis.',
    images: ['https://lunary.app/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/guides/learn-birth-chart',
  },
};

const lessons = [
  {
    title: 'Calculate the chart accurately',
    href: '/grimoire/birth-chart',
    focus: 'Birth time, location, zodiac system, house system',
    outcome:
      'You know what data the chart depends on and why the Ascendant changes quickly.',
  },
  {
    title: 'Start with the Big Three',
    href: '/grimoire/rising',
    focus: 'Sun, Moon, Rising, chart angles',
    outcome:
      'You can separate core identity, emotional needs, and the way the chart enters life.',
  },
  {
    title: 'Find the chart ruler',
    href: '/grimoire/rising',
    focus: 'Ascendant ruler, house placement, planetary condition',
    outcome:
      'You can identify the planet that carries the chart and see where it is working.',
  },
  {
    title: 'Read planets by sign',
    href: '/grimoire/placements',
    focus: 'Planet function plus zodiac style',
    outcome:
      'You stop reading signs as personality boxes and start reading planetary expression.',
  },
  {
    title: 'Read planets by house',
    href: '/grimoire/houses',
    focus: 'Life area, angularity, topics, house rulers',
    outcome:
      'You can explain where a placement becomes visible in ordinary life.',
  },
  {
    title: 'Layer in aspects',
    href: '/grimoire/aspects',
    focus: 'Angles, orbs, support, tension, repetition',
    outcome:
      'You can see how different parts of the chart cooperate, clash, or repeat a theme.',
  },
  {
    title: 'Refine with decans',
    href: '/grimoire/decans',
    focus: 'Ten-degree subdivisions inside each sign',
    outcome:
      'You can add nuance when two people share the same sign but express it differently.',
  },
  {
    title: 'Use the current sky',
    href: '/grimoire/astrology/sky-now',
    focus: 'Current planets, retrogrades, transits, timing',
    outcome:
      'You can connect a natal chart to what is being activated right now.',
  },
  {
    title: 'Synthesize the chart',
    href: '/grimoire/guides/birth-chart-complete-guide',
    focus: 'Repeating patterns, rulers, angles, chart story',
    outcome:
      'You can turn separate placements into a coherent reading instead of a keyword list.',
  },
];

const faqs = [
  {
    question: 'What is the best order to learn astrology chart reading?',
    answer:
      'Start with accurate chart calculation, then learn the Big Three, chart ruler, planets, signs, houses, aspects, decans, and transits. The order matters because later techniques depend on earlier context.',
  },
  {
    question: 'Can I read a birth chart without knowing every placement?',
    answer:
      'Yes. A useful reading starts with the strongest structure: angles, Big Three, chart ruler, house emphasis, and repeated aspect patterns. You do not need to interpret every placement with equal weight.',
  },
  {
    question: 'Why does Lunary focus on houses and aspects so much?',
    answer:
      'Signs describe style, but houses show life area and aspects show relationships between planets. Without houses and aspects, chart reading becomes too generic.',
  },
  {
    question: 'How do transits fit into birth chart reading?',
    answer:
      'Transits compare the current sky to the natal chart. They show which natal placements are being activated, which is why current astrology is more useful when it is grounded in your birth chart.',
  },
];

export default function LearnBirthChartPage() {
  const articleSchema = createArticleWithSpeakableSchema({
    headline: 'Learn to Read a Birth Chart: Step-by-Step Astrology Path',
    description:
      'A practical learning path for reading birth charts in the right order.',
    url: 'https://lunary.app/grimoire/guides/learn-birth-chart',
    section: 'Astrology Guides',
    keywords: [
      'learn birth chart',
      'birth chart reading',
      'astrology learning path',
      'natal chart interpretation',
    ],
    speakableSections: ['h1', 'header p', '#method p', '#lessons h2'],
  });

  const itemListSchema = createItemListSchema({
    name: 'Birth Chart Reading Learning Path',
    description:
      'The recommended order for learning how to read a natal chart.',
    url: 'https://lunary.app/grimoire/guides/learn-birth-chart',
    items: lessons.map((lesson) => ({
      name: lesson.title,
      url: `https://lunary.app${lesson.href}`,
      description: lesson.outcome,
    })),
  });

  return (
    <main className='p-4 md:p-8 max-w-5xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(itemListSchema)}
      {renderJsonLd(createFAQPageSchema(faqs))}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Guides', url: '/grimoire/guides' },
          {
            name: 'Learn Birth Chart',
            url: '/grimoire/guides/learn-birth-chart',
          },
        ]),
      )}

      <nav className='text-sm text-content-muted mb-8'>
        <Link href='/grimoire' className='hover:text-lunary-primary-400'>
          Grimoire
        </Link>
        <span className='mx-2'>/</span>
        <Link href='/grimoire/guides' className='hover:text-lunary-primary-400'>
          Guides
        </Link>
        <span className='mx-2'>/</span>
        <span className='text-content-secondary'>Learn Birth Chart</span>
      </nav>

      <header className='mb-12'>
        <p className='text-sm uppercase tracking-[0.35em] text-content-muted mb-4'>
          Astrology learning path
        </p>
        <h1 className='text-4xl md:text-5xl font-light text-content-primary mb-6'>
          Learn to Read a Birth Chart
        </h1>
        <p className='text-xl text-content-muted leading-relaxed max-w-3xl mb-6'>
          A birth chart becomes readable when you follow an order. Lunary
          teaches chart reading as a method: calculate the chart, identify the
          main structure, read planets in context, then synthesize the repeated
          themes.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/birth-chart'>Calculate Your Chart</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='#lessons'>Start the Path</Link>
          </Button>
        </div>
      </header>

      <section
        id='method'
        className='mb-12 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-6'
      >
        <h2 className='text-2xl font-light text-content-primary mb-4'>
          The Method in One Sentence
        </h2>
        <p className='text-content-secondary leading-relaxed mb-4'>
          Read the chart from structure to detail: angles and chart ruler first,
          planets by sign and house second, aspects and repetition third, then
          decans, dignity, retrogrades, and timing as refinements.
        </p>
        <p className='text-sm text-content-muted'>
          Sources: Lunary calculation methodology, Astronomy Engine planetary
          calculations, traditional house and aspect doctrine, and the natal
          chart synthesis framework documented in Lunary&apos;s methodology.
        </p>
        <div className='mt-4 flex flex-wrap gap-3 text-sm'>
          <Link
            href='/about/methodology'
            className='text-content-brand hover:text-lunary-primary-300'
          >
            Calculation methodology
          </Link>
          <Link
            href='/grimoire/guides/birth-chart-complete-guide'
            className='text-content-brand hover:text-lunary-primary-300'
          >
            Complete birth chart guide
          </Link>
          <Link
            href='/grimoire/astrology/sky-now'
            className='text-content-brand hover:text-lunary-primary-300'
          >
            Current sky chart
          </Link>
        </div>
      </section>

      <section id='lessons' className='mb-12'>
        <h2 className='text-3xl font-light text-content-primary mb-6'>
          The Learning Path
        </h2>
        <div className='space-y-4'>
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.title}
              href={lesson.href}
              className='group block rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5 hover:border-lunary-primary-600 hover:bg-surface-elevated/50 transition-colors'
            >
              <div className='flex flex-col md:flex-row md:items-start gap-4'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stroke-subtle bg-surface-card text-content-secondary'>
                  {index + 1}
                </div>
                <div className='flex-1'>
                  <h3 className='text-xl font-medium text-content-primary group-hover:text-content-brand transition-colors mb-2'>
                    {lesson.title}
                  </h3>
                  <p className='text-sm text-content-muted mb-2'>
                    <strong className='text-content-secondary'>Focus:</strong>{' '}
                    {lesson.focus}
                  </p>
                  <p className='text-content-secondary'>{lesson.outcome}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className='mb-12 grid gap-4 md:grid-cols-3'>
        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5'>
          <h2 className='text-lg font-medium text-content-primary mb-2'>
            Avoid Keyword Reading
          </h2>
          <p className='text-sm text-content-muted'>
            A placement is not just a sign. Always ask which planet, which sign,
            which house, which ruler, and which aspects are involved.
          </p>
        </div>
        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5'>
          <h2 className='text-lg font-medium text-content-primary mb-2'>
            Weight the Chart
          </h2>
          <p className='text-sm text-content-muted'>
            Angles, chart ruler, stelliums, exact aspects, and repeated themes
            usually matter more than isolated minor details.
          </p>
        </div>
        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5'>
          <h2 className='text-lg font-medium text-content-primary mb-2'>
            Use Timing Carefully
          </h2>
          <p className='text-sm text-content-muted'>
            Transits do not replace the natal chart. They show which parts of
            the natal chart are being activated now.
          </p>
        </div>
      </section>

      <section className='mb-12 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-6'>
        <h2 className='text-2xl font-light text-content-primary mb-4'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-5'>
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className='font-medium text-content-primary mb-2'>
                {faq.question}
              </h3>
              <p className='text-content-muted'>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-12 rounded-xl border border-lunary-primary-700 bg-layer-base/10 p-6'>
        <h2 className='text-2xl font-light text-content-brand mb-3'>
          Start with Your Own Chart
        </h2>
        <p className='text-content-secondary mb-4'>
          The fastest way to learn is to read a real chart slowly. Calculate
          your chart, then work through this path one step at a time.
        </p>
        <Button asChild variant='lunary-solid'>
          <Link href='/birth-chart'>Calculate Your Birth Chart</Link>
        </Button>
      </section>

      <ExploreGrimoire />
    </main>
  );
}
