export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

const tableOfContents = [
  { label: 'Lighting Order', href: '#lighting-order' },
  { label: 'What to Say', href: '#what-to-say' },
  { label: 'Altar Layout', href: '#altar-layout' },
  { label: 'Safety & Closing', href: '#closing' },
  { label: 'FAQ', href: '#faq' },
];

const faqs = [
  {
    question: 'Do I have to follow this exact order?',
    answer:
      'No! This is a traditional suggestion, but you can adapt it to your practice. Consistency and intention are what build ritual energy.',
  },
  {
    question: 'What if I only have one candle?',
    answer:
      'That is perfectly fine. Start with a white candle for protection, then light your intention candle. The order is about honoring intention, not having multiple candles.',
  },
  {
    question: 'How do I close a lighting ritual?',
    answer:
      'Thank the elements or spirits you called upon, then extinguish in reverse order or let the candles burn out depending on the spell.',
  },
];

const relatedItems = [
  {
    name: 'Anointing Candles with Oils',
    href: '/grimoire/candle-magic/anointing',
    type: 'Preparation',
  },
  {
    name: 'Candle Incantations',
    href: '/grimoire/candle-magic/incantations',
    type: 'Spells',
  },
  {
    name: 'Candle Colors',
    href: '/grimoire/candle-magic/colors',
    type: 'Correspondences',
  },
];

const cosmicSections: CosmicConnectionSection[] = [
  {
    title: 'Lighting Links',
    links: [
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Anointing Candles', href: '/grimoire/candle-magic/anointing' },
      { label: 'Candle Colors', href: '/grimoire/candle-magic/colors' },
    ],
  },
  {
    title: 'Supportive Practices',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      {
        label: 'Herbal Correspondences',
        href: '/grimoire/correspondences/herbs',
      },
      { label: 'Protection Magic', href: '/grimoire/protection' },
    ],
  },
];

const sectionContent = (
  <div className='space-y-10'>
    <section id='lighting-order' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Traditional Lighting Order
      </h2>
      <div className='space-y-2 text-sm text-zinc-300'>
        <p>1. White or protection candle first to establish sacred space.</p>
        <p>
          2. Elemental candles (Earth, Air, Fire, Water) if you work
          directionally.
        </p>
        <p>3. Intention candle—your main spell focus.</p>
        <p>4. Supporting candles for secondary intentions.</p>
        <p>5. Close by thanking energies and letting the flame do its work.</p>
      </div>
      <p className='text-sm text-zinc-300'>
        The exact number of candles is less important than the rhythm and
        intention of the lighting. Take a breath between each flame and allow
        the blaze to breathe with you.
      </p>
    </section>

    <section id='what-to-say' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        What to Say When Lighting
      </h2>
      <p className='text-sm text-zinc-300'>
        Speak your intention clearly, visualize the flame carrying your will,
        and thank the elements for their presence. Simple phrases like &ldquo;I
        light this flame with intention clear&rdquo; anchor the moment.
      </p>
      <p className='text-sm text-zinc-300'>
        Invite sensory cues—feel the heat, listen to the wick crackle, and smell
        the oils. This full-body engagement deepens the connection between your
        inner will and the outer candle.
      </p>
    </section>

    <section id='altar-layout' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Altar Layout Guidance
      </h2>
      <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
        <li>Center: Your main intention candle.</li>
        <li>North (Earth): Green/brown candles, crystals, salt.</li>
        <li>East (Air): Yellow/white candles, incense, feathers.</li>
        <li>South (Fire): Red/orange candles, matches, fire-safe dish.</li>
        <li>West (Water): Blue/silver candles, water bowl, shells.</li>
      </ul>
      <p className='text-sm text-zinc-300'>
        Pair each directional candle with stones, herbs, or crystals that match
        its element. Layering textures reminds you which element you are
        invoking.
      </p>
    </section>

    <section id='closing' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Safety & Closing Rituals
      </h2>
      <p className='text-sm text-zinc-300'>
        Snuff candles rather than blowing them out to keep the energy intact.
        Extinguish in reverse order, or allow longer-burning candles to fade
        naturally if that suits the spell.
      </p>
      <p className='text-sm text-zinc-300'>
        After extinguishing, observe the leftover wax and ash—they carry
        impressions of the ritual. Dispose of them respectfully or reuse in
        symbolic ways.
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
  title: 'Lighting Candles on Your Altar: Ritual Order Guide - Lunary',
  description:
    'Learn the proper order and method of lighting candles on your altar. Discover traditional lighting sequences, what to say when lighting, and how to set up your altar for candle magic rituals.',
  keywords: [
    'lighting candles on altar',
    'candle lighting order',
    'altar candle ritual',
    'candle magic altar',
    'ritual candle lighting',
    'altar setup',
    'candle ritual order',
    'how to light altar candles',
  ],
  openGraph: {
    title: 'Lighting Candles on Your Altar: Ritual Order Guide - Lunary',
    description:
      'Learn the proper order and method of lighting candles on your altar. Discover traditional lighting sequences and altar setup.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Lighting Candles on Your Altar: Ritual Order Guide - Lunary',
    description:
      'Learn the proper order and method of lighting candles on your altar.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/candle-magic/altar-lighting',
  },
};

export default function LightingCandlesOnAltarPage() {
  return (
    <SEOContentTemplate
      title='Lighting Candles on Your Altar: Ritual Order Guide - Lunary'
      h1='Lighting Candles on Your Altar'
      description='Learn the proper order and method of lighting candles on your altar. Discover traditional lighting sequences, what to say when lighting, and how to set up your altar for candle magic rituals.'
      keywords={[
        'lighting candles on altar',
        'candle lighting order',
        'altar candle ritual',
        'candle magic altar',
        'ritual candle lighting',
        'altar setup',
      ]}
      canonicalUrl='https://lunary.app/grimoire/candle-magic/altar-lighting'
      tableOfContents={tableOfContents}
      intro='The order and method of lighting candles on your altar create a powerful ritual structure that honors the elements and focuses your intention.'
      meaning='Lighting order, spoken words, and intentional layout combine to make the altar a sacred container for your work. The way energy stacks through the flame is as tactile as it is symbolic—each candle becomes another pulse in the ritual heartbeat.'
      howToWorkWith={[
        'Always light a protection or white candle first',
        'Follow elemental order when directional candles are used',
        'Speak your intention as you light each flame',
        'Add supporting candles for secondary energies',
        'Visualize energy stacking as you light',
        'Extinguish in reverse order or let candles burn if the spell requires it',
      ]}
      faqs={faqs}
      relatedItems={relatedItems}
      internalLinks={[
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          text: 'Incantations by Candle Color',
          href: '/grimoire/candle-magic/incantations',
        },
        {
          text: 'Anointing Candles with Oils',
          href: '/grimoire/candle-magic/anointing',
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
      ctaText='Practice a lighting ritual'
      ctaHref='/grimoire/candle-magic/anointing'
    >
      {sectionContent}
    </SEOContentTemplate>
  );
}
