import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { generateGiftContent } from '@/utils/gifts/gift-content';
import { sendToUser } from '@/lib/notifications/native-push-sender';
import { GIFT_LIMITS } from '../../../../utils/entitlements';
import { hasFeatureAccess } from '../../../../utils/pricing';

/**
 * GET /api/gifts — list gifts (sent + received)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // received | sent

    if (type === 'sent') {
      const result = await sql`
        SELECT g.id, g.recipient_id, g.gift_type, g.message, g.opened_at, g.created_at,
               up.name AS recipient_name, up.avatar AS recipient_avatar,
               up.sun_sign AS recipient_sun_sign
        FROM cosmic_gifts g
        LEFT JOIN user_profiles up ON up.user_id = g.recipient_id
        WHERE g.sender_id = ${user.id}
        ORDER BY g.created_at DESC
        LIMIT 50
      `;
      return NextResponse.json({
        success: true,
        gifts: result.rows.map((r) => ({
          id: r.id,
          recipientId: r.recipient_id,
          recipientName: r.recipient_name,
          recipientAvatar: r.recipient_avatar,
          recipientSunSign: r.recipient_sun_sign,
          giftType: r.gift_type,
          message: r.message,
          openedAt: r.opened_at,
          createdAt: r.created_at,
        })),
      });
    }

    // Default: received
    const result = await sql`
      SELECT g.id, g.sender_id, g.gift_type, g.message, g.content, g.opened_at, g.created_at,
             up.name AS sender_name, up.avatar AS sender_avatar,
             up.sun_sign AS sender_sun_sign
      FROM cosmic_gifts g
      LEFT JOIN user_profiles up ON up.user_id = g.sender_id
      WHERE g.recipient_id = ${user.id}
      ORDER BY g.created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({
      success: true,
      gifts: result.rows.map((r) => ({
        id: r.id,
        senderId: r.sender_id,
        senderName: r.sender_name,
        senderAvatar: r.sender_avatar,
        senderSunSign: r.sender_sun_sign,
        giftType: r.gift_type,
        message: r.opened_at ? r.message : null,
        content: r.opened_at ? r.content : null,
        openedAt: r.opened_at,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gifts' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/gifts — send a gift
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { recipientId, giftType, message } = body;

    if (!recipientId || !giftType) {
      return NextResponse.json(
        { success: false, error: 'Missing recipientId or giftType' },
        { status: 400 },
      );
    }

    if (recipientId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot send a gift to yourself' },
        { status: 400 },
      );
    }

    if (message && message.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Message must be 500 characters or less' },
        { status: 400 },
      );
    }

    // Verify friendship
    const friendship = await sql`
      SELECT id FROM friends
      WHERE (user_id = ${user.id} AND friend_id = ${recipientId})
         OR (user_id = ${recipientId} AND friend_id = ${user.id})
      LIMIT 1
    `;
    if (friendship.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'You can only send gifts to friends' },
        { status: 403 },
      );
    }

    // Rate limit for free users
    const profile = await sql`
      SELECT plan_type, subscription_status FROM user_profiles WHERE user_id = ${user.id}
    `;
    const subscriptionStatus = profile.rows[0]?.subscription_status || 'free';
    const planType = profile.rows[0]?.plan_type;
    const hasPaidGifting = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'cosmic_gifting',
    );

    if (!hasPaidGifting) {
      const recentGifts = await sql`
        SELECT COUNT(*) as count FROM cosmic_gifts
        WHERE sender_id = ${user.id}
          AND created_at > NOW() - INTERVAL '7 days'
      `;
      if (Number(recentGifts.rows[0]?.count) >= GIFT_LIMITS.freePerWeek) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Free users can send 1 gift per week. Upgrade for unlimited gifting!',
          },
          { status: 429 },
        );
      }
    }

    // Get recipient sign for cosmic encouragement
    const recipientProfile = await sql`
      SELECT sun_sign, name FROM user_profiles WHERE user_id = ${recipientId}
    `;
    const recipientSign = recipientProfile.rows[0]?.sun_sign || 'Aries';
    const recipientName = recipientProfile.rows[0]?.name || 'Friend';

    // Generate gift content
    const content = generateGiftContent(
      giftType,
      user.id,
      recipientId,
      recipientSign,
    );
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Invalid gift type' },
        { status: 400 },
      );
    }

    // Insert gift
    const result = await sql`
      INSERT INTO cosmic_gifts (sender_id, recipient_id, gift_type, content, message)
      VALUES (${user.id}, ${recipientId}, ${giftType}, ${JSON.stringify(content)}, ${message || null})
      RETURNING id, created_at
    `;

    const gift = result.rows[0];

    // Get sender name for notification
    const senderProfile = await sql`
      SELECT name FROM user_profiles WHERE user_id = ${user.id}
    `;
    const senderName = senderProfile.rows[0]?.name || 'A friend';

    // Send push notification
    try {
      await sendToUser(recipientId, {
        title: 'Cosmic Gift Received!',
        body: `${senderName} sent you a cosmic gift`,
        data: {
          giftId: gift.id,
          type: 'gift_received',
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      success: true,
      giftId: gift.id,
      createdAt: gift.created_at,
    });
  } catch (error) {
    console.error('Error sending gift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send gift' },
      { status: 500 },
    );
  }
}
