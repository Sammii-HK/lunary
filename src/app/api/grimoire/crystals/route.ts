import { NextResponse } from 'next/server';
import {
  crystalDatabase,
  crystalCategories,
  getCrystalsByCategory,
} from '@/constants/grimoire/crystals';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let data;
  if (category) {
    data = getCrystalsByCategory(category);
  } else {
    data = {
      crystals: crystalDatabase,
      categories: crystalCategories,
    };
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
