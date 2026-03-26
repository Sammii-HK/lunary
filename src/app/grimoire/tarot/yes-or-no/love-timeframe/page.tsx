import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Yes or No Tarot for Love + Time Frame | Lunary',
  description:
    'Use a consistent method for yes/no tarot questions about love and timing. Includes suit timing cues and simple framing examples.',
  keywords: [
    'yes or no tarot love',
    'tarot yes or no love',
    'tarot time frame',
    'love tarot timing',
  ],
  openGraph: {
    title: 'Yes or No Tarot for Love + Time Frame | Lunary',
    description:
      'Use a consistent method for yes/no tarot questions about love and timing.',
    url: 'https://lunary.app/grimoire/tarot/yes-or-no/love-timeframe',
    siteName: 'Lunary',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/tarot/yes-or-no/love-timeframe',
  },
};

export default function TarotYesNoLoveTimeframePage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Yes or No Tarot for Love + Time Frame'
        h1='Yes or No Tarot: Love + Time Frame'
        description='A precise approach to yes/no tarot for love questions, plus a gentle timing framework.'
        keywords={[
          'yes or no tarot love',
          'tarot yes or no love',
          'tarot time frame',
          'love tarot timing',
        ]}
        canonicalUrl='https://lunary.app/grimoire/tarot/yes-or-no/love-timeframe'
        whatIs={{
          question: 'How do I ask yes or no tarot questions about love?',
          answer:
            'Keep the question specific, grounded, and near-term. Yes/no works best when the question is about a clear decision or invitation rather than a long-term outcome.',
        }}
        tldr='Ask one clear love question, pull one card, read it as Yes/No/Maybe, and use the suit for a rough timing cue.'
        intro='Love questions can be emotional, so a clear frame matters. Yes/no tarot works when the question is immediate and actionable, not when it tries to predict a long, complex relationship arc.'
        meaning={`### Good love questions
- "Should I text them this week?"
- "Is this connection open to a new start right now?"
- "Is it wise to accept this date?"

### Questions to avoid
- "Are we soulmates?"
- "Will we get married?"
- "Do they love me forever?"

### Timing cues (gentle, not absolute)
- Wands: days to a few weeks
- Cups: weeks (emotional timing)
- Swords: days (decision point)
- Pentacles: weeks to months (slow growth)

### Reversed cards
Reversed cards often mean "not yet" or "clarify the situation first." In love readings, that usually points to emotional processing, mixed signals, or missing context.`}
        tables={[
          {
            title: 'Love Yes/No Timing Cues (Upright)',
            headers: ['Suit', 'Likely Pace', 'Why'],
            rows: [
              ['Wands', 'Days to weeks', 'Fast momentum, sparks, action'],
              ['Cups', 'Weeks', 'Emotional processing and connection'],
              ['Swords', 'Days', 'Decision or clarity needed'],
              ['Pentacles', 'Weeks to months', 'Slow, practical progress'],
            ],
          },
        ]}
        faqs={[
          {
            question: 'Can tarot give an exact time frame?',
            answer:
              'Not precisely. Timing cues are best used as a general pace rather than a fixed date.',
          },
          {
            question: 'What does a Maybe mean in love readings?',
            answer:
              'Maybe usually means the situation depends on communication, timing, or a choice that has not happened yet.',
          },
          {
            question: 'Should I pull more cards for yes/no love questions?',
            answer:
              'Stick to one card for a yes/no read. If you want detail, switch to a short spread instead.',
          },
        ]}
        internalLinks={[
          { text: 'Yes or No Tarot Guide', href: '/grimoire/tarot/yes-or-no' },
          { text: 'Explore Tarot Cards', href: '/grimoire/tarot' },
          {
            text: 'Tarot Spreads for Relationships',
            href: '/grimoire/tarot/spreads',
          },
          { text: 'Daily Tarot Reading', href: '/tarot' },
        ]}
        relatedItems={[
          {
            name: 'Yes or No Tarot',
            href: '/grimoire/tarot/yes-or-no',
            type: 'Guide',
          },
          {
            name: 'Tarot Spreads',
            href: '/grimoire/tarot/spreads',
            type: 'Guide',
          },
        ]}
        ctaText='Want a personalized love reading?'
        ctaHref='/tarot'
      />
    </div>
  );
}
