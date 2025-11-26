import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const scryingMethods = {
  'crystal-ball': {
    name: 'Crystal Ball Scrying',
    description:
      'The classic form of scrying using a clear or smoky crystal sphere to receive visions and messages.',
    tools: [
      'Crystal ball (clear quartz, obsidian, or glass)',
      'Dark cloth',
      'Candles for ambient lighting',
    ],
    technique:
      'Gaze softly into the crystal ball without focusing your eyes. Allow your vision to relax and let images, colors, or impressions form naturally.',
    history:
      'Crystal gazing dates back to ancient civilizations including the Druids, Romans, and medieval seers. Dr. John Dee, advisor to Queen Elizabeth I, was famous for his crystal ball work.',
    tips: [
      'Use dim, flickering candlelight',
      'Relax your eyes completely',
      'Allow images to come naturally',
      'Keep a scrying journal',
    ],
  },
  'black-mirror': {
    name: 'Black Mirror Scrying',
    description:
      'A powerful form of scrying using a dark, reflective surface to peer into other realms and receive visions.',
    tools: [
      'Black mirror (obsidian, black glass, or dark water)',
      'Candles placed behind you',
      'Dark room',
    ],
    technique:
      'Position the mirror so it reflects nothing. Gaze into the darkness, allowing your vision to relax and letting impressions arise from the void.',
    history:
      'Black mirror scrying has roots in ancient Mexico (obsidian mirrors) and European magical traditions. It was favored for spirit communication and deep trance work.',
    tips: [
      'Ensure no reflections in the mirror',
      'Work in complete darkness',
      'Use for deeper trance states',
      'Excellent for spirit contact',
    ],
  },
  'water-scrying': {
    name: 'Water Scrying',
    description:
      'One of the oldest forms of scrying, using still water in a bowl or natural body to receive images and guidance.',
    tools: [
      'Dark bowl filled with water',
      'Ink or dark dye (optional)',
      'Moonlight or candlelight',
    ],
    technique:
      'Fill a dark bowl with water and gaze at the surface. Allow ripples to settle and watch for images, colors, or impressions to appear.',
    history:
      'Water scrying (hydromancy) appears in nearly every ancient culture. Nostradamus famously used a bowl of water for his prophecies. Sacred wells and pools were used by Celtic seers.',
    tips: [
      'Use during moon phases',
      'Add a drop of ink for depth',
      'Natural water sources are powerful',
      'Full moon enhances visions',
    ],
  },
  'fire-scrying': {
    name: 'Fire Scrying',
    description:
      'An ancient practice of gazing into flames to receive visions, messages, and prophetic insights.',
    tools: ['Candle, fireplace, or bonfire', 'Dark room', 'Fire-safe space'],
    technique:
      'Gaze softly at the flames, relaxing your eyes and mind. Watch for shapes, colors, and movements that carry meaning. Let the fire speak to you.',
    history:
      "Fire gazing (pyromancy) is one of humanity's oldest forms of divination. Ancient Greeks, Romans, and shamanic cultures worldwide practiced fire scrying for guidance and prophecy.",
    tips: [
      'Use a single candle for beginners',
      'Bonfires for deeper work',
      'Note colors and movements',
      'Fire is excellent for transformation questions',
    ],
  },
};

const methodKeys = Object.keys(scryingMethods);

export async function generateStaticParams() {
  return methodKeys.map((method) => ({
    method: method,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ method: string }>;
}): Promise<Metadata> {
  const { method } = await params;
  const methodData = scryingMethods[method as keyof typeof scryingMethods];

  if (!methodData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${methodData.name}: Complete Guide & Techniques - Lunary`;
  const description = `Learn ${methodData.name} techniques for divination and receiving visions. Discover tools, methods, and tips for successful ${methodData.name.toLowerCase()}.`;

  return {
    title,
    description,
    keywords: [
      methodData.name.toLowerCase(),
      'scrying',
      'divination',
      'visions',
      method.replace('-', ' '),
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/divination/scrying/${method}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/divination/scrying/${method}`,
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
}

export default async function ScryingMethodPage({
  params,
}: {
  params: Promise<{ method: string }>;
}) {
  const { method } = await params;
  const methodData = scryingMethods[method as keyof typeof scryingMethods];

  if (!methodData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is ${methodData.name}?`,
      answer: methodData.description,
    },
    {
      question: `What tools do I need for ${methodData.name}?`,
      answer: `For ${methodData.name}, you'll need: ${methodData.tools.join(', ')}.`,
    },
    {
      question: `How do I practice ${methodData.name}?`,
      answer: methodData.technique,
    },
    {
      question: `What is the history of ${methodData.name}?`,
      answer: methodData.history,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${methodData.name} - Lunary`}
        h1={`${methodData.name}: Complete Guide`}
        description={`Learn ${methodData.name} techniques for divination and receiving visions.`}
        keywords={[
          methodData.name.toLowerCase(),
          'scrying',
          'divination',
          'visions',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/divination/scrying/${method}`}
        intro={methodData.description}
        tldr={`${methodData.name} uses ${methodData.tools[0].toLowerCase()} to receive visions. ${methodData.tips[0]}.`}
        meaning={`Scrying is the ancient art of gazing into a reflective or receptive surface to receive visions, messages, and insights. ${methodData.name} is one of the most respected forms of this practice.

${methodData.description}

${methodData.history}

The technique for ${methodData.name}:
${methodData.technique}

Scrying requires patience and regular practice. Your first sessions may yield little, but with time, your ability to receive clear visions will develop. The key is entering a relaxed, receptive state where your conscious mind quiets and your inner sight awakens.

Tools needed for ${methodData.name}:
${methodData.tools.map((t) => `- ${t}`).join('\n')}`}
        emotionalThemes={['Vision', 'Insight', 'Mystery', 'Revelation']}
        howToWorkWith={[
          'Prepare your scrying tools',
          'Create a quiet, dimly lit space',
          'Enter a relaxed, meditative state',
          'Gaze softly without focusing',
          'Allow images to arise naturally',
          'Record your visions immediately',
        ]}
        rituals={methodData.tips}
        tables={[
          {
            title: `${methodData.name} Requirements`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Tools', methodData.tools.join(', ')],
              ['Lighting', 'Dim, ambient'],
              ['Setting', 'Quiet, private space'],
              ['Duration', '15-30 minutes'],
            ],
          },
        ]}
        journalPrompts={[
          'What visions did I receive today?',
          'What colors or shapes appeared?',
          'How do my visions relate to my questions?',
          'How can I deepen my scrying practice?',
        ]}
        relatedItems={[
          { name: 'Scrying Guide', href: '/grimoire/scrying', type: 'Guide' },
          { name: 'Divination', href: '/grimoire/divination', type: 'Guide' },
          {
            name: 'Meditation',
            href: '/grimoire/meditation',
            type: 'Practice',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Divination', href: '/grimoire/divination' },
          {
            label: methodData.name,
            href: `/grimoire/divination/scrying/${method}`,
          },
        ]}
        internalLinks={[
          { text: 'Scrying Guide', href: '/grimoire/scrying' },
          { text: 'Divination Methods', href: '/grimoire/divination' },
          { text: 'Meditation', href: '/grimoire/meditation' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more divination methods'
        ctaHref='/grimoire/divination'
        faqs={faqs}
      />
    </div>
  );
}
