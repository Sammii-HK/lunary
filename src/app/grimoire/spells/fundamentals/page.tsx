export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Spellcasting Fundamentals: How Magic Works - Lunary',
  description:
    'Learn the foundational principles of spellcraft: intention setting, ethics, timing with moon phases and planetary days, common tools, and when not to cast. Essential guide for beginners.',
  keywords: [
    'spellcraft fundamentals',
    'how to cast spells',
    'magic basics',
    'witchcraft basics',
    'spell timing',
    'magical ethics',
    'intention setting magic',
  ],
  openGraph: {
    title: 'Spellcasting Fundamentals: How Magic Works - Lunary',
    description:
      'Learn the foundational principles of spellcraft: intention, ethics, timing, and tools.',
    type: 'article',
    url: 'https://lunary.app/grimoire/spells/fundamentals',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/spells/fundamentals',
  },
};

const faqs = [
  {
    question: 'Do spells really work?',
    answer:
      'Spells work by focusing intention and energy toward a goal. They operate best when paired with practical action, ethical clarity, and awareness of timing. Magic supports change—it amplifies your intention and keeps you accountable.',
  },
  {
    question: 'What do I need to cast my first spell?',
    answer:
      'Clear intention and focused attention are foundational. Start with a simple candle or written intention. You do not need fancy tools—your will is the strongest ingredient.',
  },
  {
    question: 'Is it safe to cast spells as a beginner?',
    answer:
      'Yes, when you stick to self-focused goals (protection, healing, clarity) and avoid manipulation. Ethics, consent, and gradual practice keep your path grounded.',
  },
  {
    question: 'What if my spell does not work?',
    answer:
      'Magic is a skill. Reflect on clarity, timing, tools, and any internal resistance. Adjust details, take practical steps, and try again. Sometimes the lesson is in the waiting.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Related Practices',
    links: [
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Meditation', href: '/grimoire/meditation' },
    ],
  },
  {
    title: 'Spell Types',
    links: [
      { label: 'All Spells', href: '/grimoire/spells' },
      { label: 'Protection', href: '/grimoire/protection' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Jar Spells', href: '/grimoire/jar-spells' },
    ],
  },
  {
    title: 'Ethics & Safety',
    links: [
      {
        label: 'Witchcraft Ethics',
        href: '/grimoire/modern-witchcraft/ethics',
      },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
      { label: 'Beginners Guide', href: '/grimoire/beginners' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    ],
  },
];

const tableOfContents = [
  { label: 'What Is a Spell?', href: '#what-is-spell' },
  { label: 'Intention & Correspondences', href: '#intention' },
  { label: 'Ethics', href: '#ethics' },
  { label: 'Spell Crafting', href: '#building-spell' },
  { label: 'Timing', href: '#timing' },
  { label: 'Tools', href: '#tools' },
  { label: 'Record Keeping', href: '#recording' },
  { label: 'When Not to Cast', href: '#when-not-to-cast' },
  { label: 'FAQ', href: '#faq' },
];

export default function SpellcraftFundamentalsPage() {
  return (
    <SEOContentTemplate
      title='Spellcasting Fundamentals: How Magic Works'
      h1='Spellcraft Fundamentals'
      description='Learn the foundations of spellcasting, from intention and ethics to timing, tools, and aftercare.'
      keywords={metadata.keywords as string[]}
      canonicalUrl={metadata.alternates?.canonical as string}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Spells', href: '/grimoire/spells' },
        { label: 'Fundamentals', href: '/grimoire/spells/fundamentals' },
      ]}
      intro='Spellcasting combines focused intention, ethical choices, and energetic timing. This guide helps you craft safe, aligned rituals that strengthen your relationship with magic.'
      meaning='Magic responds to clarity. Align your thoughts, words, and tools to direct energy purposefully. Spellcraft Fundamentals unpacks the “why” behind every component so your practice stays grounded.'
      tableOfContents={tableOfContents}
      howToWorkWith={[
        'Define your intention and state it out loud before you cast',
        'Layer correspondences (color, herb, crystal) that match the goal',
        'Honor the day ruler and moon phase for timing',
        'Keep ethical boundaries and never impose outcomes on others',
      ]}
      faqs={faqs}
      relatedItems={[
        {
          name: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
          type: 'This guide',
        },
        {
          name: 'Protection',
          href: '/grimoire/protection',
          type: 'Shielding spells',
        },
        {
          name: 'Manifestation',
          href: '/grimoire/manifestation',
          type: 'Attraction work',
        },
      ]}
      internalLinks={[
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        { text: 'Moon Phases', href: '/grimoire/moon' },
        { text: 'Book of Shadows', href: '/book-of-shadows' },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-spells'
          entityKey='fundamentals'
          title='Spell Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <section id='what-is-spell' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          1. What Is a Spell?
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          A spell is an intentional act that steers energy toward a goal. It is
          a focused ritual that aligns your mind, heart, and actions with the
          outcome you seek.
        </p>
        <p className='text-zinc-300 leading-relaxed'>
          Think of it as an energetic signature—each spoken word, stepped
          action, and tool you use amplifies the signal.
        </p>
      </section>

      <section id='intention' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          2. Intention, Focus & Correspondences
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Begin with a crystal-clear intention. Then layer mountain of
          correspondences: colors, herbs, crystals, and elemental energies that
          echo that intent.
        </p>
        <div className='grid gap-4 md:grid-cols-3'>
          {['Color', 'Herb', 'Crystal'].map((item) => (
            <article
              key={item}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
            >
              <h3 className='text-lg font-semibold text-zinc-100'>{item}</h3>
              <p className='text-sm text-zinc-400'>
                Choose one that shares agree with the goal.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id='ethics' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          3. Ethics of Spellwork
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Always choose spells that benefit you or seek consent from those
          affected. Avoid coercive or manipulative intentions, especially when
          emotions or free will are involved.
        </p>
        <p className='text-zinc-300 leading-relaxed'>
          Keep rituals grounded with gratitude, accountability, and
          follow-through on practical steps that accompany the magic.
        </p>
      </section>

      <section id='building-spell' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          4. Building a Simple Spell
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>Clarify your intention and note desired outcome.</li>
          <li>Select correspondences (color, herb, crystal, element).</li>
          <li>Choose an appropriate day and moon phase.</li>
          <li>Light a candle, state the spell, and visualize the result.</li>
          <li>Close with gratitude and journal the process.</li>
        </ol>
      </section>

      <section id='timing' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          5. Timing: Moon, Days, Planets
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Match your spell with the moon phase and planetary day for extra
          resonance. Waxing for growth, Full for power, Waning for release. Mars
          days for action, Venus for love, etc.
        </p>
      </section>

      <section id='tools' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>6. Common Tools</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {['Candles', 'Herbs', 'Crystals', 'Altar'].map((tool) => (
            <article
              key={tool}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
            >
              <h3 className='text-lg font-semibold text-zinc-100'>{tool}</h3>
              <p className='text-sm text-zinc-400'>
                Use with clear intention and cleanse regularly.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id='recording' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          7. Recording Results
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Journal your spells. Note the intention, timing, tools, and outcomes.
          Reflection reveals patterns and helps you refine your craft.
        </p>
      </section>

      <section id='when-not-to-cast' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          8. When Not to Cast
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Avoid spells when emotions are erratic, on someone else's behalf
          without consent, or when you feel uncertain. Wait for clarity, then
          return with solid intention.
        </p>
      </section>

      <section id='faq' className='space-y-4'>
        <h2 className='text-3xl font-light text-zinc-100'>9. FAQ</h2>
        <div className='space-y-4'>
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                {faq.question}
              </h3>
              <p className='text-zinc-400 text-sm'>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
