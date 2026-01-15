import { Metadata } from 'next';
import Link from 'next/link';

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

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

const sections = (
  <>
    <div className='text-center mb-12'>
      <div className='flex justify-center gap-4 mb-4'>
        <span className='text-4xl font-astro text-emerald-400'>☊</span>
        <span className='text-4xl font-astro text-violet-400'>☋</span>
      </div>
      <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
        The Lunar Nodes are powerful points in your birth chart that reveal your
        soul&apos;s journey—where you&apos;ve been and where you&apos;re headed.
      </p>
    </div>

    <div
      id='understanding'
      className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
    >
      <h2 className='text-xl font-medium text-zinc-100 mb-3'>
        Understanding the Lunar Nodes
      </h2>
      <p className='text-zinc-400 mb-4'>
        The Lunar Nodes are the points where the Moon&apos;s orbit crosses the
        ecliptic (the Sun&apos;s apparent path). They are always exactly
        opposite each other in the zodiac and move backward through the signs
        over an 18.6-year cycle.
      </p>
      <p className='text-zinc-400'>
        In Vedic astrology, they are called Rahu (North Node) and Ketu (South
        Node) and are considered shadow planets with powerful karmic
        significance.
      </p>
    </div>

    <section id='two-nodes' className='mb-12'>
      <h2 className='text-2xl font-medium text-zinc-100 mb-6'>The Two Nodes</h2>
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
                className={`text-4xl font-astro ${
                  node.slug === 'north-node'
                    ? 'text-emerald-400'
                    : 'text-violet-400'
                }`}
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

    <section
      id='together'
      className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
    >
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
              Points to what your soul wants to develop and experience in this
              life. It may feel uncomfortable at first but leads to growth and
              fulfillment.
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
              Represents skills and patterns from past lives. While comfortable,
              over-reliance on South Node energy can hold you back from growth.
            </p>
          </div>
        </div>
      </div>
    </section>

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
  </>
);

export default function LunarNodesIndexPage() {
  const heroContent = (
    <div className='text-center mb-8'>
      <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
        The Lunar Nodes reveal your soul&apos;s path: what to release and where
        you are headed next.
      </p>
    </div>
  );

  const meaning = `The Lunar Nodes are not physical bodies—they’re points where the Moon’s path crosses the Sun’s path (the ecliptic). In astrology, they describe the tension between **habit** and **growth**.\n\n- **South Node**: what’s familiar—skills, instincts, coping patterns, and comfort zones\n- **North Node**: what pulls you forward—new lessons, risks, and the direction your life evolves through\n\nThe goal isn’t to reject the South Node. It’s to **use it as a foundation** while intentionally practicing the North Node traits—especially when life feels stuck or repetitive.\n\nNodes become extra loud during eclipses (which happen near the nodes). If you’re navigating a major transition, your nodes can be a powerful “compass” for what to choose next.\n\nA simple way to work with the nodes is to notice where you default under stress (South Node) and choose one small behavior that aligns with growth (North Node). This makes the change practical and repeatable.\n\nWhen you repeat the North Node choice over time, the unfamiliar becomes natural. That is the long arc of node work. Use the nodes as a gentle compass rather than a strict rulebook.`;

  const howToWorkWith = [
    'Find your North Node sign + house: that’s the arena where growth happens through repetition and practice.',
    'Find your South Node sign + house: notice your default pattern—especially under stress.',
    'Choose one North Node behavior to practice weekly (communication, boundaries, leadership, vulnerability, etc.).',
    'During eclipse seasons, review the last 6 months and notice what’s ending vs opening—then choose the more honest path forward.',
  ];

  const faqs = [
    {
      question: 'What do the North Node and South Node mean?',
      answer:
        'The South Node describes familiar patterns and talents; the North Node describes growth direction and life lessons. Together, they map your “comfort zone vs evolution” axis.',
    },
    {
      question: 'Is the North Node always “good” and the South Node “bad”?',
      answer:
        'No. The South Node contains real strengths. The key is balance: don’t over-rely on what’s comfortable, and don’t force growth without grounding.',
    },
    {
      question: 'Do I need my birth time for the lunar nodes?',
      answer:
        'Birth time helps most for houses and angles. The node sign changes less frequently than the Moon, so you can usually get the correct sign with birth date alone—but accurate house placement needs birth time.',
    },
    {
      question: 'How are lunar nodes connected to eclipses?',
      answer:
        'Eclipses happen when the Sun and Moon align near the lunar nodes. That’s why eclipse seasons often correlate with “fated” feeling shifts, endings, and growth moments.',
    },
  ];

  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Lunar Nodes'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/lunar-nodes'
      }
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Lunar Nodes' },
      ]}
      heroContent={heroContent}
      intro='The Lunar Nodes (North Node and South Node) describe your growth axis: what you’re moving toward, and what you’re learning to release.'
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      rituals={[
        'Write one South Node pattern you are ready to release.',
        'Choose one North Node habit to practice weekly.',
        'Track one small win each time you choose growth.',
      ]}
      journalPrompts={[
        'Where do I default when I feel stressed?',
        'What would growth look like in one specific area?',
        'What support do I need to follow my North Node?',
        'What lesson keeps repeating until I respond differently?',
      ]}
      tables={[
        {
          title: 'Node Axis Snapshot',
          headers: ['Node', 'Focus'],
          rows: [
            ['South Node', 'Instincts and familiar patterns'],
            ['North Node', 'Growth edge and future direction'],
          ],
        },
      ]}
      faqs={faqs}
      tableOfContents={[
        { label: 'Understanding the Lunar Nodes', href: '#understanding' },
        { label: 'The Two Nodes', href: '#two-nodes' },
        { label: 'How the Nodes Work Together', href: '#together' },
        { label: 'Meaning', href: '#meaning' },
        { label: 'How to Work With This Energy', href: '#how-to-work' },
        { label: 'FAQ', href: '#faq' },
      ]}
      internalLinks={[
        { text: 'Birth Chart', href: '/birth-chart' },
        {
          text: 'Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
        { text: 'Houses Overview', href: '/grimoire/houses' },
        { text: 'Aspects', href: '/grimoire/aspects' },
        { text: 'Eclipses', href: '/grimoire/eclipses' },
      ]}
    >
      {sections}
    </SEOContentTemplate>
  );
}
