import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { normalizePlanType } from '../../../../utils/pricing';
import type { AiPlanId } from '@/lib/ai/types';

type AnnouncementRow = {
  id: string;
  title: string;
  description: string;
  icon: string;
  cta_label: string | null;
  cta_href: string | null;
  required_tier: string[];
  released_at: string;
};

/**
 * GET /api/announcements
 * Returns the next unseen announcement for the current user (one at a time, oldest first)
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const rawPlan = (session.user as any).subscriptionPlan || 'free';
    const userPlan = normalizePlanType(rawPlan) as AiPlanId;

    // Get all active announcements the user hasn't seen yet, ordered by release date (oldest first)
    // Filter by tier in the query for efficiency
    const result = await sql<AnnouncementRow>`
      SELECT
        fa.id,
        fa.title,
        fa.description,
        fa.icon,
        fa.cta_label,
        fa.cta_href,
        fa.required_tier,
        fa.released_at
      FROM feature_announcements fa
      WHERE fa.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM feature_announcements_seen fas
          WHERE fas.user_id = ${userId}
            AND fas.announcement_id = fa.id::text
        )
      ORDER BY fa.released_at ASC
      LIMIT 10
    `;

    // Filter by tier in code (simpler than complex SQL array logic)
    const nextAnnouncement = result.rows.find((announcement) => {
      const requiredTiers = announcement.required_tier || [];
      if (requiredTiers.length === 0) {
        return true; // No tier requirement = show to all
      }
      return requiredTiers.includes(userPlan);
    });

    if (!nextAnnouncement) {
      return NextResponse.json({ announcement: null });
    }

    return NextResponse.json({
      announcement: {
        id: nextAnnouncement.id,
        title: nextAnnouncement.title,
        description: nextAnnouncement.description,
        icon: nextAnnouncement.icon,
        ctaLabel: nextAnnouncement.cta_label,
        ctaHref: nextAnnouncement.cta_href,
        releasedAt: nextAnnouncement.released_at,
      },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/announcements
 * Mark an announcement as seen by the current user
 * Body: { announcementId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { announcementId } = body;

    if (!announcementId || typeof announcementId !== 'string') {
      return NextResponse.json(
        { error: 'announcementId is required' },
        { status: 400 },
      );
    }

    // Insert the seen record (upsert to handle duplicates gracefully)
    await sql`
      INSERT INTO feature_announcements_seen (user_id, announcement_id)
      VALUES (${userId}, ${announcementId})
      ON CONFLICT (user_id, announcement_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking announcement as seen:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
