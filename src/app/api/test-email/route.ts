import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmail,
  generateVerificationEmailHTML,
  generateVerificationEmailText,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 },
      );
    }

    // Check if email service is configured
    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        details: 'BREVO_API_KEY environment variable is missing',
        setup: 'Add BREVO_API_KEY to your environment variables',
      });
    }

    // Generate test verification URL
    const testVerificationUrl = `${request.nextUrl.origin}/auth/verify-email?token=test-token-123&email=${encodeURIComponent(email)}`;

    // Generate email content
    const html = generateVerificationEmailHTML(testVerificationUrl, email);
    const text = generateVerificationEmailText(testVerificationUrl, email);

    // Send test email (single recipient, so will return Resend response with id)
    const result = await sendEmail({
      to: email,
      subject: '🧪 Lunary Email Test - Verification Setup Working!',
      html,
      text,
    });

    // Check if result is a batch result or single email response
    const emailId = result && 'id' in result ? result.id : null;
    const isBatchResult = result && 'success' in result;

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        emailId,
        to: email,
        from: process.env.EMAIL_FROM || 'Default sender',
        timestamp: new Date().toISOString(),
        ...(isBatchResult && {
          batchResult: {
            success: (result as any).success,
            failed: (result as any).failed,
            total: (result as any).total,
          },
        }),
      },
    });
  } catch (error) {
    console.error('Test email error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check server logs for more information',
        troubleshooting: {
          commonIssues: [
            'Invalid BREVO_API_KEY',
            'Rate limit exceeded',
            'Invalid email address',
            'Brevo service unavailable',
            'Sender email not verified in Brevo',
            'Domain not authenticated in Brevo',
          ],
        },
      },
      { status: 500 },
    );
  }
}
