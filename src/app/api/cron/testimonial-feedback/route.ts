import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  getTestimonialFeedbackEmail,
  TestimonialEmailType,
} from '@/lib/email-templates/testimonial-feedback';

const INTRO_DELAY_MS = 7 * 24 * 60 * 60 * 1000;
const FOLLOWUP_DELAY_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_EMAILS_PER_RUN = 200;

type UserRow = {
  id: string;
  email: string;
  name: string | null;
};

const notificationIdLookup: Record<TestimonialEmailType, string> = {
  intro: 'testimonial_intro',
  followup: 'testimonial_followup',
};

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader =
      request.headers.get('authorization') ||
      request.headers.get('Authorization');
    const vercelCronHeader =
      request.headers.get('x-vercel-cron') ||
      request.headers.get('X-Vercel-Cron') ||
      request.headers.get('X-VERCEL-CRON');
    const isVercelCron =
      vercelCronHeader === '1' || vercelCronHeader === 'true';

    if (!isVercelCron) {
      if (!cronSecret) {
        console.error(
          '[testimonial-feedback] CRON_SECRET missing - cannot validate request',
        );
        return NextResponse.json(
          {
            success: false,
            error: 'CRON_SECRET not configured',
          },
          { status: 500 },
        );
      }

      const expectedAuth = `Bearer ${cronSecret.trim()}`;
      if ((authHeader?.trim() || '') !== expectedAuth.trim()) {
        console.error('[testimonial-feedback] Invalid CRON authentication');
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 },
        );
      }
    }

    const summary = await runTestimonialFeedback();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('[testimonial-feedback] Cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function runTestimonialFeedback() {
  const now = new Date();
  const introCutoff = new Date(now.getTime() - INTRO_DELAY_MS);
  const followupCutoff = new Date(now.getTime() - FOLLOWUP_DELAY_MS);

  const introUsers = await getIntroRecipients(introCutoff);
  const followupUsers = await getFollowupRecipients(followupCutoff);

  const introResults = await sendFeedbackEmails('intro', introUsers);
  const followupResults = await sendFeedbackEmails('followup', followupUsers);

  return {
    intro: {
      attempted: introUsers.length,
      successes: introResults.filter((r) => r.status === 'success').length,
      failures: introResults.filter((r) => r.status === 'failed').length,
    },
    followup: {
      attempted: followupUsers.length,
      successes: followupResults.filter((r) => r.status === 'success').length,
      failures: followupResults.filter((r) => r.status === 'failed').length,
    },
  };
}

async function getIntroRecipients(cutoff: Date) {
  const result = await sql`
    SELECT id, email, name
    FROM "user"
    WHERE email IS NOT NULL
      AND email <> ''
      AND "createdAt" <= ${cutoff}
      AND NOT EXISTS (
        SELECT 1
        FROM testimonial_feedback_events events
        WHERE events.user_id = "user".id
          AND events.email_type = 'intro'
      )
    ORDER BY "createdAt" ASC
    LIMIT ${MAX_EMAILS_PER_RUN}
  `;
  return result.rows as UserRow[];
}

async function getFollowupRecipients(cutoff: Date) {
  const result = await sql`
    SELECT u.id, u.email, u.name
    FROM testimonial_feedback_events intro
    JOIN "user" u ON u.id = intro.user_id
    LEFT JOIN testimonial_feedback_events followup
      ON followup.user_id = u.id
      AND followup.email_type = 'followup'
    WHERE intro.email_type = 'intro'
      AND intro.sent_at <= ${cutoff}
      AND followup.id IS NULL
    ORDER BY intro.sent_at ASC
    LIMIT ${MAX_EMAILS_PER_RUN}
  `;
  return result.rows as UserRow[];
}

type SendResult = {
  userId: string;
  email: string;
  status: 'success' | 'failed';
  error?: string;
};

async function sendFeedbackEmails(
  type: TestimonialEmailType,
  users: UserRow[],
): Promise<SendResult[]> {
  const template = getTestimonialFeedbackEmail(type);
  const results: SendResult[] = [];

  for (const user of users) {
    try {
      await sendEmail({
        to: user.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
        tracking: {
          userId: user.id,
          notificationType: 'testimonial_feedback',
          notificationId: notificationIdLookup[type],
        },
      });

      await sql`
        INSERT INTO testimonial_feedback_events (user_id, email_type, subject, sent_at)
        VALUES (${user.id}, ${type}, ${template.subject}, NOW())
        ON CONFLICT (user_id, email_type) DO UPDATE SET
          subject = EXCLUDED.subject,
          sent_at = EXCLUDED.sent_at,
          updated_at = NOW()
      `;
      results.push({ userId: user.id, email: user.email, status: 'success' });
    } catch (error) {
      console.error(
        `[testimonial-feedback] Failed to send ${type} email for user ${user.id}`,
        error,
      );
      results.push({
        userId: user.id,
        email: user.email,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
