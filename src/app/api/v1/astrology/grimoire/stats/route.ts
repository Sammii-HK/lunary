import { NextRequest } from 'next/server';
import { v1Handler, apiResponse } from '@/lib/api/v1-handler';
import grimoireData from '@/data/grimoire-search-index.json';

export const runtime = 'nodejs';

interface GrimoireEntry {
  category: string;
}

const entries = grimoireData as GrimoireEntry[];

export const GET = v1Handler('free', async (_request: NextRequest) => {
  const categories: Record<string, number> = {};
  for (const entry of entries) {
    categories[entry.category] = (categories[entry.category] || 0) + 1;
  }

  return apiResponse({
    totalEntries: entries.length,
    categories: Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
  });
});
