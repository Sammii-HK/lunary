export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Spellcraft Fundamentals: Complete Guide to Magic Basics - Lunary',
  description:
    'Learn the foundational principles of spellcraft including intention setting, altar setup, magical timing, and energy work. Essential guide for beginners.',
  openGraph: {
    title: 'Spellcraft Fundamentals: Complete Guide to Magic Basics - Lunary',
    description:
      'Learn the foundational principles of spellcraft including intention setting, altar setup, magical timing, and energy work. Essential guide for beginners.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Spellcraft Fundamentals: Complete Guide to Magic Basics - Lunary',
    description:
      'Learn the foundational principles of spellcraft including intention setting, altar setup, magical timing, and energy work. Essential guide for beginners.',
  },
};

export default function SpellcraftFundamentalsPage() {
  return (
    <SEOContentTemplate
      title='Spellcraft Fundamentals: Complete Guide to Magic Basics - Lunary'
      h1='Spellcraft Fundamentals'
      description='Before casting spells, understand the foundational principles of spellcraft. These fundamentals ensure your magic is effective, ethical, and aligned with your intentions.'
      keywords={[
        'spellcraft fundamentals',
        'magic basics',
        'how to cast spells',
        'spellcraft guide',
        'witchcraft basics',
        'magical timing',
      ]}
      canonicalUrl='https://lunary.app/grimoire/spellcraft-fundamentals'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Spells & Rituals', href: '/grimoire/practices' },
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spellcraft-fundamentals',
        },
      ]}
      meaning={`Before casting spells, understand the foundational principles of spellcraft. These fundamentals ensure your magic is effective, ethical, and aligned with your intentions.

**Intention Setting:**
Clear intention is the foundation of all magic. Your intention directs energy and determines outcomes. How to set clear intentions: Be specific about what you want (not vague), focus on what you want to attract (not what you want to avoid), use present tense ("I am" not "I will be"), include how it benefits you and others, write it down or speak it aloud clearly. Example: Instead of "I don't want to be poor," say "I am financially abundant and secure."

**Altar Setup:**
An altar is a sacred space for magical work. It doesn't need to be elaborate—simplicity and intention matter most. Essential altar elements: Representation of elements (candle for fire, water, salt for earth, incense for air), personal items (photos, crystals, symbols that hold meaning), tools (matches, athame or wand optional, offering bowl), cleansing tools (sage, salt, or cleansing spray). Cleanse your altar before each use. Arrange items intuitively—there's no single "correct" way. Your altar should feel sacred and personal.

**Understanding Magical Timing:**
Timing amplifies spell effectiveness. Align your magic with natural cycles for best results. Moon phases: New Moon (new beginnings, setting intentions), Waxing Moon (growth, attraction, building energy), Full Moon (manifestation, release, charging), Waning Moon (banishing, letting go, breaking habits). Days of the week: Monday/Moon (intuition, dreams, emotions), Tuesday/Mars (action, courage, protection), Wednesday/Mercury (communication, learning, travel), Thursday/Jupiter (abundance, expansion, luck), Friday/Venus (love, beauty, relationships), Saturday/Saturn (banishing, protection, discipline), Sunday/Sun (success, vitality, confidence).

**Energy Work Basics:**
Magic works with energy. Learning to sense, direct, and work with energy is fundamental to spellcraft. Grounding: Connect with earth energy. Visualize roots extending from your feet into the earth. Feel stable and centered. Essential before and after spellwork. Centering: Find your core energy. Take deep breaths, feel your energy at your center (solar plexus or heart). This is your power source. Shielding: Protect your energy. Visualize a bubble of light around you. Set intention: "I am protected."`}
      internalLinks={[
        { text: 'Spellcraft Practices', href: '/grimoire/practices' },
        { text: 'Moon Rituals by Phase', href: '/grimoire/moon-rituals' },
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        { text: 'Meditation & Mindfulness', href: '/grimoire/meditation' },
      ]}
    />
  );
}
