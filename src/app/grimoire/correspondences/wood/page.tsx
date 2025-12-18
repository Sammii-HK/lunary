import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../utils/string';

export const metadata: Metadata = {
  title: 'Wood Correspondences: Magical Tree & Wand Guide | Lunary',
  description:
    'Complete guide to magical wood correspondences. Learn how oak, willow, ash, elder, and other sacred trees connect to magic, wands, and ritual tools.',
  keywords: [
    'wood correspondences',
    'wand wood',
    'tree magic',
    'oak magic',
    'willow magic',
    'sacred trees',
    'magical woods',
  ],
  openGraph: {
    title: 'Wood Correspondences Guide | Lunary',
    description:
      'Complete guide to magical wood correspondences and sacred trees.',
    url: 'https://lunary.app/grimoire/correspondences/wood',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Wood Correspondences Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wood Correspondences Guide | Lunary',
    description: 'Complete guide to sacred trees and magical woods.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/wood',
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
    question: 'What wood is best for wands?',
    answer:
      'The best wand wood depends on your magical focus. Oak is all-purpose and strong, willow excels at moon magic and intuition, ash is excellent for divination, and elder is powerful but requires experienced handling. Choose wood that resonates with your practice.',
  },
  {
    question: 'How do I ethically harvest wood for magic?',
    answer:
      'Always ask the tree permission before taking any part. Take only fallen branches when possible. If cutting, do so during a waning moon and leave an offering. Never take more than the tree can spare, and thank it afterward.',
  },
  {
    question: 'What is the most magical tree?',
    answer:
      'Different traditions honor different trees. The Druids revered oak above all. Wiccans often work with willow. Elder is considered highly magical but demanding. Many consider the hawthorn or rowan most protective. Your ancestral traditions may guide you.',
  },
  {
    question: 'Can I use store-bought wood for magic?',
    answer:
      'Yes, purchased wood can be used magically. Cleanse it thoroughly and bond with it before use. However, wood you collect yourself or that comes from a meaningful tree (like one in your yard) will have stronger personal connection.',
  },
  {
    question: 'What wood should not be used in magic?',
    answer:
      'Elder requires caution and proper respect (never burn it). Some avoid blackthorn due to its association with dark magic. Any wood from a dead or diseased tree should be avoided. Trust your intuition about which woods feel appropriate.',
  },
];

export default function WoodIndexPage() {
  const woods = Object.entries(correspondencesData.wood);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Wood Correspondences | Lunary'
        h1='Wood Correspondences: Sacred Trees & Magical Woods'
        description='Trees are sacred in many traditions. Each wood carries unique magical properties for wands, staves, and ritual tools.'
        keywords={[
          'wood correspondences',
          'wand wood',
          'tree magic',
          'sacred trees',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/wood'
        whatIs={{
          question: 'What are Wood Correspondences?',
          answer:
            'Wood correspondences are the magical properties and associations of different tree species. Each type of wood carries unique energy influenced by its planetary ruler, element, and traditional symbolism. Understanding wood correspondences helps practitioners choose the right material for wands, staves, and other ritual tools.',
        }}
        tldr='Oak for strength and protection, willow for moon magic and intuition, ash for divination and world tree energy, elder for transformation and fairy magic, rowan for protection and psychic power.'
        meaning={`Trees have been considered sacred across cultures throughout human history. The Druids built their entire spiritual practice around tree wisdom. The Norse world-tree Yggdrasil connected all realms. Understanding wood correspondences connects you to this ancient tradition.

**Why Wood Matters in Magic:**

Wood carries the living essence of the tree long after harvest. Each species has absorbed different energies through its:
- **Growth patterns**: Fast-growing vs slow-growing
- **Habitat**: Where and how the tree thrives
- **Seasonal behavior**: Evergreen vs deciduous
- **Traditional lore**: Cultural and magical associations

**Common Magical Woods:**

**Oak**: Strength, protection, doorways, solar magic. King of the forest.
**Willow**: Moon magic, intuition, healing, flexibility. Connected to water.
**Ash**: The world tree, divination, protection, balance. Bridges realms.
**Elder**: Fairy magic, transformation, banishing. Demands respect.
**Rowan**: Protection, psychic power, success. Guards against enchantment.
**Hawthorn**: Fairy realm, heart magic, protection. Gateway tree.
**Birch**: New beginnings, purification, creativity. First tree in Celtic alphabet.
**Hazel**: Wisdom, divination, creativity. Sacred to poets.
**Apple**: Love, immortality, Avalon. Underworld connections.

**Using Wood in Magic:**

- **Wands**: Focus and direct energy
- **Staves**: Walking, ritual, grounding
- **Runes/Ogham**: Divination sets carved from appropriate wood
- **Altar tools**: Bowls, platters, offering dishes
- **Charms**: Small pieces carried for specific purposes`}
        howToWorkWith={[
          'Research the wood correspondences that match your intention',
          'Source wood ethically — ask permission, use fallen branches',
          'Cleanse and consecrate wood before magical use',
          'Bond with your wooden tools through regular use',
          'Store wood properly to maintain its energy',
        ]}
        relatedItems={[
          {
            name: 'Herbs',
            href: '/grimoire/correspondences/herbs',
            type: 'Correspondences',
          },
          {
            name: 'Witchcraft Tools',
            href: '/grimoire/modern-witchcraft/tools',
            type: 'Guide',
          },
          {
            name: 'Elements',
            href: '/grimoire/correspondences/elements',
            type: 'Correspondences',
          },
          {
            name: 'Planets',
            href: '/grimoire/astronomy/planets',
            type: 'Astrology',
          },
          {
            name: 'All Correspondences',
            href: '/grimoire/correspondences',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          {
            text: 'Correspondences Overview',
            href: '/grimoire/correspondences',
          },
          {
            text: 'Herb Correspondences',
            href: '/grimoire/correspondences/herbs',
          },
          { text: 'Sabbats', href: '/grimoire/wheel-of-the-year' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
        ]}
        ctaText='Want personalized wood recommendations for your practice?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Sacred Woods
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any wood to explore its full correspondences, magical uses,
            and practical applications.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {woods.map(([name, data]) => (
              <Link
                key={name}
                href={`/grimoire/correspondences/wood/${stringToKebabCase(name)}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
              >
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                  {name}
                </h3>
                <p className='text-sm text-zinc-400 mb-2'>
                  {data.correspondences.slice(0, 3).join(', ')}
                </p>
                <p className='text-xs text-zinc-400'>
                  Planet: {data.planets.join(', ')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
