export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Reading Card Combinations: Tarot Card Pairing Guide - Lunary',
  description:
    'Learn how to read tarot cards together for richer interpretations. Discover element combinations, number patterns, and Major Arcana pairings.',
  openGraph: {
    title: 'Reading Card Combinations: Tarot Card Pairing Guide - Lunary',
    description:
      'Learn how to read tarot cards together for richer interpretations. Discover element combinations, number patterns, and Major Arcana pairings.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Reading Card Combinations: Tarot Card Pairing Guide - Lunary',
    description:
      'Learn how to read tarot cards together for richer interpretations. Discover element combinations, number patterns, and Major Arcana pairings.',
  },
};

export default function CardCombinationsPage() {
  return (
    <SEOContentTemplate
      title='Reading Card Combinations: Tarot Card Pairing Guide - Lunary'
      h1='Reading Card Combinations'
      description="Cards don't exist in isolation. Learning to read cards together creates richer, more nuanced interpretations. Here are common combination patterns."
      keywords={[
        'tarot card combinations',
        'reading card combinations',
        'tarot card pairs',
        'tarot card meanings together',
        'how to read multiple tarot cards',
      ]}
      canonicalUrl='https://lunary.app/grimoire/card-combinations'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Tarot', href: '/grimoire/tarot' },
        {
          label: 'Reading Card Combinations',
          href: '/grimoire/card-combinations',
        },
      ]}
      meaning={`Reading tarot cards together creates richer, more nuanced interpretations than reading cards individually. When cards appear together, they tell a story, create themes, and reveal deeper layers of meaning.

**Element Combinations:**
- Fire + Air: Action and ideas combine for inspired action and communication. Great for manifesting ideas into reality.
- Water + Earth: Emotions grounded in reality, practical emotional work. Stable relationships and emotional security.
- Fire + Water: Passionate emotions, intense feelings driving action. Powerful creative or romantic energy.
- Air + Earth: Ideas made practical, mental planning with tangible results. Strategic thinking leading to material success.
- Fire + Fire: Intense passion, high energy, rapid action. Can indicate burnout if too many.
- Water + Water: Deep emotions, intuition, psychic sensitivity. May indicate emotional overwhelm.
- Air + Air: Mental activity, communication, ideas. May indicate overthinking or scattered thoughts.
- Earth + Earth: Stability, practicality, material focus. May indicate stagnation or being too grounded.

**Number Patterns:**
- Multiple Aces: New beginnings in multiple areas of life. Fresh starts and opportunities across different life areas.
- Multiple Court Cards: People and personalities influencing the situation. Social dynamics and relationships are key.
- Sequential Numbers: A progression or journey through that energy. Shows development and evolution.
- Same Number Different Suits: The same theme playing out in different life areas. Universal lesson or pattern.
- All Even Numbers: Balance, partnership, waiting, reflection. May indicate need for patience.
- All Odd Numbers: Action, movement, individuality, initiation. Active energy and forward momentum.

**Major Arcana Combinations:**
- The Fool + The World: Beginning and ending of a cycle, completion leading to new start. Full circle moment.
- The Magician + The Star: Manifestation with hope and inspiration. Aligned action toward dreams.
- Death + The Tower: Major transformation and sudden change. Complete life restructuring.
- The Sun + The Moon: Balance of conscious and unconscious, clarity and mystery. Integration of light and shadow.
- The Lovers + The Devil: Choice between healthy and unhealthy relationships. Temptation and commitment.
- The Hermit + The High Priestess: Deep inner wisdom and intuition. Spiritual seeking and inner knowing.
- Strength + The Chariot: Inner strength driving forward action. Controlled power and determination.

**How to Read Combinations:**
1. Look for themes: What do the cards have in common? What story do they tell together?
2. Consider position: How do the cards relate to each other in the spread? Adjacent cards often influence each other.
3. Notice contrasts: Opposing elements or numbers can create tension that needs resolution.
4. Find the bridge: What connects these cards? Look for shared elements, numbers, or themes.
5. Trust the story: Let the cards tell you their story rather than forcing individual meanings.

**Common Combination Examples:**
- Three of Cups + Ten of Pentacles: Celebration leading to long-term stability. Joyous family or community events with lasting impact.
- Knight of Swords + Eight of Wands: Rapid communication and swift action. Fast-moving news or decisions.
- The Empress + Ace of Pentacles: Fertility and new material beginnings. Abundant new opportunities.
- Two of Cups + The Lovers: Deep partnership and important relationship choices. Romantic commitment.`}
      internalLinks={[
        { text: 'Tarot Cards Guide', href: '/grimoire/tarot' },
        {
          text: 'Reversed Cards Guide',
          href: '/grimoire/reversed-cards-guide',
        },
        { text: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
      ]}
    />
  );
}
