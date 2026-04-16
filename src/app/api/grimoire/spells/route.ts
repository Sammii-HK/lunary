import { NextResponse } from 'next/server';
import {
  spellDatabase,
  spellCategories,
  getSpellsByCategory,
  getSpellsBySabbat,
  getSpellsByMoonPhase,
  filterOutOfSeasonSabbatSpells,
} from '@/lib/spells';
import { isSabbatSeasonallyRelevant } from '@/lib/grimoire/seasonal-sabbat';

export const dynamic = 'force-dynamic';

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
    // Filter out sabbat-locked spells whose sabbat isn't seasonally relevant.
    // Without this, a random New Moon in April surfaces Samhain spells
    // because the Samhain ritual has moonPhase=['New Moon','Waning Crescent'].
    data = filterOutOfSeasonSabbatSpells(
      getSpellsByMoonPhase(moonPhase),
      isSabbatSeasonallyRelevant,
    );
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
