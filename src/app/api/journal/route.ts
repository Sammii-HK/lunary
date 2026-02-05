import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { isDreamEntry } from '@/lib/journal/dream-classifier';
import { JOURNAL_LIMITS, normalizePlanType } from '../../../../utils/pricing';
import { conversionTracking } from '@/lib/analytics';

export type JournalCategory = 'journal' | 'dream' | 'ritual';

export interface JournalEntry {
  id: number;
  content: string;
  moodTags: string[];
  cardReferences: string[];
  moonPhase: string | null;
  transitHighlight: string | null;
  source: 'manual' | 'chat' | 'astral-guide';
  sourceMessageId: string | null;
  createdAt: string;
  category?: JournalCategory;
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
        category,
        content,
        tags,
        created_at
      FROM collections
      WHERE user_id = ${user.id}
      AND category IN ('journal', 'dream', 'ritual')
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
        category: row.category as JournalCategory,
      };
    });

    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM collections
      WHERE user_id = ${user.id}
      AND category IN ('journal', 'dream', 'ritual')
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
    const subscriptionResult = await sql`
      SELECT status, plan_type
      FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    const rawStatus = subscription?.status || 'free';
    const subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    const planType = normalizePlanType(subscription?.plan_type);
    const isPaid =
      subscriptionStatus === 'active' || subscriptionStatus === 'trial';

    if (!isPaid && planType === 'free') {
      const limit = JOURNAL_LIMITS.freeMonthlyEntries;
      const entryCountResult = await sql`
        SELECT COUNT(*)::int as count
        FROM collections
        WHERE user_id = ${user.id}
          AND category IN ('journal', 'dream', 'ritual')
          AND created_at >= date_trunc('month', NOW())
      `;
      const count = Number(entryCountResult.rows[0]?.count ?? 0);
      if (count >= limit) {
        return NextResponse.json(
          {
            success: false,
            error: `Free plan limited to ${limit} journal entries per month.`,
            upgradeRequired: true,
          },
          { status: 403 },
        );
      }
    }
    const body = await request.json();

    const {
      content,
      moodTags = [],
      cardReferences = [],
      moonPhase = null,
      transitHighlight = null,
      source = 'manual',
      sourceMessageId = null,
      category = null,
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

    const allowedCategories: JournalCategory[] = ['journal', 'dream', 'ritual'];
    const isJournalCategory = (value: unknown): value is JournalCategory =>
      typeof value === 'string' &&
      allowedCategories.includes(value as JournalCategory);
    const requestedCategory = isJournalCategory(category) ? category : null;
    const resolvedCategory =
      requestedCategory ??
      (isDreamEntry({ content, moodTags, source }) ? 'dream' : 'journal');

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
        ${resolvedCategory},
        ${JSON.stringify(contentData)}::jsonb,
        ${moodTags}::text[]
      )
      RETURNING id, category, created_at
    `;

    const entry = result.rows[0];

    // Track journal/dream creation
    if (entry.category === 'dream') {
      conversionTracking.dreamEntryCreated(user.id, {
        source,
        hasMoodTags: moodTags.length > 0,
        hasCardReferences: cardReferences.length > 0,
        hasMoonPhase: !!moonPhase,
        contentLength: content.trim().length,
      });
    } else if (entry.category === 'journal') {
      conversionTracking.journalEntryCreated(user.id, {
        source,
        hasMoodTags: moodTags.length > 0,
        hasCardReferences: cardReferences.length > 0,
        hasMoonPhase: !!moonPhase,
        contentLength: content.trim().length,
      });
    }

    // Check referral activation (fire-and-forget)
    if (entry.category === 'journal' || entry.category === 'dream') {
      import('@/lib/referrals/check-activation')
        .then(({ checkInviteActivation }) =>
          checkInviteActivation(user.id, 'journal_entry_created'),
        )
        .catch(() => {});
    }

    // Track journal progress for skill tree (journals and dreams count)
    if (entry.category === 'journal' || entry.category === 'dream') {
      try {
        const { incrementProgress } = await import('@/lib/progress/server');
        await incrementProgress(user.id, 'journal', 1, isPaid);
      } catch (progressError) {
        console.warn('[Journal] Failed to track progress:', progressError);
      }
    }

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
        category: entry.category,
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
