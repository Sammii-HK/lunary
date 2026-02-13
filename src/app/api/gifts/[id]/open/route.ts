import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

/**
 * POST /api/gifts/[id]/open — mark a gift as opened and return full content.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    // Verify the gift exists and belongs to this user as recipient
    const gift = await sql`
      SELECT g.*, up.name AS sender_name, up.avatar AS sender_avatar, up.sun_sign AS sender_sun_sign
      FROM cosmic_gifts g
      LEFT JOIN user_profiles up ON up.user_id = g.sender_id
      WHERE g.id = ${id} AND g.recipient_id = ${user.id}
    `;

    if (gift.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gift not found' },
        { status: 404 },
      );
    }

    const row = gift.rows[0];

    // Mark as opened if not already
    if (!row.opened_at) {
      await sql`
        UPDATE cosmic_gifts SET opened_at = NOW() WHERE id = ${id}
      `;
    }

    return NextResponse.json({
      success: true,
      gift: {
        id: row.id,
        senderId: row.sender_id,
        senderName: row.sender_name,
        senderAvatar: row.sender_avatar,
        senderSunSign: row.sender_sun_sign,
        giftType: row.gift_type,
        content: row.content,
        message: row.message,
        openedAt: row.opened_at || new Date().toISOString(),
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('Error opening gift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to open gift' },
      { status: 500 },
    );
  }
}
