import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import crypto from 'crypto';

function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM shop_purchases
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      purchases: result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        packId: row.pack_id,
        stripeSessionId: row.stripe_session_id,
        stripePaymentIntentId: row.stripe_payment_intent_id,
        status: row.status,
        amount: row.amount,
        downloadToken: row.download_token,
        downloadCount: row.download_count,
        maxDownloads: row.max_downloads,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      packId,
      stripeSessionId,
      stripePaymentIntentId,
      status = 'pending',
      amount,
      maxDownloads = 5,
      expiresAt,
    } = body;

    if (!id || !packId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: id, packId, amount' },
        { status: 400 },
      );
    }

    const downloadToken = generateDownloadToken();

    const result = await sql`
      INSERT INTO shop_purchases (
        id, user_id, pack_id, stripe_session_id, stripe_payment_intent_id,
        status, amount, download_token, max_downloads, expires_at
      )
      VALUES (
        ${id}, ${user.id}, ${packId}, ${stripeSessionId || null},
        ${stripePaymentIntentId || null}, ${status}, ${amount},
        ${downloadToken}, ${maxDownloads}, ${expiresAt ? new Date(expiresAt).toISOString() : null}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
        updated_at = NOW()
      RETURNING *
    `;

    const purchase = result.rows[0];
    return NextResponse.json({
      purchase: {
        id: purchase.id,
        userId: purchase.user_id,
        packId: purchase.pack_id,
        stripeSessionId: purchase.stripe_session_id,
        stripePaymentIntentId: purchase.stripe_payment_intent_id,
        status: purchase.status,
        amount: purchase.amount,
        downloadToken: purchase.download_token,
        downloadCount: purchase.download_count,
        maxDownloads: purchase.max_downloads,
        expiresAt: purchase.expires_at,
        createdAt: purchase.created_at,
        updatedAt: purchase.updated_at,
      },
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 },
    );
  }
}
