import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendEmail } from '@/lib/email';
import { generateDeletionToken } from '@/lib/deletion-tokens';
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
    const existingRequest = await prisma.deletion_requests.findFirst({
      where: { user_id: userId, status: 'pending' },
      select: { id: true, scheduled_for: true },
    });

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'You already have a pending deletion request',
        scheduledFor: existingRequest.scheduled_for,
      });
    }

    // Schedule deletion for 30 days from now
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 30);

    const requestId = generateId();
    await prisma.deletion_requests.create({
      data: {
        id: requestId,
        user_id: userId,
        user_email: userEmail ?? '',
        reason: reason || null,
        status: 'pending',
        scheduled_for: scheduledFor,
      },
    });

    // Send deletion scheduled email with token-based cancel URL
    if (userEmail) {
      try {
        const scheduledDateStr = scheduledFor.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const cancelToken = generateDeletionToken(userEmail, 'cancel');
        const cancelUrl = `${APP_BASE_URL}/api/account/cancel-deletion?token=${encodeURIComponent(cancelToken)}&email=${encodeURIComponent(userEmail)}`;

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
    const updated = await prisma.deletion_requests.updateMany({
      where: { user_id: session.user.id, status: 'pending' },
      data: { status: 'cancelled', cancelled_at: new Date() },
    });

    if (updated.count === 0) {
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

    const deletionRequest = await prisma.deletion_requests.findFirst({
      where: { user_id: session.user.id },
      select: {
        id: true,
        status: true,
        scheduled_for: true,
        reason: true,
        created_at: true,
        cancelled_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({
      deletionRequest: deletionRequest || null,
    });
  } catch (error) {
    console.error('Get deletion request error:', error);
    return NextResponse.json(
      { error: 'Failed to get deletion request' },
      { status: 500 },
    );
  }
}
