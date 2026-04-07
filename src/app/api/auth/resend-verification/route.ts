import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Public endpoint — no session required.
// Sends (or resends) a verification email for an unverified account.
// Abuse prevention: we only send if no valid (unexpired) token already exists
// in the last 10 minutes, so this can't be hammered.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true },
  });

  // Return the same response whether user exists or not — prevents enumeration
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true });
  }

  // Rate limit: don't resend if a token was created in the last 10 minutes
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recent = await prisma.verification.findFirst({
    where: { identifier: email, createdAt: { gte: tenMinsAgo } },
  });
  if (recent) {
    return NextResponse.json({ success: true }); // silent — client shows generic message
  }

  const baseURL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://lunary.app';

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.verification.deleteMany({ where: { identifier: email } });
  await prisma.verification.create({
    data: {
      id: crypto.randomUUID(),
      identifier: email,
      value: token,
      expiresAt,
    },
  });

  const verificationUrl = `${baseURL}/auth/verify-email?token=${token}`;

  const emailModule = await import('@/lib/email');
  let html: string;
  let text: string;
  try {
    html = await (emailModule as any).generateVerificationEmailHTML(
      verificationUrl,
      email,
    );
    text = (emailModule as any).generateVerificationEmailText(
      verificationUrl,
      email,
    );
  } catch {
    html = `<p>Verify your email to access Lunary:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`;
    text = `Verify your email:\n${verificationUrl}`;
  }

  await emailModule.sendEmail({
    to: email,
    subject: 'One click to start your trial — Lunary',
    html,
    text,
    tracking: {
      userId: user.id,
      notificationType: 'email_verification',
      notificationId: `email-verify-resend-${token}`,
      utm: {
        source: 'email',
        medium: 'auth',
        campaign: 'email_verification_resend',
      },
    },
  });

  return NextResponse.json({ success: true });
}
