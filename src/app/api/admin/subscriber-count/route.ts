import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    // Simple endpoint to get subscriber count for admin dashboard
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM push_subscriptions 
      WHERE is_active = true
    `;

    const count = result.rows[0]?.count || 0;

    return NextResponse.json({
      success: true,
      count: parseInt(count),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    return NextResponse.json(
      {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
