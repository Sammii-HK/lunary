import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  let pool: Pool | null = null;

  try {
    // Get the authenticated session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in first' },
        { status: 401 },
      );
    }

    const user = session.user as any;

    if (!user.email) {
      return NextResponse.json(
        { error: 'No email address found on your account' },
        { status: 400 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 },
      );
    }

    const baseURL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://lunary.app';

    // Generate a new verification token
    const token = crypto.randomUUID();

    // Create database connection and insert verification token
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      max: 1,
    });

    // Insert verification token in better-auth's verification table
    // The identifier format used by better-auth for email verification
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hour expiry
    await pool.query(
      `INSERT INTO "verification" (identifier, value, "expiresAt")
       VALUES ($1, $2, $3)
       ON CONFLICT (identifier) DO UPDATE
       SET value = $2, "expiresAt" = $3`,
      [user.email, token, expiresAt],
    );

    // Generate verification URL
    const verificationUrl = `${baseURL}/auth/verify-email?token=${token}`;

    // Send the verification email
    const emailModule = await import('@/lib/email');
    const html = await (emailModule as any).generateVerificationEmailHTML(
      verificationUrl,
      user.email,
    );
    const text = await (emailModule as any).generateVerificationEmailText(
      verificationUrl,
      user.email,
    );

    await emailModule.sendEmail({
      to: user.email,
      subject: '✨ Verify Your Email - Lunary',
      html,
      text,
      tracking: {
        userId: user.id,
        notificationType: 'email_verification_resend',
        notificationId: `email-verify-resend-${token}`,
        utm: {
          source: 'email',
          medium: 'auth',
          campaign: 'email_verification_resend',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Verification email sent to ${user.email}`,
    });
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email. Please try again.' },
      { status: 500 },
    );
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
