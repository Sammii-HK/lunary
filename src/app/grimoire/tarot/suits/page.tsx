import { Metadata } from 'next';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { tarotSuits } from '@/constants/tarot';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const suitDetails: Record<string, { color: string; themes: string[] }> = {
  wands: {
    color: 'text-orange-400',
    themes: ['Creativity', 'Passion', 'Ambition', 'Energy', 'Willpower'],
  },
  cups: {
    color: 'text-blue-400',
    themes: ['Emotions', 'Relationships', 'Love', 'Intuition', 'Dreams'],
  },
  swords: {
    color: 'text-cyan-400',
    themes: ['Intellect', 'Conflict', 'Truth', 'Communication', 'Decisions'],
  },
  pentacles: {
    color: 'text-emerald-400',
    themes: ['Material', 'Finances', 'Career', 'Health', 'Stability'],
  },
};

export const metadata: Metadata = {
  title: 'Tarot Suits: Wands, Cups, Swords & Pentacles Meanings | Lunary',
  description:
    'Explore the four suits of the Minor Arcana: Wands, Cups, Swords, and Pentacles. Learn their elements, meanings, and how they reflect daily life experiences.',
  keywords: [
    'tarot suits',
    'minor arcana',
    'wands tarot',
    'cups tarot',
    'swords tarot',
    'pentacles tarot',
    'tarot elements',
  ],
  openGraph: {
    title: 'Tarot Suits Guide | Lunary',
    description:
      'Explore the four suits of the Minor Arcana and their meanings.',
    url: 'https://lunary.app/grimoire/tarot/suits',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot/suits',
  },
};

