export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Reversed Cards Guide: How to Read Reversed Tarot Cards - Lunary',
  description:
    'Complete guide to reading reversed tarot cards. Learn what reversed cards mean, how to interpret them, and common patterns in tarot readings.',
  openGraph: {
    title: 'Reversed Cards Guide: How to Read Reversed Tarot Cards - Lunary',
    description:
      'Complete guide to reading reversed tarot cards. Learn what reversed cards mean, how to interpret them, and common patterns in tarot readings.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Reversed Cards Guide: How to Read Reversed Tarot Cards - Lunary',
    description:
      'Complete guide to reading reversed tarot cards. Learn what reversed cards mean, how to interpret them, and common patterns in tarot readings.',
  },
};

export default function ReversedCardsGuidePage() {
  const faqs = [
    {
      question: 'Do reversed cards always mean the opposite?',
      answer:
        'Not always. Reversals can indicate blocked or internalized energy, delays, a lesson being integrated, or a shadow expression—not just a simple “opposite.”',
    },
    {
      question: 'Should I read reversals as negative?',
      answer:
        'No. A reversal can point to growth, reflection, or a change in timing. Many reversals are “work-in-progress” messages rather than bad outcomes.',
    },
    {
      question: 'What if I don’t want to use reversals?',
      answer:
        'That’s totally valid. Some readers don’t use reversals and instead read the full range of a card’s meaning based on position, surrounding cards, and intuition.',
    },
    {
      question: 'How do I know which reversal meaning is correct?',
      answer:
        'Use context: the question, the spread position, the suit/element, and the surrounding cards. Over time you’ll notice patterns that make your reversal readings consistent.',
    },
  ];

  return (
    <SEOContentTemplate
      title='Reversed Cards Guide: How to Read Reversed Tarot Cards - Lunary'
      h1='Reversed Cards Guide'
      description={`Reversed cards (cards that appear upside down) add depth and nuance to tarot readings. They don't always mean the opposite of the upright meaning—often they indicate internal processes, delays, or blocked energy.`}
      keywords={[
        'reversed tarot cards',
        'reversed cards guide',
        'how to read reversed cards',
        'tarot reversed meaning',
        'upside down tarot cards',
      ]}
      canonicalUrl='https://lunary.app/grimoire/reversed-cards-guide'
      intro='Reversals are a simple way to add nuance: they show where energy is blocked, delayed, internalized, or asking for integration. Use this guide to pick one consistent reversal framework and read with confidence.'
      meaning={`Reversed tarot cards are best read as a **signal**, not a verdict. When a card appears upside down, it often points to one of four themes:\n\n- **Blocked expression**: the card’s energy is present but not flowing freely\n- **Internalization**: the lesson is happening inside first (mindset, self-belief, emotions)\n- **Delay or detour**: timing is off, resources are missing, or the process is incomplete\n- **Shadow expression**: the “unconscious” side of the upright meaning\n\nA consistent approach is: start with the upright meaning, then ask *how is this energy changing?* In practice, reversals help you locate the friction point—what to adjust so the situation can move forward.`}
      howToWorkWith={[
        'Pick one reversal lens (blocked, internal, delay, shadow) and apply it consistently before adding “opposites.”',
        'Let the suit guide you: Cups (emotions), Wands (action), Swords (mind), Pentacles (practical/material).',
        'Use surrounding cards to confirm whether the reversal is a delay, a lesson, or a boundary.',
        'Journal your reversals for a week: note which themes repeat and what changed when you acted on the advice.',
      ]}
      faqs={faqs}
      tableOfContents={[
        { label: 'Meaning', href: '#meaning' },
        { label: 'How to Work With This Energy', href: '#how-to-work' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Related Topics', href: '#related-topics' },
      ]}
      internalLinks={[
        { text: 'Tarot Cards Guide', href: '/grimoire/tarot' },
        { text: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
        { text: 'Card Combinations', href: '/grimoire/card-combinations' },
        { text: 'Tarot Suits', href: '/grimoire/tarot/suits' },
      ]}
    >
      <div className='space-y-6'>
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Understanding Reversed Cards
          </h2>
          <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
            Reversed cards can mean several things depending on context:
          </p>
          <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2 mb-4'>
            <li>
              <strong>Blocked energy:</strong> The card's energy is present but
              not flowing freely
            </li>
            <li>
              <strong>Internal process:</strong> The meaning is happening within
              rather than externally
            </li>
            <li>
              <strong>Delay:</strong> The energy is coming but not yet
              manifesting
            </li>
            <li>
              <strong>Opposite meaning:</strong> Sometimes the reversed card
              represents the opposite of its upright meaning
            </li>
            <li>
              <strong>Shadow aspect:</strong> The darker or less conscious side
              of the card's energy
            </li>
          </ul>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            Always consider the card's position in the spread, surrounding
            cards, and your intuition when interpreting reversals.
          </p>
        </div>

        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            How to Read Reversed Cards
          </h2>
          <div className='space-y-3 text-sm text-zinc-300'>
            <div>
              <strong>1. Check the context:</strong> What question are you
              asking? What position is the card in?
            </div>
            <div>
              <strong>2. Look at surrounding cards:</strong> Do other cards
              support or contradict the reversal?
            </div>
            <div>
              <strong>3. Consider the element:</strong> Reversed Cups might mean
              blocked emotions; reversed Swords might mean mental confusion.
            </div>
            <div>
              <strong>4. Trust your intuition:</strong> What does the reversal
              feel like to you?
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Common Reversed Patterns
          </h2>
          <div className='space-y-3 text-sm text-zinc-300'>
            <div>
              <strong>Major Arcana reversed:</strong> Often indicates internal
              spiritual work or shadow aspects of major life themes
            </div>
            <div>
              <strong>Court cards reversed:</strong> May represent blocked
              expression of that personality type or its shadow side
            </div>
            <div>
              <strong>Pip cards reversed:</strong> Usually indicate delays,
              internal processes, or blocked energy in that area of life
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Element-Specific Reversed Meanings
          </h2>
          <div className='space-y-4 text-sm text-zinc-300'>
            <div>
              <strong>Reversed Wands (Fire):</strong> Blocked creativity, lack
              of motivation, delayed action, or internalized passion
            </div>
            <div>
              <strong>Reversed Cups (Water):</strong> Blocked emotions,
              emotional confusion, suppressed feelings, or emotional withdrawal
            </div>
            <div>
              <strong>Reversed Swords (Air):</strong> Mental confusion, blocked
              communication, internal conflict, or delayed decisions
            </div>
            <div>
              <strong>Reversed Pentacles (Earth):</strong> Material delays,
              financial blocks, practical obstacles, or blocked abundance
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Tips for Reading Reversed Cards
          </h2>
          <ul className='list-disc list-inside space-y-2 text-sm text-zinc-300'>
            <li>
              Don't automatically assume reversed means "bad" or "negative"
            </li>
            <li>
              Consider if the energy is simply delayed or happening internally
            </li>
            <li>
              Look for patterns—multiple reversed cards may indicate a theme
            </li>
            <li>
              Trust your intuition—sometimes a reversal feels right even if it
              doesn't match traditional meanings
            </li>
            <li>
              Practice reading both upright and reversed meanings to develop
              your understanding
            </li>
          </ul>
        </div>

        <div
          id='related-topics'
          className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Related Topics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Link
              href='/grimoire/tarot'
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
            >
              Tarot Cards Guide
            </Link>
            <Link
              href='/grimoire/card-combinations'
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
            >
              Reading Card Combinations
            </Link>
            <Link
              href='/grimoire/tarot/spreads'
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
            >
              Tarot Spreads
            </Link>
          </div>
        </div>
      </div>
    </SEOContentTemplate>
  );
}
