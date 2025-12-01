export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Incantations by Candle Color: Candle Magic Spells - Lunary',
  description:
    'Specific incantations to use when lighting candles of different colors. Learn powerful candle magic spells for love, prosperity, protection, and more. Speak with conviction and feel the energy of each color.',
  keywords: [
    'candle incantations',
    'candle color spells',
    'candle magic incantations',
    'candle color meanings',
    'candle spells by color',
    'candle magic words',
    'candle rituals',
    'color magic',
  ],
  openGraph: {
    title: 'Incantations by Candle Color: Candle Magic Spells - Lunary',
    description:
      'Specific incantations to use when lighting candles of different colors. Learn powerful candle magic spells for love, prosperity, protection, and more.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Incantations by Candle Color: Candle Magic Spells - Lunary',
    description:
      'Specific incantations to use when lighting candles of different colors. Learn powerful candle magic spells.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/incantations-by-candle-color',
  },
};

export default function IncantationsByCandleColorPage() {
  return (
    <SEOContentTemplate
      title='Incantations by Candle Color: Candle Magic Spells - Lunary'
      h1='Incantations by Candle Color'
      description='Specific incantations to use when lighting candles of different colors. Speak with conviction and feel the energy of each color. Learn powerful candle magic spells for love, prosperity, protection, and more.'
      keywords={[
        'candle incantations',
        'candle color spells',
        'candle magic incantations',
        'candle color meanings',
        'candle spells by color',
        'candle magic words',
      ]}
      canonicalUrl='https://lunary.app/grimoire/incantations-by-candle-color'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          label: 'Incantations by Candle Color',
          href: '/grimoire/incantations-by-candle-color',
        },
      ]}
      intro='Specific incantations to use when lighting candles of different colors. Speak with conviction and feel the energy of each color. These incantations combine the power of spoken word with color correspondences to amplify your candle magic.'
      meaning={`Each candle color carries specific energetic properties. When you combine color energy with powerful incantations, you create a focused intention that manifests your desires. Speak these incantations with conviction, feeling the energy of each color flowing through you.

**Red Candle:**
"By this red flame, passion and strength I claim. Courage flows through me, action takes form, my will is made manifest."
Use for: Love, courage, strength, action

**Pink Candle:**
"This pink light brings love and care, romance and friendship fill the air. Self-love grows, compassion flows, healing hearts wherever it goes."
Use for: Romance, self-love, friendship

**Orange Candle:**
"Orange fire burns bright and bold, success and opportunity unfold. Creativity flows, confidence grows, abundance comes as this flame glows."
Use for: Success, creativity, attraction

**Yellow Candle:**
"Yellow light brings clarity bright, communication flows day and night. Learning comes, joy becomes, mental clarity this flame brings."
Use for: Communication, learning, clarity

**Green Candle:**
"Green flame of growth and wealth, prosperity comes, abundance felt. Healing flows, nature knows, fertile ground where this light glows."
Use for: Prosperity, healing, growth

**Blue Candle:**
"Blue light brings peace and calm, healing waters, protective balm. Wisdom flows, truth it knows, spiritual growth this flame bestows."
Use for: Peace, healing, protection

**Purple Candle:**
"Purple flame of power and might, psychic vision, spiritual light. Transformation comes, wisdom becomes, higher knowledge this flame brings."
Use for: Spirituality, psychic ability

**White Candle:**
"White light pure and bright, protection, peace, and divine light. Purity flows, clarity grows, all-purpose power this flame bestows."
Use for: Protection, purification, all-purpose

**Black Candle:**
"Black flame absorbs what's not mine, banishing negativity, binding what's unkind. Protection strong, removing wrong, only good remains where this flame belongs."
Use for: Banishing, protection, removing negativity`}
      howToWorkWith={[
        'Choose the candle color that matches your intention',
        'Speak incantations with conviction and feeling',
        'Visualize the color energy flowing through you',
        'Feel the meaning of each word as you speak',
        'Combine incantations with candle carving and anointing',
        'Use incantations during candle lighting rituals',
        'Repeat incantations daily for multi-day spells',
        'Modify incantations to fit your personal practice',
      ]}
      faqs={[
        {
          question: 'Do I need to use these exact incantations?',
          answer:
            'No! These incantations are templates. Feel free to modify them to fit your personal practice and intention. The important thing is speaking with conviction and feeling the energy of the words.',
        },
        {
          question: 'How many times should I repeat an incantation?',
          answer:
            'Traditionally, incantations are spoken three times, but you can repeat them as many times as feels right. Some practitioners say them once while lighting, others repeat them throughout the candle burn. Trust your intuition.',
        },
        {
          question: 'Can I combine multiple colors in one ritual?',
          answer:
            'Yes! You can use multiple candles of different colors, each with its own incantation. For example, use a white candle for protection, then a green candle for prosperity, speaking the appropriate incantation for each.',
        },
      ]}
      internalLinks={[
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          text: 'Lighting Candles on Your Altar',
          href: '/grimoire/lighting-candles-on-altar',
        },
        {
          text: 'Anointing Candles with Oils',
          href: '/grimoire/anointing-candles',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spellcraft-fundamentals',
        },
      ]}
    />
  );
}
