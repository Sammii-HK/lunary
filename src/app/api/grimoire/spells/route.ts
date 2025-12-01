import { NextResponse } from 'next/server';
import {
  spells,
  spellCategories,
  getSpellsByCategory,
  getSpellsBySabbat,
  getSpellsByMoonPhase,
} from '@/constants/spells';
import type { MoonPhaseLabels } from '../../../../../utils/moon/moonPhases';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const sabbat = searchParams.get('sabbat');
  const moonPhase = searchParams.get('moonPhase');

  let data;
  if (category) {
    data = getSpellsByCategory(category);
  } else if (sabbat) {
    data = getSpellsBySabbat(sabbat);
  } else if (moonPhase) {
    data = getSpellsByMoonPhase(moonPhase as MoonPhaseLabels);
  } else {
    data = {
      spells,
      categories: spellCategories,
    };
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
