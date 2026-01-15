export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Reading Card Combinations: Tarot Card Pairing Guide - Lunary',
  description:
    'Learn how to read tarot card combinations for richer interpretations, element pairings, and Major Arcana stories.',
  openGraph: {
    title: 'Reading Card Combinations: Tarot Card Pairing Guide - Lunary',
    description:
      'Learn how to read tarot card combinations for richer interpretations, element pairings, and Major Arcana stories.',
    type: 'article',
    url: 'https://lunary.app/grimoire/card-combinations',
  },
  twitter: {
    card: 'summary',
    title: 'Reading Card Combinations: Tarot Card Pairing Guide - Lunary',
    description:
      'Learn how to read tarot card combinations for richer interpretations, element pairings, and Major Arcana stories.',
  },
};

const tableOfContents = [
  { label: 'Why Combinations Matter', href: '#why-combinations' },
  { label: 'Element Pairings', href: '#element-pairings' },
  { label: 'Number Rhythms', href: '#number-patterns' },
  { label: 'Major Arcana Stories', href: '#major-arcana' },
  { label: 'Context & Roles', href: '#context-roles' },
  { label: 'How to Read', href: '#how-to-read' },
  { label: 'Common Pitfalls', href: '#common-pitfalls' },
  { label: 'Examples', href: '#examples' },
  { label: 'Practice Routine', href: '#practice-routine' },
  { label: 'FAQ', href: '#faq' },
];

const faqs = [
  {
    question: 'Why read cards together?',
    answer:
      'Card combinations layer energies, showing dialogues, tension, and journeys that single cards cannot deliver.',
  },
  {
    question: 'What if cards contradict?',
    answer:
      'Contrasts highlight tension; use them to see points needing balance. Look for bridging themes or elements that reconcile the story.',
  },
  {
    question: 'Do elements matter more than numbers?',
    answer:
      'Both matter. Elements set tone and emotion, while numbers map rhythm and progression. Together they reveal the narrative.',
  },
];

const relatedItems = [
  { name: 'Tarot Cards Guide', href: '/grimoire/tarot', type: 'Overview' },
  { name: 'Tarot Spreads', href: '/grimoire/tarot/spreads', type: 'Practice' },
  {
    name: 'Reversed Cards Guide',
    href: '/grimoire/reversed-cards-guide',
    type: 'Technique',
  },
];

