import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${encodeURIComponent(
        lat,
      )}&lon=${encodeURIComponent(lon)}&format=json`,
    );

    if (!response.ok) {
      return NextResponse.json({
        city: null,
        country: null,
        timezone: null,
        error: 'LocationIQ reverse failed',
      });
    }

    const data = (await response.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        neighbourhood?: string;
        country?: string;
      };
      timezone?: string;
    };

    const address = data.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.neighbourhood;

    return NextResponse.json({
      city: city || null,
      country: address.country || null,
      timezone: data.timezone || null,
    });
  } catch (error) {
    return NextResponse.json({
      city: null,
      country: null,
      timezone: null,
      error: 'LocationIQ reverse error',
    });
  }
}