export default function TarotSuitsIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Tarot Suits'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={metadata.alternates?.canonical as string}
        tableOfContents={[
          { label: 'Understanding the Suits', href: '#understanding' },
          { label: 'Reading Suit Balance', href: '#suit-balance' },
          { label: 'Suit Progressions', href: '#suit-progressions' },
          { label: 'Suit Breakdown', href: '#suit-breakdown' },
          { label: 'Related Resources', href: '#related-resources' },
        ]}
        intro='The Minor Arcana is divided into four suits, each tied to an element and a part of everyday life. Suits tell you where energy is focused in a reading, whether in feelings, actions, thoughts, or material matters.'
        tldr='Wands = fire/action, Cups = water/emotions, Swords = air/thoughts, Pentacles = earth/resources. Suit dominance points to where the story is happening.'
        meaning={`Tarot suits act like a map of lived experience. When a suit repeats, it highlights the area of life the reading centers on. A spread heavy in Cups suggests emotional processing, while a spread heavy in Swords suggests decisions or conflict.

The suit and the number work together. The suit shows the domain, and the number shows the stage of development. Court cards show people, roles, or attitudes within that domain.

Reading suit balance helps you see what is overactive or missing. Too much Swords can mean overthinking, while too much Wands can signal restlessness. If a suit is missing, it can point to the next action: add practicality if Earth is absent, or add emotional honesty if Water is missing.`}
        heroContent={
          <div className='text-center'>
            <div className='flex justify-center mb-4'>
              <Layers className='w-16 h-16 text-violet-400' />
            </div>
            <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
              The Minor Arcana features 56 cards split across four suits, each
              tied to an element and everyday life experiences.
            </p>
          </div>
        }
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Tarot', href: '/grimoire/tarot' },
          { label: 'Suits' },
        ]}
        rituals={[
          'Sort your deck into suits and read each suit as a mini story.',
          'Pull one card from each suit and compare the themes.',
          'Journal which suit appears most often in your readings.',
          'Practice reading without reversals to focus on suit energy.',
        ]}
        journalPrompts={[
          'Which suit appears most often in my readings?',
          'What area of life is asking for attention right now?',
          'How do I respond to conflict, emotions, action, and stability?',
          'What suit do I avoid and why?',
        ]}
        tables={[
          {
            title: 'Suit Overview',
            headers: ['Suit', 'Element', 'Focus'],
            rows: [
              ['Wands', 'Fire', 'Action, will, creativity'],
              ['Cups', 'Water', 'Emotions, relationships'],
              ['Swords', 'Air', 'Thought, conflict, clarity'],
              ['Pentacles', 'Earth', 'Resources, body, work'],
            ],
          },
          {
            title: 'Suit Dominance Clues',
            headers: ['Dominant Suit', 'Common Signal'],
            rows: [
              ['Wands', 'Momentum or initiative'],
              ['Cups', 'Emotional processing'],
              ['Swords', 'Decisions or tension'],
              ['Pentacles', 'Practical matters'],
            ],
          },
          {
            title: 'Suit Stages at a Glance',
            headers: ['Stage', 'What it suggests'],
            rows: [
              ['Aces', 'Beginning energy and raw potential'],
              ['Fives', 'Tension, adjustment, or turning point'],
              ['Tens', 'Completion and integration'],
              ['Courts', 'People, roles, or attitudes'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'All Tarot Cards', href: '/grimoire/tarot' },
          { text: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
          { text: 'Major Arcana', href: '/grimoire/tarot/major-arcana' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={[
          {
            question: 'What do the tarot suits represent?',
            answer:
              'Each suit represents a life domain: Wands for action, Cups for emotions, Swords for thoughts, and Pentacles for material matters.',
          },
          {
            question: 'What does it mean if one suit dominates a reading?',
            answer:
              'It means that area of life is the main focus of the question or situation.',
          },
          {
            question: 'How do court cards relate to suits?',
            answer:
              'Court cards show people, roles, or attitudes within the suit domain.',
          },
        ]}
      >
        <section
          id='understanding'
          className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding the Suits
          </h2>
          <p className='text-zinc-400 mb-4'>
            Each suit contains Ace through Ten plus four court cards. The suits
            align with the four elements and reveal which areas of life are
            highlighted in a reading.
          </p>
          <p className='text-zinc-400'>
            Dominant suits indicate the energy that’s most relevant to your
            question or situation.
          </p>
        </section>

        <section
          id='suit-balance'
          className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Reading Suit Balance
          </h2>
          <p className='text-zinc-400 mb-4'>
            A balanced spread usually includes a mix of suits. When one suit is
            missing, it may point to a blind spot or an area that is being
            overlooked. When one suit dominates, it shows the main storyline.
          </p>
          <p className='text-zinc-400'>
            If you pull many Wands, focus on action and initiative. If you pull
            many Cups, attend to feelings and connection. Let the suits guide
            your next step.
          </p>
        </section>

        <section
          id='suit-progressions'
          className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Suit Progressions
          </h2>
          <p className='text-zinc-400 mb-4'>
            Numbers show the arc of a suit. Aces are beginnings, Fives test the
            path, and Tens signal completion. Tracking the numbers inside a suit
            helps you read whether the story is just starting, building, or
            resolving.
          </p>
          <p className='text-zinc-400'>
            If your spread jumps from low to high numbers in one suit, it can
            mean a fast-moving situation. If the numbers cluster, the message is
            often about staying with the process rather than rushing to the
            outcome.
          </p>
        </section>

        <section id='suit-breakdown' className='space-y-8'>
          {Object.entries(tarotSuits).map(([key, suit]) => (
            <section
              key={key}
              className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'
            >
              <Link
                href={`/grimoire/tarot/suits/${key}`}
                className='group block'
              >
                <div className='flex items-center gap-4 mb-4'>
                  <h2
                    className={`text-2xl font-medium ${suitDetails[key].color} group-hover:opacity-80`}
                  >
                    {suit.name}
                  </h2>
                  <span className='px-3 py-1 text-sm bg-zinc-800 text-zinc-400 rounded'>
                    {suit.element}
                  </span>
                </div>
              </Link>
              <p className='text-zinc-400 mb-4'>{suit.qualities}</p>
              <div className='flex flex-wrap gap-2 mb-4'>
                {suitDetails[key].themes.map((theme) => (
                  <span
                    key={theme}
                    className='px-2 py-1 text-xs bg-zinc-800/50 text-zinc-400 rounded'
                  >
                    {theme}
                  </span>
                ))}
              </div>
              <Link
                href={`/grimoire/tarot/suits/${key}`}
                className={`text-sm ${suitDetails[key].color} hover:underline`}
              >
                View all {suit.name} cards →
              </Link>
            </section>
          ))}
        </section>

        <section
          id='related-resources'
          className='border-t border-zinc-800 pt-8 mt-12'
        >
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/tarot'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Tarot Cards
            </Link>
            <Link
              href='/grimoire/tarot/spreads'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Tarot Spreads
            </Link>
            <Link
              href='/grimoire/reversed-cards-guide'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Reversed Cards
            </Link>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
