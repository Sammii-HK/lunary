import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/users?email=foo@bar.com  → single user lookup
// GET /api/admin/users                    → list all unverified users
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();

  // No email param → return all unverified users (excluding test/bot accounts)
  if (!email) {
    const unverified = await prisma.user.findMany({
      where: {
        emailVerified: false,
        NOT: { email: { contains: 'test.lunary.app' } },
      },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ users: unverified });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const verification = await prisma.verification.findFirst({
    where: { identifier: email },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    user,
    pendingVerification: verification
      ? {
          expiresAt: verification.expiresAt,
          expired: verification.expiresAt < new Date(),
        }
      : null,
  });
}

// POST /api/admin/users — manual verify or resend
// body: { email, action: 'verify' | 'resend' }
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json().catch(() => ({}));
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const action = body.action;

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (action === 'verify') {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    // Clean up any pending verification tokens
    await prisma.verification.deleteMany({ where: { identifier: email } });

    return NextResponse.json({
      success: true,
      message: `${email} marked as verified`,
    });
  }

  if (action === 'resend') {
    const baseURL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://lunary.app';

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Replace any existing verification token for this email
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
        notificationId: `email-verify-admin-${token}`,
        utm: {
          source: 'email',
          medium: 'auth',
          campaign: 'email_verification',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Verification email sent to ${email}`,
    });
  }

  if (action === 'bulk-resend') {
    // body: { action: 'bulk-resend', emails: string[] }
    const emails: string[] = Array.isArray(body.emails)
      ? body.emails.filter((e: unknown) => typeof e === 'string')
      : [];

    if (emails.length === 0) {
      return NextResponse.json(
        { error: 'emails array required' },
        { status: 400 },
      );
    }

    const baseURL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://lunary.app';

    const emailModule = await import('@/lib/email');
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const targetEmail of emails) {
      try {
        const targetUser = await prisma.user.findUnique({
          where: { email: targetEmail },
        });
        if (!targetUser) {
          results.push({
            email: targetEmail,
            success: false,
            error: 'not found',
          });
          continue;
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48hr for backfill

        await prisma.verification.deleteMany({
          where: { identifier: targetEmail },
        });
        await prisma.verification.create({
          data: {
            id: crypto.randomUUID(),
            identifier: targetEmail,
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
            targetEmail,
          );
          text = (emailModule as any).generateVerificationEmailText(
            verificationUrl,
            targetEmail,
          );
        } catch {
          html = `<p>Verify your email to access Lunary:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`;
          text = `Verify your email:\n${verificationUrl}`;
        }

        await emailModule.sendEmail({
          to: targetEmail,
          subject: 'One click to start your trial — Lunary',
          html,
          text,
          tracking: {
            userId: targetUser.id,
            notificationType: 'email_verification',
            notificationId: `email-verify-backfill-${token}`,
            utm: {
              source: 'email',
              medium: 'auth',
              campaign: 'email_verification_backfill',
            },
          },
        });

        results.push({ email: targetEmail, success: true });
      } catch (err) {
        results.push({
          email: targetEmail,
          success: false,
          error: err instanceof Error ? err.message : 'unknown error',
        });
      }
    }

    const sent = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      sent,
      failed: results.length - sent,
      results,
    });
  }

  return NextResponse.json(
    { error: 'Invalid action. Use "verify", "resend", or "bulk-resend".' },
    { status: 400 },
  );
}
