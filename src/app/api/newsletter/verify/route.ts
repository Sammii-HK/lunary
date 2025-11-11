import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
      SELECT id, email, is_verified, verification_token
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

    // Check if already verified
    if (subscriber.is_verified) {
      return NextResponse.redirect(
        new URL(
          '/newsletter/verify?success=true&already_verified=true',
          request.url,
        ),
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

    return NextResponse.redirect(
      new URL('/newsletter/verify?success=true', request.url),
    );
  } catch (error) {
    console.error('Newsletter verification error:', error);
    return NextResponse.redirect(
      new URL('/newsletter/verify?error=server_error', request.url),
    );
  }
}
