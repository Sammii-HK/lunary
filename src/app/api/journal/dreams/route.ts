import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  isDreamEntry,
  extractAllDreamTags,
} from '@/lib/journal/dream-classifier';

export interface DreamEntry {
  id: number;
  content: string;
  moodTags: string[];
  cardReferences: string[];
  moonPhase: string | null;
  transitHighlight: string | null;
  source: 'manual' | 'chat' | 'astral-guide';
  sourceMessageId: string | null;
  createdAt: string;
  dreamTags: string[];
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeLegacy = searchParams.get('includeLegacy') !== 'false';

    let result;

    if (includeLegacy) {
      result = await sql`
        SELECT 
          id,
          category,
          content,
          tags,
          created_at
        FROM collections
        WHERE user_id = ${user.id}
        AND (category = 'dream' OR category = 'journal')
        ORDER BY created_at DESC
        LIMIT ${limit * 2}
        OFFSET ${offset}
      `;
    } else {
      result = await sql`
        SELECT 
          id,
          category,
          content,
          tags,
          created_at
        FROM collections
        WHERE user_id = ${user.id}
        AND category = 'dream'
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const entries: DreamEntry[] = [];

    for (const row of result.rows) {
      const contentData =
        typeof row.content === 'string' ? JSON.parse(row.content) : row.content;

      const entryData = {
        content: contentData.text || '',
        moodTags: contentData.moodTags || [],
        source: contentData.source || 'manual',
      };

      const isExplicitDream = row.category === 'dream';
      const isDetectedDream = isDreamEntry(entryData);

      if (!isExplicitDream && !isDetectedDream) {
        continue;
      }

      const dreamTags = extractAllDreamTags(entryData.content);

      entries.push({
        id: row.id,
        content: entryData.content,
        moodTags: contentData.moodTags || [],
        cardReferences: contentData.cardReferences || [],
        moonPhase: contentData.moonPhase || null,
        transitHighlight: contentData.transitHighlight || null,
        source: contentData.source || 'manual',
        sourceMessageId: contentData.sourceMessageId || null,
        createdAt: row.created_at,
        dreamTags,
      });

      if (entries.length >= limit) {
        break;
      }
    }

    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM collections
      WHERE user_id = ${user.id}
      AND category = 'dream'
    `;
    const explicitTotal = parseInt(totalResult.rows[0]?.total || '0', 10);

    return NextResponse.json({
      success: true,
      entries,
      pagination: {
        total: Math.max(explicitTotal, entries.length),
        limit,
        offset,
        hasMore: entries.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching dream entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dream entries' },
      { status: 500 },
    );
  }
}
