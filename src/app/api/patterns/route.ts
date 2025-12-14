import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';

export const dynamic = 'force-dynamic';

interface PatternResponse {
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number }>;
  suitDistribution: Array<{ suit: string; count: number }>;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const days = Math.min(
      Math.max(parseInt(searchParams.get('days') || '30', 10), 1),
      365,
    );

    const result = await sql`
      SELECT cards, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND archived_at IS NULL
        AND created_at >= NOW() - (${days} || ' days')::INTERVAL
      ORDER BY created_at DESC
    `;

    const cardFrequency: { [key: string]: number } = {};
    const keywordCounts: { [key: string]: number } = {};
    const suitCounts: { [key: string]: number } = {};

    result.rows.forEach((row) => {
      const cards = Array.isArray(row.cards)
        ? row.cards
        : JSON.parse(row.cards || '[]');

      cards.forEach((card: any) => {
        const cardName = card.card?.name || card.name;
        if (cardName) {
          cardFrequency[cardName] = (cardFrequency[cardName] || 0) + 1;

          const suit = getCardSuit(cardName);
          suitCounts[suit] = (suitCounts[suit] || 0) + 1;
        }

        const keywords = card.card?.keywords || card.keywords || [];
        keywords.forEach((keyword: string) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      });
    });

    const dominantThemes = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

    const frequentCards = Object.entries(cardFrequency)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count: count as number }));

    const suitDistribution = Object.entries(suitCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([suit, count]) => ({ suit, count: count as number }));

    const response: PatternResponse = {
      dominantThemes,
      frequentCards,
      suitDistribution,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: 'Please sign in to view patterns' },
        { status: 401 },
      );
    }

    console.error('[patterns] Error fetching patterns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 },
    );
  }
}

function getCardSuit(cardName: string): string {
  const majors = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
  ];

  if (majors.some((m) => cardName.includes(m))) {
    return 'Major Arcana';
  }
  if (cardName.includes('Cups')) return 'Cups';
  if (cardName.includes('Wands')) return 'Wands';
  if (cardName.includes('Swords')) return 'Swords';
  if (cardName.includes('Pentacles')) return 'Pentacles';
  return 'Unknown';
}
