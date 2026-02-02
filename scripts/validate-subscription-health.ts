/**
 * Subscription Health Validation Script
 *
 * Checks for common issues in production:
 * - Duplicate customers for same user
 * - Missing userId metadata
 * - Orphaned subscriptions
 * - Subscriptions not in database
 * - Database/Stripe mismatches
 *
 * Run with: npx ts-node scripts/validate-subscription-health.ts
 *
 * Options:
 * - FIX=true: Automatically fix issues (use with caution!)
 * - VERBOSE=true: Show detailed output
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const AUTO_FIX = process.env.FIX === 'true';
const VERBOSE = process.env.VERBOSE === 'true';

interface Issue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  data?: any;
  fix?: () => Promise<void>;
}

const issues: Issue[] = [];

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function logIssue(issue: Issue) {
  issues.push(issue);
  const emoji =
    issue.severity === 'critical'
      ? '🔴'
      : issue.severity === 'warning'
        ? '🟡'
        : 'ℹ️';
  console.log(
    `${emoji} [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.description}`,
  );
  if (VERBOSE && issue.data) {
    console.log('   Data:', JSON.stringify(issue.data, null, 2));
  }
}

async function check1_DuplicateCustomers() {
  console.log('\n📋 Check 1: Duplicate customers per user');
  const stripe = getStripe();

  // Get all users with multiple customer IDs
  const result = await sql`
    SELECT user_id, user_email, array_agg(DISTINCT stripe_customer_id) as customer_ids
    FROM subscriptions
    WHERE stripe_customer_id IS NOT NULL
    GROUP BY user_id, user_email
    HAVING COUNT(DISTINCT stripe_customer_id) > 1
  `;

  if (result.rows.length === 0) {
    console.log('✅ No duplicate customers found');
    return;
  }

  for (const row of result.rows) {
    logIssue({
      type: 'DUPLICATE_CUSTOMERS',
      severity: 'critical',
      description: `User ${row.user_id} has ${row.customer_ids.length} customers`,
      data: {
        userId: row.user_id,
        email: row.user_email,
        customerIds: row.customer_ids,
      },
      fix: async () => {
        console.log(
          `   Fixing: Identifying primary customer for ${row.user_id}...`,
        );
        // Keep the customer with active subscription or most recent
        const customerDetails = await Promise.all(
          row.customer_ids.map(async (custId: string) => {
            try {
              const subs = await stripe.subscriptions.list({
                customer: custId,
                limit: 10,
              });
              const hasActive = subs.data.some((s) =>
                ['active', 'trialing'].includes(s.status),
              );
              return { custId, hasActive, subCount: subs.data.length };
            } catch {
              return { custId, hasActive: false, subCount: 0 };
            }
          }),
        );

        const primary = customerDetails.sort((a, b) => {
          if (a.hasActive !== b.hasActive) return b.hasActive ? 1 : -1;
          return b.subCount - a.subCount;
        })[0];

        console.log(`   Keeping customer ${primary.custId}`);
        await sql`
          UPDATE subscriptions
          SET stripe_customer_id = ${primary.custId}
          WHERE user_id = ${row.user_id}
        `;
      },
    });
  }
}

async function check2_MissingMetadata() {
  console.log('\n📋 Check 2: Stripe customers missing userId metadata');
  const stripe = getStripe();

  const result = await sql`
    SELECT DISTINCT stripe_customer_id, user_id, user_email
    FROM subscriptions
    WHERE stripe_customer_id IS NOT NULL
    AND user_id IS NOT NULL
    LIMIT 100
  `;

  let missingCount = 0;
  for (const row of result.rows) {
    try {
      const customer = await stripe.customers.retrieve(row.stripe_customer_id);
      const metadata = (customer as any).metadata || {};

      if (!metadata.userId) {
        missingCount++;
        logIssue({
          type: 'MISSING_METADATA',
          severity: 'warning',
          description: `Customer ${row.stripe_customer_id} missing userId metadata`,
          data: {
            customerId: row.stripe_customer_id,
            userId: row.user_id,
            email: row.user_email,
          },
          fix: async () => {
            await stripe.customers.update(row.stripe_customer_id, {
              metadata: { userId: row.user_id },
            });
            console.log(
              `   Fixed: Added userId metadata to ${row.stripe_customer_id}`,
            );
          },
        });
      }
    } catch (error) {
      logIssue({
        type: 'INVALID_CUSTOMER_ID',
        severity: 'critical',
        description: `Customer ${row.stripe_customer_id} not found in Stripe`,
        data: {
          customerId: row.stripe_customer_id,
          userId: row.user_id,
        },
        fix: async () => {
          await sql`
            UPDATE subscriptions
            SET stripe_customer_id = NULL
            WHERE stripe_customer_id = ${row.stripe_customer_id}
          `;
          console.log(`   Fixed: Removed invalid customer ID from database`);
        },
      });
    }
  }

  if (missingCount === 0) {
    console.log('✅ All customers have userId metadata');
  } else {
    console.log(`⚠️  Found ${missingCount} customers missing metadata`);
  }
}

async function check3_OrphanedSubscriptions() {
  console.log('\n📋 Check 3: Unresolved orphaned subscriptions');

  const result = await sql`
    SELECT
      stripe_subscription_id,
      stripe_customer_id,
      customer_email,
      status,
      created_at
    FROM orphaned_subscriptions
    WHERE resolved = FALSE
    ORDER BY created_at DESC
  `;

  if (result.rows.length === 0) {
    console.log('✅ No orphaned subscriptions');
    return;
  }

  console.log(`⚠️  Found ${result.rows.length} orphaned subscriptions`);

  for (const row of result.rows) {
    logIssue({
      type: 'ORPHANED_SUBSCRIPTION',
      severity: 'warning',
      description: `Subscription ${row.stripe_subscription_id} not linked to user`,
      data: {
        subscriptionId: row.stripe_subscription_id,
        customerId: row.stripe_customer_id,
        email: row.customer_email,
        status: row.status,
        age: Math.floor(
          (Date.now() - new Date(row.created_at).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      },
      fix: async () => {
        // Try to find user by email
        const userResult = await sql`
          SELECT id FROM "user" WHERE LOWER(email) = LOWER(${row.customer_email}) LIMIT 1
        `;

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          const stripe = getStripe();

          // Update Stripe metadata
          await stripe.subscriptions.update(row.stripe_subscription_id, {
            metadata: { userId },
          });
          await stripe.customers.update(row.stripe_customer_id, {
            metadata: { userId },
          });

          // Link in database
          await sql`
            INSERT INTO subscriptions (
              user_id, stripe_customer_id, stripe_subscription_id,
              user_email, status, plan_type, trial_used
            ) VALUES (
              ${userId}, ${row.stripe_customer_id}, ${row.stripe_subscription_id},
              ${row.customer_email}, ${row.status}, ${row.plan_type}, true
            )
            ON CONFLICT (user_id) DO UPDATE SET
              stripe_customer_id = EXCLUDED.stripe_customer_id,
              stripe_subscription_id = EXCLUDED.stripe_subscription_id
          `;

          // Mark as resolved
          await sql`
            UPDATE orphaned_subscriptions
            SET resolved = TRUE, resolved_user_id = ${userId}, resolved_at = NOW(), resolved_by = 'health_check'
            WHERE stripe_subscription_id = ${row.stripe_subscription_id}
          `;

          console.log(`   Fixed: Linked to user ${userId}`);
        } else {
          console.log(
            `   Cannot auto-fix: No user found with email ${row.customer_email}`,
          );
        }
      },
    });
  }
}

async function check4_StripeDatabaseMismatch() {
  console.log('\n📋 Check 4: Active Stripe subscriptions not in database');
  const stripe = getStripe();

  // Get all active subscriptions from Stripe
  const subscriptions = await stripe.subscriptions.list({
    status: 'all',
    limit: 100,
  });

  let mismatchCount = 0;
  for (const sub of subscriptions.data) {
    if (!['active', 'trialing', 'past_due'].includes(sub.status)) {
      continue; // Skip inactive subscriptions
    }

    // Check if in database
    const dbResult = await sql`
      SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ${sub.id}
    `;

    if (dbResult.rows.length === 0) {
      mismatchCount++;
      const customerId = sub.customer as string;
      const customer = await stripe.customers.retrieve(customerId);
      const email = (customer as any).email;
      const userId = (customer as any).metadata?.userId;

      logIssue({
        type: 'MISSING_IN_DATABASE',
        severity: 'critical',
        description: `Active subscription ${sub.id} not in database`,
        data: {
          subscriptionId: sub.id,
          customerId,
          email,
          userId,
          status: sub.status,
        },
        fix: async () => {
          if (userId) {
            await sql`
              INSERT INTO subscriptions (
                user_id, stripe_customer_id, stripe_subscription_id,
                user_email, status, plan_type, trial_used
              ) VALUES (
                ${userId}, ${customerId}, ${sub.id},
                ${email}, 'active', 'lunary_plus', true
              )
              ON CONFLICT (user_id) DO UPDATE SET
                stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                status = EXCLUDED.status
            `;
            console.log(`   Fixed: Added to database for user ${userId}`);
          } else {
            console.log(`   Cannot auto-fix: No userId metadata on customer`);
          }
        },
      });
    }
  }

  if (mismatchCount === 0) {
    console.log('✅ All active Stripe subscriptions are in database');
  } else {
    console.log(
      `⚠️  Found ${mismatchCount} active subscriptions not in database`,
    );
  }
}

async function check5_DatabaseStripeMismatch() {
  console.log('\n📋 Check 5: Database subscriptions not in Stripe');
  const stripe = getStripe();

  const result = await sql`
    SELECT user_id, stripe_subscription_id, status
    FROM subscriptions
    WHERE stripe_subscription_id IS NOT NULL
    AND status IN ('active', 'trial', 'past_due')
    LIMIT 100
  `;

  let mismatchCount = 0;
  for (const row of result.rows) {
    try {
      const sub = await stripe.subscriptions.retrieve(
        row.stripe_subscription_id,
      );

      // Check status mismatch
      const stripeStatus = sub.status === 'trialing' ? 'trial' : sub.status;
      if (stripeStatus !== row.status) {
        logIssue({
          type: 'STATUS_MISMATCH',
          severity: 'warning',
          description: `Status mismatch for subscription ${row.stripe_subscription_id}`,
          data: {
            subscriptionId: row.stripe_subscription_id,
            dbStatus: row.status,
            stripeStatus: sub.status,
          },
          fix: async () => {
            await sql`
              UPDATE subscriptions
              SET status = ${stripeStatus}
              WHERE stripe_subscription_id = ${row.stripe_subscription_id}
            `;
            console.log(`   Fixed: Updated status to ${stripeStatus}`);
          },
        });
      }
    } catch (error: any) {
      if (error?.code === 'resource_missing') {
        mismatchCount++;
        logIssue({
          type: 'SUBSCRIPTION_NOT_IN_STRIPE',
          severity: 'critical',
          description: `Subscription ${row.stripe_subscription_id} not found in Stripe`,
          data: {
            userId: row.user_id,
            subscriptionId: row.stripe_subscription_id,
            dbStatus: row.status,
          },
          fix: async () => {
            await sql`
              UPDATE subscriptions
              SET status = 'cancelled', stripe_subscription_id = NULL
              WHERE stripe_subscription_id = ${row.stripe_subscription_id}
            `;
            console.log(`   Fixed: Marked as cancelled in database`);
          },
        });
      }
    }
  }

  if (mismatchCount === 0) {
    console.log('✅ All database subscriptions exist in Stripe');
  } else {
    console.log(
      `⚠️  Found ${mismatchCount} database subscriptions not in Stripe`,
    );
  }
}

async function generateReport() {
  console.log('\n' + '═'.repeat(60));
  console.log('SUBSCRIPTION HEALTH REPORT');
  console.log('═'.repeat(60));

  const critical = issues.filter((i) => i.severity === 'critical');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const info = issues.filter((i) => i.severity === 'info');

  console.log(`\n🔴 Critical Issues: ${critical.length}`);
  console.log(`🟡 Warnings: ${warnings.length}`);
  console.log(`ℹ️  Info: ${info.length}`);
  console.log(`\nTotal Issues: ${issues.length}`);

  if (issues.length === 0) {
    console.log('\n✅ All checks passed! No issues found.');
    return;
  }

  // Group by type
  const byType = issues.reduce(
    (acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('\n📊 Issues by Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  if (AUTO_FIX) {
    console.log('\n🔧 AUTO-FIX ENABLED - Attempting to fix issues...\n');
    for (const issue of issues) {
      if (issue.fix) {
        try {
          await issue.fix();
        } catch (error) {
          console.error(`   ❌ Failed to fix: ${error}`);
        }
      }
    }
    console.log('\n✅ Auto-fix complete');
  } else {
    console.log('\n💡 To automatically fix issues, run with: FIX=true');
  }
}

async function main() {
  console.log('🏥 SUBSCRIPTION HEALTH CHECK\n');
  console.log(`Mode: ${AUTO_FIX ? 'AUTO-FIX' : 'READ-ONLY'}`);
  console.log(`Verbose: ${VERBOSE}\n`);
  console.log('━'.repeat(60));

  try {
    await check1_DuplicateCustomers();
    await check2_MissingMetadata();
    await check3_OrphanedSubscriptions();
    await check4_StripeDatabaseMismatch();
    await check5_DatabaseStripeMismatch();

    await generateReport();
  } catch (error) {
    console.error('\n❌ Health check failed:', error);
    process.exit(1);
  }

  console.log('\n✅ Health check complete\n');
}

main();
