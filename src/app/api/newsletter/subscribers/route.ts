import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET: List all subscribers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const verifiedOnly = searchParams.get('verified') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = '';
    const params: any[] = [];
    let paramIndex = 1;

    query = `
      SELECT 
        id,
        email,
        user_id,
        is_active,
        is_verified,
        preferences,
        source,
        created_at,
        updated_at,
        last_email_sent,
        email_count
      FROM newsletter_subscribers
      WHERE 1=1
    `;

    if (activeOnly) {
      query += ' AND is_active = true';
    }

    if (verifiedOnly) {
      query += ' AND is_verified = true';
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    // Use raw SQL query with parameters
    const subscribers = await (sql as any).unsafe(query, params);

    // Get total count
    const countQuery = activeOnly
      ? sql`SELECT COUNT(*) as total FROM newsletter_subscribers WHERE is_active = true`
      : sql`SELECT COUNT(*) as total FROM newsletter_subscribers`;

    const totalResult = await countQuery;
    const total = parseInt(totalResult.rows[0]?.total || '0');

    return NextResponse.json({
      success: true,
      subscribers: subscribers.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch subscribers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// POST: Add new subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId, preferences, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 },
      );
    }

    // Generate verification token
    const verificationToken = Array.from(
      crypto.getRandomValues(new Uint8Array(32)),
    )
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const result = await sql`
      INSERT INTO newsletter_subscribers (
        email,
        user_id,
        preferences,
        source,
        verification_token
      ) VALUES (
        ${email.toLowerCase()},
        ${userId || null},
        ${JSON.stringify(preferences || { weeklyNewsletter: true })},
        ${source || 'signup'},
        ${verificationToken}
      )
      ON CONFLICT (email) 
      DO UPDATE SET
        user_id = COALESCE(EXCLUDED.user_id, newsletter_subscribers.user_id),
        is_active = true,
        updated_at = NOW(),
        preferences = COALESCE(EXCLUDED.preferences, newsletter_subscribers.preferences)
      RETURNING id, email, is_verified, verification_token
    `;

    const subscriber = result.rows[0];

    // Send verification email if not already verified
    if (!subscriber.is_verified && subscriber.verification_token) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
        const verificationUrl = `${baseUrl}/api/newsletter/verify?token=${subscriber.verification_token}&email=${encodeURIComponent(subscriber.email)}`;

        const { sendEmail } = await import('@/lib/email');
        const {
          generateNewsletterVerificationEmailHTML,
          generateNewsletterVerificationEmailText,
        } = await import('@/lib/email-templates/newsletter-verification');

        const html = generateNewsletterVerificationEmailHTML(
          verificationUrl,
          subscriber.email,
        );
        const text = generateNewsletterVerificationEmailText(
          verificationUrl,
          subscriber.email,
        );

        await sendEmail({
          to: subscriber.email,
          subject: '🌙 Confirm Your Email - Lunary Newsletter',
          html,
          text,
        });

        console.log(
          `✅ Newsletter verification email sent to ${subscriber.email}`,
        );
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the subscription, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        isVerified: subscriber.is_verified,
        verificationToken: subscriber.verification_token,
      },
      message: subscriber.is_verified
        ? 'Subscriber added successfully'
        : 'Subscriber added - verification email sent',
    });
  } catch (error) {
    console.error('Failed to add subscriber:', error);
    return NextResponse.json(
      {
        error: 'Failed to add subscriber',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
