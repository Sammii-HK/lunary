// // app/api/shop/search/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getShopListingsFromStripe } from '@/lib/shop/catalogue';

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const q = (searchParams.get('q') || '').toLowerCase().trim();
//   const category = (searchParams.get('category') || 'all').toLowerCase();

//   const all = await getShopListingsFromStripe(); // ✅ STRIPE mapped items

//   let filtered = all;

//   if (category !== 'all') {
//     filtered = filtered.filter((p) => p.category === category);
//   }

//   if (q) {
//     filtered = filtered.filter((p) => {
//       const haystack = [
//         p.title,
//         p.tagline,
//         p.description,
//         ...(p.whatInside || []),
//         ...(p.tags || []),
//         ...(p.keywords || []),
//       ]
//         .filter(Boolean)
//         .join(' ')
//         .toLowerCase();

//       return haystack.includes(q);
//     });
//   }

//   return NextResponse.json({ products: filtered.slice(0, 200) });
// }

// /api/shop/search/route.ts
import { NextResponse } from 'next/server';
import { getShopListingsFromStripe } from '@/lib/shop/catalogue';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  if (!q) return NextResponse.json({ products: [] });

  const all = await getShopListingsFromStripe();

  const products = all.filter((p) => {
    const haystack =
      `${p.title} ${p.tagline} ${p.description} ${p.whatInside?.join(' ')}`.toLowerCase();
    return haystack.includes(q);
  });

  return NextResponse.json({ products });
}
