import { NextResponse } from 'next/server';
import {
  angelNumbers,
  lifePathNumbers,
} from '@/constants/grimoire/numerology-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let data;
  if (type === 'angel') {
    data = angelNumbers;
  } else if (type === 'lifepath') {
    data = lifePathNumbers;
  } else {
    data = {
      angelNumbers,
      lifePathNumbers,
    };
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
