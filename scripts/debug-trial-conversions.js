#!/usr/bin/env node

/**
 * Debug: Actual trial conversions
 * Check real conversion data including coupons
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugConversions() {
  console.log('\n🔍 DEBUGGING TRIAL CONVERSIONS\n');
  console.log('=========================================\n');

  try {
    // 1. Find ALL trial users (regardless of time)
    console.log('1️⃣  ALL TRIAL USERS (all time):');
    const allTrialUsers = await prisma.subscriptions.findMany({
      where: { status: 'trial' },
      select: {
        user_id: true,
        status: true,
        plan_type: true,
        is_paying: true,
        has_discount: true,
        created_at: true,
        trial_ends_at: true,
      },
    });
    console.log(`   Total: ${allTrialUsers.length}`);
    if (allTrialUsers.length > 0) {
      console.log(`   Sample:\n`, allTrialUsers.slice(0, 3));
    }

    // 2. Find users with status='active' AND is_paying=true
    console.log('\n2️⃣  ACTIVE PAYING USERS:');
    const activePaying = await prisma.subscriptions.findMany({
      where: {
        status: 'active',
        is_paying: true,
      },
      select: {
        user_id: true,
        status: true,
        plan_type: true,
        is_paying: true,
        has_discount: true,
        created_at: true,
        stripe_subscription_id: true,
      },
    });
    console.log(`   Total: ${activePaying.length}`);
    if (activePaying.length > 0) {
      console.log(`   Sample:\n`, activePaying.slice(0, 3));
    }

    // 3. Find users with trial in history (plan_type or trialed_plans)
    console.log('\n3️⃣  USERS WITH TRIAL HISTORY:');
    const withTrialHistory = await prisma.subscriptions.findMany({
      where: {
        OR: [
          { trialed_plans: { hasSome: ['trial'] } },
          { plan_type: { contains: 'trial' } },
        ],
      },
      select: {
        user_id: true,
        status: true,
        plan_type: true,
        is_paying: true,
        trialed_plans: true,
        created_at: true,
      },
    });
    console.log(`   Total: ${withTrialHistory.length}`);
    if (withTrialHistory.length > 0) {
      console.log(`   Sample:\n`, withTrialHistory.slice(0, 3));
    }

    // 4. Users with COUPONS (has_discount=true, is_paying=true)
    console.log('\n4️⃣  PAYING USERS WITH DISCOUNTS/COUPONS:');
    const discountedPaying = await prisma.subscriptions.findMany({
      where: {
        has_discount: true,
        is_paying: true,
      },
      select: {
        user_id: true,
        status: true,
        plan_type: true,
        is_paying: true,
        has_discount: true,
        discount_percent: true,
        monthly_amount_due: true,
        created_at: true,
      },
    });
    console.log(`   Total: ${discountedPaying.length}`);
    if (discountedPaying.length > 0) {
      console.log(`   Sample:\n`, discountedPaying.slice(0, 5));
    }

    // 5. Find trial users from last 30 days and check if they have newer records
    console.log('\n5️⃣  TRIAL USERS (LAST 30d) - CHECK FOR CONVERSION:');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTrialUsers = await prisma.subscriptions.findMany({
      where: {
        status: 'trial',
        created_at: { gte: thirtyDaysAgo },
      },
      select: {
        user_id: true,
        status: true,
        is_paying: true,
        created_at: true,
        trial_ends_at: true,
      },
    });
    console.log(`   Total: ${recentTrialUsers.length}`);

    // For each trial user, check if they have OTHER subscription records
    console.log('\n   Checking for multiple subscription records per user:');
    let convertedCount = 0;
    for (const trial of recentTrialUsers.slice(0, 10)) {
      const allRecords = await prisma.subscriptions.findMany({
        where: { user_id: trial.user_id },
        select: { status: true, is_paying: true, created_at: true },
      });
      if (allRecords.length > 1) {
        const hasPaid = allRecords.some((r) => r.is_paying);
        if (hasPaid) {
          convertedCount++;
          console.log(
            `   ✓ User ${trial.user_id}: ${allRecords.length} records, IS PAYING`,
          );
        }
      }
    }
    console.log(`   Converted from these 10: ${convertedCount}`);

    // 6. Raw subscription count by status
    console.log('\n6️⃣  ALL SUBSCRIPTIONS BY STATUS:');
    const byStatus = await prisma.subscriptions.groupBy({
      by: ['status'],
      _count: {
        user_id: true,
      },
    });
    console.log(`   ${JSON.stringify(byStatus, null, 2)}`);

    // 7. Paying breakdown
    console.log('\n7️⃣  PAYING USERS BREAKDOWN:');
    const paying = await prisma.subscriptions.groupBy({
      by: ['is_paying', 'status'],
      _count: {
        user_id: true,
      },
    });
    console.log(`   ${JSON.stringify(paying, null, 2)}`);

    console.log('\n✅ Debug complete\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugConversions();
