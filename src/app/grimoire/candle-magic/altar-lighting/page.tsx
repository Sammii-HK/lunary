export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Lighting Candles on Your Altar: Ritual Order Guide - Lunary',
  description:
    'Learn the proper order and method of lighting candles on your altar. Discover traditional lighting sequences, what to say when lighting, and how to set up your altar for candle magic rituals.',
  keywords: [
    'lighting candles on altar',
    'candle lighting order',
    'altar candle ritual',
    'candle magic altar',
    'ritual candle lighting',
    'altar setup',
    'candle ritual order',
    'how to light altar candles',
  ],
  openGraph: {
    title: 'Lighting Candles on Your Altar: Ritual Order Guide - Lunary',
    description:
      'Learn the proper order and method of lighting candles on your altar. Discover traditional lighting sequences and altar setup.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Lighting Candles on Your Altar: Ritual Order Guide - Lunary',
    description:
      'Learn the proper order and method of lighting candles on your altar.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/candle-magic/altar-lighting',
  },
};

export default function LightingCandlesOnAltarPage() {
  return (
    <SEOContentTemplate
      title='Lighting Candles on Your Altar: Ritual Order Guide - Lunary'
      h1='Lighting Candles on Your Altar'
      description='Learn the proper order and method of lighting candles on your altar. Discover traditional lighting sequences, what to say when lighting, and how to set up your altar for candle magic rituals.'
      keywords={[
        'lighting candles on altar',
        'candle lighting order',
        'altar candle ritual',
        'candle magic altar',
        'ritual candle lighting',
        'altar setup',
      ]}
      canonicalUrl='https://lunary.app/grimoire/candle-magic/altar-lighting'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          label: 'Altar Lighting',
          href: '/grimoire/candle-magic/altar-lighting',
        },
      ]}
      intro='The order and method of lighting candles on your altar creates a powerful ritual structure. Each step builds energy and intention. Understanding proper candle lighting order helps you create sacred space, honor the elements, and focus your magical work effectively.'
      meaning={`**Traditional Lighting Order:**

1. **White Candle (Protection/Divine Light):** Always light first to create sacred space and protection. Say: "By this light, I create sacred space. Only love and light may enter this place."

2. **Elemental Candles (if using):** Light in order: North (Earth/Green/Brown), East (Air/Yellow/White), South (Fire/Red/Orange), West (Water/Blue/Silver). Or light your intention candle next.

3. **Intention Candle:** Your main spell candle. Light while stating your intention clearly. This is the focal point of your work.

4. **Supporting Candles:** Any additional candles for specific purposes (e.g., love candle, prosperity candle).

5. **Closing:** Always end by thanking the elements, spirits, or deities you've called upon. Extinguish in reverse order (or let burn completely if that's your intention).

**What to Say When Lighting:**

- **General lighting phrase:** "I light this flame with intention clear, may my will be made manifest here."
- **Before lighting:** State your intention aloud or silently. Be specific and clear.
- **As you light:** Visualize your intention flowing into the flame. See it burning brightly with your desired outcome.
- **After lighting:** "By fire and will, so mote it be" or "And so it is" to seal your intention.

**Altar Setup for Candle Magic:**

- **Center:** Place your main intention candle in the center
- **North (Earth):** Green/brown candles, crystals, salt
- **East (Air):** Yellow/white candles, incense, feathers
- **South (Fire):** Red/orange candles, matches, fire-safe dish
- **West (Water):** Blue/silver candles, water bowl, shells

Arrange intuitively—there's no single "correct" way. What matters is that it feels right to you and supports your intention.`}
      howToWorkWith={[
        'Always light white/protection candle first',
        'Follow traditional elemental order if using directional candles',
        'Light intention candle while stating your purpose clearly',
        'Use supporting candles for additional purposes',
        'Speak incantations or phrases when lighting each candle',
        'Visualize energy building as you light each candle',
        'Extinguish in reverse order when closing ritual',
        'Set up altar intuitively but with intention',
      ]}
      faqs={[
        {
          question: 'Do I have to follow this exact order?',
          answer:
            'No! This is a traditional order, but you can adapt it to your practice. The key is consistency and intention. If you always light candles in the same order, it creates a ritual structure that builds energy.',
        },
        {
          question: 'What if I only have one candle?',
          answer: `That's perfectly fine! Start with a white candle for protection, then light your intention candle. The order is about building energy and creating sacred space, not about having multiple candles.`,
        },
        {
          question: 'How do I extinguish candles properly?',
          answer: `Traditionally, candles are extinguished by snuffing (using a snuffer or pinching the wick) rather than blowing. Blowing is said to scatter the energy. Extinguish in reverse order of lighting, or let them burn completely if that's your intention.`,
        },
      ]}
      internalLinks={[
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          text: 'Incantations by Candle Color',
          href: '/grimoire/candle-magic/incantations',
        },
        {
          text: 'Anointing Candles with Oils',
          href: '/grimoire/candle-magic/anointing',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
      ]}
    />
  );
}
