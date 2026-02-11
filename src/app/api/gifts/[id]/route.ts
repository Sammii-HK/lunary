import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

/**
 * GET /api/gifts/[id] — get a single gift
 * Content is hidden if the gift is unopened and requested by the recipient.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    const result = await sql`
      SELECT g.*,
             sp.name AS sender_name, sp.avatar AS sender_avatar, sp.sun_sign AS sender_sun_sign,
             rp.name AS recipient_name, rp.avatar AS recipient_avatar, rp.sun_sign AS recipient_sun_sign
      FROM cosmic_gifts g
      LEFT JOIN user_profiles sp ON sp.user_id = g.sender_id
      LEFT JOIN user_profiles rp ON rp.user_id = g.recipient_id
      WHERE g.id = ${id}
        AND (g.sender_id = ${user.id} OR g.recipient_id = ${user.id})
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gift not found' },
        { status: 404 },
      );
    }

    const row = result.rows[0];
    const isRecipient = row.recipient_id === user.id;
    const isOpened = !!row.opened_at;

    return NextResponse.json({
      success: true,
      gift: {
        id: row.id,
        senderId: row.sender_id,
        senderName: row.sender_name,
        senderAvatar: row.sender_avatar,
        senderSunSign: row.sender_sun_sign,
        recipientId: row.recipient_id,
        recipientName: row.recipient_name,
        recipientAvatar: row.recipient_avatar,
        recipientSunSign: row.recipient_sun_sign,
        giftType: row.gift_type,
        // Hide content + message for unopened gifts viewed by recipient
        content: isRecipient && !isOpened ? null : row.content,
        message: isRecipient && !isOpened ? null : row.message,
        openedAt: row.opened_at,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching gift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gift' },
      { status: 500 },
    );
  }
}
