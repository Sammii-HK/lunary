import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM email_preferences WHERE user_id = ${session.user.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        preferences: {
          marketing_emails: true,
          product_updates: true,
          cosmic_insights: true,
          trial_reminders: true,
          weekly_digest: true,
          unsubscribed_all: false,
        },
      });
    }

    return NextResponse.json({ preferences: result.rows[0] });
  } catch (error) {
    console.error('Get email preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get email preferences' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      marketing_emails,
      product_updates,
      cosmic_insights,
      trial_reminders,
      weekly_digest,
      unsubscribed_all,
    } = body;

    await sql`
      INSERT INTO email_preferences (
        user_id,
        marketing_emails,
        product_updates,
        cosmic_insights,
        trial_reminders,
        weekly_digest,
        unsubscribed_all
      ) VALUES (
        ${session.user.id},
        ${marketing_emails ?? true},
        ${product_updates ?? true},
        ${cosmic_insights ?? true},
        ${trial_reminders ?? true},
        ${weekly_digest ?? true},
        ${unsubscribed_all ?? false}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        marketing_emails = EXCLUDED.marketing_emails,
        product_updates = EXCLUDED.product_updates,
        cosmic_insights = EXCLUDED.cosmic_insights,
        trial_reminders = EXCLUDED.trial_reminders,
        weekly_digest = EXCLUDED.weekly_digest,
        unsubscribed_all = EXCLUDED.unsubscribed_all,
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update email preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 },
    );
  }
}
