import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const signupSchema = z.object({
  email: z.string().email(),
  source: z
    .enum(['product_hunt', 'launch_page', 'press_kit', 'tiktok'])
    .default('launch_page'),
  metadata: z
    .object({
      name: z.string().optional(),
      referral: z.string().optional(),
    })
    .optional(),
});

function buildConfirmationEmail({
  email,
  source,
}: {
  email: string;
  source: string;
}) {
  const headline = 'You are on the Lunary launch list ✨';
  const body = `
    <p>Thank you for joining from <strong>${source.replace('_', ' ')}</strong>.</p>
    <p>What happens next:</p>
    <ul>
      <li>Product Hunt launch reminder the morning of launch</li>
      <li>Exclusive Cosmic Report template + press kit</li>
      <li>Priority invite to the TikTok live build session</li>
    </ul>
    <p>You can update preferences anytime by replying to this email.</p>
  `;

  return {
    html: `
      <div style="font-family:Roboto,Helvetica,sans-serif;background:#05020c;color:#f4f4ff;padding:32px;border-radius:16px">
        <h1 style="margin-top:0">${headline}</h1>
        ${body}
        <p style="font-size:12px;color:#a1a1b5;margin-top:24px">
          Sent to ${email}. Need help? Reply or email launch@lunary.app.
        </p>
      </div>
    `,
    text: `${headline}

You are confirmed for launch updates from Lunary.
- Product Hunt reminder
- Exclusive cosmic report template
- TikTok live build invite

Questions? Reply to this email.`,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.parse(body);

    const metadata = parsed.metadata ? JSON.stringify(parsed.metadata) : null;
    const normalizedEmail = parsed.email.toLowerCase();

    const signupResult = await sql`
      INSERT INTO launch_signups (email, source, metadata)
      VALUES (${normalizedEmail}, ${parsed.source}, ${metadata})
      ON CONFLICT (email) DO UPDATE
      SET source = EXCLUDED.source,
          metadata = COALESCE(EXCLUDED.metadata, launch_signups.metadata)
      RETURNING id, email, source, created_at
    `;

    try {
      await sql`
        INSERT INTO newsletter_subscribers (email, source, preferences)
        VALUES (${normalizedEmail}, ${parsed.source}, ${JSON.stringify({ launch: true })})
        ON CONFLICT (email) DO UPDATE SET
          updated_at = NOW(),
          source = EXCLUDED.source,
          preferences = COALESCE(EXCLUDED.preferences, newsletter_subscribers.preferences)
      `;
    } catch (newsletterError) {
      console.error('Failed to sync with newsletter list:', newsletterError);
    }

    try {
      const { html, text } = buildConfirmationEmail({
        email: normalizedEmail,
        source: parsed.source,
      });
      await sendEmail({
        to: normalizedEmail,
        subject: 'Lunary Launch Countdown',
        html,
        text,
      });
    } catch (emailError) {
      console.error('Failed to send launch confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Launch signup captured successfully',
      signup: signupResult.rows[0],
    });
  } catch (error) {
    console.error('Launch signup failed:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload', issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to process launch signup',
      },
      { status: 500 },
    );
  }
}
