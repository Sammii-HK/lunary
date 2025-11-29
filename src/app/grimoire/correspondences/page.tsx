import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Correspondences from '../components/Correspondences';

export const metadata: Metadata = {
  title: 'Magical Correspondences: Complete Guide - Lunary',
  description:
    'Explore magical correspondences including elements, colors, planets, days, deities, flowers, numbers, wood, herbs, and animals. Comprehensive guide to symbolic connections in witchcraft. Learn how to use correspondences in spellwork and rituals.',
  keywords: [
    'magical correspondences',
    'elemental correspondences',
    'color correspondences',
    'planetary correspondences',
    'herb correspondences',
    'crystal correspondences',
    'witchcraft correspondences',
    'magical symbols',
    'spell correspondences',
  ],
  openGraph: {
    title: 'Magical Correspondences: Complete Guide - Lunary',
    description:
      'Explore magical correspondences including elements, colors, planets, days, deities, flowers, numbers, wood, herbs, and animals. Comprehensive guide to symbolic connections.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Magical Correspondences: Complete Guide - Lunary',
    description:
      'Explore magical correspondences including elements, colors, planets, days, deities, flowers, numbers, wood, herbs, and animals.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences',
  },
};

export default function CorrespondencesPage() {
  return (
    <>
      <SEOContentTemplate
        title='Magical Correspondences: Complete Guide - Lunary'
        h1='Magical Correspondences'
        description='Explore the symbolic connections between elements, colors, planets, and magical practices. Understanding correspondences helps you align your spellwork with natural energies and cosmic forces.'
        keywords={[
          'magical correspondences',
          'elemental correspondences',
          'color correspondences',
          'planetary correspondences',
          'herb correspondences',
          'crystal correspondences',
          'witchcraft correspondences',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          {
            label: 'Magical Correspondences',
            href: '/grimoire/correspondences',
          },
        ]}
        intro='Correspondences are the symbolic connections between different elements of the natural and spiritual world. They help practitioners align their magical work with specific energies, planets, elements, and intentions. Understanding correspondences is fundamental to effective spellcraft and ritual work. This comprehensive guide covers elemental correspondences, color magic, planetary influences, herb properties, crystal energies, and much more.'
        meaning={`Magical correspondences form the foundation of effective spellwork. Each element, color, planet, herb, crystal, and symbol carries specific energetic properties that can enhance your magical practice. By understanding these connections, you can create more powerful and aligned rituals, spells, and magical work.

Correspondences work through sympathetic magic—the principle that like attracts like. When you use a red candle for a love spell, you're aligning with the fire element's passion and the color red's association with love and desire. When you work with rosemary during a Mercury retrograde, you're connecting with the herb's correspondence to Mercury and its properties of memory and communication.

These connections aren't arbitrary—they're based on centuries of observation, tradition, and energetic resonance. Practitioners have noticed patterns between colors, elements, planets, and magical outcomes, creating a rich system of correspondences that enhances spellwork effectiveness.`}
        howToWorkWith={[
          'Study correspondences systematically—start with elements, then colors, then planets',
          'Create a correspondence journal to track what works for you',
          'Use correspondences to enhance existing spells and rituals',
          'Combine multiple correspondences for more powerful magic',
          'Trust your intuition—personal correspondences matter too',
          'Research traditional correspondences before creating your own',
          'Use correspondences to choose optimal timing for spellwork',
          'Align correspondences with your intention for best results',
        ]}
        faqs={[
          {
            question: 'How do I use correspondences in spellwork?',
            answer:
              'Choose correspondences that align with your intention. For a love spell, use red or pink candles (color), rose quartz (crystal), roses (herb), and work on Friday (Venus day). Combine multiple correspondences for more powerful magic.',
          },
          {
            question: 'Can I create my own correspondences?',
            answer:
              'Yes! While traditional correspondences are powerful, personal correspondences based on your own experiences and intuition are equally valid. Keep a journal of what works for you.',
          },
          {
            question: "Do correspondences work if I don't believe in them?",
            answer:
              "Correspondences work through energetic resonance and intention. Even if you're skeptical, using them helps focus your intention and creates symbolic meaning that enhances your practice.",
          },
        ]}
        internalLinks={[
          { text: 'Candle Magic', href: '/grimoire/candle-magic' },
          { text: 'Spells & Rituals', href: '/grimoire/practices' },
          { text: 'Crystals', href: '/grimoire/crystals' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
          { text: 'Numerology', href: '/grimoire/numerology' },
        ]}
      />
      <div className='max-w-4xl p-4'>
        <Correspondences />
      </div>
    </>
  );
}
