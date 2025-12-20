# KPI Spreadsheet Setup Guide (DEPRECATED)

## ⚠️ This approach has been replaced

This guide described the old Google Apps Script approach, which has been **replaced by the server-side implementation**.

**Please use the new setup guide instead**: [`docs/analytics-sheet.md`](./analytics-sheet.md)

The new server-side approach:

- ✅ Runs automatically via cron (no manual Apps Script setup)
- ✅ Writes directly from the server (more reliable)
- ✅ Uses OAuth2 authentication (same as YouTube API)
- ✅ Provides clean, investor-grade weekly metrics
- ✅ Supports backfilling historical data

## Migration Notes

If you were using the old Apps Script approach:

1. The new system uses different sheet tabs (README, Weekly_KPIs, Funnel_Week, Feature_Usage_Weekly)
2. Old data can remain in the sheet for reference
3. New weekly data will be written to the new tabs automatically
4. You can backfill historical weeks using the `/api/admin/analytics/backfill` endpoint

---

## Old Google Apps Script (for reference only)

```javascript
const ANALYTICS_URL = 'https://lunary.app/api/analytics/summary';
const API_SECRET =
  PropertiesService.getScriptProperties().getProperty('LUNARY_API_SECRET');

// Run this once to set your API secret
function setSecret() {
  PropertiesService.getScriptProperties().setProperty(
    'LUNARY_API_SECRET',
    'YOUR_SECRET_HERE',
  );
}

function updateLunaryMetrics() {
  const response = UrlFetchApp.fetch(ANALYTICS_URL, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      Authorization: `Bearer ${API_SECRET}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.getResponseCode() !== 200) {
    Logger.log('Non-200 from API: ' + response.getResponseCode());
    Logger.log(response.getContentText());
    return;
  }

  const data = JSON.parse(response.getContentText());
  const ss = SpreadsheetApp.getActive();
  const today = new Date();

  // Helper function to get or create sheet
  function getOrCreateSheet(name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    return sheet;
  }

  // Helper function to append row to sheet
  function appendRow(sheet, rowData) {
    sheet.appendRow(rowData);
  }

  // Helper function to ensure headers exist
  function ensureHeaders(sheet, headers) {
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
  }

  // Sheet 1: High-Level KPIs
  const kpiSheet = getOrCreateSheet('HighLevelKPIs');
  ensureHeaders(kpiSheet, [
    'Date',
    'DAU',
    'WAU',
    'MAU',
    'ReturningUsersPercent',
    'ConversionRate',
    'ChurnPercent',
    'MRR',
    'ARR',
    'ARPU',
    'CAC',
    'LTV',
    'DAUWAUStickiness',
  ]);
  appendRow(kpiSheet, [
    today,
    data.highLevelKPIs.dau,
    data.highLevelKPIs.wau,
    data.highLevelKPIs.mau,
    data.highLevelKPIs.returningUsersPercent,
    data.highLevelKPIs.conversionRate,
    data.highLevelKPIs.churnPercent,
    data.highLevelKPIs.mrr,
    data.highLevelKPIs.arr,
    data.highLevelKPIs.arpu,
    data.highLevelKPIs.cac || 0,
    data.highLevelKPIs.ltv,
    data.highLevelKPIs.dauWauStickiness || 0,
  ]);

  // Sheet 2: Financial Metrics
  const financialSheet = getOrCreateSheet('FinancialMetrics');
  ensureHeaders(financialSheet, [
    'Date',
    'MRR',
    'NewMRR',
    'ExpansionMRR',
    'ChurnedMRR',
    'NetRevenue',
    'StripeFees',
    'InfraCosts',
    'GrossMargin',
    'NetMargin',
  ]);
  appendRow(financialSheet, [
    today,
    data.financial.mrr,
    data.financial.newMrr,
    data.financial.expansionMrr,
    data.financial.churnedMrr,
    data.financial.netRevenue,
    data.financial.stripeFees,
    data.financial.infraCosts || 0,
    data.financial.grossMargin || 0,
    data.financial.netMargin || 0,
  ]);

  // New Sheet: Churn Metrics
  const churnSheet = getOrCreateSheet('ChurnMetrics');
  ensureHeaders(churnSheet, [
    'Date',
    'MonthlySubscriberChurn',
    'AnnualSubscriberChurn',
    'OverallChurn',
  ]);
  appendRow(churnSheet, [
    today,
    data.churn.monthlySubscriberChurn,
    data.churn.annualSubscriberChurn,
    data.churn.overallChurn,
  ]);

  // New Sheet: Acquisition Metrics
  const acquisitionSheet = getOrCreateSheet('AcquisitionMetrics');
  ensureHeaders(acquisitionSheet, [
    'Date',
    'ARPNU',
    'NewPaidUsers',
    'NewUserRevenue',
    'OrganicSignups',
    'PaidSignups',
    'SocialSignups',
    'SEOSignups',
    'ReferralSignups',
    'DirectSignups',
    'ActivationRate',
    'CostPerActivatedUser',
    'PaybackPeriodMonths',
  ]);
  appendRow(acquisitionSheet, [
    today,
    data.acquisition.arpnu,
    data.acquisition.newPaidUsers,
    data.acquisition.newUserRevenue,
    data.acquisition.organic,
    data.acquisition.paid,
    data.acquisition.social,
    data.acquisition.seo,
    data.acquisition.referral,
    data.acquisition.direct,
    data.acquisition.activationRate,
    data.acquisition.costPerActivatedUser || 0,
    data.acquisition.paybackPeriodMonths || 0,
  ]);

  // New Sheet: Subscription Cohorts
  const subscriptionCohortsSheet = getOrCreateSheet('SubscriptionCohorts');
  ensureHeaders(subscriptionCohortsSheet, [
    'CohortMonth',
    'InitialSubscribers',
    'InitialMRR',
    'CurrentSubscribers',
    'CurrentMRR',
    'ChurnedSubscribers',
    'RetentionRate',
    'ExpansionMRR',
  ]);
  data.subscriptionCohorts.forEach((cohort) => {
    const existingRow = findRowByValue(
      subscriptionCohortsSheet,
      1,
      cohort.cohortMonth,
    );
    const rowData = [
      cohort.cohortMonth,
      cohort.initialSubscribers,
      cohort.initialMRR,
      cohort.currentSubscribers,
      cohort.currentMRR,
      cohort.churnedSubscribers,
      cohort.retentionRate,
      cohort.expansionMRR,
    ];
    if (existingRow > 0) {
      subscriptionCohortsSheet
        .getRange(existingRow, 1, 1, 8)
        .setValues([rowData]);
    } else {
      appendRow(subscriptionCohortsSheet, rowData);
    }
  });

  // Sheet 3: Cohort Retention (weekly updates)
  const cohortSheet = getOrCreateSheet('CohortRetention');
  ensureHeaders(cohortSheet, [
    'CohortStartDate',
    'Day0Users',
    'Day1Retention',
    'Day7Retention',
    'Day30Retention',
    'Day90Retention',
    'Notes',
  ]);
  // Update or add cohorts
  data.cohorts.forEach((cohort) => {
    const existingRow = findRowByValue(cohortSheet, 1, cohort.startDate);
    const rowData = [
      cohort.startDate,
      cohort.day0Users,
      cohort.day1Retention,
      cohort.day7Retention,
      cohort.day30Retention,
      cohort.day90Retention,
      '',
    ];
    if (existingRow > 0) {
      cohortSheet.getRange(existingRow, 1, 1, 7).setValues([rowData]);
    } else {
      appendRow(cohortSheet, rowData);
    }
  });

  // Sheet 4: AI Engagement
  const aiSheet = getOrCreateSheet('AIEngagement');
  ensureHeaders(aiSheet, [
    'Date',
    'AISessions',
    'UniqueAIUsers',
    'TokensPerUser',
    'CompletionRate',
    'TopMode1',
    'TopMode1Count',
    'TopMode2',
    'TopMode2Count',
  ]);
  appendRow(aiSheet, [
    today,
    data.aiEngagement.sessions,
    data.aiEngagement.uniqueUsers,
    data.aiEngagement.tokensPerUser,
    data.aiEngagement.completionRate,
    data.aiEngagement.topModes[0]?.mode || '',
    data.aiEngagement.topModes[0]?.count || 0,
    data.aiEngagement.topModes[1]?.mode || '',
    data.aiEngagement.topModes[1]?.count || 0,
  ]);

  // Sheet 5: Funnel Performance
  const funnelSheet = getOrCreateSheet('FunnelPerformance');
  ensureHeaders(funnelSheet, [
    'Date',
    'FreeUsers',
    'TrialStarts',
    'TrialToPaidConversion',
    'PaidUsers',
    'Upsells',
    'AnnualPlanConversions',
    'FreeToPlus',
    'PlusToAI',
  ]);
  appendRow(funnelSheet, [
    today,
    data.funnel.freeUsers,
    data.funnel.trialStarts,
    data.funnel.trialToPaidConversion,
    data.funnel.paidUsers,
    data.funnel.upsells,
    data.funnel.annualConversions,
    data.funnel.freeToPlus,
    data.funnel.plusToAI,
  ]);

  // Sheet 6: SEO
  const seoSheet = getOrCreateSheet('SEO');
  ensureHeaders(seoSheet, [
    'Date',
    'ArticleCount',
    'PagesIndexed',
    'MonthlyOrganicClicks',
    'MonthlyImpressions',
    'CTR',
    'TopPage1',
    'TopPage1Clicks',
  ]);
  appendRow(seoSheet, [
    today,
    data.seo.articleCount,
    data.seo.pagesIndexed || 0,
    data.seo.monthlyClicks || 0,
    data.seo.monthlyImpressions || 0,
    data.seo.ctr || 0,
    data.seo.topPages[0]?.url || '',
    data.seo.topPages[0]?.clicks || 0,
  ]);

  // Sheet 7: Notifications
  const notificationsSheet = getOrCreateSheet('Notifications');
  ensureHeaders(notificationsSheet, [
    'Date',
    'NotificationType',
    'Sent',
    'OpenRate',
    'CTR',
    'SignupsAttributed',
  ]);
  data.notifications.forEach((notification) => {
    appendRow(notificationsSheet, [
      notification.date,
      notification.type,
      notification.sent,
      notification.openRate,
      notification.ctr,
      notification.signupsAttributed,
    ]);
  });

  // Sheet 8: Product Usage
  const productSheet = getOrCreateSheet('ProductUsage');
  ensureHeaders(productSheet, [
    'Date',
    'BirthChartViews',
    'TarotPulls',
    'RitualsGenerated',
    'CrystalSearches',
    'CollectionsCreated',
    'ReportsDownloaded',
  ]);
  appendRow(productSheet, [
    today,
    data.productUsage.birthChartViews,
    data.productUsage.tarotPulls,
    data.productUsage.ritualsGenerated,
    data.productUsage.crystalSearches,
    data.productUsage.collectionsCreated,
    data.productUsage.reportsDownloaded,
  ]);

  // Sheet 9: Pricing Tier Breakdown
  const pricingSheet = getOrCreateSheet('PricingTiers');
  ensureHeaders(pricingSheet, [
    'Date',
    'FreeUsers',
    'PlusSubscribers',
    'AISubscribers',
    'AnnualSubscribers',
    'ARPPU',
    'AnnualVsMonthlySplit',
  ]);
  appendRow(pricingSheet, [
    today,
    data.pricingTiers.freeUsers,
    data.pricingTiers.plusSubscribers,
    data.pricingTiers.aiSubscribers,
    data.pricingTiers.annualSubscribers,
    data.pricingTiers.arppu,
    data.pricingTiers.annualVsMonthlySplit,
  ]);

  // Sheet 10: API Costs
  const costsSheet = getOrCreateSheet('APICosts');
  ensureHeaders(costsSheet, [
    'Date',
    'AITokensUsed',
    'AICost',
    'PerUserCost',
    'AICostPerPaidUser',
    'InfraMinutes',
    'Storage',
    'Compute',
  ]);
  appendRow(costsSheet, [
    today,
    data.apiCosts.aiTokensUsed,
    data.apiCosts.aiCost,
    data.apiCosts.perUserCost,
    data.apiCosts.aiCostPerPaidUser || 0,
    data.apiCosts.infraMinutes || 0,
    data.apiCosts.storage || 0,
    data.apiCosts.compute || 0,
  ]);

  // History Sheet (comprehensive daily snapshot)
  const historySheet = getOrCreateSheet('History');
  ensureHeaders(historySheet, [
    'Date',
    'MRR',
    'ARR',
    'DAU',
    'WAU',
    'MAU',
    'Stickiness',
    'ReturningUsersPercent',
    'ActiveTrials',
    'ActivePayingUsers',
    'ChurnRate',
    'ConversionRate',
    'ARPU',
    'TrialToPaidConversionRate30d',
    'RetentionDay1',
    'RetentionDay7',
    'RetentionDay30',
    'LTVPerUser',
    'NewMRR',
    'ExpansionMRR',
    'ChurnedMRR',
    'NetRevenue',
    'StripeFees',
    'AICostPerEngagedUser',
    'CrystalLookupsPerUser',
  ]);
  appendRow(historySheet, [
    today,
    data.mrr,
    data.arr,
    data.dau,
    data.wau,
    data.mau,
    data.stickiness,
    data.returningUsersPercent,
    data.activeTrials,
    data.activePayingUsers,
    data.churnRate,
    data.conversionRate,
    data.arpu,
    data.trialToPaidConversionRate30d,
    data.retentionDay1,
    data.retentionDay7,
    data.retentionDay30,
    data.ltvPerUser,
    data.newMrr,
    data.expansionMrr,
    data.churnedMrr,
    data.netRevenue,
    data.stripeFees,
    data.aiCostPerEngagedUser,
    data.crystalLookupsPerUser,
  ]);
}

