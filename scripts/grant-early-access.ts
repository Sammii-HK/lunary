import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';
import {
  sendEmail,
  generateAccessRestoredEmailHTML,
  generateAccessRestoredEmailText,
} from '../src/lib/email';

// Hard exclude — never grant access or email this account
const HARD_EXCLUDE = new Set([
  'anselm.eickhoff@gmail.com',
  'softly.becoming.studio@gmail.com', // Sammii's own account
]);

// Lifetime access (STARSALIGN — no expiry)
const LIFETIME_EMAILS = new Set([
  'louisdu92@hotmail.com',
  'myles.sanigar@gmail.com',
  'benfitter@me.com',
  'jackmcguirelewis97@gmail.com',
  'samhaylock@aol.com',
  'rosannacioce98@gmail.com',
  'yay@chee.party',
  'caitlinswift1301@gmail.com',
  'rshyamashri@gmail.com',
  'jrintoul528@gmail.com',
]);

// Free year only — suspicious/random-name accounts (NAF4vfYU — 12 months, then expires)
const FREE_YEAR_EMAILS = new Set(['eek1128@gmail.com', 'rj.sharp@verizon.net']);

const CONFIRMED_EMAILS = [...LIFETIME_EMAILS, ...FREE_YEAR_EMAILS].filter(
  (e) => !HARD_EXCLUDE.has(e),
);

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(
    `${DRY_RUN ? '[DRY RUN] ' : ''}Processing ${CONFIRMED_EMAILS.length} early access users\n`,
  );

  let granted = 0;
  let emailed = 0;
  let notFound = 0;

  for (const email of CONFIRMED_EMAILS) {
    // Look up user
    const userResult = await sql.query(
      `SELECT id, email, name FROM "user" WHERE email = $1 LIMIT 1`,
      [email],
    );

    if (userResult.rows.length === 0) {
      console.log(`⚠️  No user account found for: ${email}`);
      notFound++;
      continue;
    }

    const user = userResult.rows[0];
    const userId = user.id;
    const userName = user.name;
    const displayName = userName || email.split('@')[0];

    const isLifetime = LIFETIME_EMAILS.has(email);
    const couponId = isLifetime ? 'STARSALIGN' : 'NAF4vfYU';
    const periodEnd = isLifetime
      ? null
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const accessLabel = isLifetime ? 'lifetime' : 'free year';

    console.log(
      `\n→ ${email} (id: ${userId}, name: ${userName || '(no name)'}) [${accessLabel}]`,
    );

    if (!DRY_RUN) {
      await sql.query(
        `
        INSERT INTO subscriptions (
          user_id,
          user_email,
          status,
          plan_type,
          has_discount,
          discount_percent,
          monthly_amount_due,
          coupon_id,
          current_period_end,
          trial_used,
          stripe_customer_id,
          stripe_subscription_id
        ) VALUES (
          $1, $2, 'active', 'lunary_plus_ai',
          true, 100, 0, $3,
          $4, true, NULL, NULL
        )
        ON CONFLICT (user_id) DO UPDATE SET
          status = 'active',
          plan_type = 'lunary_plus_ai',
          has_discount = true,
          discount_percent = 100,
          monthly_amount_due = 0,
          coupon_id = $3,
          current_period_end = $4,
          trial_used = true
        `,
        [userId, email, couponId, periodEnd],
      );
      console.log(
        `  ✅ DB: granted active ${accessLabel} access (coupon: ${couponId})`,
      );
      granted++;
    } else {
      console.log(
        `  [DRY] Would upsert: status=active, plan=lunary_plus_ai, coupon=${couponId}, expiry=${periodEnd ?? 'none'}`,
      );
      granted++;
    }

    // Send restore email
    if (!DRY_RUN) {
      try {
        const html = await generateAccessRestoredEmailHTML({
          userName: displayName,
        });
        const text = await generateAccessRestoredEmailText({
          userName: displayName,
        });
        await sendEmail({
          to: email,
          subject: 'Your Lunary access has been restored',
          html,
          text,
        });
        console.log(`  ✅ Email sent to ${email}`);
        emailed++;
      } catch (err: any) {
        console.error(`  ❌ Email failed for ${email}: ${err.message}`);
      }
    } else {
      console.log(
        `  [DRY] Would send restore email to ${email} (name: ${displayName})`,
      );
      emailed++;
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Done.`);
  console.log(`  Access granted: ${granted}`);
  console.log(`  Emails sent:    ${emailed}`);
  console.log(`  Not found:      ${notFound}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
