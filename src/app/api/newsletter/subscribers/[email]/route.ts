import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getCurrentUser } from '@/lib/get-user-session';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ email: string }>;
}

function getDefaultPreferences() {
  return {
    weeklyNewsletter: true,
    dailyHoroscope: false,
    blogUpdates: true,
    productUpdates: false,
    cosmicAlerts: false,
  };
}

async function canAccessSubscriber(
  request: NextRequest,
  email: string,
  allowPublic = false,
): Promise<boolean> {
  if (allowPublic) return true;

  const authResult = await requireAdminAuth(request);
  if (!(authResult instanceof NextResponse)) return true;

  const currentUser = await getCurrentUser(request);
  return currentUser?.email?.toLowerCase() === email.toLowerCase();
}

// GET: Get single subscriber (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const allowPublic = request.nextUrl.searchParams.get('public') === '1';

    const hasAccess = await canAccessSubscriber(
      request,
      decodedEmail,
      allowPublic,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { isActive, preferences, isVerified, publicAccess } = body;

    const hasAccess = await canAccessSubscriber(
      request,
      decodedEmail,
      publicAccess === true,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle unsubscribe (most common case)
    if (isActive === false) {
      const result = await sql`
        UPDATE newsletter_subscribers
        SET 
          is_active = false,
          preferences = COALESCE(preferences, '{}'::jsonb) || '{"weeklyNewsletter": false, "dailyHoroscope": false, "blogUpdates": false, "productUpdates": false, "cosmicAlerts": false}'::jsonb,
          unsubscribed_at = NOW(),
          updated_at = NOW()
        WHERE email = ${decodedEmail}
        RETURNING id, email, is_active, is_verified, preferences
      `;

      if (result.rows.length === 0) {
        // User not in newsletter table - insert as unsubscribed
        // This handles the case where someone clicks unsubscribe from a transactional email
        // before ever subscribing to marketing emails
        const insertResult = await sql`
          INSERT INTO newsletter_subscribers (
            email,
            is_active,
            unsubscribed_at,
            source,
            preferences
          )
          VALUES (
            ${decodedEmail},
            false,
            NOW(),
            'unsubscribe_link',
            ${JSON.stringify({
              ...getDefaultPreferences(),
              weeklyNewsletter: false,
              dailyHoroscope: false,
              blogUpdates: false,
              productUpdates: false,
              cosmicAlerts: false,
            })}::jsonb
          )
          ON CONFLICT (email) DO UPDATE SET
            is_active = false,
            preferences = COALESCE(newsletter_subscribers.preferences, '{}'::jsonb) || '{"weeklyNewsletter": false, "dailyHoroscope": false, "blogUpdates": false, "productUpdates": false, "cosmicAlerts": false}'::jsonb,
            unsubscribed_at = NOW(),
            updated_at = NOW()
          RETURNING id, email, is_active, is_verified, preferences
        `;

        return NextResponse.json({
          success: true,
          subscriber: insertResult.rows[0],
          message: 'You have been unsubscribed from marketing emails.',
        });
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
          preferences = COALESCE(preferences, '{}'::jsonb) || ${JSON.stringify(getDefaultPreferences())}::jsonb,
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
          preferences = COALESCE(preferences, '{}'::jsonb) || ${prefsJson}::jsonb,
          is_active = CASE
            WHEN COALESCE((${prefsJson}::jsonb->>'weeklyNewsletter')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'dailyHoroscope')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'blogUpdates')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'productUpdates')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'cosmicAlerts')::boolean, false)
            THEN true
            ELSE false
          END,
          unsubscribed_at = CASE
            WHEN COALESCE((${prefsJson}::jsonb->>'weeklyNewsletter')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'dailyHoroscope')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'blogUpdates')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'productUpdates')::boolean, false)
              OR COALESCE((${prefsJson}::jsonb->>'cosmicAlerts')::boolean, false)
            THEN NULL
            ELSE NOW()
          END,
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

// DELETE: Remove subscriber (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

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
