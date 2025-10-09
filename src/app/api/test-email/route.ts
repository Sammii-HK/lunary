import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateVerificationEmailHTML, generateVerificationEmailText } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        details: 'RESEND_API_KEY environment variable is missing',
        setup: 'Visit /email-setup for configuration instructions'
      });
    }

    // Generate test verification URL
    const testVerificationUrl = `${request.nextUrl.origin}/auth/verify-email?token=test-token-123&email=${encodeURIComponent(email)}`;

    // Generate email content
    const html = generateVerificationEmailHTML(testVerificationUrl, email);
    const text = generateVerificationEmailText(testVerificationUrl, email);

    // Send test email
    const result = await sendEmail({
      to: email,
      subject: '🧪 Lunary Email Test - Verification Setup Working!',
      html,
      text,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        emailId: result?.id,
        to: email,
        from: process.env.EMAIL_FROM || 'Default sender',
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Test email error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more information',
      troubleshooting: {
        commonIssues: [
          'Invalid RESEND_API_KEY',
          'Rate limit exceeded',
          'Invalid email address',
          'Resend service unavailable'
        ]
      }
    }, { status: 500 });
  }
}
