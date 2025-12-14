import { NextResponse } from 'next/server';
import {
  spellDatabase,
  spellCategories,
  getSpellsByCategory,
  getSpellsBySabbat,
  getSpellsByMoonPhase,
} from '@/lib/spells';

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
    data = getSpellsByMoonPhase(moonPhase);
  } else {
    data = {
      spells: spellDatabase,
      categories: spellCategories,
    };
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
