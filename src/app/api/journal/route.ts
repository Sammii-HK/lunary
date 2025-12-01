import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export interface JournalEntry {
  id: number;
  content: string;
  moodTags: string[];
  cardReferences: string[];
  moonPhase: string | null;
  transitHighlight: string | null;
  source: 'manual' | 'chat';
  sourceMessageId: string | null;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await sql`
      SELECT 
        id,
        content,
        tags,
        created_at
      FROM collections
      WHERE user_id = ${user.id}
      AND category = 'journal'
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const entries: JournalEntry[] = result.rows.map((row) => {
      const contentData =
        typeof row.content === 'string' ? JSON.parse(row.content) : row.content;

      return {
        id: row.id,
        content: contentData.text || '',
        moodTags: contentData.moodTags || [],
        cardReferences: contentData.cardReferences || [],
        moonPhase: contentData.moonPhase || null,
        transitHighlight: contentData.transitHighlight || null,
        source: contentData.source || 'manual',
        sourceMessageId: contentData.sourceMessageId || null,
        createdAt: row.created_at,
      };
    });

    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM collections
      WHERE user_id = ${user.id}
      AND category = 'journal'
    `;
    const total = parseInt(totalResult.rows[0]?.total || '0', 10);

    return NextResponse.json({
      success: true,
      entries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch journal entries' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();

    const {
      content,
      moodTags = [],
      cardReferences = [],
      moonPhase = null,
      transitHighlight = null,
      source = 'manual',
      sourceMessageId = null,
    } = body;

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 },
      );
    }

    const title =
      content.length > 50 ? content.substring(0, 50) + '...' : content;

    const contentData = {
      text: content.trim(),
      moodTags,
      cardReferences,
      moonPhase,
      transitHighlight,
      source,
      sourceMessageId,
    };

    const result = await sql`
      INSERT INTO collections (user_id, title, category, content, tags)
      VALUES (
        ${user.id},
        ${title},
        'journal',
        ${JSON.stringify(contentData)}::jsonb,
        ${moodTags}::text[]
      )
      RETURNING id, created_at
    `;

    const entry = result.rows[0];

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        content: content.trim(),
        moodTags,
        cardReferences,
        moonPhase,
        transitHighlight,
        source,
        sourceMessageId,
        createdAt: entry.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create journal entry' },
      { status: 500 },
    );
  }
}
