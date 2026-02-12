import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateDeletionToken } from '@/lib/deletion-tokens';
import {
  generateDeletionVerifyEmailHTML,
  generateDeletionVerifyEmailText,
} from '@/lib/email-components/ComplianceEmails';
import { checkRateLimit } from '@/lib/api/rate-limit';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP: max 3 requests per 15 minutes
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const ipLimit = checkRateLimit(`deletion-req:${ip}`, 3, 15 * 60_000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit by email: max 2 requests per hour
    const emailLimit = checkRateLimit(
      `deletion-req:${normalizedEmail}`,
      2,
      60 * 60_000,
    );
    if (!emailLimit.allowed) {
      // Return generic success to avoid leaking account existence
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with that email, a verification link has been sent.',
      });
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
