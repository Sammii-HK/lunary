import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Runs every 6 hours.
// Finds users who signed up more than 30 minutes ago, are still unverified,
// and have no pending verification token (meaning the email was never sent).
// Sends them a fresh verification email automatically.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseURL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://lunary.app';

  // Users unverified for more than 30 minutes with no token in the verification table
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const candidates = await prisma.user.findMany({
    where: {
      emailVerified: false,
      createdAt: { gte: sevenDaysAgo, lte: thirtyMinsAgo },
      NOT: { email: { contains: 'test.lunary.app' } },
    },
    select: { id: true, email: true },
  });

  if (candidates.length === 0) {
    return NextResponse.json({ success: true, checked: 0, sent: 0 });
  }

  // Filter to only those with no valid (unexpired) token
  const existingTokens = await prisma.verification.findMany({
    where: {
      identifier: { in: candidates.map((u) => u.email) },
      expiresAt: { gte: new Date() },
    },
    select: { identifier: true },
  });
  const hasToken = new Set(existingTokens.map((v) => v.identifier));
  const needsEmail = candidates.filter((u) => !hasToken.has(u.email));

  if (needsEmail.length === 0) {
    return NextResponse.json({
      success: true,
      checked: candidates.length,
      sent: 0,
    });
  }

  const emailModule = await import('@/lib/email');
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const user of needsEmail) {
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await prisma.verification.deleteMany({
        where: { identifier: user.email },
      });
      await prisma.verification.create({
        data: {
          id: crypto.randomUUID(),
          identifier: user.email,
          value: token,
          expiresAt,
        },
      });

      const verificationUrl = `${baseURL}/auth/verify-email?token=${token}`;

      let html: string;
      let text: string;
      try {
        html = await (emailModule as any).generateVerificationEmailHTML(
          verificationUrl,
          user.email,
        );
        text = (emailModule as any).generateVerificationEmailText(
          verificationUrl,
          user.email,
        );
      } catch {
        html = `<p>Verify your email to access Lunary:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`;
        text = `Verify your email:\n${verificationUrl}`;
      }

      await emailModule.sendEmail({
        to: user.email,
        subject: 'One click to start your trial — Lunary',
        html,
        text,
        tracking: {
          userId: user.id,
          notificationType: 'email_verification',
          notificationId: `email-verify-cron-${token}`,
          utm: {
            source: 'email',
            medium: 'auth',
            campaign: 'email_verification_cron',
          },
        },
      });

      results.push({ email: user.email, success: true });
      console.log(`[verification-backfill] Sent to ${user.email}`);
    } catch (err) {
      results.push({
        email: user.email,
        success: false,
        error: err instanceof Error ? err.message : 'unknown',
      });
      console.error(`[verification-backfill] Failed for ${user.email}:`, err);
    }
  }

  const sent = results.filter((r) => r.success).length;
  console.log(
    `[verification-backfill] Done: ${sent}/${needsEmail.length} sent`,
  );

  return NextResponse.json({
    success: true,
    checked: candidates.length,
    sent,
    failed: needsEmail.length - sent,
    results,
  });
}
