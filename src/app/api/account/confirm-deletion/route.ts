import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import {
  verifyDeletionToken,
  generateDeletionToken,
} from '@/lib/deletion-tokens';
import {
  generateDeletionScheduledEmailHTML,
  generateDeletionScheduledEmailText,
} from '@/lib/email-components/ComplianceEmails';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

function generateId(): string {
  return `del_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(
      `${APP_BASE_URL}/delete-account?error=invalid`,
    );
  }

  const result = verifyDeletionToken(token, email, 'verify');

  if (!result.valid) {
    const errorType = result.expired ? 'expired' : 'invalid';
    return NextResponse.redirect(
      `${APP_BASE_URL}/delete-account?error=${errorType}`,
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return NextResponse.redirect(
        `${APP_BASE_URL}/delete-account?error=invalid`,
      );
    }

    // Check for existing pending deletion
    const existingRequest = await prisma.deletion_requests.findFirst({
      where: { user_id: user.id, status: 'pending' },
    });

    if (existingRequest) {
      return NextResponse.redirect(
        `${APP_BASE_URL}/delete-account?confirmed=true`,
      );
    }

    // Schedule deletion for 30 days from now
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 30);

    const requestId = generateId();
    await prisma.deletion_requests.create({
      data: {
        id: requestId,
        user_id: user.id,
        user_email: user.email,
        reason: 'Self-service deletion request',
        status: 'pending',
        scheduled_for: scheduledFor,
      },
    });

    // Generate cancel token and send scheduled email
    const cancelToken = generateDeletionToken(user.email, 'cancel');
    const cancelUrl = `${APP_BASE_URL}/api/account/cancel-deletion?token=${encodeURIComponent(cancelToken)}&email=${encodeURIComponent(user.email)}`;

    const scheduledDateStr = scheduledFor.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = await generateDeletionScheduledEmailHTML(
      user.email,
      scheduledDateStr,
      cancelUrl,
    );
    const text = generateDeletionScheduledEmailText(
      user.email,
      scheduledDateStr,
      cancelUrl,
    );

    await sendEmail({
      to: user.email,
      subject: 'Account Deletion Scheduled - Lunary',
      html,
      text,
      tracking: {
        userId: user.id,
        notificationType: 'account_deletion_scheduled',
        notificationId: requestId,
      },
    });

    return NextResponse.redirect(
      `${APP_BASE_URL}/delete-account?confirmed=true`,
    );
  } catch (error) {
    console.error('Confirm deletion error:', error);
    return NextResponse.redirect(`${APP_BASE_URL}/delete-account?error=server`);
  }
}
