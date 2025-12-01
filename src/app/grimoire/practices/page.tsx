export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Practices from '../components/Practices';

export const metadata: Metadata = {
  title: 'Spells & Rituals: Complete Guide - Lunary',
  description:
    'A comprehensive collection of magical practices, rituals, and spells organized by purpose and moon phase. Learn spellcraft fundamentals, protection magic, love spells, prosperity rituals, healing, cleansing, divination, manifestation, and banishing practices.',
  keywords: [
    'spells',
    'rituals',
    'witchcraft practices',
    'magical practices',
    'protection magic',
    'love spells',
    'prosperity spells',
    'healing rituals',
    'how to cast spells',
    'witchcraft spells',
  ],
  openGraph: {
    title: 'Spells & Rituals: Complete Guide - Lunary',
    description:
      'A comprehensive collection of magical practices, rituals, and spells organized by purpose and moon phase.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Spells & Rituals: Complete Guide - Lunary',
    description:
      'A comprehensive collection of magical practices, rituals, and spells organized by purpose and moon phase.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/practices',
  },
};

export default function PracticesPage() {
  return (
    <>
      <SEOContentTemplate
        title='Spells & Rituals: Complete Guide - Lunary'
        h1='Spells & Rituals'
        description='A comprehensive collection of magical practices, rituals, and spells organized by purpose and moon phase. Learn spellcraft fundamentals, protection magic, love spells, prosperity rituals, healing, cleansing, divination, manifestation, and banishing practices.'
        keywords={[
          'spells',
          'rituals',
          'witchcraft practices',
          'magical practices',
          'protection magic',
          'love spells',
          'prosperity spells',
          'healing rituals',
        ]}
        canonicalUrl='https://lunary.app/grimoire/practices'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Spells & Rituals', href: '/grimoire/practices' },
        ]}
        intro={`Spells and rituals are the practical application of magical knowledge. They combine intention, correspondences, timing, and energy work to create change in your life and the world around you. This comprehensive collection includes spells for protection, love, prosperity, healing, cleansing, divination, manifestation, and banishing, all organized by purpose and optimal moon phase timing. Whether you're a beginner or experienced practitioner, these spells provide a foundation for effective magical work.`}
        meaning={`Spells and rituals are structured magical practices designed to manifest specific outcomes. They work by combining multiple elements: clear intention, appropriate correspondences (colors, herbs, crystals, timing), focused energy, and symbolic actions. Each spell is a carefully crafted ritual that aligns your will with natural and cosmic forces to create desired change.

The effectiveness of spells depends on several factors: the clarity of your intention, the alignment of correspondences, optimal timing (especially moon phases), your ability to raise and direct energy, and your belief in the process. Spells aren't about forcing outcomes but rather about creating conditions that allow your desires to manifest naturally.

Rituals provide structure and meaning to magical work. They create sacred space, focus intention, and connect you with spiritual forces. Even simple rituals can be powerful when performed with clear intention and focused energy.`}
        howToWorkWith={[
          'Start with spellcraft fundamentals before casting',
          'Choose spells that align with your ethical code',
          'Time spells according to moon phases when possible',
          'Gather all ingredients before beginning',
          'Create sacred space and set clear intention',
          'Follow spell instructions carefully',
          'Raise and direct energy with focus',
          'Release attachment to outcomes after casting',
        ]}
        faqs={[
          {
            question: 'Do spells really work?',
            answer:
              'Spells work by aligning your intention with natural and cosmic forces. They create conditions for manifestation rather than forcing outcomes. Success depends on clear intention, proper timing, and your ability to raise and direct energy effectively.',
          },
          {
            question: 'How long do spells take to work?',
            answer:
              'Spell timing varies widely. Some spells manifest quickly (days or weeks), while others take months. Factors include the complexity of your goal, moon phase timing, and how aligned your actions are with your intention. Be patient and trust the process.',
          },
          {
            question: 'Can I modify spells?',
            answer: `Yes! Adapt spells to fit your needs, correspondences, and available materials. The core structure (intention, timing, energy work) matters more than exact ingredients. Trust your intuition while respecting the spell's fundamental purpose.`,
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
          { text: 'Candle Magic', href: '/grimoire/candle-magic' },
          { text: 'Moon Rituals', href: '/grimoire/moon-rituals' },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <Practices />
      </div>
    </>
  );
}
