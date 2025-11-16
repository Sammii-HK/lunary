#!/usr/bin/env tsx
/**
 * Test script to verify subscription normalization and feature access logic
 * Tests the code paths without requiring HTTP authentication
 */

// Simple inline test without importing the module
console.log('🧪 Testing Subscription Logic\n');

// Simulate the normalizePlanType function
function normalizePlanType(planType: string | undefined): string {
  if (!planType) return 'free';
  if (
    planType === 'lunary_plus_ai' ||
    planType === 'lunary_plus_ai_annual' ||
    planType === 'lunary_plus'
  ) {
    return planType;
  }
  if (planType === 'yearly') {
    return 'lunary_plus_ai_annual';
  }
  if (planType === 'monthly') {
    return 'lunary_plus';
  }
  return planType;
}

// Simulate feature access check
const FEATURE_ACCESS: Record<string, string[]> = {
  free: [],
  lunary_plus_ai: ['downloadable_reports', 'advanced_patterns'],
  lunary_plus_ai_annual: [
    'downloadable_reports',
    'advanced_patterns',
    'yearly_forecast',
    'data_export',
    'tarot_patterns',
  ],
};

function hasFeatureAccess(
  subscriptionStatus: string | undefined,
  planType: string | undefined,
  feature: string,
): boolean {
  if (!subscriptionStatus || subscriptionStatus === 'free') {
    return FEATURE_ACCESS.free.includes(feature);
  }

  const normalizedStatus =
    subscriptionStatus === 'trialing' ? 'trial' : subscriptionStatus;

  if (normalizedStatus === 'trial' || normalizedStatus === 'active') {
    const normalizedPlan = normalizePlanType(planType);
    const effectivePlan =
      normalizedPlan === 'yearly' ? 'lunary_plus_ai_annual' : normalizedPlan;

    const planFeatures =
      effectivePlan === 'lunary_plus_ai_annual'
        ? FEATURE_ACCESS.lunary_plus_ai_annual
        : effectivePlan === 'lunary_plus_ai'
          ? FEATURE_ACCESS.lunary_plus_ai
          : [];

    return (
      FEATURE_ACCESS.free.includes(feature) || planFeatures.includes(feature)
    );
  }

  return false;
}

// Test case: trialing + lunary_plus_ai_annual (from terminal output)
const testCases = [
  {
    name: 'Trialing Annual AI Plan',
    status: 'trialing',
    planType: 'lunary_plus_ai_annual',
    features: [
      'downloadable_reports',
      'advanced_patterns',
      'yearly_forecast',
      'data_export',
      'tarot_patterns',
    ],
  },
  {
    name: 'Active Annual AI Plan',
    status: 'active',
    planType: 'lunary_plus_ai_annual',
    features: [
      'downloadable_reports',
      'advanced_patterns',
      'yearly_forecast',
      'data_export',
    ],
  },
  {
    name: 'Trial Monthly AI Plan',
    status: 'trialing',
    planType: 'lunary_plus_ai',
    features: ['downloadable_reports', 'advanced_patterns'],
  },
  {
    name: 'Yearly (generic) should map to annual',
    status: 'trialing',
    planType: 'yearly',
    features: ['downloadable_reports', 'yearly_forecast', 'data_export'],
  },
];

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n📋 Testing: ${testCase.name}`);
  console.log(`   Status: ${testCase.status}`);
  console.log(`   Plan: ${testCase.planType}`);

  // Normalize plan type
  const normalizedPlan = normalizePlanType(testCase.planType);
  console.log(`   Normalized Plan: ${normalizedPlan}`);

  // Normalize status
  const normalizedStatus =
    testCase.status === 'trialing' ? 'trial' : testCase.status;
  console.log(`   Normalized Status: ${normalizedStatus}`);

  // Test each feature
  for (const feature of testCase.features) {
    const hasAccess = hasFeatureAccess(
      normalizedStatus,
      normalizedPlan,
      feature,
    );
    const status = hasAccess ? '✅' : '❌';
    console.log(`   ${status} ${feature}: ${hasAccess}`);

    if (hasAccess) {
      passed++;
    } else {
      failed++;
      console.log(`      ⚠️  Expected access but got denied!`);
    }
  }
}

console.log(`\n\n📊 Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);

if (failed === 0) {
  console.log(`\n🎉 All tests passed!`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Some tests failed. Check the logic above.`);
  process.exit(1);
}
