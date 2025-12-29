import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(
        query,
      )}&format=json&limit=1`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'LocationIQ search failed' },
        { status: response.status },
      );
    }

    const data = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;

    const first = data[0];
    if (!first?.lat || !first?.lon) {
      return NextResponse.json({
        latitude: null,
        longitude: null,
        error: 'No results',
      });
    }

    return NextResponse.json({
      latitude: parseFloat(first.lat),
      longitude: parseFloat(first.lon),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'LocationIQ search error' },
      { status: 500 },
    );
  }
}
