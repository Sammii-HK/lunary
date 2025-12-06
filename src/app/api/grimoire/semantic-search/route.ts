import { NextRequest, NextResponse } from 'next/server';
import { searchSimilar, getEmbeddingCount } from '@/lib/embeddings';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');
    const category = searchParams.get('category') || undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 },
      );
    }

    if (limit > 20) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 20' },
        { status: 400 },
      );
    }

    const results = await searchSimilar(query, limit, category);
    const totalCount = await getEmbeddingCount();

    return NextResponse.json({
      query,
      results,
      totalInDatabase: totalCount,
      metadata: {
        category: category || 'all',
        limit,
        resultsReturned: results.length,
      },
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      {
        error: 'Semantic search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 5, category } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (limit > 20) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 20' },
        { status: 400 },
      );
    }

    const results = await searchSimilar(query, limit, category);

    return NextResponse.json({
      query,
      results,
      metadata: {
        category: category || 'all',
        limit,
        resultsReturned: results.length,
      },
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      {
        error: 'Semantic search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
