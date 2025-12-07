import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendEmail } from '@/lib/email';
import {
  generateDeletionScheduledEmailHTML,
  generateDeletionScheduledEmailText,
  generateDeletionCancelledEmailHTML,
} from '@/lib/email-components/ComplianceEmails';

function generateId(): string {
  return `del_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const { reason } = await request.json();

    // Check for existing pending deletion request
    const existingRequest = await sql`
      SELECT id, scheduled_for FROM deletion_requests 
      WHERE user_id = ${userId} AND status = 'pending'
      LIMIT 1
    `;

    if (existingRequest.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'You already have a pending deletion request',
        scheduledFor: existingRequest.rows[0].scheduled_for,
      });
    }

    // Schedule deletion for 30 days from now
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 30);

    const requestId = generateId();
    await sql`
      INSERT INTO deletion_requests (
        id, user_id, user_email, reason, status, scheduled_for
      ) VALUES (
        ${requestId},
        ${userId},
        ${userEmail},
        ${reason || null},
        'pending',
        ${scheduledFor.toISOString()}
      )
    `;

    // Send deletion scheduled email
    if (userEmail) {
      try {
        const scheduledDateStr = scheduledFor.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const cancelUrl = `${APP_BASE_URL}/profile?cancelDeletion=true`;

        const html = await generateDeletionScheduledEmailHTML(
          userEmail,
          scheduledDateStr,
          cancelUrl,
        );
        const text = generateDeletionScheduledEmailText(
          userEmail,
          scheduledDateStr,
          cancelUrl,
        );

        await sendEmail({
          to: userEmail,
          subject: 'Account Deletion Scheduled - Lunary',
          html,
          text,
          tracking: {
            userId,
            notificationType: 'account_deletion_scheduled',
            notificationId: requestId,
          },
        });
      } catch (emailError) {
        console.error('Failed to send deletion email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        'Account scheduled for deletion. You can cancel this within 30 days.',
      scheduledFor: scheduledFor.toISOString(),
      requestId,
    });
  } catch (error) {
    console.error('Account deletion request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit deletion request' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cancel the deletion request
    const result = await sql`
      UPDATE deletion_requests
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE user_id = ${session.user.id} AND status = 'pending'
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No pending deletion request found' },
        { status: 404 },
      );
    }

    // Send deletion cancelled email
    const userEmail = session.user.email;
    if (userEmail) {
      try {
        const html = await generateDeletionCancelledEmailHTML(userEmail);

        await sendEmail({
          to: userEmail,
          subject: 'Account Deletion Cancelled - Lunary',
          html,
          tracking: {
            userId: session.user.id,
            notificationType: 'account_deletion_cancelled',
          },
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion cancelled',
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel deletion request' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const request = await sql`
      SELECT id, status, scheduled_for, reason, created_at, cancelled_at
      FROM deletion_requests
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return NextResponse.json({
      deletionRequest: request.rows[0] || null,
    });
  } catch (error) {
    console.error('Get deletion request error:', error);
    return NextResponse.json(
      { error: 'Failed to get deletion request' },
      { status: 500 },
    );
  }
}
