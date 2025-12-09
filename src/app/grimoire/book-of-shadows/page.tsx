export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Book of Shadows: How to Create Your Personal Grimoire - Lunary',
  description:
    'Learn how to create and maintain your Book of Shadows (BOS). Discover what to include, how to organize it, and how to make it personal. Your personal grimoire for spells, rituals, and spiritual journey.',
  keywords: [
    'book of shadows',
    'grimoire',
    'witchcraft journal',
    'spell book',
    'book of shadows guide',
    'how to create book of shadows',
    'witchcraft journaling',
  ],
  openGraph: {
    title: 'Book of Shadows: How to Create Your Personal Grimoire - Lunary',
    description:
      'Learn how to create and maintain your Book of Shadows. Discover what to include and how to organize it.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Book of Shadows: How to Create Your Personal Grimoire - Lunary',
    description: 'Learn how to create and maintain your Book of Shadows.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/book-of-shadows',
  },
};

export default function BookOfShadowsPage() {
  return (
    <SEOContentTemplate
      title='Book of Shadows: How to Create Your Personal Grimoire - Lunary'
      h1='Book of Shadows'
      description='Learn how to create and maintain your Book of Shadows (BOS). Discover what to include, how to organize it, and how to make it personal. Your personal grimoire for spells, rituals, and spiritual journey.'
      keywords={[
        'book of shadows',
        'grimoire',
        'witchcraft journal',
        'spell book',
        'book of shadows guide',
      ]}
      canonicalUrl='https://lunary.app/grimoire/book-of-shadows'
      intro={`A Book of Shadows (BOS) is your personal grimoire—a record of your spells, rituals, correspondences, and spiritual journey. It's a living document that grows with your practice. Your BOS is uniquely yours, reflecting your path, experiences, and magical discoveries.`}
      meaning={`**What to Include:**
- Spells and rituals you've performed
- Correspondences (colors, herbs, crystals, etc.)
- Moon phases and astrological notes
- Dream interpretations and symbols
- Personal experiences and insights
- Recipes for potions, oils, and incense
- Notes on what worked and what didn't
- Personal reflections and growth

**How to Organize:**
- **By category:** Spells, rituals, correspondences, etc.
- **Chronologically:** As you learn and practice
- **By intention:** Love, protection, prosperity, etc.
- **Mixed approach:** Whatever makes sense to you

There's no "correct" way. Organize it so you can find things easily. Some witches use digital BOS, others prefer handwritten journals.

**Making It Personal:**
- Decorate with drawings, pressed flowers, or symbols
- Use colors and correspondences that resonate
- Include personal experiences and feelings
- Write in your own voice—it's YOUR book
- Don't worry about perfection—it's a working document

Your Book of Shadows is a reflection of your spiritual journey. It grows and evolves with you, becoming a valuable resource and record of your practice.`}
      howToWorkWith={[
        'Choose a format that works for you (digital or physical)',
        'Start simple and add content as you practice',
        'Record spells and rituals you perform',
        `Note what works and what doesn't`,
        'Include correspondences and timing notes',
        'Add personal reflections and insights',
        'Decorate and personalize your BOS',
        'Review and update regularly',
      ]}
      faqs={[
        {
          question: 'Do I need a physical Book of Shadows?',
          answer:
            'No! Many modern witches use digital BOS (apps, documents, or online platforms). Some prefer handwritten journals for the personal connection. Choose what works for you—both are valid. Some practitioners use both: digital for organization, physical for special rituals.',
        },
        {
          question: 'What if I make mistakes in my BOS?',
          answer: `Mistakes are part of learning! Your BOS is a working document, not a perfect manuscript. Cross things out, add notes, make corrections. The messiness shows your growth and learning process. Many witches find their early entries amusing later—it's all part of the journey.`,
        },
        {
          question: 'Should I share my Book of Shadows?',
          answer: `That's entirely up to you. Some witches keep their BOS completely private, others share parts with trusted friends or online communities. Your BOS is personal, so share only what feels right. Many practitioners create a "public" version for sharing and keep a private one for personal work.`,
        },
      ]}
      internalLinks={[
        {
          text: 'Modern Witchcraft',
          href: '/grimoire/modern-witchcraft',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spellcraft-fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/practices' },
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
      ]}
    />
  );
}
