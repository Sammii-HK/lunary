import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { createArticleSchema, renderJsonLd } from '@/lib/schema';
import SynastryGeneratorClient from './synastry-generator-client';

export const metadata: Metadata = {
  title: 'Synastry Chart Generator: Compare Two Birth Charts | Lunary',
  description:
    'Generate a synastry chart to explore relationship compatibility. Compare two birth charts and see key aspects, strengths, and growth edges.',
  keywords: [
    'synastry',
    'synastry chart',
    'synastry generator',
    'compatibility chart',
    'relationship astrology',
    'birth chart compatibility',
  ],
  alternates: {
    canonical: 'https://lunary.app/grimoire/synastry/generate',
  },
  openGraph: {
    title: 'Synastry Chart Generator | Lunary',
    description:
      'Generate a synastry chart to explore relationship compatibility and key aspects.',
    url: 'https://lunary.app/grimoire/synastry/generate',
    type: 'article',
  },
};

export default function SynastryGeneratorPage() {
  const articleSchema = createArticleSchema({
    headline: 'Synastry Chart Generator',
    description:
      'Compare two birth charts to uncover relationship compatibility.',
    url: 'https://lunary.app/grimoire/synastry/generate',
    keywords: ['synastry chart', 'compatibility chart', 'synastry generator'],
    section: 'Synastry',
  });

  const tableOfContents = [
    { label: 'Input Charts', href: '#input-charts' },
    { label: 'Synastry Summary', href: '#synastry-summary' },
    { label: 'Key Aspects', href: '#key-aspects' },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(articleSchema)}
      <SEOContentTemplate
        title='Synastry Chart Generator · Lunary'
        h1='Synastry Chart Generator'
        description='Compare two birth charts to discover compatibility, strengths, and growth areas.'
        keywords={metadata.keywords as string[]}
        canonicalUrl='https://lunary.app/grimoire/synastry/generate'
        tableOfContents={tableOfContents}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Synastry', href: '/grimoire/synastry' },
          { label: 'Generate' },
        ]}
        intro='Generate a synastry chart to explore relationship dynamics. Compare two natal charts and see major aspects, strengths, and growth edges.'
        tldr='Enter two birth charts to generate synastry aspects and overlays. Use the results as a conversation tool: where do you feel ease, and where do you need clearer communication or boundaries?'
        meaning={`Synastry compares two birth charts to highlight areas of harmony and friction. Use it as a map for communication and growth, not a verdict. The most helpful results come from looking at personal planets first, then assessing the overall balance of supportive versus challenging connections.

Start with Sun, Moon, Venus, Mars, and Mercury. These describe identity, emotional needs, attraction, and communication. Outer planet contacts add longer-term themes and lessons.

If you see challenging aspects, treat them as growth edges. They show where patience, clarity, or compromise is needed. If you see supportive aspects, use them as anchors during conflict.

Treat the report as a starting point for honest dialogue. A few high-impact connections matter more than dozens of minor aspects.

If the chart feels complex, focus on one shared theme and one action you can both take. Clarity beats overwhelm.

It can help to note one supportive aspect and one challenging aspect. The supportive aspect shows what to lean on, while the challenging aspect shows where growth is required.

House overlays add practical context. When one person's planets fall into the other person's house, it shows where the relationship activates daily life. For example, planets in the 7th house highlight partnership and commitment, while planets in the 10th emphasize visibility or shared goals.

Angles are also important. Contacts to the Ascendant, Descendant, Midheaven, or IC tend to feel personal and noticeable. These can describe attraction, visibility, or shared direction over time.

Use the report as a mirror. It highlights patterns you can discuss, not a fixed destiny. The more honestly you talk about the themes, the more helpful the chart becomes.

If the chart feels dense, focus on one supportive aspect and one challenging aspect only. Depth beats volume.

Remember that compatibility grows with communication and choice. Use the chart to support those conversations, not to replace them.

Keep the focus on mutual growth rather than fault-finding.

One honest conversation will do more than a hundred minor aspects.`}
        tables={[
          {
            title: 'What the Generator Highlights',
            headers: ['Category', 'Why It Matters', 'What to Look For'],
            rows: [
              [
                'Sun/Moon',
                'Emotional compatibility',
                'Supportive aspects for felt safety',
              ],
              [
                'Venus/Mars',
                'Chemistry and attraction',
                'Mutual links for desire and affection',
              ],
              [
                'Mercury',
                'Communication style',
                'Ease vs friction in understanding',
              ],
              [
                'Saturn',
                'Long-term potential',
                'Commitment and responsibility themes',
              ],
              ['Angles', 'Personal impact', 'Contacts to ASC, DSC, MC, or IC'],
            ],
          },
          {
            title: 'House Overlay Hints',
            headers: ['House', 'Emphasis'],
            rows: [
              ['1st', 'Identity and first impressions'],
              ['4th', 'Home, roots, and comfort'],
              ['7th', 'Partnership and commitment'],
              ['10th', 'Public life and shared goals'],
            ],
          },
        ]}
        howToWorkWith={[
          'Start with personal planet aspects before outer-planet themes.',
          'Note the most repeated aspect type (trines, squares, oppositions).',
          'Check house overlays to see where the connection lands in daily life.',
          'Use one or two key aspects as conversation prompts.',
          'Avoid treating one challenging aspect as a final verdict.',
        ]}
        rituals={[
          'Write down the top three supportive aspects and celebrate them.',
          'Pick one challenging aspect and agree on one shared practice.',
          'Do a short check-in ritual after conflict to reset.',
          'Use a weekly 10-minute reflection to track patterns.',
        ]}
        journalPrompts={[
          'Where do we feel naturally aligned, and why?',
          'What is our most common misunderstanding?',
          'Which aspect suggests a growth edge we can work on together?',
          'How do we handle conflict when it shows up?',
          'What do we consistently bring out in each other?',
          'What is one practical change we can try this week?',
        ]}
        relatedItems={[
          { name: 'Synastry Guide', href: '/grimoire/synastry', type: 'Guide' },
          {
            name: 'Birth Chart Basics',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
          {
            name: 'Astrological Aspects',
            href: '/grimoire/aspects',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Learn Synastry', href: '/grimoire/synastry' },
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
          { text: 'Aspects', href: '/grimoire/aspects' },
        ]}
        faqs={[
          {
            question: 'Do I need an exact birth time?',
            answer:
              'Birth time improves accuracy for houses and angles. You can still generate a synastry overview without it, but it will be less precise.',
          },
          {
            question: 'What matters most in synastry?',
            answer:
              'Sun/Moon connections, Venus/Mars chemistry, and strong aspect patterns between personal planets often show the biggest relationship themes.',
          },
          {
            question: 'Can synastry predict relationship success?',
            answer:
              'No. Synastry shows patterns and dynamics, but how you communicate, choose, and grow together matters more than any single aspect.',
          },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-zodiac'
            entityKey='zodiac'
            title='Synastry Connections'
          />
        }
        ctaText='Learn how synastry works'
        ctaHref='/grimoire/synastry'
      >
        <SynastryGeneratorClient />
      </SEOContentTemplate>
    </div>
  );
}
