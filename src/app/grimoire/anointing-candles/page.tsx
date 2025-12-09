export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Anointing Candles with Oils: Candle Magic Guide - Lunary',
  description:
    'Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork. Discover anointing methods, common oils, and how to enhance your candle magic with essential oils.',
  keywords: [
    'anointing candles',
    'candle anointing',
    'anointing oils',
    'candle magic oils',
    'essential oils candles',
    'how to anoint candles',
    'candle preparation',
    'candle magic oils',
  ],
  openGraph: {
    title: 'Anointing Candles with Oils: Candle Magic Guide - Lunary',
    description:
      'Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork. Discover anointing methods and common oils.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Anointing Candles with Oils: Candle Magic Guide - Lunary',
    description:
      'Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/anointing-candles',
  },
};

export default function AnointingCandlesPage() {
  return (
    <SEOContentTemplate
      title='Anointing Candles with Oils: Candle Magic Guide - Lunary'
      h1='Anointing Candles with Oils'
      description='Learn how to anoint candles with oils to add another layer of intention and energy to your spellwork. Essential oils carry specific properties that enhance your candle magic.'
      keywords={[
        'anointing candles',
        'candle anointing',
        'anointing oils',
        'candle magic oils',
        'essential oils candles',
        'how to anoint candles',
      ]}
      canonicalUrl='https://lunary.app/grimoire/anointing-candles'
      intro='Anointing candles with oils adds another layer of intention and energy to your spellwork. Essential oils carry specific properties that enhance your candle magic. Understanding anointing methods and oil correspondences helps you create more powerful and focused candle spells.'
      meaning={`**Anointing Method:**

1. **Choose your oil:** Select an oil that matches your intention
2. **Anoint from center outward:** For attracting energy
3. **Anoint from ends to center:** For banishing energy
4. **Visualize:** See your intention flowing into the candle
5. **Speak your intention:** State your purpose clearly

**Common Anointing Oils:**

- **Lavender:** Peace, healing, sleep
- **Rose:** Love, romance, self-love
- **Jasmine:** Love, sensuality, psychic ability
- **Frankincense:** Protection, spirituality, purification
- **Patchouli:** Prosperity, grounding, attraction
- **Eucalyptus:** Healing, protection, purification
- **Bergamot:** Success, prosperity, confidence
- **Sandalwood:** Spirituality, meditation, protection

**How Anointing Works:**

Anointing adds another layer of intention to your candle magic. The oil carries the energetic properties of the plant it comes from, and the act of anointing focuses your intention into the candle. When you anoint from center outward, you're drawing energy toward you (attracting). When you anoint from ends to center, you're pushing energy away (banishing).

The combination of color correspondences, carving, anointing, and spoken intention creates a powerful multi-layered spell that aligns your will with natural forces.`}
      howToWorkWith={[
        'Choose oils that match your intention and candle color',
        'Anoint from center outward for attracting/manifesting',
        'Anoint from ends to center for banishing/releasing',
        'Visualize your intention flowing into the candle as you anoint',
        'Speak your intention clearly while anointing',
        'Combine anointing with candle carving for maximum effect',
        'Use carrier oils if essential oils are too strong',
        'Store anointed candles wrapped in cloth until use',
      ]}
      faqs={[
        {
          question: 'Do I need to use essential oils?',
          answer:
            'Essential oils are traditional and powerful, but you can also use carrier oils infused with herbs, or even simple olive oil with intention. The important thing is the intention and the act of anointing, not necessarily the specific oil.',
        },
        {
          question: 'How much oil should I use?',
          answer:
            'A little goes a long way. Use just enough to lightly coat the candle—too much can be a fire hazard. A few drops of essential oil or a thin layer of carrier oil is usually sufficient.',
        },
        {
          question: 'Can I combine multiple oils?',
          answer:
            'Yes! You can blend oils that complement each other. For example, combine rose and jasmine for love spells, or frankincense and sandalwood for protection and spirituality. Just ensure the oils work well together energetically.',
        },
      ]}
      internalLinks={[
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          text: 'Lighting Candles on Your Altar',
          href: '/grimoire/lighting-candles-on-altar',
        },
        {
          text: 'Incantations by Candle Color',
          href: '/grimoire/incantations-by-candle-color',
        },
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
      ]}
    />
  );
}
