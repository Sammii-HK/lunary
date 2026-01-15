import { Metadata } from 'next';

import GrimoireLayout from './GrimoireLayout';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title:
    'Lunary Grimoire - Complete Digital Grimoire | Astrology, Tarot, Crystals',
  description:
    'Complete digital grimoire with 500+ articles on tarot, crystals, astrology, moon phases, spells, and magical practice.',
  keywords: [
    'grimoire',
    'astrology',
    'tarot',
    'crystals',
    'moon phases',
    'spells',
    'witchcraft',
    'numerology',
    'birth chart',
  ],
  openGraph: {
    title: 'Lunary Grimoire - Complete Digital Grimoire',
    description:
      'Complete digital grimoire with 500+ articles on tarot, crystals, astrology, moon phases, spells, and magical practice.',
    url: 'https://lunary.app/grimoire',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire',
  },
};

const grimoireCategories = [
  {
    name: 'Zodiac Signs',
    url: 'https://lunary.app/grimoire/zodiac',
    description: 'Explore all 12 zodiac signs and their meanings',
  },
  {
    name: 'Astrology',
    url: 'https://lunary.app/grimoire/astrology',
    description: 'Birth charts, houses, aspects, and timing',
  },
  {
    name: 'Tarot Cards',
    url: 'https://lunary.app/grimoire/tarot',
    description: 'Complete guide to all 78 tarot cards',
  },
  {
    name: 'Crystals',
    url: 'https://lunary.app/grimoire/crystals',
    description: 'Crystal meanings, properties, and healing uses',
  },
  {
    name: 'Moon Phases',
    url: 'https://lunary.app/grimoire/moon',
    description: 'Moon phases, rituals, and lunar magic',
  },
  {
    name: 'Birth Chart',
    url: 'https://lunary.app/grimoire/birth-chart',
    description: 'Learn to read your natal chart',
  },
  {
    name: 'Runes',
    url: 'https://lunary.app/grimoire/runes',
    description: 'Elder Futhark rune meanings and divination',
  },
  {
    name: 'Numerology',
    url: 'https://lunary.app/grimoire/numerology',
    description: 'Life path numbers, angel numbers, and more',
  },
  {
    name: 'Candle Magic',
    url: 'https://lunary.app/grimoire/candle-magic',
    description: 'Candle colors, rituals, and spellwork',
  },
  {
    name: 'Correspondences',
    url: 'https://lunary.app/grimoire/correspondences',
    description:
      'Magical correspondences for elements, colors, herbs, and more',
  },
  {
    name: 'Witchcraft Practices',
    url: 'https://lunary.app/grimoire/practices',
    description:
      'Complete guide to spells, meditation, divination, shadow work, and more',
  },
  {
    name: 'Spells',
    url: 'https://lunary.app/grimoire/spells',
    description: 'Protection, love, prosperity, and healing spells',
  },
];

