// src/app/grimoire/spells/page.tsx

import { Metadata } from 'next';
import { spellCategories, spellDatabase } from '@/lib/spells';
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

const PAGE_SIZE = 10;

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

// Convert your normalised spell shape into what the list UI needs
function toClientSpell(spell: any): SpellForClient {
  return {
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
  };
}

function getAllCategories() {
  const merged: Record<
    string,
    { name: string; description: string; icon: string }
  > = {};

  Object.entries(spellCategories).forEach(([key, cat]: any) => {
    merged[key] = {
      name: cat.name,
      description: cat.description,
      icon: cat.icon ?? '✨',
    };
  });

  return merged;
}

// Global category counts for ALL spells (not just the current page)
function getGlobalCategoryCounts(allSpells: SpellForClient[]) {
  const counts: Record<string, number> = { all: allSpells.length };

  for (const s of allSpells) {
    if (!s?.category) continue;
    counts[s.category] = (counts[s.category] || 0) + 1;
  }

  return counts;
}

export default async function SpellsIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    difficulty?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};

  const initialQuery = sp.q ?? '';
  const initialCategory = sp.category ?? 'all';
  const initialDifficulty = sp.difficulty ?? 'all';
  const allSpells: SpellForClient[] = spellDatabase.map(toClientSpell);
  const allCategories = getAllCategories();

  // filter globally (this is the key change)
  const filteredAll = allSpells.filter((s) => {
    const matchesQ =
      !sp.q ||
      s.title.toLowerCase().includes(sp.q) ||
      s.description.toLowerCase().includes(sp.q) ||
      s.purpose.toLowerCase().includes(sp.q) ||
      s.category.toLowerCase().includes(sp.q) ||
      (s.subcategory ? s.subcategory.toLowerCase().includes(sp.q) : false);

    const matchesCategory =
      initialCategory === 'all' ? true : s.category === initialCategory;
    const matchesDifficulty =
      initialDifficulty === 'all' ? true : s.difficulty === initialDifficulty;

    return matchesQ && matchesCategory && matchesDifficulty;
  });

  const totalCount = filteredAll.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = 1;

  const spellsForPage = filteredAll.slice(0, PAGE_SIZE);

  // counts should match the filtered result set (so they feel correct during search)
  const categoryCounts = getGlobalCategoryCounts(filteredAll);

  const spellListSchema = createItemListSchema({
    name: 'Spell Collection',
    description:
      'Curated collection of spells for protection, love, prosperity, healing, moon magic, shadow work, and magical practice.',
    url: 'https://lunary.app/grimoire/spells',
    items: spellsForPage.map((spell) => ({
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
        meaning={`Spells are structured intention. The goal is not to force an outcome, but to align your actions with the energy you want to invite or release. A strong spell has a clear purpose, a simple structure, and a real-world follow through.

Start with a single goal. Choose timing and correspondences that support it, then keep the ritual short enough to complete with focus. Consistency matters more than complexity.

After the spell, take one practical step that matches your intention. That step grounds the work and helps you notice results without overthinking them.`}
        howToWorkWith={[
          'Pick the simplest spell that matches your goal.',
          'Gather materials before you begin to avoid breaks in focus.',
          'Choose timing that supports the intention (moon phase, day, hour).',
          'Speak the intention out loud once to anchor the ritual.',
          'Close and ground so you leave the circle with clarity.',
        ]}
        rituals={[
          'Cleanse the space with smoke, sound, or salt water.',
          'Write your intention in one clear sentence.',
          'Light a candle and read the spell slowly and steadily.',
          'Thank any energies you invoked and close the ritual.',
        ]}
        journalPrompts={[
          'What is the single outcome I want from this spell?',
          'Which correspondences feel most supportive right now?',
          'What practical action will I take after this ritual?',
          'How will I measure progress over the next week?',
        ]}
        tables={[
          {
            title: 'Spell Components',
            headers: ['Component', 'Purpose'],
            rows: [
              ['Intention', 'Clarifies the goal'],
              ['Timing', 'Aligns the energy'],
              ['Correspondences', 'Adds symbolic focus'],
              ['Action', 'Anchors results in real life'],
            ],
          },
          {
            title: 'When to Keep It Simple',
            headers: ['Situation', 'Simple Choice'],
            rows: [
              ['New to spellwork', 'Single candle ritual'],
              ['Low energy day', 'Short written intention'],
              ['Unclear goal', 'Clarity journaling spell'],
              ['High urgency', 'Protection and grounding first'],
            ],
          },
        ]}
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
              'Yes. Start with beginner-level spells that focus on protection, self-love, and personal growth. Avoid any spells that attempt to control others or involve advanced techniques until you have more experience. Always read through a spell completely before beginning.',
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
        <SpellsClient
          spells={spellsForPage}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          basePath='/grimoire/spells'
          categories={allCategories}
          categoryCounts={categoryCounts}
          initialQuery={initialQuery}
          initialCategory={initialCategory}
          initialDifficulty={initialDifficulty}
        />
      </SEOContentTemplate>
    </>
  );
}
