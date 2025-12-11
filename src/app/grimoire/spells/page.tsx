import { Metadata } from 'next';
import { spellCategories as grimoireSpellCategories } from '@/constants/grimoire/spells';
import {
  spellCategories as constantsSpellCategories,
  spells as constantsSpells,
} from '@/constants/spells';
import spellsJson from '@/data/spells.json';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { SpellsClient } from './SpellsClient';

export const metadata: Metadata = {
  title: 'Spells & Rituals: Complete Witchcraft Spell Library - Lunary',
  description:
    'Explore our collection of 200+ spells for protection, love, prosperity, healing, moon magic, shadow work, and more. Find detailed instructions, correspondences, and guidance for your magical practice.',
  keywords: [
    'spells',
    'magic spells',
    'witchcraft spells',
    'protection spells',
    'love spells',
    'healing spells',
    'moon spells',
    'ritual magic',
    'spell collection',
    'beginner spells',
  ],
  openGraph: {
    title: 'Spells & Rituals Library | Lunary',
    description:
      'Explore our collection of 200+ spells for protection, love, prosperity, healing, and more.',
    url: 'https://lunary.app/grimoire/spells',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: '/api/og/grimoire/spells',
        width: 1200,
        height: 630,
        alt: 'Spell Collection - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spells & Rituals: Complete Witchcraft Spell Library - Lunary',
    description:
      'Explore our collection of 200+ spells for protection, love, prosperity, healing, and more.',
    images: ['/api/og/grimoire/spells'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/spells',
  },
};

// Spell type for the client component
interface SpellForClient {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  type: string;
  difficulty: string;
  duration: string;
  description: string;
  purpose: string;
  timing?: {
    moonPhase?: string[];
    planetaryDay?: string[];
  };
  correspondences?: {
    elements?: string[];
    planets?: string[];
  };
}

// Combine spells from JSON and constants, avoiding duplicates
function getAllSpells(): SpellForClient[] {
  const jsonSpellIds = new Set(spellsJson.map((s: { id: string }) => s.id));
  const constantsSpellsFiltered = constantsSpells.filter(
    (s: { id: string }) => !jsonSpellIds.has(s.id),
  );

  return [...spellsJson, ...constantsSpellsFiltered].map((spell) => ({
    id: spell.id || '',
    title: spell.title || '',
    category: spell.category || '',
    subcategory: spell.subcategory,
    type: spell.type || 'spell',
    difficulty: spell.difficulty || 'beginner',
    duration: spell.duration || '10-15 minutes',
    description: spell.description || spell.purpose || '',
    purpose: spell.purpose || spell.description || '',
    timing: spell.timing,
    correspondences: spell.correspondences,
  }));
}

// Merge categories from both sources
function getAllCategories() {
  const merged: Record<
    string,
    { name: string; description: string; icon: string }
  > = {};

  // Add from constants/spells.ts
  Object.entries(constantsSpellCategories).forEach(([key, cat]) => {
    merged[key] = {
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
    };
  });

  // Add from constants/grimoire/spells.ts (may override)
  Object.entries(grimoireSpellCategories).forEach(([key, cat]) => {
    if (!merged[key]) {
      merged[key] = {
        name: cat.name,
        description: cat.description,
        icon: '✨', // Default icon if not present
      };
    }
  });

  return merged;
}

export default function SpellsIndexPage() {
  const allSpells = getAllSpells();
  const allCategories = getAllCategories();

  const spellListSchema = createItemListSchema({
    name: 'Spell Collection',
    description:
      'Curated collection of spells for protection, love, prosperity, healing, moon magic, shadow work, and magical practice.',
    url: 'https://lunary.app/grimoire/spells',
    items: allSpells.slice(0, 30).map((spell) => ({
      name: spell.title,
      url: `https://lunary.app/grimoire/spells/${spell.id}`,
      description: spell.description,
    })),
  });

  return (
    <>
      {renderJsonLd(spellListSchema)}
      <SEOContentTemplate
        title='Spells & Rituals Library'
        h1='Spells & Rituals'
        description='Explore our curated collection of spells and rituals. Each includes detailed instructions, materials, correspondences, and guidance for safe, ethical practice.'
        keywords={[
          'spells',
          'magic spells',
          'witchcraft spells',
          'protection spells',
          'love spells',
          'moon magic',
          'ritual magic',
        ]}
        canonicalUrl='https://lunary.app/grimoire/spells'
        whatIs={{
          question: 'What are spells in witchcraft?',
          answer:
            'Spells are focused rituals that combine intention, symbolism, and energy to create change. They use tools like candles, herbs, crystals, and spoken words to direct willpower toward a specific goal. Effective spellwork requires clear intention, appropriate timing (like moon phases), and ethical consideration of the outcome.',
        }}
        tldr='Spells combine intention, symbolism, and energy to create change. Key elements: clear intention, appropriate materials, timing (moon phases, planetary hours), and ethical practice. Always read through a spell completely before starting and gather all materials first.'
        intro='Spellwork requires intention, focus, and respect for magical practice. Always read through a spell completely before starting, gather your materials, and create sacred space. Remember that magic works best when aligned with ethical principles and genuine need.'
        faqs={[
          {
            question: 'Do spells really work?',
            answer:
              'Spells work by focusing intention and energy toward a goal. They work best when combined with practical action, clear intention, appropriate timing, and genuine need. Results depend on factors including your belief, the spell construction, and alignment with natural energies.',
          },
          {
            question: 'What do I need to cast a spell?',
            answer:
              'Basic spellwork requires intention and focus. Many spells use tools like candles, herbs, crystals, or written words to help focus energy. The most important element is your clear intention and genuine need.',
          },
          {
            question: 'When is the best time to cast spells?',
            answer:
              'Timing matters in magic. New moons favor beginnings and manifestation; full moons favor completion and release. Planetary hours and days add power (Venus for love, Mars for courage). However, urgent needs can override ideal timing.',
          },
          {
            question: 'Are spells safe for beginners?',
            answer:
              'Yes! Start with beginner-level spells that focus on protection, self-love, and personal growth. Avoid any spells that attempt to control others or involve advanced techniques until you have more experience. Always read through a spell completely before beginning.',
          },
        ]}
        relatedItems={[
          {
            name: 'Spellcraft Fundamentals',
            href: '/grimoire/spells/fundamentals',
            type: 'guide',
          },
          {
            name: 'Candle Magic',
            href: '/grimoire/candle-magic',
            type: 'practice',
          },
          {
            name: 'Correspondences',
            href: '/grimoire/correspondences',
            type: 'reference',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'timing',
          },
        ]}
      >
        <SpellsClient spells={allSpells} categories={allCategories} />
      </SEOContentTemplate>
    </>
  );
}
