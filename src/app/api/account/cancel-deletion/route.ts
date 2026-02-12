import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { verifyDeletionToken } from '@/lib/deletion-tokens';
import { generateDeletionCancelledEmailHTML } from '@/lib/email-components/ComplianceEmails';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(
      `${APP_BASE_URL}/delete-account?error=invalid`,
    );
  }

  const result = verifyDeletionToken(token, email, 'cancel');

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

    if (!user) {
      return NextResponse.redirect(
        `${APP_BASE_URL}/delete-account?error=invalid`,
      );
    }

    // Cancel pending deletion request
    const updated = await prisma.deletion_requests.updateMany({
      where: { user_id: user.id, status: 'pending' },
      data: { status: 'cancelled', cancelled_at: new Date() },
    });

    if (updated.count === 0) {
      return NextResponse.redirect(
        `${APP_BASE_URL}/delete-account?error=no_request`,
      );
    }

    // Send cancellation email
    if (user.email) {
      try {
        const html = await generateDeletionCancelledEmailHTML(user.email);

        await sendEmail({
          to: user.email,
          subject: 'Account Deletion Cancelled - Lunary',
          html,
          tracking: {
            userId: user.id,
            notificationType: 'account_deletion_cancelled',
          },
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    return NextResponse.redirect(
      `${APP_BASE_URL}/delete-account?cancelled=true`,
    );
  } catch (error) {
    console.error('Cancel deletion error:', error);
    return NextResponse.redirect(`${APP_BASE_URL}/delete-account?error=server`);
  }
}
