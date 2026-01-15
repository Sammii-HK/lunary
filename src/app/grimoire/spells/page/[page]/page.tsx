import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { spellCategories, spellDatabase } from '@/lib/spells';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import SpellsClient from '../../SpellsClient';

const PAGE_SIZE = 10;

/**
 * NOTE: This route intentionally does NOT use generateStaticParams because:
 * 1. Pagination depends on search/filter query params (q, category, difficulty)
 * 2. The total number of pages varies based on active filters
 * 3. Static generation would require generating all possible filter combinations
 * 4. The route is dynamic and handles filtering server-side
 *
 * The route is still SEO-friendly with:
 * - Proper canonical URLs
 * - Robots meta tags (index: true, follow: true)
 * - Proper metadata for each page
 */

function toClientSpell(spell: any) {
  return {
    id: spell.id || '',
    title: spell.title || '',
    category: spell.category || '',
    subcategory: spell.subcategory || undefined,
    type: spell.type || 'spell',
    difficulty: spell.difficulty || 'beginner',
    duration: spell.duration || '10-15 minutes',
    description: spell.description || spell.purpose || '',
    purpose: spell.purpose || spell.description || '',
    timing: spell.timing,
    correspondences: spell.correspondences,
  };
}

function buildCategoryCounts(spells: Array<{ category?: string }>) {
  const counts: Record<string, number> = { all: spells.length };
  for (const s of spells) {
    if (!s?.category) continue;
    counts[s.category] = (counts[s.category] || 0) + 1;
  }
  return counts;
}