// Helper function to find row by value in a column
function findRowByValue(sheet, columnIndex, value) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex - 1] === value) {
      return i + 1; // Return 1-based row number
    }
  }
  return 0; // Not found
}
```

## Scheduling Automatic Updates

1. In Apps Script, go to **Triggers** (clock icon in left sidebar)
2. Click **"Add Trigger"**
3. Configure:
   - **Function**: `updateLunaryMetrics`
   - **Event source**: Time-driven
   - **Type**: Day timer
   - **Time**: Choose your preferred time (e.g., 10:00 AM)
4. Click **Save**

## Sheet Structure Summary

### Sheet 1: HighLevelKPIs

Daily snapshot of core KPIs: DAU, WAU, MAU, conversion rates, MRR, ARR, ARPU, CAC, LTV

### Sheet 2: FinancialMetrics

Financial breakdown: MRR changes, Stripe fees, infrastructure costs, margins

### Sheet 3: CohortRetention

Weekly cohort updates with retention at day 1, 7, 30, 90

### Sheet 4: AIEngagement

AI usage metrics: sessions, users, tokens, completion rates, top modes

### Sheet 5: FunnelPerformance

Conversion funnel: free users → trials → paid, upsells, plan conversions

### Sheet 6: SEO

SEO metrics: article count, indexed pages, clicks, impressions, CTR

### Sheet 7: Notifications

Notification performance by type: sent, open rates, CTR, signups attributed

### Sheet 8: ProductUsage

Feature usage: birth charts, tarot, rituals, crystals, collections, reports

### Sheet 9: PricingTiers

Subscription breakdown by tier: free, plus, AI, annual subscribers

### Sheet 10: APICosts

Cost tracking: AI tokens, costs per user, infrastructure costs

### History Sheet

Comprehensive daily snapshot of all key metrics for historical analysis

## Notes (Old Approach - Deprecated)

- ⚠️ **This Apps Script approach is deprecated**
- ✅ See [`docs/analytics-sheet.md`](./analytics-sheet.md) for the new server-side implementation
- Old data can remain in sheets for historical reference
- The new server-side approach provides cleaner, investor-grade weekly metrics
