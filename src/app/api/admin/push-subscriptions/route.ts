import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    const userId = searchParams.get('userId');

    const activeCount = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions WHERE is_active = true
    `;

    const inactiveCount = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions WHERE is_active = false
    `;

    const recentNotifications = await sql`
      SELECT 
        user_id,
        user_email,
        is_active,
        last_notification_sent,
        created_at,
        updated_at,
        SUBSTRING(endpoint, 1, 60) as endpoint_preview
      FROM push_subscriptions
      ORDER BY last_notification_sent DESC NULLS LAST
      LIMIT 20
    `;

    let userSubscription = null;
    if (userEmail || userId) {
      const userSub = await sql`
        SELECT 
          id,
          user_id,
          user_email,
          is_active,
          last_notification_sent,
          created_at,
          updated_at,
          preferences,
          SUBSTRING(endpoint, 1, 80) as endpoint_preview
        FROM push_subscriptions
        WHERE ${userEmail ? sql`user_email = ${userEmail}` : sql`user_id = ${userId}`}
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      userSubscription = userSub.rows[0] || null;
    }

    const subscriptionsByStatus = await sql`
      SELECT 
        is_active,
        COUNT(*) as count,
        MAX(last_notification_sent) as last_sent,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM push_subscriptions
      GROUP BY is_active
    `;

    const staleSubscriptions = await sql`
      SELECT COUNT(*) as count
      FROM push_subscriptions
      WHERE is_active = true
      AND (last_notification_sent IS NULL OR last_notification_sent < NOW() - INTERVAL '7 days')
    `;

    return NextResponse.json({
      success: true,
      summary: {
        active: parseInt(activeCount.rows[0]?.count || '0'),
        inactive: parseInt(inactiveCount.rows[0]?.count || '0'),
        stale: parseInt(staleSubscriptions.rows[0]?.count || '0'),
        total:
          parseInt(activeCount.rows[0]?.count || '0') +
          parseInt(inactiveCount.rows[0]?.count || '0'),
      },
      subscriptionsByStatus: subscriptionsByStatus.rows,
      recentNotifications: recentNotifications.rows,
      userSubscription,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch push subscription stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, email, endpoint } = await request.json();

    if (action === 'reactivate') {
      if (endpoint) {
        await sql`
          UPDATE push_subscriptions
          SET is_active = true, updated_at = NOW()
          WHERE endpoint = ${endpoint}
        `;
      } else if (userId) {
        await sql`
          UPDATE push_subscriptions
          SET is_active = true, updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      } else if (email) {
        await sql`
          UPDATE push_subscriptions
          SET is_active = true, updated_at = NOW()
          WHERE user_email = ${email}
        `;
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription reactivated',
      });
    }

    if (action === 'cleanup-stale') {
      const result = await sql`
        UPDATE push_subscriptions
        SET is_active = false
        WHERE is_active = true
        AND last_notification_sent < NOW() - INTERVAL '30 days'
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        message: `Deactivated ${result.rows.length} stale subscriptions`,
        deactivated: result.rows.length,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Push subscription action failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
