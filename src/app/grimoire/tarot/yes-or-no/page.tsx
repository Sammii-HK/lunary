import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Yes or No Tarot: Quick Answers for Simple Questions | Lunary',
  description:
    'Learn how to read yes or no tarot answers with a consistent method. Includes upright vs reversed guidance, suit tendencies, and when to avoid yes/no questions.',
  keywords: [
    'yes or no tarot',
    'tarot yes or no',
    'yes no tarot',
    'tarot quick answer',
    'tarot decision reading',
  ],
  openGraph: {
    title: 'Yes or No Tarot | Lunary',
    description:
      'Learn how to read yes or no tarot answers with a consistent method.',
    url: 'https://lunary.app/grimoire/tarot/yes-or-no',
    siteName: 'Lunary',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot/yes-or-no',
  },
};

export default function TarotYesNoPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Yes or No Tarot: Quick Answers for Simple Questions'
        h1='Yes or No Tarot'
        description='A consistent way to read yes/no tarot questions without overcomplicating the answer.'
        keywords={[
          'yes or no tarot',
          'tarot yes or no',
          'yes no tarot',
          'tarot quick answer',
        ]}
        canonicalUrl='https://lunary.app/grimoire/tarot/yes-or-no'
        whatIs={{
          question: 'What is yes or no tarot?',
          answer:
            'Yes or no tarot is a quick decision reading style that assigns a simple Yes, No, or Maybe to a card. It works best for clear, practical questions where you want directional guidance rather than a deep narrative.',
        }}
        tldr='Ask a clear question, pull one card, and read it as Yes, No, or Maybe. Upright cards tend to be more direct; reversed cards often indicate delays or mixed signals.'
        intro='Yes or no tarot is about clarity, not complexity. It works best when your question is simple and specific, and you accept that the answer is a snapshot of the current energy.'
        meaning={`Use this method as a consistent framework:

1) Keep the question small and direct.
2) Pull one card.
3) Read upright as the primary answer and reversed as a caution or delay.
4) Add a single sentence of context so the answer stays grounded.

### Suit Tendencies (Upright)
- Wands: Yes (momentum and action)
- Cups: Yes (emotional alignment)
- Pentacles: Maybe (slow, practical progress)
- Swords: Maybe (uncertainty or mental conflict)

### Reversed Cards
Reversed cards usually point to delays, blockages, or internal work. Many reversed answers shift toward Maybe rather than a firm No.

### Court Cards
Court cards are usually Maybe. They depend on people, timing, or a shift in approach.

### Major Arcana
Major Arcana cards often answer Yes or No with a lesson attached. The outcome is tied to a bigger life theme.`}
        tables={[
          {
            title: 'Yes/No Tendencies by Suit (Upright)',
            headers: ['Suit', 'Tendency', 'Why'],
            rows: [
              ['Wands', 'Yes', 'Action, momentum, and initiative'],
              ['Cups', 'Yes', 'Emotional alignment and receptivity'],
              ['Pentacles', 'Maybe', 'Slow but steady, practical timing'],
              ['Swords', 'Maybe', 'Mental conflict or unclear data'],
            ],
          },
        ]}
        faqs={[
          {
            question: 'Can tarot really answer yes or no questions?',
            answer:
              'Yes, when the question is simple and specific. Tarot is better at showing energy and timing than delivering absolute certainty.',
          },
          {
            question: 'What if I keep getting Maybe?',
            answer:
              'Maybe usually means the situation is still forming or depends on a choice. Clarify the question or ask what would make it a Yes.',
          },
          {
            question: 'Should I use reversed cards for yes/no?',
            answer:
              'Yes. Reversed cards are useful in yes/no because they signal delays, internal blocks, or a need to adjust the approach.',
          },
        ]}
        internalLinks={[
          { text: 'Explore Tarot Cards', href: '/grimoire/tarot' },
          {
            text: 'Yes/No Love + Time Frame',
            href: '/grimoire/tarot/yes-or-no/love-timeframe',
          },
          { text: 'Daily Tarot Reading', href: '/tarot' },
          { text: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
        ]}
        relatedItems={[
          {
            name: 'Tarot Cards',
            href: '/grimoire/tarot',
            type: 'Guide',
          },
          {
            name: 'Tarot Spreads',
            href: '/grimoire/tarot/spreads',
            type: 'Guide',
          },
          {
            name: 'Yes/No Love + Time Frame',
            href: '/grimoire/tarot/yes-or-no/love-timeframe',
            type: 'Guide',
          },
        ]}
        ctaText='Want a personalized yes/no reading?'
        ctaHref='/tarot'
      >
        <div className='mt-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-300'>
          Best used for simple questions. If the question involves multiple
          people, long timelines, or major life decisions, use a spread instead
          of a yes/no pull.
        </div>
      </SEOContentTemplate>
    </div>
  );
}
