import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import CandleMagic from '../components/CandleMagic';

export const metadata: Metadata = {
  title: 'Candle Magic: Complete Guide - Lunary',
  description:
    'Learn the art of candle magic: color meanings, carving techniques, anointing with oils, lighting candles on altar, incantations by color, safety practices, and candle rituals. Comprehensive guide for beginners and advanced practitioners.',
  keywords: [
    'candle magic',
    'candle spells',
    'candle rituals',
    'candle colors',
    'candle carving',
    'anointing candles',
    'candle safety',
    'candle magic guide',
    'how to do candle magic',
  ],
  openGraph: {
    title: 'Candle Magic: Complete Guide - Lunary',
    description:
      'Learn the art of candle magic: color meanings, carving techniques, anointing with oils, lighting candles on altar, incantations by color, safety practices, and candle rituals.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Candle Magic: Complete Guide - Lunary',
    description:
      'Learn the art of candle magic: color meanings, carving techniques, anointing with oils, lighting candles on altar, incantations by color, safety practices, and candle rituals.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/candle-magic',
  },
};

export default function CandleMagicPage() {
  return (
    <>
      <SEOContentTemplate
        title='Candle Magic: Complete Guide - Lunary'
        h1='Candle Magic'
        description='Learn the art of candle magic: color meanings, carving techniques, anointing, safety, and rituals. Candle magic is one of the most accessible forms of spellwork, perfect for beginners and experienced practitioners alike.'
        keywords={[
          'candle magic',
          'candle spells',
          'candle rituals',
          'candle colors',
          'candle carving',
          'anointing candles',
          'candle safety',
        ]}
        canonicalUrl='https://lunary.app/grimoire/candle-magic'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Candle Magic', href: '/grimoire/candle-magic' },
        ]}
        intro='Candle magic is one of the most accessible and powerful forms of spellwork. By combining color correspondences, intention-setting, and the transformative power of fire, candle magic allows practitioners to manifest their desires and work with elemental energies. This comprehensive guide covers everything you need to know to practice candle magic safely and effectively, from choosing the right candle colors to advanced carving and anointing techniques.'
        meaning={`Candle magic harnesses the power of fire, one of the four classical elements, to manifest intentions and create change. The flame represents transformation, purification, and the connection between the physical and spiritual realms. When you light a candle with intention, you are activating powerful energetic forces that work to bring your desires into reality.

The practice combines multiple magical techniques: color correspondences align your intention with specific energies, carving focuses your will into the candle itself, anointing adds another layer of intention through oils and herbs, and the act of lighting creates a bridge between your intention and manifestation.

Candle magic works through sympathetic magic—the principle that symbolic actions create real-world results. The candle becomes a focal point for your intention, and as it burns, it releases your intention into the universe. The flame transforms your desire from thought into action, from potential into reality.`}
        howToWorkWith={[
          'Choose candle colors that match your intention',
          'Carve symbols, words, or names into the candle',
          'Anoint with oils that correspond to your goal',
          'Light candles in proper order on your altar',
          'Use specific incantations for each color',
          'Practice fire safety at all times',
          'Let candles burn completely when possible',
          'Dispose of wax remnants respectfully',
        ]}
        faqs={[
          {
            question: 'What color candle should I use?',
            answer:
              'Choose colors based on your intention: red for love/passion, green for prosperity, blue for peace/healing, white for protection/purification, black for banishing. Each color carries specific energetic properties.',
          },
          {
            question: 'How do I carve a candle?',
            answer:
              'Use an athame, pin, or sharp tool. Carve from top to bottom for attracting/manifesting, bottom to top for banishing. Carve your intention, name, or symbols while focusing on your goal.',
          },
          {
            question: 'Is candle magic safe?',
            answer:
              'Yes, when practiced safely. Never leave burning candles unattended, keep them away from flammable materials, trim wicks, and have water or a fire extinguisher nearby. Consider LED candles for long-term spells.',
          },
        ]}
        internalLinks={[
          {
            text: 'Spellcraft Fundamentals',
            href: '/grimoire/spellcraft-fundamentals',
          },
          {
            text: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
          { text: 'Moon Rituals', href: '/grimoire/moon-rituals' },
        ]}
      />
      <div className='max-w-4xl p-4'>
        <CandleMagic />
      </div>
    </>
  );
}
