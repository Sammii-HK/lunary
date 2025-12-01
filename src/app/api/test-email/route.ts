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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          details: 'Please provide a valid email address',
        },
        { status: 400 },
      );
    }

    // Check if email service is configured
    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured',
          details: 'BREVO_API_KEY environment variable is missing',
          setup: 'Add BREVO_API_KEY to your environment variables',
        },
        { status: 500 },
      );
    }

    // Generate test verification URL
    const testVerificationUrl = `${request.nextUrl.origin}/auth/verify-email?token=test-token-123&email=${encodeURIComponent(email)}`;

    // Generate email content
    const html = await generateVerificationEmailHTML(
      testVerificationUrl,
      email,
    );
    const text = await generateVerificationEmailText(
      testVerificationUrl,
      email,
    );

    console.log('📧 Sending test email to:', email);

    // Send test email (single recipient, so will return Brevo response with id)
    const result = await sendEmail({
      to: email,
      subject: '🧪 Lunary Email Test - Verification Setup Working!',
      html,
      text,
    });

    // Check if result is a batch result or single email response
    const emailId = result && 'id' in result ? result.id : null;
    const isBatchResult = result && 'success' in result;

    if (!emailId && !isBatchResult) {
      console.warn('⚠️ Email sent but no message ID returned:', result);
    }

    console.log('✅ Test email sent successfully:', { emailId, to: email });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        emailId: emailId || 'N/A',
        to: email,
        from: process.env.EMAIL_FROM || 'cosmic@lunary.app',
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
    console.error('❌ Test email error:', error);

    // Extract more detailed error information
    let errorMessage = 'Unknown error';
    let errorDetails = 'Check server logs for more information';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for Brevo-specific errors
      if (error.message.includes('API key')) {
        errorDetails = 'Invalid or missing BREVO_API_KEY';
        statusCode = 500;
      } else if (
        error.message.includes('rate limit') ||
        error.message.includes('429')
      ) {
        errorDetails = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (
        error.message.includes('invalid') &&
        error.message.includes('email')
      ) {
        errorDetails = 'Invalid email address format';
        statusCode = 400;
      } else if (
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      ) {
        errorDetails = 'Brevo API authentication failed. Check your API key.';
        statusCode = 401;
      } else if (
        error.message.includes('forbidden') ||
        error.message.includes('403')
      ) {
        errorDetails =
          'Brevo API access forbidden. Check sender email verification.';
        statusCode = 403;
      }

      // Log full error for debugging
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        troubleshooting: {
          commonIssues: [
            'Invalid BREVO_API_KEY - Check your environment variables',
            'Rate limit exceeded - Wait a few minutes and try again',
            'Invalid email address - Verify the email format',
            'Brevo service unavailable - Check Brevo status page',
            'Sender email not verified in Brevo - Verify sender in Brevo dashboard',
            'Domain not authenticated in Brevo - Complete domain authentication',
          ],
        },
      },
      { status: statusCode },
    );
  }
}
