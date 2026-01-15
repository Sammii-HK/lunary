import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../utils/string';

export const metadata: Metadata = {
  title: 'Color Correspondences: Magical Color Meanings Guide | Lunary',
  description:
    'Complete guide to color magic and correspondences. Learn what each color represents spiritually and how to use color in candles, spells, and rituals.',
  keywords: [
    'color correspondences',
    'color magic',
    'candle colors',
    'magical colors',
    'color meanings',
    'color symbolism',
    'witchcraft colors',
  ],
  openGraph: {
    title: 'Color Correspondences Guide | Lunary',
    description:
      'Complete guide to magical color correspondences and meanings.',
    url: 'https://lunary.app/grimoire/correspondences/colors',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Color Correspondences Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Correspondences Guide | Lunary',
    description: 'Complete guide to color magic and correspondences.',
    images: ['/api/og/grimoire/correspondences'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/colors',
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
    question: 'How do I choose the right candle color for my spell?',
    answer:
      'Match the candle color to your intention: red for passion and courage, pink for love and friendship, orange for success and creativity, yellow for communication and intellect, green for money and growth, blue for healing and peace, purple for spirituality and power, white for purification and any purpose, black for banishing and protection.',
  },
  {
    question: 'What color candle should I use if I do not have the right one?',
    answer:
      'White candles are universal substitutes that can be used for any magical purpose. They represent purity and contain all colors within them. In a pinch, a white candle can replace any other color.',
  },
  {
    question: 'Do colors have different meanings in different traditions?',
    answer:
      'Yes, color meanings can vary between magical traditions and cultures. The correspondences listed here represent common Western magical associations. Always trust your intuition and personal associations with colors as well.',
  },
  {
    question: 'How does color affect magic beyond candles?',
    answer:
      'Color influences all aspects of magical practice: altar cloths, clothing worn during ritual, visualization, crystals selected, flowers and herbs chosen, and even food offerings. Surrounding yourself with colors aligned with your intention strengthens your magical work.',
  },
  {
    question: 'What colors are associated with each chakra?',
    answer:
      'The seven main chakras correspond to rainbow colors: Root (red), Sacral (orange), Solar Plexus (yellow), Heart (green), Throat (blue), Third Eye (indigo/purple), Crown (violet/white). Working with these colors can help balance and heal specific chakras.',
  },
];

const colorDisplay: Record<string, string> = {
  Red: 'bg-red-600',
  Orange: 'bg-orange-500',
  Yellow: 'bg-yellow-400',
  Green: 'bg-green-500',
  Blue: 'bg-blue-500',
  Purple: 'bg-purple-500',
  White: 'bg-white',
  Black: 'bg-zinc-900 border border-zinc-600',
  Pink: 'bg-pink-400',
  Silver: 'bg-zinc-400',
  Gold: 'bg-amber-400',
};

export default function ColorsIndexPage() {
  const colors = Object.entries(correspondencesData.colors);

  const tableOfContents = [
    { label: 'All Magical Colors', href: '#all-magical-colors' },
    { label: 'Quick Reference', href: '#colors-by-intent' },
    { label: 'FAQs', href: '#faq' },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Color Resources',
      links: [
        {
          label: 'Color Correspondences',
          href: '/grimoire/correspondences/colors',
        },
        {
          label: 'Candle Magic Colors',
          href: '/grimoire/candle-magic/colors',
        },
        {
          label: 'Correspondences Overview',
          href: '/grimoire/correspondences',
        },
      ],
    },
    {
      title: 'Practice Tools',
      links: [
        { label: 'Elements', href: '/grimoire/correspondences/elements' },
        { label: 'Crystals', href: '/grimoire/crystals' },
        { label: 'Chakras', href: '/grimoire/chakras' },
      ],
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Color Correspondences | Lunary'
        h1='Color Correspondences: Magical Color Guide'
        description='Colors carry powerful magical associations. Use them in candle magic, altar decoration, visualization, and more.'
        keywords={[
          'color correspondences',
          'color magic',
          'candle colors',
          'magical colors',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/colors'
        whatIs={{
          question: 'What are Color Correspondences?',
          answer:
            'Color correspondences are the magical and spiritual associations assigned to each color based on their vibrational frequency and psychological impact. In magic, colors are used to amplify intentions, represent elements and planets, and align energy with specific goals. Understanding color correspondences helps practitioners choose the right colors for candles, altar cloths, visualization, and ritual attire.',
        }}
        tldr='Red for passion, pink for love, orange for success, yellow for communication, green for money, blue for healing, purple for spirituality, white for purity (universal substitute), black for banishing.'
        meaning={`Color magic is one of the most accessible and powerful forms of magical practice. Every color vibrates at a specific frequency that influences energy and intention.

**How Color Magic Works:**

Colors affect us psychologically and energetically. In magic, we harness these effects by:
- Choosing candles that match our intentions
- Wearing colors aligned with our goals
- Decorating altars with meaningful colors
- Visualizing specific colors during meditation
- Selecting crystals and herbs of corresponding colors

**Primary Magical Colors:**

**Red**: Passion, courage, strength, lust, survival
**Orange**: Success, creativity, legal matters, confidence
**Yellow**: Communication, intellect, study, travel
**Green**: Money, growth, fertility, abundance, healing
**Blue**: Healing, peace, wisdom, protection, truth
**Purple**: Spirituality, power, psychic ability, royalty
**White**: Purity, cleansing, all purposes (universal)
**Black**: Banishing, protection, absorbing negativity
**Pink**: Love, friendship, emotional healing, self-care
**Silver**: Moon magic, intuition, dreams, feminine energy
**Gold**: Sun magic, success, prosperity, masculine energy

**Planetary Color Associations:**

- Sun: Gold, Yellow
- Moon: Silver, White
- Mars: Red
- Mercury: Orange, Yellow
- Jupiter: Purple, Blue
- Venus: Green, Pink
- Saturn: Black, Dark Blue`}
        howToWorkWith={[
          'Identify your magical intention clearly',
          'Choose the color that best corresponds to your goal',
          'Incorporate the color through candles, cloths, or visualization',
          'Combine with matching herbs, crystals, and planetary timing',
          'Trust your intuition if a different color calls to you',
        ]}
        relatedItems={[
          {
            name: 'Candle Magic Colors',
            href: '/grimoire/candle-magic/colors',
            type: 'Guide',
          },
          {
            name: 'Elements',
            href: '/grimoire/correspondences/elements',
            type: 'Correspondences',
          },
          {
            name: 'Herbs',
            href: '/grimoire/correspondences/herbs',
            type: 'Correspondences',
          },
          {
            name: 'Crystals',
            href: '/grimoire/crystals',
            type: 'Guide',
          },
          {
            name: 'Planets',
            href: '/grimoire/astronomy/planets',
            type: 'Astrology',
          },
        ]}
        internalLinks={[
          {
            text: 'Correspondences Overview',
            href: '/grimoire/correspondences',
          },
          { text: 'Candle Magic', href: '/grimoire/candle-magic' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Crystals', href: '/grimoire/crystals' },
        ]}
        ctaText='Want personalized color recommendations for your practice?'
        ctaHref='/pricing'
        faqs={faqs}
        tableOfContents={tableOfContents}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-correspondences'
            entityKey='correspondences'
            title='Color Connections'
            sections={cosmicSections}
          />
        }
      >
        <section id='all-magical-colors' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Magical Colors
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any color to explore its full correspondences, magical
            uses, and practical applications.
          </p>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {colors.map(([name, data]) => (
              <Link
                key={name}
                href={`/grimoire/correspondences/colors/${stringToKebabCase(name)}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-zinc-600 transition-all'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div
                    className={`w-8 h-8 rounded-full ${colorDisplay[name] || 'bg-zinc-600'}`}
                  />
                  <h3 className='font-medium text-zinc-100 group-hover:text-zinc-200 transition-colors'>
                    {name}
                  </h3>
                </div>
                <p className='text-xs text-zinc-400'>
                  {data.correspondences.slice(0, 3).join(', ')}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section
          id='colors-by-intent'
          className='mb-12 bg-gradient-to-r from-red-900/20 via-green-900/20 to-blue-900/20 border border-zinc-700 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Colors by Intention
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-red-400 font-medium'>Love & Passion:</p>
              <p className='text-zinc-400'>Red, Pink, Rose Gold</p>
            </div>
            <div>
              <p className='text-green-400 font-medium'>Money & Abundance:</p>
              <p className='text-zinc-400'>Green, Gold, Silver</p>
            </div>
            <div>
              <p className='text-blue-400 font-medium'>Healing & Peace:</p>
              <p className='text-zinc-400'>Blue, White, Light Green</p>
            </div>
            <div>
              <p className='text-purple-400 font-medium'>
                Spirituality & Power:
              </p>
              <p className='text-zinc-400'>Purple, Indigo, Violet</p>
            </div>
            <div>
              <p className='text-orange-400 font-medium'>
                Success & Creativity:
              </p>
              <p className='text-zinc-400'>Orange, Gold, Yellow</p>
            </div>
            <div>
              <p className='text-zinc-400 font-medium'>
                Protection & Banishing:
              </p>
              <p className='text-zinc-400'>Black, White, Red</p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
