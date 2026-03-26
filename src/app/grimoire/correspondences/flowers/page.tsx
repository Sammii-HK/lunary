import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Flower Correspondences: Magical Flower Meanings | Lunary',
  description:
    'Complete guide to magical flower correspondences. Learn how to use roses, lavender, jasmine, marigolds, and more in spells, offerings, and rituals.',
  keywords: [
    'flower correspondences',
    'flower magic',
    'rose magic',
    'lavender magic',
    'magical flowers',
    'flower meanings',
    'floral magic',
  ],
  openGraph: {
    title: 'Flower Correspondences Guide | Lunary',
    description:
      'Complete guide to magical flower correspondences and meanings.',
    url: 'https://lunary.app/grimoire/correspondences/flowers',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Flower Correspondences Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flower Correspondences Guide | Lunary',
    description: 'Complete guide to magical flowers and their correspondences.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/flowers',
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
    question: 'How do I use flowers in magic?',
    answer:
      'Flowers can be used fresh on altars and in offerings, dried in sachets and spell jars, as essential oils in anointing, added to ritual baths, scattered in sacred spaces, or woven into garlands and crowns. Their beauty and fragrance carry specific magical energies.',
  },
  {
    question: 'What flowers are best for love spells?',
    answer:
      'Rose (especially red and pink) is the primary love flower. Jasmine attracts romantic love, lavender brings peace and devotion, hibiscus ignites passion, and apple blossom encourages new romance. Combine flowers with Venus-day timing for strongest effect.',
  },
  {
    question: 'Can I use dried flowers in magic?',
    answer:
      'Yes, dried flowers retain their magical properties and are often more practical for long-term use in sachets, spell jars, and incense. Some practitioners believe fresh flowers have stronger energy, while dried flowers have more concentrated, stable power.',
  },
  {
    question: 'What flowers are good for protection?',
    answer:
      'Marigold (calendula) is excellent for protection and boundary setting. Snapdragons protect against negative energy, carnations guard against evil, and sunflowers bring protective solar energy. Black-eyed Susans ward off negative spirits.',
  },
  {
    question: 'How do flower colors affect their magic?',
    answer:
      'Flower color adds additional magical properties. Red flowers enhance passion and courage, pink aids love and friendship, white purifies and blesses, yellow brings joy and success, purple deepens spirituality, and orange encourages creativity and success.',
  },
];

export default function FlowersIndexPage() {
  const flowers = Object.entries(correspondencesData.flowers);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Flower Correspondences | Lunary'
        h1='Flower Correspondences: Magical Flower Guide'
        description='Flowers have been used in magic for centuries. Each bloom carries unique energy and symbolism for spells, offerings, and decoration.'
        keywords={[
          'flower correspondences',
          'flower magic',
          'magical flowers',
          'floral magic',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/flowers'
        whatIs={{
          question: 'What are Flower Correspondences?',
          answer:
            'Flower correspondences are the magical associations and properties of different blooms. Each flower carries unique energy based on its planetary ruler, element, color, and traditional symbolism. Understanding flower correspondences allows practitioners to select the right flowers for spells, offerings, altar decoration, and ritual work.',
        }}
        tldr='Rose for love, lavender for peace, jasmine for attraction, marigold for protection, sunflower for success, lily for purity, chamomile for calm, and hibiscus for passion.'
        meaning={`Flowers have been used in magical and spiritual practice across all cultures throughout history. Their beauty, fragrance, and ephemeral nature connect us to the cycles of life and the divine.

**Why Flowers are Magical:**

Flowers represent the peak expression of a plant's energy — they are designed to attract, to seduce, to communicate. This makes them powerful magical allies for:
- **Attraction magic**: Drawing love, money, opportunities
- **Beauty magic**: Enhancing appearance and charm
- **Offerings**: Honoring deities and spirits
- **Altar decoration**: Creating sacred atmosphere
- **Healing work**: Emotional and spiritual healing

**Working with Flower Energy:**

**Fresh Flowers**: Strongest energy, best for immediate use, offerings, and fresh altar decoration. Their beauty and scent create powerful atmosphere.

**Dried Flowers**: More stable, concentrated energy. Perfect for sachets, spell jars, and long-term magical tools. Can be stored for extended periods.

**Essential Oils**: Concentrated flower essence. Use for anointing, adding to baths, or diffusing during ritual.

**Flower Waters**: Gentle floral essence. Rose water and orange blossom water are traditional for cleansing and blessing.`}
        howToWorkWith={[
          'Research the flower correspondences that match your intention',
          'Source flowers ethically — grow your own when possible',
          'Use fresh flowers on your altar and for offerings',
          'Dry flowers for sachets, spell jars, and incense',
          'Combine flower magic with matching moon phases and days',
        ]}
        relatedItems={[
          {
            name: 'Herbs',
            href: '/grimoire/correspondences/herbs',
            type: 'Correspondences',
          },
          {
            name: 'Colors',
            href: '/grimoire/correspondences/colors',
            type: 'Correspondences',
          },
          {
            name: 'Elements',
            href: '/grimoire/correspondences/elements',
            type: 'Correspondences',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'Guide',
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
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Sabbats', href: '/grimoire/wheel-of-the-year' },
        ]}
        ctaText='Want personalized flower recommendations for your practice?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Magical Flowers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any flower to explore its full correspondences, magical
            uses, and practical applications.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {flowers.map(([name, data]) => (
              <Link
                key={name}
                href={`/grimoire/correspondences/flowers/${stringToKebabCase(name)}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-pink-700/50 transition-all'
              >
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-pink-300 transition-colors mb-2'>
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

        <section className='mb-12 bg-pink-950/20 border border-pink-900/50 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Flowers by Purpose
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-pink-400 font-medium'>Love & Romance:</p>
              <p className='text-zinc-400'>Rose, Jasmine, Hibiscus, Orchid</p>
            </div>
            <div>
              <p className='text-pink-400 font-medium'>Peace & Healing:</p>
              <p className='text-zinc-400'>Lavender, Chamomile, Lily, Violet</p>
            </div>
            <div>
              <p className='text-pink-400 font-medium'>Protection:</p>
              <p className='text-zinc-400'>Marigold, Snapdragon, Carnation</p>
            </div>
            <div>
              <p className='text-pink-400 font-medium'>Success & Prosperity:</p>
              <p className='text-zinc-400'>Sunflower, Daffodil, Honeysuckle</p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