const GrimoireHome = () => {
  const grimoireListSchema = createItemListSchema({
    name: 'Lunary Grimoire',
    description:
      'Complete digital grimoire with 500+ articles on tarot, crystals, astrology, moon phases, spells, and magical practice.',
    url: 'https://lunary.app/grimoire',
    items: grimoireCategories,
  });

  return (
    <div className='h-full w-full'>
      {renderJsonLd(grimoireListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Lunary Grimoire'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl='https://lunary.app/grimoire'
        intro='The Lunary Grimoire is a living library of astrology, tarot, numerology, ritual, and spiritual practice. Use it to study meanings, explore timing, and build your own rituals.'
        tldr='Browse the Grimoire by topic, dive into a guide, or explore a specific tool. Each page is designed to be practical and easy to apply.'
        meaning={`The Grimoire brings together structured guides and practical resources. Each topic is designed to help you learn the core meanings and apply them in daily life.

Start with a beginner guide if you are new, then explore deeper topics like transits, divination, and ritual planning. Over time, the connections between topics become clearer and the practice becomes more intuitive.

Use the Grimoire as a study path. Pick one theme each month, read a few linked pages, and practice one small ritual. The goal is steady learning, not rushing through content.

If you are looking for timing, focus on Moon phases, transits, and planetary days. If you are looking for insight, explore tarot spreads, rune meanings, and numerology cycles. Each section supports a different style of practice.

The best way to use the library is to return to a few core pages and build on them. Notes and repetition turn information into wisdom.

If you are building a personal practice, combine study with action. Read a page, choose one exercise, and test it in real life. Small experiments create lasting understanding.

If you feel overwhelmed, start with one page and stay with it for a week. Depth matters more than quantity.

Return to related topics and compare notes. The connections between astrology, tarot, and numerology become clearer when you study them side by side.

Use the search and filters to narrow your focus. A smaller scope helps you build confidence and makes the material easier to apply.`}
        howToWorkWith={[
          'Choose one topic and study it consistently for a week.',
          'Use the Moon and timing pages to plan your rituals.',
          'Compare related topics, like tarot and numerology, for added insight.',
          'Save the pages you return to most often.',
          'Build a weekly routine around one practice.',
        ]}
        rituals={[
          'Set a weekly study theme and note three insights.',
          'Create a simple altar item tied to your current topic.',
          'Choose one page to revisit and add new notes.',
          'End each month with a short reflection on progress.',
          'Pair one reading with one real-world action.',
        ]}
        journalPrompts={[
          'Which topic feels most relevant to me right now?',
          'What do I want to learn over the next month?',
          'How can I apply one insight in daily life?',
          'Which practices feel most grounding?',
          'What is one habit I want to build from this study?',
          'Which topic do I want to return to next week?',
        ]}
        tables={[
          {
            title: 'Popular Topics',
            headers: ['Topic', 'Focus'],
            rows: [
              ['Zodiac', 'Signs, elements, compatibility'],
              ['Tarot', 'Cards, spreads, interpretation'],
              ['Moon', 'Phases, rituals, timing'],
              ['Numerology', 'Numbers, cycles, meanings'],
            ],
          },
          {
            title: 'Study Path Ideas',
            headers: ['Goal', 'Suggested Section'],
            rows: [
              ['Self-discovery', 'Birth chart and houses'],
              ['Timing', 'Moon phases and transits'],
              ['Intuition', 'Tarot and divination'],
              ['Grounding', 'Crystals and practices'],
            ],
          },
          {
            title: 'Quick Start',
            headers: ['If you want', 'Start here'],
            rows: [
              ['A daily practice', 'Moon signs and rituals'],
              ['Relationship insight', 'Synastry and compatibility'],
              ['Clearer timing', 'Transits and planetary days'],
              ['Creative inspiration', 'Tarot spreads'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Tarot Guide', href: '/grimoire/tarot' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Numerology', href: '/grimoire/numerology' },
        ]}
        faqs={[
          {
            question: 'What is a grimoire?',
            answer:
              'A grimoire is a collection of spiritual knowledge, practices, and rituals. This one is organized as a modern digital library.',
          },
          {
            question: 'Where should I start?',
            answer:
              'Start with the beginner guides, then choose one topic to explore each week. Consistency matters more than speed.',
          },
          {
            question: 'Is the Grimoire only for advanced practitioners?',
            answer:
              'No. It is designed for all levels, with clear explanations and practical steps you can apply immediately.',
          },
        ]}
        relatedItems={[
          {
            name: 'Beginner Guide',
            href: '/grimoire/beginners',
            type: 'Guide',
          },
          { name: 'Guides', href: '/grimoire/guides', type: 'Guide' },
          { name: 'Practices', href: '/grimoire/practices', type: 'Guide' },
        ]}
      >
        <GrimoireLayout />
      </SEOContentTemplate>
    </div>
  );
};

export default GrimoireHome;
