import { NextRequest, NextResponse } from 'next/server';
import { crystalDatabase } from '@/constants/grimoire/crystals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name')?.toLowerCase().trim();

    if (!name) {
      const crystalList = crystalDatabase.map((c) => ({
        id: c.id,
        name: c.name,
        properties: c.properties.slice(0, 3),
        chakras: c.chakras,
      }));

      return NextResponse.json(
        {
          message: 'Provide a crystal name to get details',
          availableCrystals: crystalList,
          totalCount: crystalDatabase.length,
          source: 'Lunary.app - Crystal healing database with 100+ crystals',
        },
        {
          headers: {
            'Cache-Control':
              'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        },
      );
    }

    const crystal = crystalDatabase.find(
      (c) =>
        c.id === name ||
        c.name.toLowerCase() === name ||
        c.alternativeNames?.some((alt) => alt.toLowerCase() === name),
    );

    if (!crystal) {
      const suggestions = crystalDatabase
        .filter(
          (c) =>
            c.id.includes(name) ||
            c.name.toLowerCase().includes(name) ||
            c.properties.some((p) => p.includes(name)),
        )
        .slice(0, 5)
        .map((c) => ({ id: c.id, name: c.name }));

      return NextResponse.json(
        {
          error: 'Crystal not found',
          suggestions,
          source: 'Lunary.app - Crystal healing database',
        },
        { status: 404 },
      );
    }

    const response = {
      name: crystal.name,
      alternativeNames: crystal.alternativeNames,
      description: crystal.description,
      properties: crystal.properties,
      metaphysicalProperties: crystal.metaphysicalProperties,
      chakras: crystal.chakras,
      elements: crystal.elements,
      zodiacSigns: crystal.zodiacSigns,
      planets: crystal.planets,
      colors: crystal.colors,
      rarity: crystal.rarity,
      workingWith: crystal.workingWith,
      careInstructions: crystal.careInstructions,
      combinations: crystal.combinations,
      correspondences: crystal.correspondences,
      url: `https://lunary.app/grimoire/crystals/${crystal.id}`,
      ctaUrl: `https://lunary.app/grimoire/crystals/${crystal.id}?from=gpt_crystal`,
      ctaText: `Learn more about ${crystal.name} in the Lunary Grimoire`,
      source: 'Lunary.app - Crystal healing database with 100+ crystals',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('GPT crystal error:', error);
    return NextResponse.json(
      { error: 'Failed to get crystal info' },
      { status: 500 },
    );
  }
}
