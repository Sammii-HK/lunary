export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

const faqs = [
  {
    question: 'Do I need to use essential oils?',
    answer:
      'Essential oils are traditional and powerful, but you can also use carrier oils infused with herbs, or even simple olive oil with intention. The important thing is the intention and the act of anointing, not necessarily the specific oil.',
  },
  {
    question: 'How much oil should I use?',
    answer:
      'A little goes a long way. Use just enough to lightly coat the candle—too much can be a fire hazard. A few drops of essential oil or a thin layer of carrier oil is usually sufficient.',
  },
  {
    question: 'Can I combine multiple oils?',
    answer:
      'Yes! You can blend oils that complement each other. For example, combine rose and jasmine for love spells, or frankincense and sandalwood for protection and spirituality. Just ensure the oils work well together energetically.',
  },
];

const tableOfContents = [
  { label: 'Why Anoint Candles', href: '#why-anoint' },
  { label: 'Anointing Techniques', href: '#techniques' },
  { label: 'Essential Oils', href: '#oils' },
  { label: 'Ritual Tips', href: '#tips' },
  { label: 'Safety & Storage', href: '#safety' },
  { label: 'FAQ', href: '#faq' },
];

const relatedItems = [
  {
    name: 'Candle Incantations',
    href: '/grimoire/candle-magic/incantations',
    type: 'Spells',
  },
  {
    name: 'Lighting Candles on the Altar',
    href: '/grimoire/candle-magic/altar-lighting',
    type: 'Ritual Order',
  },
  {
    name: 'Color Correspondences',
    href: '/grimoire/correspondences/colors',
    type: 'Correspondences',
  },
];

const cosmicSections: CosmicConnectionSection[] = [
  {
    title: 'Candle Practice',
    links: [
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Candle Colors', href: '/grimoire/candle-magic/colors' },
      {
        label: 'Altar Lighting',
        href: '/grimoire/candle-magic/altar-lighting',
      },
    ],
  },
  {
    title: 'Magical Tools',
    links: [
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Jar Spells', href: '/grimoire/jar-spells' },
    ],
  },
];

