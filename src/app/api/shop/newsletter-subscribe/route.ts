import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().email(),
});

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid email address' },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    // No audience configured — log and succeed silently so the UX is not broken
    console.log(
      '[newsletter-subscribe] No RESEND_AUDIENCE_ID set — skipping contact creation for:',
      email,
    );
    return NextResponse.json({ success: true });
  }

  try {
    const resend = getResend();
    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
  } catch (err: any) {
    // Resend returns a 409 / "already exists" error for duplicate contacts.
    // Treat this as success — the user is already on the list.
    const message: string = err?.message ?? '';
    if (
      message.toLowerCase().includes('already exists') ||
      message.toLowerCase().includes('contact already') ||
      err?.statusCode === 409
    ) {
      return NextResponse.json({ success: true });
    }

    console.error('[newsletter-subscribe] Resend error:', err);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
