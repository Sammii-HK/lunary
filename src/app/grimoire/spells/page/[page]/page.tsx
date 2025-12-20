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
