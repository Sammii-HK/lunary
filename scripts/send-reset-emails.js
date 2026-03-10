#!/usr/bin/env node

// One-off script to send password reset emails to affected customers
// Uses Resend API + inserts reset tokens into better-auth verification table
// Usage: node scripts/send-reset-emails.js --dry-run   (preview only)
//        node scripts/send-reset-emails.js              (send for real)

const { randomBytes } = require('crypto');
const { Pool } = require('pg');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const PROD_DB = process.env.PROD_DB;
const BASE_URL = 'https://lunary.app';
const DRY_RUN = process.argv.includes('--dry-run');

if (!RESEND_API_KEY || !PROD_DB) {
  console.error('Missing RESEND_API_KEY or PROD_DB env vars');
  process.exit(1);
}

const pool = new Pool({
  connectionString: PROD_DB,
  ssl: { rejectUnauthorized: false },
});

async function createResetToken(userId, email) {
  const token = randomBytes(32).toString('hex');
  const id = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [id, email, token, expiresAt],
  );

  return `${BASE_URL}/auth/reset?token=${token}`;
}

async function sendEmail(to, subject, html, text) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Lunary <noreply@lunary.app>',
      reply_to: 'hello@lunary.app',
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend error: ${JSON.stringify(data)}`);
  }
  return data;
}

function buildEmail(planDisplay, resetUrl) {
  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="margin-bottom: 32px;">
    <img src="https://lunary.app/icon-192x192.png" alt="Lunary" width="48" height="48" style="border-radius: 12px;" />
  </div>

  <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 16px;">Please reset your password</h1>

  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
    We recently dealt with a bot attack on Lunary, and during the cleanup some legitimate accounts were temporarily affected, including yours. We're really sorry about this.
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
    <strong>Your ${planDisplay} subscription and all your data (readings, birth chart, cosmic reports) are completely safe and untouched.</strong>
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    You just need to set a new password to log back in:
  </p>

  <div style="margin-bottom: 24px;">
    <a href="${resetUrl}" style="display: inline-block; background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
      Reset your password
    </a>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 16px;">
    This link expires in 24 hours. If you didn't expect this email, you can safely ignore it.
  </p>

  <p style="font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 8px;">
    Or copy this link into your browser:
  </p>
  <p style="font-size: 13px; line-height: 1.6; color: #888; word-break: break-all; margin-bottom: 24px;">
    ${resetUrl}
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <p style="font-size: 14px; line-height: 1.6; color: #666;">
    If you have any issues, just reply to this email and we'll sort it out.
  </p>

  <p style="font-size: 14px; color: #666; margin-top: 16px;">
    Sammii<br/>
    <span style="color: #999;">Lunary</span>
  </p>
</div>`;

  const text = `Please reset your Lunary password

We recently dealt with a bot attack on Lunary, and during the cleanup some legitimate accounts were temporarily affected, including yours. We're really sorry about this.

Your ${planDisplay} subscription and all your data (readings, birth chart, cosmic reports) are completely safe and untouched.

You just need to set a new password to log back in:

${resetUrl}

This link expires in 24 hours.

If you have any issues, just reply to this email and we'll sort it out.

Sammii
Lunary`;

  return { html, text };
}

async function main() {
  console.log(DRY_RUN ? '--- DRY RUN MODE ---\n' : '--- SENDING EMAILS ---\n');

  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.email,
      s.plan_type,
      CASE
        WHEN s.plan_type IN ('lunary_plus') THEN 'Lunary+'
        WHEN s.plan_type IN ('lunary_plus_ai', 'lunary_plus_ai_annual') THEN 'Lunary+ Pro'
        ELSE 'Lunary+'
      END as plan_display
    FROM public."user" u
    JOIN public.account a ON a."userId" = u.id
    JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE a.password IS NULL
      AND u.email NOT IN ('emma@lunary.app', 'review@lunary.app')
    ORDER BY u.email
  `);

  console.log(`Found ${rows.length} customers to email\n`);

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      if (DRY_RUN) {
        console.log(`  [DRY] ${row.email} (${row.plan_display})`);
        sent++;
        continue;
      }

      const resetUrl = await createResetToken(row.id, row.email);
      const { html, text } = buildEmail(row.plan_display, resetUrl);

      await sendEmail(
        row.email,
        'Please reset your Lunary password',
        html,
        text,
      );

      console.log(`  Sent: ${row.email} (${row.plan_display})`);
      sent++;

      // Rate limit: 1 per second
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  FAILED: ${row.email}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${sent} sent, ${failed} failed`);
  await pool.end();
}

main().catch(console.error);
