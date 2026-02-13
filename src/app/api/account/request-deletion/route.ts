import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateDeletionToken } from '@/lib/deletion-tokens';
import {
  generateDeletionVerifyEmailHTML,
  generateDeletionVerifyEmailText,
} from '@/lib/email-components/ComplianceEmails';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export async function POST(request: NextRequest) {
  try {
    // If authenticated, use the session email (prevents user-controlled bypass).
    // If not authenticated, fall back to body email for the "can't access app"
    // compliance flow — the email verification link is the security check.
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    let normalizedEmail: string;

    if (session?.user?.email) {
      normalizedEmail = session.user.email.trim().toLowerCase();
    } else {
      const body = await request.json();
      const email = body?.email;

      if (!email || typeof email !== 'string') {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 },
        );
      }

      normalizedEmail = email.trim().toLowerCase();
    }

    // Always return success to avoid leaking account existence
    const successResponse = NextResponse.json({
      success: true,
      message:
        'If an account exists with that email, a verification link has been sent.',
    });

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return successResponse;
    }

    // Check for existing pending deletion request
    const existingRequest = await prisma.deletion_requests.findFirst({
      where: { user_id: user.id, status: 'pending' },
    });

    if (existingRequest) {
      return successResponse;
    }

    // Generate verify token and send email
    const token = generateDeletionToken(user.email, 'verify');
    const confirmUrl = `${APP_BASE_URL}/api/account/confirm-deletion?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;

    const html = await generateDeletionVerifyEmailHTML(user.email, confirmUrl);
    const text = generateDeletionVerifyEmailText(user.email, confirmUrl);

    await sendEmail({
      to: user.email,
      subject: 'Confirm Account Deletion - Lunary',
      html,
      text,
      tracking: {
        userId: user.id,
        notificationType: 'account_deletion_verify',
      },
    });

    return successResponse;
  } catch (error) {
    console.error('Request deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 },
    );
  }
}
