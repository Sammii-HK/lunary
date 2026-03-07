import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 },
      );
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Server misconfigured' },
        { status: 500 },
      );
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);

    const cfResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      },
    );

    const result = (await cfResponse.json()) as { success: boolean };

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Bot check failed' },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 },
    );
  }
}
