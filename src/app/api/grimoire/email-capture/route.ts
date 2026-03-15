import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { renderWelcomeDay2 } from '@/lib/email-components/WelcomeSeriesEmails';
import { trackConversionEvent } from '@/lib/analytics/tracking';

export const dynamic = 'force-dynamic';

const emailCaptureSchema = z.object({
  email: z.string().email(),
  birthday: z.string().optional(),
  hub: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = emailCaptureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    const { email, birthday, hub } = parsed.data;

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (existing.rows.length > 0) {
      // User already exists, just track the event
      await trackConversionEvent({
        userId: existing.rows[0].id,
        eventType: 'grimoire_email_capture',
        metadata: { hub, birthday, existing: true },
      });

      return NextResponse.json({ ok: true, existing: true });
    }

    // Create a lightweight subscription record for the email capture
    // The user hasn't fully signed up yet, but we can send them the welcome series
    const userId = `grimoire_${Date.now()}_${crypto.randomUUID()}`;

    await sql`
      INSERT INTO subscriptions (user_id, user_email, status, plan_type, created_at)
      VALUES (${userId}, ${email}, 'free', 'free', NOW())
      ON CONFLICT (user_id) DO NOTHING
    `;

    // If birthday provided, we could store it for personalisation later
    if (birthday) {
      await sql`
        INSERT INTO user_profiles (user_id, birthday, created_at)
        VALUES (${userId}, ${birthday}, NOW())
        ON CONFLICT (user_id) DO NOTHING
      `;
    }

    // Track the capture event
    await trackConversionEvent({
      userId,
      eventType: 'grimoire_email_capture',
      metadata: { hub, birthday: !!birthday },
    });

    // Send immediate welcome email
    try {
      const html = await renderWelcomeDay2({
        userName: email.split('@')[0],
        userEmail: email,
      });

      await sendEmail({
        to: email,
        subject: 'Your cosmic toolkit: 5 things Lunary gives you',
        html,
        tracking: {
          userId,
          notificationType: 'grimoire_capture',
          notificationId: `grimoire-capture-${userId}`,
          utm: {
            source: 'email',
            medium: 'lifecycle',
            campaign: 'grimoire_capture',
            content: hub || 'unknown',
          },
        },
      });
    } catch (emailError) {
      console.error('Failed to send grimoire capture email:', emailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Grimoire email capture error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