const sectionContent = (
  <div className='space-y-10'>
    <section id='why-anoint' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>Why Anoint Candles?</h2>
      <p className='text-zinc-300 leading-relaxed'>
        Anointing puts your intention directly into the candle. The oil carries
        its own correspondences, turning the candle into a living sigil for your
        spell work.
      </p>
    </section>

    <section id='techniques' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Anointing Techniques
      </h2>
      <ol className='list-decimal list-inside text-sm text-zinc-300 space-y-2'>
        <li>
          Choose an oil that matches your intention (love, protection,
          prosperity, etc.).
        </li>
        <li>
          Anoint from center outward to draw energy in or ends to center to push
          energy away.
        </li>
        <li>Visualize and speak your intention as the oil meets wax.</li>
        <li>
          Carve symbols or words before, during, or after anointing for added
          focus.
        </li>
        <li>
          Use carrier oils for dilution when needed and always store charged
          candles safely.
        </li>
      </ol>
    </section>

    <section id='oils' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Essential Oils & Intentions
      </h2>
      <div className='grid gap-4 md:grid-cols-2'>
        {[
          { oil: 'Lavender', use: 'Peace, healing, sleep' },
          { oil: 'Rose', use: 'Love, romance, self-love' },
          { oil: 'Jasmine', use: 'Psychic ability, sensuality' },
          {
            oil: 'Frankincense',
            use: 'Protection, purification, spirituality',
          },
          { oil: 'Patchouli', use: 'Prosperity, grounding, attraction' },
          { oil: 'Sandalwood', use: 'Meditation, protection, spirituality' },
        ].map((item) => (
          <article
            key={item.oil}
            className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
          >
            <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
              {item.oil}
            </h3>
            <p className='text-sm text-zinc-300'>{item.use}</p>
          </article>
        ))}
      </div>
    </section>

    <section id='tips' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>Ritual Tips</h2>
      <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
        <li>
          Tell a story about your intention while anointing to anchor meaning.
        </li>
        <li>
          Keep the oils near your practice area to scent the space when needed.
        </li>
        <li>
          Respect fire safety—let the oil soak in before lighting and never let
          it pool.
        </li>
        <li>
          Wrap anointed candles in cloth or a bag to keep them charged until
          use.
        </li>
      </ul>
      <p className='text-sm text-zinc-300'>
        A simple deepening technique: anoint in silence first (2–3 minutes),
        then speak your incantation. The silence steadies your nervous system so
        your words land with more focus.
      </p>
    </section>

    <section id='safety' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Safety, Dilution & Storage
      </h2>
      <p className='text-sm text-zinc-300'>
        Oils are flammable and essential oils are concentrated. Use a thin
        layer—never enough to pool near the wick. If you use essential oils,
        dilute them in a carrier oil (olive, jojoba, grapeseed, fractionated
        coconut) before applying.
      </p>
      <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
        <li>
          Let the candle rest after anointing so the oil absorbs into the wax.
        </li>
        <li>
          Store blends in dark glass bottles, labeled with intention and date.
        </li>
        <li>
          If you’re sensitive, patch-test oils and avoid eye/mucous-membrane
          contact.
        </li>
      </ul>
    </section>

    <section id='faq' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>FAQ</h2>
      <div className='space-y-3'>
        {faqs.map((faq) => (
          <article
            key={faq.question}
            className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
          >
            <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
              {faq.question}
            </h3>
            <p className='text-sm text-zinc-300'>{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);

export const metadata: Metadata = {
  title: 'Anointing Candles with Oils: Candle Magic Guide - Lunary',
  description:
    'Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork. Discover anointing methods, common oils, and how to enhance your candle magic with essential oils.',
  keywords: [
    'anointing candles',
    'candle anointing',
    'anointing oils',
    'candle magic oils',
    'essential oils candles',
    'how to anoint candles',
    'candle preparation',
    'candle magic oils',
  ],
  openGraph: {
    title: 'Anointing Candles with Oils: Candle Magic Guide - Lunary',
    description:
      'Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork. Discover anointing methods and common oils.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Anointing Candles with Oils: Candle Magic Guide - Lunary',
    description:
      'Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/candle-magic/anointing',
  },
};

export default function AnointingCandlesPage() {
  return (
    <SEOContentTemplate
      title='Anointing Candles with Oils: Candle Magic Guide - Lunary'
      h1='Anointing Candles with Oils'
      description='Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork. Essential oils carry specific properties that enhance your candle magic.'
      keywords={[
        'anointing candles',
        'candle anointing',
        'anointing oils',
        'candle magic oils',
        'essential oils candles',
        'how to anoint candles',
      ]}
      canonicalUrl='https://lunary.app/grimoire/candle-magic/anointing'
      tableOfContents={tableOfContents}
      intro='Anointing candles with oils layers intention and energy over your spellwork. The oil becomes a condenser for your will, turning the candle into a resonant sigil.'
      meaning='Anointing focuses intention by weaving color correspondences, oil energy, and spoken purpose into the wax.'
      howToWorkWith={[
        'Choose oils that match your intention and candle color',
        'Anoint from center outward for attraction and ends-to-center for banishing',
        'Visualize energy flowing with each stroke of oil',
        'Speak your purpose clearly as you work',
        'Combine anointing with carving or color correspondences',
        'Use carrier oils if essential oils are too strong',
      ]}
      faqs={faqs}
      relatedItems={relatedItems}
      internalLinks={[
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          text: 'Lighting Candles on Your Altar',
          href: '/grimoire/candle-magic/altar-lighting',
        },
        {
          text: 'Incantations by Candle Color',
          href: '/grimoire/candle-magic/incantations',
        },
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-candle-magic'
          entityKey='candle-magic'
          title='Candle Magic Connections'
          sections={cosmicSections}
        />
      }
      ctaText='Layer intention with oils'
      ctaHref='/grimoire/candle-magic/anointing'
    >
      {sectionContent}
    </SEOContentTemplate>
  );
}
