export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

const tableOfContents = [
  { label: 'Why Incantations Matter', href: '#why-incantations' },
  { label: 'Incantation Structure', href: '#structure' },
  { label: 'Color Spells', href: '#color-spells' },
  { label: 'Practice Tips', href: '#practice-tips' },
  { label: 'FAQs', href: '#faq' },
];

const faqs = [
  {
    question: 'Do I need to use these exact incantations?',
    answer:
      'No! Use them as templates and make the words your own. The key is speaking with conviction while feeling the energy behind each phrase.',
  },
  {
    question: 'How many times should I repeat an incantation?',
    answer:
      'Traditional practice repeats words three times, but repeat as feels right for your ritual—once, thrice, or throughout the candle burn.',
  },
  {
    question: 'Can I combine multiple colors in one spell?',
    answer:
      'Yes—use different candles for layered intentions. Light them consecutively, speak each color’s incantation, and weave the energies together.',
  },
];

const relatedItems = [
  {
    name: 'Candle Magic Guide',
    href: '/grimoire/candle-magic',
    type: 'Overview',
  },
  {
    name: 'Anointing Candles',
    href: '/grimoire/candle-magic/anointing',
    type: 'Preparation',
  },
  {
    name: 'Lighting Candles on the Altar',
    href: '/grimoire/candle-magic/altar-lighting',
    type: 'Ritual Order',
  },
];

const cosmicSections: CosmicConnectionSection[] = [
  {
    title: 'Candle Practice',
    links: [
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Color Guide', href: '/grimoire/candle-magic/colors' },
      { label: 'Anointing Candles', href: '/grimoire/candle-magic/anointing' },
    ],
  },
  {
    title: 'Magical Tools',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Jar Spells', href: '/grimoire/jar-spells' },
    ],
  },
];

