import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface RouteParams {
  params: Promise<{ email: string }>;
}

// GET: Get single subscriber
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const result = await sql`
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
      WHERE email = ${decodedEmail.toLowerCase()}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      subscriber: result.rows[0],
    });
  } catch (error) {
    console.error('Failed to fetch subscriber:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch subscriber',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// PATCH: Update subscriber (unsubscribe, update preferences, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email).toLowerCase();
    const body = await request.json();
    const { isActive, preferences, isVerified } = body;

    // Handle unsubscribe (most common case)
    if (isActive === false) {
      const result = await sql`
        UPDATE newsletter_subscribers
        SET 
          is_active = false,
          unsubscribed_at = NOW(),
          updated_at = NOW()
        WHERE email = ${decodedEmail}
        RETURNING id, email, is_active, is_verified, preferences
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        subscriber: result.rows[0],
      });
    }

    // Handle resubscribe
    if (isActive === true) {
      const result = await sql`
        UPDATE newsletter_subscribers
        SET 
          is_active = true,
          unsubscribed_at = NULL,
          updated_at = NOW()
        WHERE email = ${decodedEmail}
        RETURNING id, email, is_active, is_verified, preferences
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        subscriber: result.rows[0],
      });
    }

    // Handle preferences update
    if (preferences !== undefined) {
      const prefsJson = JSON.stringify(preferences);
      const result = await sql`
        UPDATE newsletter_subscribers
        SET 
          preferences = ${prefsJson}::jsonb,
          updated_at = NOW()
        WHERE email = ${decodedEmail}
        RETURNING id, email, is_active, is_verified, preferences
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        subscriber: result.rows[0],
      });
    }

    // Handle verification
    if (isVerified === true) {
      const result = await sql`
        UPDATE newsletter_subscribers
        SET 
          is_verified = true,
          verified_at = NOW(),
          verification_token = NULL,
          updated_at = NOW()
        WHERE email = ${decodedEmail}
        RETURNING id, email, is_active, is_verified, preferences
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        subscriber: result.rows[0],
      });
    }

    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update subscriber:', error);
    return NextResponse.json(
      {
        error: 'Failed to update subscriber',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// DELETE: Remove subscriber (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const result = await sql`
      UPDATE newsletter_subscribers
      SET 
        is_active = false,
        unsubscribed_at = NOW(),
        updated_at = NOW()
      WHERE email = ${decodedEmail.toLowerCase()}
      RETURNING id, email
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber unsubscribed successfully',
    });
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return NextResponse.json(
      {
        error: 'Failed to unsubscribe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