const cosmicSections: CosmicConnectionSection[] = [
  {
    title: 'Tarot Practice',
    links: [
      { label: 'Tarot Guide', href: '/grimoire/tarot' },
      { label: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
      { label: 'Daily Tarot Reading', href: '/tarot' },
    ],
  },
  {
    title: 'Magical Tools',
    links: [
      { label: 'Elemental Correspondences', href: '/grimoire/correspondences' },
      { label: 'Numerology', href: '/grimoire/numerology' },
      { label: 'Astrology Hub', href: '/grimoire/astrology' },
    ],
  },
];

const sectionContent = (
  <div className='space-y-10'>
    <section id='why-combinations' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Why Combinations Matter
      </h2>
      <p className='text-zinc-300 leading-relaxed'>
        Cards interact. When you read them together you hear the story they are
        composing— themes, conflicts, and movement that shine more brightly in
        combination.
      </p>
    </section>

    <section id='element-pairings' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>Element Pairings</h2>
      <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
        {[
          {
            label: 'Fire + Air',
            body: 'Bold action paired with quick thinking.',
          },
          { label: 'Water + Earth', body: 'Emotion grounded in practicality.' },
          {
            label: 'Fire + Water',
            body: 'Passion colored by feeling—watch the heat.',
          },
          {
            label: 'Air + Earth',
            body: 'Ideas shaped into tangible outcomes.',
          },
          { label: 'Fire + Fire', body: 'High energy—watch for burn out.' },
          {
            label: 'Water + Water',
            body: 'Deep sensitivity that needs grounding.',
          },
        ].map((pair) => (
          <article
            key={pair.label}
            className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
          >
            <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
              {pair.label}
            </h3>
            <p>{pair.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section id='number-patterns' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>Number Rhythms</h2>
      <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
        <li>Multiple Aces signal simultaneous fresh starts.</li>
        <li>
          Court card clusters bring people and dynamics to the foreground.
        </li>
        <li>Sequential numbers highlight a journey or rhythm.</li>
        <li>The same number across suits points to a universal lesson.</li>
        <li>Even stacks suggest balance, patience, partnership.</li>
        <li>Odd stacks urge bold, independent movement.</li>
      </ul>
    </section>

    <section id='major-arcana' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>
        Major Arcana Stories
      </h2>
      <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
        {[
          {
            label: 'Fool + World',
            body: 'Circling endings that spark new beginnings.',
          },
          {
            label: 'Magician + Star',
            body: 'Manifestation aligned with hope.',
          },
          {
            label: 'Death + Tower',
            body: 'Radical transformation and upheaval.',
          },
          { label: 'Sun + Moon', body: 'Clarity blending with mystery.' },
          {
            label: 'Hermit + High Priestess',
            body: 'Inner wisdom amplified by intuition.',
          },
          {
            label: 'Strength + Chariot',
            body: 'Controlled courage pressing forward.',
          },
        ].map((item) => (
          <article
            key={item.label}
            className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
          >
            <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
              {item.label}
            </h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section id='context-roles' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>Context & Roles</h2>
      <p className='text-zinc-300 leading-relaxed'>
        The same pair can read very differently depending on the question. Ask
        whether a card represents you, another person, or the situation itself.
        A powerful combination often shows a role shift: who initiates, who
        responds, and what is changing between the two.
      </p>
      <p className='text-zinc-300 leading-relaxed'>
        If you feel stuck, assign each card a role like “desire,” “obstacle,” or
        “next step.” That simple move turns two separate meanings into one
        story.
      </p>
    </section>

    <section id='how-to-read' className='space-y-4'>
      <h2 className='text-3xl font-light text-zinc-100'>How to Read</h2>
      <ol className='list-decimal list-inside text-sm text-zinc-300 space-y-2'>
        <li>Find shared elements, suits, or themes between cards.</li>
        <li>Observe positioning—adjacent cards influence each other first.</li>
        <li>Notice contrasts; tension often shows decisions.</li>
        <li>
          Find bridges—repeated symbols, numbers, or colors that connect the
          story.
        </li>
        <li>
          Let the combination breathe before splitting out individual meanings.
        </li>
      </ol>
    </section>

    <section id='common-pitfalls' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>Common Pitfalls</h2>
      <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
        <li>Reading each card in isolation without blending the narrative.</li>
        <li>Over-prioritizing “textbook” meanings over the actual question.</li>
        <li>Ignoring direction or movement cues (approach, retreat, stall).</li>
        <li>Forgetting the spread position and timing context.</li>
      </ul>
    </section>

    <section id='examples' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>Examples</h2>
      <div className='space-y-2 text-sm text-zinc-300'>
        <p>
          Three of Cups + Ten of Pentacles: Joy leading to legacy stability.
        </p>
        <p>
          Knight of Swords + Eight of Wands: Swift decisions guided by momentum.
        </p>
        <p>Empress + Ace of Pentacles: Fertility blooming into abundance.</p>
        <p>Two of Cups + Lovers: Partnership needing mindful commitment.</p>
      </div>
    </section>

    <section id='practice-routine' className='space-y-3'>
      <h2 className='text-3xl font-light text-zinc-100'>Practice Routine</h2>
      <p className='text-zinc-300 leading-relaxed'>
        Build skill by drawing two cards daily. Write a one-line headline for
        the pair, then add one action you would take if the combination were
        advice. This keeps your readings focused and practical.
      </p>
      <p className='text-zinc-300 leading-relaxed'>
        Track repeat pairings across a week. Repetition usually signals a theme
        you can work with, not a fixed prediction.
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

export default function CardCombinationsPage() {
  return (
    <SEOContentTemplate
      title='Reading Card Combinations: Tarot Card Pairing Guide - Lunary'
      h1='Reading Card Combinations'
      description="Cards don't exist in isolation. Learning to read cards together creates richer, more nuanced interpretations."
      keywords={[
        'tarot card combinations',
        'reading card combinations',
        'tarot card pairs',
        'tarot card meanings together',
        'how to read multiple tarot cards',
      ]}
      canonicalUrl='https://lunary.app/grimoire/card-combinations'
      intro='Reading cards together reveals the narrative threads, tension, and flow that single-card readings miss.'
      meaning='Combinations blend elements, numerology, and Major Arcana to describe journeys, choices, and transformations.'
      tableOfContents={tableOfContents}
      internalLinks={[
        { text: 'Tarot Cards Guide', href: '/grimoire/tarot' },
        { text: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
        {
          text: 'Reversed Cards Guide',
          href: '/grimoire/reversed-cards-guide',
        },
      ]}
      relatedItems={relatedItems}
      howToWorkWith={[
        'Layer elements to sense the emotional tone.',
        'Track repeated numbers to feel the rhythm.',
        'Let Major Arcana pairings mark turning points.',
        'Allow the combination story to unfold before splitting meanings.',
      ]}
      rituals={[
        'Shuffle with a clear question and pull two cards face-up.',
        'Assign roles: opener, response, outcome.',
        'Say the combined message out loud once.',
        'Write one action that matches the combined energy.',
      ]}
      journalPrompts={[
        'What is the story these two cards are telling together?',
        'Which card feels like the situation and which feels like the response?',
        'Where do I see this pairing show up in my life right now?',
        'What is the simplest action that honors this pairing?',
      ]}
      tables={[
        {
          title: 'Combination Reading Framework',
          headers: ['Layer', 'Question to ask'],
          rows: [
            ['Role', 'Who or what does each card represent?'],
            ['Tone', 'What emotional temperature do the elements suggest?'],
            ['Movement', 'Is the energy building, pausing, or releasing?'],
            ['Action', 'What is the smallest aligned step?'],
          ],
        },
        {
          title: 'Pairing Signals',
          headers: ['Signal', 'Interpretation'],
          rows: [
            ['Same suit', 'One theme, same life arena'],
            ['Same number', 'Shared lesson or timing'],
            ['Major + Minor', 'Big theme expressed in daily life'],
            ['Contrasting elements', 'Tension that needs balance'],
          ],
        },
      ]}
      faqs={faqs}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-tarot'
          entityKey='tarot'
          title='Tarot Connections'
          sections={cosmicSections}
        />
      }
      ctaText='Practice with a custom combo spread'
      ctaHref='/tarot'
    >
      {sectionContent}
    </SEOContentTemplate>
  );
}
