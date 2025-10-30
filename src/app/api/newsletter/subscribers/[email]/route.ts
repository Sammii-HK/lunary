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
    const decodedEmail = decodeURIComponent(email);
    const body = await request.json();
    const { isActive, preferences, isVerified } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (isActive !== undefined) {
      updates.push('is_active = $' + (values.length + 1));
      values.push(isActive);
      
      if (!isActive) {
        updates.push('unsubscribed_at = NOW()');
      }
    }

    if (preferences !== undefined) {
      updates.push('preferences = $' + (values.length + 1));
      values.push(JSON.stringify(preferences));
    }

    if (isVerified !== undefined) {
      updates.push('is_verified = $' + (values.length + 1));
      values.push(isVerified);
      
      if (isVerified) {
        updates.push('verified_at = NOW()');
        updates.push('verification_token = NULL');
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 },
      );
    }

    updates.push('updated_at = NOW()');
    values.push(decodedEmail.toLowerCase());

    const query = `
      UPDATE newsletter_subscribers
      SET ${updates.join(', ')}
      WHERE email = $${values.length}
      RETURNING id, email, is_active, is_verified, preferences
    `;

    // Use template literal with sql.unsafe for dynamic queries
    const result = await (sql as any).unsafe(query, values);

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

