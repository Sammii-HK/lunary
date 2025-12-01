import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Crystals from '../components/Crystals';

export const revalidate = 86400; // Revalidate every 24 hours

export const metadata: Metadata = {
  title: 'Crystals: Complete Guide to Crystal Meanings & Uses - Lunary',
  description:
    'Comprehensive crystal guide with daily selections, categories, and how to work with crystals for healing and magic. Learn crystal properties, correspondences, and practices. Essential guide for crystal work.',
  keywords: [
    'crystals',
    'crystal healing',
    'crystal meanings',
    'crystal guide',
    'gemstones',
    'crystal properties',
    'crystal magic',
    'how to use crystals',
  ],
  openGraph: {
    title: 'Crystals: Complete Guide to Crystal Meanings & Uses - Lunary',
    description:
      'Comprehensive crystal guide with daily selections, categories, and how to work with crystals for healing and magic.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Crystals: Complete Guide to Crystal Meanings & Uses - Lunary',
    description:
      'Comprehensive crystal guide with daily selections, categories, and how to work with crystals for healing and magic.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/crystals',
  },
};

export default function CrystalsPage() {
  return (
    <>
      <SEOContentTemplate
        title='Crystals: Complete Guide to Crystal Meanings & Uses - Lunary'
        h1='Crystals'
        description='Comprehensive crystal guide with daily selections, categories, and how to work with crystals for healing and magic. Learn crystal properties, correspondences, and practices.'
        keywords={[
          'crystals',
          'crystal healing',
          'crystal meanings',
          'crystal guide',
          'gemstones',
          'crystal properties',
        ]}
        canonicalUrl='https://lunary.app/grimoire/crystals'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Crystals', href: '/grimoire/crystals' },
        ]}
        intro='Crystals are powerful tools for healing, protection, and magical work. Each crystal carries unique vibrational energy that can enhance your practice, support healing, and amplify intentions. This comprehensive guide covers crystal meanings, properties, correspondences, and how to work with crystals effectively in your magical practice.'
        meaning={`Crystals are formed deep within the Earth over millions of years, absorbing and storing the planet's energy. Each crystal has a unique molecular structure that creates specific vibrational frequencies. These frequencies interact with your own energy field, helping to balance, heal, and amplify your intentions.

Crystals work through resonance—their stable energy patterns help align your own energy. When you work with a crystal, you're connecting with its energetic signature and allowing it to support your goals. Different crystals resonate with different chakras, elements, planets, and intentions, making them versatile tools for magical work.

The effectiveness of crystal work depends on your intention, the crystal's properties, and how you use it. Cleansing, charging, and programming crystals enhances their effectiveness and aligns them with your specific needs.`}
        howToWorkWith={[
          'Choose crystals that align with your intention',
          'Cleanse crystals regularly to clear stored energy',
          'Charge crystals under moonlight or sunlight',
          'Program crystals with specific intentions',
          'Carry crystals for daily support',
          'Place crystals in your space for energy work',
          'Use crystals in meditation and ritual',
          'Combine crystals for amplified effects',
        ]}
        faqs={[
          {
            question: 'How do I cleanse my crystals?',
            answer:
              'Common cleansing methods include: running water (if safe for the crystal), salt water, smudging with sage, burying in earth, moonlight or sunlight exposure, sound (singing bowls or bells), and visualization. Choose methods that resonate with you and are safe for your specific crystals.',
          },
          {
            question: 'Do I need to charge crystals?',
            answer:
              "Charging refreshes a crystal's energy and aligns it with your intention. Moonlight (especially full moon) is excellent for most crystals. Sunlight works for some but can fade certain crystals. You can also charge with intention, visualization, or by placing with other charged crystals.",
          },
          {
            question: 'Can I use multiple crystals together?',
            answer:
              "Yes! Combining crystals creates powerful synergies. Choose crystals that complement each other's properties. For example, combine rose quartz (love) with amethyst (spiritual connection) for love spells, or clear quartz (amplification) with any other crystal to enhance its energy.",
          },
        ]}
        internalLinks={[
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
          { text: 'Chakras', href: '/grimoire/chakras' },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <Crystals />
      </div>
    </>
  );
}
