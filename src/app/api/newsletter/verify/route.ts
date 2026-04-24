import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { addBrevoNewsletterContact } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(
        new URL('/newsletter/verify?error=missing_params', request.url),
      );
    }

    // Verify token matches
    const result = await sql`
      SELECT id, email, is_verified, verification_token, preferences
      FROM newsletter_subscribers
      WHERE email = ${email.toLowerCase()}
      AND verification_token = ${token}
    `;

    if (result.rows.length === 0) {
      return NextResponse.redirect(
        new URL('/newsletter/verify?error=invalid_token', request.url),
      );
    }

    const subscriber = result.rows[0];
    const captureContext = subscriber.preferences?.captureContext || {};
    const redirectParams = new URLSearchParams({ success: 'true' });

    if (subscriber.is_verified) {
      redirectParams.set('already_verified', 'true');
    }
    if (captureContext.sign) {
      redirectParams.set('sign', captureContext.sign);
    }
    if (captureContext.proposition) {
      redirectParams.set('proposition', captureContext.proposition);
    }
    if (captureContext.upsellVariant) {
      redirectParams.set('upsellVariant', captureContext.upsellVariant);
    }
    if (captureContext.pagePath) {
      redirectParams.set('pagePath', captureContext.pagePath);
    }
    if (captureContext.hub) {
      redirectParams.set('hub', captureContext.hub);
    }

    // Check if already verified
    if (subscriber.is_verified) {
      return NextResponse.redirect(
        new URL(`/newsletter/verify?${redirectParams.toString()}`, request.url),
      );
    }

    // Mark as verified
    await sql`
      UPDATE newsletter_subscribers
      SET 
        is_verified = true,
        verified_at = NOW(),
        verification_token = NULL,
        updated_at = NOW()
      WHERE email = ${email.toLowerCase()}
      AND verification_token = ${token}
    `;

    try {
      await addBrevoNewsletterContact(email.toLowerCase(), 'newsletter_verify');
    } catch (brevoError) {
      console.error('Brevo newsletter sync failed:', brevoError);
    }

    return NextResponse.redirect(
      new URL(`/newsletter/verify?${redirectParams.toString()}`, request.url),
    );
  } catch (error) {
    console.error('Newsletter verification error:', error);
    return NextResponse.redirect(
      new URL('/newsletter/verify?error=server_error', request.url),
    );
  }
}
