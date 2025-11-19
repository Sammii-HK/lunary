import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';

export const revalidate = 0;

interface ExportData {
  user: {
    id: string;
    email: string;
    name?: string;
    birthday?: string;
  };
  birthChart?: {
    sun: string;
    moon: string;
    rising: string;
    [key: string]: unknown;
  };
  tarotReadings: Array<{
    id: number;
    spreadName: string;
    summary: string;
    createdAt: string;
  }>;
  horoscopes: Array<{
    date: string;
    content: string;
  }>;
  collections: Array<{
    id: number;
    title: string;
    category: string;
    createdAt: string;
  }>;
  chatThreads?: Array<{
    id: string;
    createdAt: string;
    messageCount: number;
  }>;
  exportedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const subscriptionResult = await sql`
      SELECT plan_type, status
      FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const subscription = subscriptionResult.rows[0];
    // Normalize status: 'trialing' -> 'trial' for consistency with hasFeatureAccess
    const rawStatus = subscription?.status || 'free';
    const subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    // Normalize plan type to ensure correct feature access
    const planType = normalizePlanType(subscription?.plan_type);

    if (!hasFeatureAccess(subscriptionStatus, planType, 'data_export')) {
      return NextResponse.json(
        {
          error: 'Data export is available for Lunary+ AI Annual subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const userProfile = await sql`
      SELECT email, name, birthday
      FROM accounts
      WHERE id = ${user.id}
      LIMIT 1
    `;

    const profile = userProfile.rows[0];

    const tarotReadingsResult = await sql`
      SELECT id, spread_name, summary, created_at
      FROM tarot_readings
      WHERE user_id = ${user.id}
        AND archived_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    const collectionsResult = await sql`
      SELECT id, title, category, created_at
      FROM collections
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    const chatThreadsResult = await sql`
      SELECT id, created_at, jsonb_array_length(messages) as message_count
      FROM ai_threads
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const exportData: ExportData = {
      user: {
        id: user.id,
        email: profile?.email || '',
        name: profile?.name || undefined,
        birthday: profile?.birthday || undefined,
      },
      tarotReadings: tarotReadingsResult.rows.map((row) => ({
        id: row.id,
        spreadName: row.spread_name,
        summary: row.summary,
        createdAt: row.created_at,
      })),
      horoscopes: [],
      collections: collectionsResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        createdAt: row.created_at,
      })),
      chatThreads: chatThreadsResult.rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        messageCount: Number(row.message_count) || 0,
      })),
      exportedAt: new Date().toISOString(),
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const filename = `lunary-data-export-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to export user data:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please sign in to export your data' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to export data' },
      { status: 500 },
    );
  }
}
