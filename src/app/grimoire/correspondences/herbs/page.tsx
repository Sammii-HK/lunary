import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../utils/string';

export const metadata: Metadata = {
  title: 'Herb Correspondences: Complete Magical Herb Guide | Lunary',
  description:
    'Complete guide to magical herb correspondences. Learn how to use sage, rosemary, lavender, mugwort, and more in spells, incense, and rituals.',
  keywords: [
    'herb correspondences',
    'magical herbs',
    'herb magic',
    'sage magic',
    'rosemary magic',
    'witchcraft herbs',
    'spell herbs',
    'herbal magic',
  ],
  openGraph: {
    title: 'Herb Correspondences Guide | Lunary',
    description: 'Complete guide to magical herb correspondences and uses.',
    url: 'https://lunary.app/grimoire/correspondences/herbs',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Herb Correspondences Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herb Correspondences Guide | Lunary',
    description: 'Complete guide to magical herbs and their correspondences.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/herbs',
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
    question: 'How do I use herbs in magic?',
    answer:
      'Herbs can be used in many magical ways: burned as incense or smudge, added to sachets and spell jars, used in ritual baths, brewed as magical teas, infused into oils, scattered in sacred spaces, or carried as charms. The method depends on your intention and the specific herb.',
  },
  {
    question: 'What herbs are best for protection magic?',
    answer:
      'Common protection herbs include sage (cleansing and protection), rosemary (warding and protection), basil (repelling negativity), black pepper (banishing), and bay leaves (protection and strength). These can be burned, carried, or placed around your space.',
  },
  {
    question: 'How do planetary correspondences affect herbs?',
    answer:
      'Each herb is associated with one or more planets, which determines its magical properties. Sun herbs bring success and vitality, Moon herbs aid intuition and emotions, Mars herbs provide courage and protection, Venus herbs attract love, Mercury herbs enhance communication, Jupiter herbs bring abundance, and Saturn herbs aid in banishing.',
  },
  {
    question: 'Can I substitute herbs in spells?',
    answer:
      'Yes, herbs with similar correspondences can often be substituted. Look for herbs with the same planetary ruler, element, or magical properties. Rosemary is considered a universal substitute that can replace almost any herb in a pinch.',
  },
  {
    question: 'What is the best way to store magical herbs?',
    answer:
      'Store dried herbs in airtight glass containers away from direct sunlight. Label each jar with the herb name and date collected/purchased. Keep herbs in a cool, dry place. Most dried herbs retain their magical potency for 1-2 years when properly stored.',
  },
];

export default function HerbsIndexPage() {
  const herbs = Object.entries(correspondencesData.herbs);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Herb Correspondences | Lunary'
        h1='Herb Correspondences: Magical Herbs Guide'
        description='Herbs are essential to magical practice. Learn the properties, correspondences, and uses of these powerful plant allies.'
        keywords={[
          'herb correspondences',
          'magical herbs',
          'herb magic',
          'witchcraft herbs',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/herbs'
        whatIs={{
          question: 'What are Herb Correspondences?',
          answer:
            'Herb correspondences are the magical associations and properties of plants used in witchcraft and spellwork. Each herb has connections to specific planets, elements, deities, and magical purposes. Understanding these correspondences allows practitioners to select the right herbs for their intentions, whether for protection, love, prosperity, healing, or divination.',
        }}
        tldr='Each magical herb has planetary, elemental, and intentional correspondences. Use sage for cleansing, rosemary for protection and memory, lavender for peace and love, mugwort for divination, and basil for prosperity.'
        meaning={`Herbal magic is one of the oldest forms of magical practice, dating back thousands of years across cultures worldwide. Plants carry specific vibrational energies that can be harnessed for magical purposes.

**How Herbs Work in Magic:**

Herbs work through their inherent energetic properties, which are influenced by:
- **Planetary rulers**: Determines the herb's core magical nature
- **Elemental association**: Fire, Water, Air, or Earth qualities
- **Growing conditions**: When and where the herb thrives
- **Historical use**: Traditional magical and medicinal applications

**Common Methods of Using Herbs:**

1. **Burning**: As incense, smudge, or in candle magic
2. **Sachets**: Combining herbs in small bags for specific purposes
3. **Spell Jars**: Layering herbs with other ingredients
4. **Baths**: Adding to ritual bath water
5. **Oils**: Infusing herbs in carrier oils
6. **Tea**: Brewing for internal magic (with safe herbs only)
7. **Scattering**: Placing around spaces or on altars

**Safety Note:**

Not all magical herbs are safe for consumption or skin contact. Always research an herb thoroughly before use, especially if you plan to ingest it or apply it to skin. Some powerful magical herbs are toxic.`}
        howToWorkWith={[
          'Research the herb correspondences that match your intention',
          'Source herbs ethically — grow your own or buy sustainably',
          'Cleanse and consecrate herbs before magical use',
          'Combine herbs with matching planetary and elemental energies',
          'Thank the plant spirit and set your intention clearly',
        ]}
        relatedItems={[
          {
            name: 'Flowers',
            href: '/grimoire/correspondences/flowers',
            type: 'Correspondences',
          },
          {
            name: 'Elements',
            href: '/grimoire/correspondences/elements',
            type: 'Correspondences',
          },
          {
            name: 'Colors',
            href: '/grimoire/correspondences/colors',
            type: 'Correspondences',
          },
          {
            name: 'Planets',
            href: '/grimoire/planets',
            type: 'Astrology',
          },
          {
            name: 'Candle Magic',
            href: '/grimoire/candle-magic',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          {
            text: 'Correspondences Overview',
            href: '/grimoire/correspondences',
          },
          { text: 'Moon Phases', href: '/grimoire/moon-phases' },
          { text: 'Sabbats', href: '/grimoire/sabbats' },
          { text: 'Crystals', href: '/grimoire/crystals' },
        ]}
        ctaText='Want personalized herbal recommendations for your practice?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Magical Herbs
          </h2>
          <p className='text-zinc-400 mb-6'>
            Click on any herb to explore its full correspondences, magical uses,
            and practical applications.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {herbs.map(([name, data]) => (
              <Link
                key={name}
                href={`/grimoire/correspondences/herbs/${stringToKebabCase(name)}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-emerald-700/50 transition-all'
              >
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-emerald-300 transition-colors mb-2'>
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

        <section className='mb-12 bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Herbs by Purpose
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-emerald-400 font-medium'>Protection:</p>
              <p className='text-zinc-400'>
                Sage, Rosemary, Basil, Bay, Black Pepper
              </p>
            </div>
            <div>
              <p className='text-emerald-400 font-medium'>Love:</p>
              <p className='text-zinc-400'>
                Rose, Lavender, Jasmine, Hibiscus, Damiana
              </p>
            </div>
            <div>
              <p className='text-emerald-400 font-medium'>Prosperity:</p>
              <p className='text-zinc-400'>
                Basil, Cinnamon, Mint, Bay, Chamomile
              </p>
            </div>
            <div>
              <p className='text-emerald-400 font-medium'>Divination:</p>
              <p className='text-zinc-400'>
                Mugwort, Yarrow, Bay, Star Anise, Wormwood
              </p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
