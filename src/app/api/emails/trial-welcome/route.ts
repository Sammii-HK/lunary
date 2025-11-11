import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
  generateTrialWelcomeEmailHTML,
  generateTrialWelcomeEmailText,
} from '@/lib/email-templates/trial-nurture';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, trialDaysRemaining, planType } =
      await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const html = generateTrialWelcomeEmailHTML(
      userName || 'there',
      trialDaysRemaining || 7,
      planType || 'monthly',
    );
    const text = generateTrialWelcomeEmailText(
      userName || 'there',
      trialDaysRemaining || 7,
      planType || 'monthly',
    );

    await sendEmail({
      to: email,
      subject: '🌙 Welcome to Your Free Trial - Lunary',
      html,
      text,
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