// server-side filter (global) using query params
function filterAllSpells(
  spells: ReturnType<typeof toClientSpell>[],
  searchParams?: { q?: string; category?: string; difficulty?: string },
) {
  const q = (searchParams?.q ?? '').trim().toLowerCase();
  const category = (searchParams?.category ?? 'all').trim();
  const difficulty = (searchParams?.difficulty ?? 'all').trim();

  return spells.filter((s) => {
    const matchesQ =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.purpose.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.subcategory ? String(s.subcategory).toLowerCase().includes(q) : false);

    const matchesCategory = category === 'all' ? true : s.category === category;
    const matchesDifficulty =
      difficulty === 'all' ? true : s.difficulty === difficulty;

    return matchesQ && matchesCategory && matchesDifficulty;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const pageNum = Number(page);

  if (!Number.isFinite(pageNum) || pageNum < 2) {
    return { alternates: { canonical: 'https://lunary.app/grimoire/spells' } };
  }

  const canonical = `https://lunary.app/grimoire/spells/page/${pageNum}`;

  return {
    title: `Spells & Rituals Library (Page ${pageNum}) - Lunary`,
    description:
      'Browse Lunary’s spell library: protection, love, prosperity, healing, cleansing, divination, manifestation, banishing, and more.',
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function SpellsPaginatedPage({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams?: Promise<{
    q?: string;
    category?: string;
    difficulty?: string;
  }>;
}) {
  const { page } = await params;
  const currentPage = Number(page);

  const sp = (await searchParams) ?? {};

  const all = (spellDatabase ?? []).map(toClientSpell);
  // then use sp.q / sp.category / sp.difficulty everywhere
  const filteredAll = filterAllSpells(all, sp);

  const initialQuery = sp.q ?? '';
  const initialCategory = sp.category ?? 'all';
  const initialDifficulty = sp.difficulty ?? 'all';

  if (!Number.isFinite(currentPage) || currentPage < 2) notFound();

  // all spells (client shape)

  const totalCount = filteredAll.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (currentPage > totalPages) notFound();

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageSpells = filteredAll.slice(start, start + PAGE_SIZE);

  const categories = Object.fromEntries(
    Object.entries(spellCategories ?? {}).map(([key, cat]: any) => [
      key,
      { name: cat.name, description: cat.description, icon: cat.icon || '✨' },
    ]),
  );

  // ✅ counts should match the same filtered result-set (so filters feel consistent)
  const categoryCounts = buildCategoryCounts(filteredAll);

  return (
    <SEOContentTemplate
      title='Spells & Rituals Library'
      h1='Spells & Rituals'
      description='A complete collection of spells and rituals with instructions, timing, correspondences, and guidance for safe practice.'
      canonicalUrl={`https://lunary.app/grimoire/spells/page/${currentPage}`}
      intro='Browse spells by intention, difficulty, and category. Use correspondences (colors, herbs, days, moon phases) to time your work and keep your practice grounded, ethical, and safe.'
      tldr='Choose a clear goal, match it with timing and correspondences, and follow through with real-world action. Start simple and build consistency.'
      meaning={`Spells are structured intention: a combination of focus, symbolism, timing, and repeated practice. A good spell does three things:\n\n1) **Clarifies the goal** (what you are asking for)\n2) **Builds a container** (tools and correspondences that support the intention)\n3) **Creates follow-through** (a real-world action that matches the spell)\n\nUse this library as a menu. Start with a category that matches your aim (protection, cleansing, love, prosperity), then adapt the steps to your own boundaries and beliefs. If you are new, begin with cleansing and protection work before attempting more complex rituals.\n\n**How to Choose a Spell**\n\nChoose the simplest spell that matches your goal. If you feel scattered, start with a short candle ritual or a single-card intention. Complexity does not guarantee results.\n\n**Aftercare**\n\nGround after spellwork and check in with your energy. A short walk, a glass of water, or a brief journal entry helps integrate the practice.\n\n**Consistency Matters**\n\nSmall, repeated rituals create stronger results than a one-time dramatic effort. Pick one spell to repeat weekly and track what shifts.\n\nIf you feel unsure, return to protection and cleansing. They create a stable foundation for every other spell type.\n\nKeep your notes simple so you can see progress clearly. Consistent tracking builds trust in the process. Small wins count. Give results time to unfold. Stay patient.`}
      tableOfContents={[
        { label: 'Meaning', href: '#meaning' },
        { label: 'Explore Spells', href: '#explore-practices' },
        { label: 'FAQ', href: '#faq' },
      ]}
      rituals={[
        'Cleanse your space before beginning any spellwork.',
        'Write the intention in one short sentence.',
        'Use a timer for focused, distraction-free ritual time.',
        'Close by thanking the elements or energies you invoked.',
      ]}
      journalPrompts={[
        'What result am I truly seeking with this spell?',
        'Which correspondences feel most aligned for me?',
        'What real-world action supports this intention?',
        'How will I know the spell is working?',
      ]}
      tables={[
        {
          title: 'Spell Planning Checklist',
          headers: ['Step', 'Why it matters'],
          rows: [
            ['Clear goal', 'Focuses the intention'],
            ['Timing', 'Supports momentum'],
            ['Correspondences', 'Adds symbolic power'],
            ['Aftercare', 'Integrates the work'],
          ],
        },
        {
          title: 'Common Timing Choices',
          headers: ['Timing', 'Best For'],
          rows: [
            ['Waxing moon', 'Growth and attraction'],
            ['Waning moon', 'Release and banishing'],
            ['New moon', 'New beginnings'],
            ['Full moon', 'Manifestation and visibility'],
          ],
        },
        {
          title: 'When to Pause or Simplify',
          headers: ['Signal', 'Response'],
          rows: [
            ['Low energy', 'Shorter ritual or rest'],
            ['Unclear goal', 'Journal first, then choose'],
            ['Feeling scattered', 'Use one tool only'],
          ],
        },
      ]}
      faqs={[
        {
          question: 'Do spells “work” without tools?',
          answer:
            'Tools help focus and symbolize intention, but they are not required. Clear intention, consistency, and aligned real-world actions are the core of effective spellwork.',
        },
        {
          question: 'What should beginners start with?',
          answer:
            'Start with cleansing, protection, and grounding. Build a simple routine (candle + salt + journaling) before layering more ingredients and timing.',
        },
        {
          question: 'How do I choose timing for a spell?',
          answer:
            'Use moon phases (waxing for growth, waning for release), planetary days/hours, and your own energy. Timing is supportive—not mandatory.',
        },
        {
          question: 'Is love magic ethical?',
          answer:
            'Avoid coercive work. Focus on self-love, attraction, clarity, and opening opportunities rather than controlling a specific person’s will.',
        },
        {
          question: 'How long should I wait to see results?',
          answer:
            'Some effects are immediate, while others build over weeks. Track progress and adjust your approach if needed.',
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
        { name: 'Moon Phases', href: '/grimoire/moon/phases', type: 'timing' },
      ]}
      keywords={[
        'spells',
        'magic spells',
        'witchcraft spells',
        'protection spells',
        'love spells',
        'moon magic',
        'ritual magic',
      ]}
      internalLinks={[
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        { text: 'Correspondences', href: '/grimoire/correspondences' },
        { text: 'Grimoire Home', href: '/grimoire' },
      ]}
    >
      <SpellsClient
        spells={pageSpells}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        categories={categories}
        categoryCounts={categoryCounts}
        basePath='/grimoire/spells'
        initialQuery={initialQuery}
        initialCategory={initialCategory}
        initialDifficulty={initialDifficulty}
      />
    </SEOContentTemplate>
  );
}
