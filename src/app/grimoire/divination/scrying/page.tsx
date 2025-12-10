import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

const scryingMethods = [
  {
    slug: 'crystal-ball',
    name: 'Crystal Ball',
    description: 'Classic divination using a clear sphere to receive visions',
  },
  {
    slug: 'mirror',
    name: 'Mirror Scrying',
    description: 'Using a black mirror or reflective surface for visions',
  },
  {
    slug: 'water',
    name: 'Water Scrying',
    description: 'Gazing into still water to perceive images and messages',
  },
  {
    slug: 'fire',
    name: 'Fire Scrying',
    description: 'Reading flames and embers for divination and insight',
  },
  {
    slug: 'smoke',
    name: 'Smoke Scrying',
    description: 'Interpreting patterns in rising smoke from incense or fire',
  },
];

export const metadata: Metadata = {
  title: 'Scrying: How to Use a Crystal Ball or Mirror for Divination | Lunary',
  description:
    'Master scrying techniques including crystal ball gazing, black mirror scrying, water scrying, and fire scrying. Learn how to receive psychic visions through reflective surfaces.',
  keywords: [
    'scrying',
    'crystal ball',
    'mirror scrying',
    'water scrying',
    'fire scrying',
    'divination methods',
    'psychic vision',
    'black mirror',
  ],
  openGraph: {
    title: 'Scrying: Crystal Ball & Mirror Divination | Lunary',
    description:
      'Master scrying techniques for psychic visions through crystal balls, mirrors, water, and fire.',
    url: 'https://lunary.app/grimoire/divination/scrying',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/divination',
        width: 1200,
        height: 630,
        alt: 'Scrying Divination Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scrying Guide | Lunary',
    description: 'Master crystal ball, mirror, water, and fire scrying.',
    images: ['/api/og/grimoire/divination'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/divination/scrying',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const faqs = [
  {
    question: 'How long does it take to learn scrying?',
    answer:
      "Scrying requires patience. Some see visions immediately, others need weeks or months. The key is consistent practice and trusting your intuition. Don't give up if you don't see clear images—feelings, colors, and impressions are also valid.",
  },
  {
    question: 'Do I need a crystal ball to scry?',
    answer:
      'No! You can scry with many tools: black mirrors, bowls of water, fire, candle flames, or even dark screens. Black mirrors are often easier for beginners than crystal balls. Choose what resonates with you.',
  },
  {
    question: "What if I don't see anything?",
    answer:
      "Visions aren't always literal images. You might feel emotions, see colors, sense movement, or receive symbolic impressions. All of these are valid forms of scrying. Trust what you experience, even if it's not a clear picture.",
  },
  {
    question: 'What is the best time for scrying?',
    answer:
      'Many practitioners prefer night, especially during a Full Moon. Dim lighting helps—complete darkness or candlelight is ideal. The key is finding a time when you can be undisturbed and in a meditative state.',
  },
  {
    question: 'How do I interpret scrying visions?',
    answer:
      'Trust your first impressions. Visions can be literal, symbolic, or emotional. Consider colors, shapes, and feelings. Keep a journal of your sessions and look for patterns over time. Your personal associations matter most.',
  },
];

export default function ScryingIndexPage() {
  const scryingListSchema = createItemListSchema({
    name: 'Scrying Methods',
    description:
      'Complete guide to scrying methods including crystal ball, mirror, water, fire, and smoke scrying.',
    url: 'https://lunary.app/grimoire/divination/scrying',
    items: scryingMethods.map((method) => ({
      name: method.name,
      url: `https://lunary.app/grimoire/divination/scrying/${method.slug}`,
      description: method.description,
    })),
  });

  return (
    <>
      {renderJsonLd(scryingListSchema)}
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <SEOContentTemplate
          title='Scrying | Lunary'
          h1='Scrying: Complete Divination Guide'
          description='Scrying is the ancient practice of gazing into reflective surfaces to receive psychic visions and messages from the subconscious and spiritual realms.'
          keywords={[
            'scrying',
            'crystal ball',
            'mirror scrying',
            'water scrying',
            'fire scrying',
          ]}
          canonicalUrl='https://lunary.app/grimoire/divination/scrying'
          breadcrumbs={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Divination', href: '/grimoire/divination' },
            { label: 'Scrying', href: '/grimoire/divination/scrying' },
          ]}
          whatIs={{
            question: 'What is scrying?',
            answer:
              'Scrying is an ancient divination practice of gazing into reflective or translucent surfaces to receive visions, messages, and psychic insights. The surface acts as a focal point that helps quiet the conscious mind and access deeper awareness. Common scrying tools include crystal balls, black mirrors, water, fire, and smoke.',
          }}
          tldr='Scrying uses reflective surfaces (crystal balls, mirrors, water, fire) to receive visions. Dim the lights, relax your gaze, and let images arise naturally. Trust impressions even if not clear pictures.'
          meaning={`Scrying is one of humanity's oldest divination practices, used across cultures for millennia. The word comes from the English "descry," meaning to perceive or reveal.

**How Scrying Works:**

Scrying works by relaxing the conscious mind and allowing images to arise from the subconscious or psychic senses. The reflective surface serves as a focus point, not the source of the visions themselves. In this relaxed state, you become receptive to impressions, symbols, and messages.

**Scrying Methods:**

**Crystal Ball:** The most iconic scrying tool. Clear quartz, obsidian, or glass spheres act as a focal point. Requires practice but offers deep visions.

**Black Mirror:** Obsidian or black glass creates a void that's often easier for beginners. The darkness helps quiet the conscious mind.

**Water Scrying:** A bowl of water, preferably dark or moonlit, is simple and accessible. The water's surface reflects and reveals images.

**Fire Scrying:** Gazing into flames or embers creates moving visions. Powerful but requires fire safety awareness.

**Smoke Scrying:** Interpreting patterns in rising smoke from incense or fire. Good for receiving quick messages.

**Keys to Success:**

- Create a quiet, dimly lit space
- Cleanse your scrying tool
- Set your intention or ask a question
- Gaze softly without hard focus
- Allow images, symbols, or feelings to emerge
- Trust your first impressions
- Journal immediately after`}
          howToWorkWith={[
            'Choose a scrying method that resonates with you',
            'Create a quiet, dimly lit environment',
            'Cleanse your scrying tool before use',
            'Set a clear intention or question',
            'Gaze softly without forcing focus',
            'Allow visions to emerge naturally',
            'Trust your first impressions',
            'Journal immediately after each session',
          ]}
          tables={[
            {
              title: 'Scrying Method Comparison',
              headers: ['Method', 'Difficulty', 'Best For'],
              rows: [
                [
                  'Crystal Ball',
                  'Intermediate',
                  'Deep visions, detailed imagery',
                ],
                ['Black Mirror', 'Beginner', 'First-timers, spirit contact'],
                ['Water Scrying', 'Beginner', 'Accessibility, moon work'],
                [
                  'Fire Scrying',
                  'Intermediate',
                  'Dynamic visions, transformation',
                ],
                ['Smoke Scrying', 'Beginner', 'Quick messages, yes/no'],
              ],
            },
          ]}
          journalPrompts={[
            'What did I see, feel, or sense during scrying?',
            'What symbols appeared and what do they mean to me?',
            'How did my body and emotions respond?',
            'What message am I receiving?',
          ]}
          relatedItems={[
            {
              name: 'Divination Guide',
              href: '/grimoire/divination',
              type: 'Guide',
            },
            {
              name: 'Pendulum',
              href: '/grimoire/divination/pendulum',
              type: 'Method',
            },
            {
              name: 'Dream Interpretation',
              href: '/grimoire/divination/dream-interpretation',
              type: 'Method',
            },
            { name: 'Tarot', href: '/grimoire/tarot', type: 'Method' },
          ]}
          internalLinks={[
            { text: 'Divination Overview', href: '/grimoire/divination' },
            {
              text: 'Pendulum Divination',
              href: '/grimoire/divination/pendulum',
            },
            { text: 'Tarot Reading', href: '/tarot' },
            { text: 'Grimoire Home', href: '/grimoire' },
          ]}
          ctaText='Explore more divination methods'
          ctaHref='/grimoire/divination'
          faqs={faqs}
        >
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Scrying Methods
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {scryingMethods.map((method) => (
                <Link
                  key={method.slug}
                  href={`/grimoire/divination/scrying/${method.slug}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
                >
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-violet-300 transition-colors mb-2'>
                    {method.name}
                  </h3>
                  <p className='text-sm text-zinc-400'>{method.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </SEOContentTemplate>
      </div>
    </>
  );
}
