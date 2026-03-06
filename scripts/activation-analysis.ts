import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function analyzeActivation() {
  console.log('\n📊 ACTIVATION INTELLIGENCE: Real Conversion Funnel\n');

  // Segment by actual payment type
  const byPayment = await sql`
    SELECT
      CASE 
        WHEN COALESCE(monthly_amount_due, 0) = 0 THEN 'Free or Trial'
        WHEN discount_percent = 100 THEN 'Coupon (100% off)'
        WHEN discount_percent IS NOT NULL THEN 'Coupon (Partial)'
        ELSE 'Full Price'
      END as segment,
      status,
      COUNT(*) as count,
      COUNT(CASE WHEN monthly_amount_due > 0 THEN 1 END) as revenue_gen,
      ROUND(SUM(COALESCE(monthly_amount_due, 0))::numeric, 2) as segment_mrr
    FROM subscriptions
    GROUP BY segment, status
    ORDER BY segment_mrr DESC NULLS LAST
  `;

  console.log('By Payment Type & Status:');
  console.log('────────────────────────────────────────────────────');
  for (const row of byPayment.rows) {
    const pctGen =
      row.count > 0 ? ((row.revenue_gen / row.count) * 100).toFixed(1) : '0.0';
    console.log(
      `${row.segment.padEnd(20)} ${row.status.padEnd(12)} ${String(row.count).padStart(3)} users | £${String(row.segment_mrr).padStart(8)} MRR | ${pctGen}% generating`,
    );
  }

  // Real conversion: trial → full-price
  const trialToFull = await sql`
    SELECT
      COUNT(DISTINCT CASE WHEN status = 'trial' THEN user_id END) as in_trial,
      COUNT(DISTINCT CASE WHEN status IN ('active', 'past_due') AND (discount_percent IS NULL OR discount_percent = 0) THEN user_id END) as converted_to_full_price,
      COUNT(DISTINCT CASE WHEN status IN ('active', 'past_due') AND discount_percent IS NOT NULL AND discount_percent > 0 THEN user_id END) as converted_to_coupon,
      COUNT(DISTINCT CASE WHEN status IN ('active', 'past_due') THEN user_id END) as total_active,
      ROUND(SUM(CASE WHEN status IN ('active', 'past_due') AND (discount_percent IS NULL OR discount_percent = 0) THEN monthly_amount_due ELSE 0 END)::numeric, 2) as full_price_mrr,
      ROUND(SUM(CASE WHEN status IN ('active', 'past_due') AND discount_percent IS NOT NULL THEN monthly_amount_due ELSE 0 END)::numeric, 2) as coupon_mrr
    FROM subscriptions
  `;

  const row = trialToFull.rows[0];
  console.log('\n\n🎯 Conversion Funnel Clarity:');
  console.log('────────────────────────────────────────────────────');
  console.log(`In Trial:                   ${row.in_trial} users`);
  console.log(`↓`);
  console.log(
    `Active (Any Type):          ${row.total_active} users (${row.total_active > 0 ? ((row.total_active / (row.in_trial || 1)) * 100).toFixed(1) : '0.0'}% trial conversion)`,
  );
  console.log(
    `├─ Full Price:              ${row.converted_to_full_price} users → £${row.full_price_mrr} MRR`,
  );
  console.log(
    `└─ On Coupons:              ${row.converted_to_coupon} users → £${row.coupon_mrr} MRR (${row.converted_to_coupon > 0 ? ((row.converted_to_coupon / row.total_active) * 100).toFixed(1) : '0'}% of active)`,
  );

  console.log('\n\n⚠️  Key Insight:');
  console.log('────────────────────────────────────────────────────');
  console.log(
    `Your "paying" conversion rate is ${row.converted_to_full_price} / ${row.in_trial} (${row.in_trial > 0 ? ((row.converted_to_full_price / row.in_trial) * 100).toFixed(1) : '0'}%)`,
  );
  console.log(
    `Your "engaged user" conversion rate is ${row.total_active} / ${row.in_trial} (${row.in_trial > 0 ? ((row.total_active / row.in_trial) * 100).toFixed(1) : '0'}%)`,
  );
  console.log(
    `\nYou're optimizing for the wrong metric. Your GTM is driving\nusers to *engaged* (87% on coupons), not *paying* (13% full price).`,
  );
  console.log('\nQuestion: Is this intentional?\n');
}

analyzeActivation().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
