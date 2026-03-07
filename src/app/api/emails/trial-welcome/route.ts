import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';
import {
  generateTrialWelcomeEmailHTML,
  generateTrialWelcomeEmailText,
} from '@/lib/email-templates/trial-nurture';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { email, userName, trialDaysRemaining, planType } =
      await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const html = await generateTrialWelcomeEmailHTML(
      userName || 'there',
      trialDaysRemaining || 7,
      planType || 'monthly',
    );
    const text = await generateTrialWelcomeEmailText(
      userName || 'there',
      trialDaysRemaining || 7,
      planType || 'monthly',
    );

    await sendEmail({
      to: email,
      subject: '✨ Your Astral Guide is Ready - Lunary',
      html,
      text,
      tracking: {
        userId: email,
        notificationType: 'trial_welcome',
        notificationId: `trial-welcome-${email}`,
        utm: {
          source: 'email',
          medium: 'lifecycle',
          campaign: 'trial_welcome',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trial welcome email sent',
    });
  } catch (error) {
    console.error('Failed to send trial welcome email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