const sectionContent = (
  <div className='space-y-10'>
    <section id='why-incantations' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Why Incantations Matter
      </h2>
      <p className='text-zinc-300'>
        Words anchor intention. When spoken alongside candle lighting,
        incantations weave focus, resonance, and the vibration of the chosen
        color into your magic.
      </p>
      <p className='text-zinc-300'>
        If you struggle to “feel” magic, incantations help your body
        participate. The voice carries breath, and breath carries state. When
        you speak slowly, your nervous system settles; when you speak with fire,
        your motivation rises. Your pacing is part of the spell.
      </p>
    </section>

    <section id='structure' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        A Simple Incantation Structure
      </h2>
      <p className='text-sm text-zinc-300'>
        Most candle incantations follow a reliable structure: name the energy,
        name the intention, and declare the outcome. This keeps your words
        specific (and avoids rambling mid-ritual).
      </p>
      <ol className='list-decimal list-inside text-sm text-zinc-300 space-y-2'>
        <li>
          <strong>Invocation:</strong> “By this [color] flame…”
        </li>
        <li>
          <strong>Direction:</strong> “I call in [quality]…”
        </li>
        <li>
          <strong>Declaration:</strong> “So it is / so it becomes.”
        </li>
      </ol>
    </section>

    <section id='color-spells' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Color Spells Snapshot
      </h2>
      <div className='grid gap-4 md:grid-cols-2 text-sm text-zinc-300'>
        {[
          { title: 'Red', body: 'Love, courage, passion, action' },
          { title: 'Green', body: 'Prosperity, growth, healing, abundance' },
          { title: 'Blue', body: 'Peace, protection, healing, truth' },
          {
            title: 'Purple',
            body: 'Spirituality, psychic vision, transformation',
          },
          { title: 'White', body: 'Protection, purification, all-purpose' },
          { title: 'Black', body: 'Banishing, protection, endings' },
        ].map((item) => (
          <article
            key={item.title}
            className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
          >
            <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
              {item.title}
            </h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section id='practice-tips' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>Practice Tips</h2>
      <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
        <li>
          Speak the words with conviction and breathe the color into your body.
        </li>
        <li>
          Layer incantations with anointing, carving, and correspondences.
        </li>
        <li>
          Repeat phrases on repeat candles, but trust your intuition for rhythm.
        </li>
      </ul>
      <p className='text-sm text-zinc-300'>
        Try a repetition number that matches your intention: 3 for momentum, 6
        for harmony, 9 for completion. The goal is consistency, not perfection.
      </p>
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
  title: 'Incantations by Candle Color: Candle Magic Spells - Lunary',
  description:
    'Specific incantations to use when lighting candles of different colors. Learn powerful candle magic spells for love, prosperity, protection, and more. Speak with conviction and feel the energy of each color.',
  keywords: [
    'candle incantations',
    'candle color spells',
    'candle magic incantations',
    'candle color meanings',
    'candle spells by color',
    'candle magic words',
    'candle rituals',
    'color magic',
  ],
  openGraph: {
    title: 'Incantations by Candle Color: Candle Magic Spells - Lunary',
    description:
      'Specific incantations to use when lighting candles of different colors. Learn powerful candle magic spells for love, prosperity, protection, and more.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Incantations by Candle Color: Candle Magic Spells - Lunary',
    description:
      'Specific incantations to use when lighting candles of different colors. Learn powerful candle magic spells.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/candle-magic/incantations',
  },
};

export default function IncantationsByCandleColorPage() {
  return (
    <SEOContentTemplate
      title='Incantations by Candle Color: Candle Magic Spells - Lunary'
      h1='Incantations by Candle Color'
      description='Specific incantations to use when lighting candles of different colors. Speak with conviction and feel the energy of each color. Learn powerful candle magic spells for love, prosperity, protection, and more.'
      keywords={[
        'candle incantations',
        'candle color spells',
        'candle magic incantations',
        'candle color meanings',
        'candle spells by color',
        'candle magic words',
      ]}
      canonicalUrl='https://lunary.app/grimoire/candle-magic/incantations'
      tableOfContents={tableOfContents}
      intro='Specific incantations to use when lighting colored candles make your intention sound and feel real. Speak with conviction and layer the words with your color correspondences.'
      meaning={`Each candle color carries specific energetic properties. When you combine color energy with powerful incantations, you create a focused intention that manifests your desires. Speak these incantations with conviction, feeling the energy of each color flowing through you.

**Red Candle:**
"By this red flame, passion and strength I claim. Courage flows through me, action takes form, my will is made manifest."
Use for: Love, courage, strength, action

**Pink Candle:**
"This pink light brings love and care, romance and friendship fill the air. Self-love grows, compassion flows, healing hearts wherever it goes."
Use for: Romance, self-love, friendship

**Orange Candle:**
"Orange fire burns bright and bold, success and opportunity unfold. Creativity flows, confidence grows, abundance comes as this flame glows."
Use for: Success, creativity, attraction

**Yellow Candle:**
"Yellow light brings clarity bright, communication flows day and night. Learning comes, joy becomes, mental clarity this flame brings."
Use for: Communication, learning, clarity

**Green Candle:**
"Green flame of growth and wealth, prosperity comes, abundance felt. Healing flows, nature knows, fertile ground where this light glows."
Use for: Prosperity, healing, growth

**Blue Candle:**
"Blue light brings peace and calm, healing waters, protective balm. Wisdom flows, truth it knows, spiritual growth this flame bestows."
Use for: Peace, healing, protection

**Purple Candle:**
"Purple flame of power and might, psychic vision, spiritual light. Transformation comes, wisdom becomes, higher knowledge this flame brings."
Use for: Spirituality, psychic ability

**White Candle:**
"White light pure and bright, protection, peace, and divine light. Purity flows, clarity grows, all-purpose power this flame bestows."
Use for: Protection, purification, all-purpose

**Black Candle:**
"Black flame absorbs what's not mine, banishing negativity, binding what's unkind. Protection strong, removing wrong, only good remains where this flame belongs."
Use for: Banishing, protection, removing negativity`}
      howToWorkWith={[
        'Choose the candle color that matches your intention',
        'Speak incantations with conviction and feeling',
        'Visualize the color energy flowing through you',
        'Combine incantations with carving and anointing',
      ]}
      faqs={faqs}
      internalLinks={[
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          text: 'Lighting Candles on Your Altar',
          href: '/grimoire/candle-magic/altar-lighting',
        },
        {
          text: 'Anointing Candles with Oils',
          href: '/grimoire/candle-magic/anointing',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
      ]}
      relatedItems={relatedItems}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-candle-magic'
          entityKey='candle-magic'
          title='Candle Magic Connections'
          sections={cosmicSections}
        />
      }
      ctaText='Speak your candle incantations'
      ctaHref='/grimoire/candle-magic'
    >
      {sectionContent}
    </SEOContentTemplate>
  );
}
