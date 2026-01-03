import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type LocationSuggestion = {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limitParam = url.searchParams.get('limit');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  const rawLimit = Number.parseInt(limitParam || '5', 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 8)
    : 5;

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(
        query,
      )}&format=json&limit=${limit}&addressdetails=1`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'LocationIQ search failed' },
        { status: response.status },
      );
    }

    const data = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        hamlet?: string;
        neighbourhood?: string;
        state?: string;
        region?: string;
        county?: string;
        country?: string;
      };
    }>;

    const results: LocationSuggestion[] = data
      .map((item) => {
        if (!item.lat || !item.lon) return null;
        const address = item.address || {};
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.suburb ||
          address.hamlet ||
          address.neighbourhood;
        const region = address.state || address.region || address.county;
        const country = address.country;
        const label =
          [city, region, country].filter(Boolean).join(', ') ||
          item.display_name ||
          'Unknown location';

        return {
          label,
          latitude: Number.parseFloat(item.lat),
          longitude: Number.parseFloat(item.lon),
          city,
          region,
          country,
        };
      })
      .filter((item): item is LocationSuggestion => Boolean(item));

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'LocationIQ search error' },
      { status: 500 },
    );
  }
}
