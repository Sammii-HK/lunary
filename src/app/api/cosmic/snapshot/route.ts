import { NextRequest, NextResponse } from 'next/server';
import {
  getCachedSnapshot,
  buildSnapshotWithGlobalCache,
  saveSnapshot,
} from '@/lib/cosmic-snapshot/cache';
import {
  getGlobalCosmicData,
  buildGlobalCosmicData,
} from '@/lib/cosmic-snapshot/global-cache';
import { requireUser } from '@/lib/ai/auth';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : new Date();
    let snapshot = await getCachedSnapshot(user.id, date);

    // If snapshot doesn't exist, generate it on-demand
    if (!snapshot) {
      try {
        // Get user profile data
        const profileResult = await sql`
          SELECT email, name, birthday, timezone, locale
          FROM accounts
          WHERE id = ${user.id}
          LIMIT 1
        `;
        const profile = profileResult.rows[0];

        if (!profile?.birthday) {
          return NextResponse.json(
            { error: 'Birthday required to generate cosmic snapshot' },
            { status: 400 },
          );
        }

        // Get or build global cosmic data
        let globalData = await getGlobalCosmicData(date);
        if (!globalData) {
          globalData = await buildGlobalCosmicData(date);
        }

        // Build snapshot
        snapshot = await buildSnapshotWithGlobalCache(
          user.id,
          globalData,
          profile.timezone || 'Europe/London',
          profile.locale || 'en-GB',
          profile.name,
          profile.birthday,
          date,
        );

        // Save snapshot for future use
        await saveSnapshot(user.id, date, snapshot);
      } catch (error) {
        console.error('[cosmic/snapshot] Failed to generate snapshot:', error);
        return NextResponse.json(
          { error: 'Failed to generate cosmic snapshot' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('[cosmic/snapshot] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cosmic snapshot' },
      { status: 500 },
    );
  }
}
