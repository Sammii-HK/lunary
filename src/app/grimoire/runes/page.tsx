export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import Runes from '../components/Runes';

export const metadata: Metadata = {
  title: 'Runes: Ancient Runic Alphabet & Meanings - Lunary',
  description:
    'Explore ancient runic alphabets and their meanings. Learn runic divination and magical practices. Discover the power of runes for guidance and spellwork. Comprehensive Elder Futhark guide.',
  keywords: [
    'runes',
    'runic alphabet',
    'rune meanings',
    'runic divination',
    'elder futhark',
    'rune magic',
    'rune reading',
    'how to read runes',
  ],
  openGraph: {
    title: 'Runes: Ancient Runic Alphabet & Meanings - Lunary',
    description:
      'Explore ancient runic alphabets and their meanings. Learn runic divination and magical practices.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Runes: Ancient Runic Alphabet & Meanings - Lunary',
    description:
      'Explore ancient runic alphabets and their meanings. Learn runic divination and magical practices.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/runes',
  },
};

export default function RunesPage() {
  return (
    <>
      <SEOContentTemplate
        title='Runes: Ancient Runic Alphabet & Meanings - Lunary'
        h1='Runes'
        description='Explore ancient runic alphabets and their meanings. Learn runic divination and magical practices. Discover the power of runes for guidance and spellwork.'
        keywords={[
          'runes',
          'runic alphabet',
          'rune meanings',
          'runic divination',
          'elder futhark',
          'rune magic',
        ]}
        canonicalUrl='https://lunary.app/grimoire/runes'
        intro='Runes are ancient symbols used for writing, divination, and magic. The Elder Futhark, the oldest runic alphabet, contains 24 runes, each with deep symbolic meaning and magical power. Understanding runes opens a powerful system of divination and spellwork that connects you with ancient wisdom and natural forces. This comprehensive guide covers rune meanings, divination methods, and magical applications.'
        meaning={`Runes are more than letters—they're symbols of natural forces, archetypes, and cosmic principles. Each rune represents a specific energy, concept, or aspect of existence. When you work with runes, you're tapping into these fundamental forces and aligning with their power.

The Elder Futhark is divided into three groups (aetts) of eight runes each, representing different aspects of life: Fehu through Wunjo (material world), Hagalaz through Sowilo (challenges and transformation), and Tiwaz through Othala (spiritual connection and heritage).

Runes work through symbolism, energy, and intention. Each rune carries specific meanings that can guide divination, enhance spellwork, and provide protection. Understanding rune meanings and correspondences helps you use them effectively in your practice.`}
        howToWorkWith={[
          'Learn the meaning of each rune',
          'Use runes for divination and guidance',
          'Carve runes into candles or tools for magic',
          'Draw runes for protection and manifestation',
          'Combine runes for complex spellwork',
          'Meditate on rune symbols for deeper understanding',
          'Use runes in bindrunes (combined symbols)',
          'Respect the ancient tradition and use runes ethically',
        ]}
        faqs={[
          {
            question: 'How do I read runes?',
            answer:
              'Common methods include: drawing one rune for quick guidance, three runes (past/present/future), five runes (cross spread), or casting all runes and reading those that land face-up. Focus on your question, draw or cast runes, and interpret based on their meanings and positions.',
          },
          {
            question: 'Do I need to make my own runes?',
            answer:
              'While making your own runes creates powerful personal connection, you can also purchase rune sets. Many practitioners prefer making their own from wood, stone, or clay, as this process imbues them with your energy. Either way, cleanse and consecrate your runes before use.',
          },
          {
            question: 'Can I use runes in spellwork?',
            answer:
              'Yes! Runes are powerful for spellwork. Carve runes into candles, draw them on paper or tools, create bindrunes (combined symbols), or use rune symbols in ritual. Each rune carries specific energy that enhances spells aligned with its meaning.',
          },
        ]}
        internalLinks={[
          { text: 'Divination Methods', href: '/grimoire/divination' },
          { text: 'Tarot Cards', href: '/grimoire/tarot' },
          {
            text: 'Spellcraft Fundamentals',
            href: '/grimoire/spellcraft-fundamentals',
          },
        ]}
      />
      <div className='max-w-4xl mx-auto p-4'>
        <Runes />
      </div>
    </>
  );
}
