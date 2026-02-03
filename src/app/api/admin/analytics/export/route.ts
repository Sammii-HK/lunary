import { NextRequest, NextResponse } from 'next/server';

/**
 * Export analytics data as CSV or JSON
 * GET /api/admin/analytics/export?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&format=csv|json
 *
 * This endpoint aggregates data from multiple analytics endpoints to provide
 * a consistent export that matches dashboard metrics.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const format = searchParams.get('format') || 'json';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 },
      );
    }

    // Use hardcoded baseUrl to prevent SSRF attacks
    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';
    const queryParams = `start_date=${startDate}&end_date=${endDate}`;

    // Fetch data from the same endpoints as the dashboard
    const [
      dauWauMauRes,
      conversionsRes,
      activationRes,
      userGrowthRes,
      cohortsRes,
      successMetricsRes,
      subscriptionLifecycleRes,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/admin/analytics/dau-wau-mau?${queryParams}`),
      fetch(`${baseUrl}/api/admin/analytics/conversions?${queryParams}`),
      fetch(`${baseUrl}/api/admin/analytics/activation?${queryParams}`),
      fetch(`${baseUrl}/api/admin/analytics/user-growth?${queryParams}`),
      fetch(
        `${baseUrl}/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`,
      ),
      fetch(`${baseUrl}/api/admin/analytics/success-metrics?${queryParams}`),
      fetch(
        `${baseUrl}/api/admin/analytics/subscription-lifecycle?${queryParams}`,
      ),
    ]);

    const dauWauMau = dauWauMauRes.ok ? await dauWauMauRes.json() : null;
    const conversions = conversionsRes.ok ? await conversionsRes.json() : null;
    const activation = activationRes.ok ? await activationRes.json() : null;
    const userGrowth = userGrowthRes.ok ? await userGrowthRes.json() : null;
    const cohorts = cohortsRes.ok ? await cohortsRes.json() : null;
    const successMetrics = successMetricsRes.ok
      ? await successMetricsRes.json()
      : null;
    const subscriptionLifecycle = subscriptionLifecycleRes.ok
      ? await subscriptionLifecycleRes.json()
      : null;

    // Build the export data structure - matches dashboard exactly
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        date_range: {
          start: startDate,
          end: endDate,
        },
      },
      engagement: {
        // DAU/WAU/MAU from engagement events (matches dashboard "Engagement" metrics)
        dau: dauWauMau?.dau ?? null,
        wau: dauWauMau?.wau ?? null,
        mau: dauWauMau?.mau ?? null,
        // Stickiness ratios
        stickiness_dau_mau: dauWauMau?.stickiness_dau_mau ?? null,
        stickiness_wau_mau: dauWauMau?.stickiness_wau_mau ?? null,
        stickiness_dau_wau: dauWauMau?.stickiness_dau_wau ?? null,
        // Returning users (now uses same events as DAU/WAU/MAU)
        returning_dau: dauWauMau?.returning_dau ?? null,
        returning_wau: dauWauMau?.returning_wau ?? null,
        returning_mau: dauWauMau?.returning_mau ?? null,
        // App opened metrics (separate tracking)
        app_opened_dau: dauWauMau?.app_opened_dau ?? null,
        app_opened_wau: dauWauMau?.app_opened_wau ?? null,
        app_opened_mau: dauWauMau?.app_opened_mau ?? null,
        // Product metrics (signed-in users only)
        signed_in_product_dau: dauWauMau?.signed_in_product_dau ?? null,
        signed_in_product_wau: dauWauMau?.signed_in_product_wau ?? null,
        signed_in_product_mau: dauWauMau?.signed_in_product_mau ?? null,
        // Grimoire
        grimoire_mau: dauWauMau?.content_mau_grimoire ?? null,
        grimoire_only_mau: dauWauMau?.grimoire_only_mau ?? null,
      },
      retention: {
        day_1: dauWauMau?.retention?.day_1 ?? null,
        day_7: dauWauMau?.retention?.day_7 ?? null,
        day_30: dauWauMau?.retention?.day_30 ?? null,
        churn_rate: dauWauMau?.churn_rate ?? null,
      },
      conversions: {
        // Cohort-based conversion metrics
        total_conversions: conversions?.total_conversions ?? null,
        conversion_rate: conversions?.conversion_rate ?? null,
        trial_conversion_rate: conversions?.trial_conversion_rate ?? null,
        avg_days_to_convert: conversions?.avg_days_to_convert ?? null,
        avg_days_to_trial: conversions?.avg_days_to_trial ?? null,
        avg_days_to_paid: conversions?.avg_days_to_paid ?? null,
        // Funnel
        funnel_free_users: conversions?.funnel?.free_users ?? null,
        funnel_trial_users: conversions?.funnel?.trial_users ?? null,
        funnel_paid_users: conversions?.funnel?.paid_users ?? null,
      },
      activation: {
        activation_rate: activation?.activationRate ?? null,
        total_signups: activation?.totalSignups ?? null,
        activated_users: activation?.activatedUsers ?? null,
      },
      growth: {
        growth_rate: userGrowth?.growthRate ?? null,
        total_signups: userGrowth?.totalSignups ?? null,
      },
      revenue: {
        mrr: successMetrics?.monthly_recurring_revenue?.value ?? null,
        arr: successMetrics?.annual_recurring_revenue?.value ?? null,
        arpu: successMetrics?.arpu?.value ?? null,
        paying_customers: successMetrics?.paying_customers?.value ?? null,
      },
      subscriptions: {
        active_subscriptions:
          successMetrics?.active_subscriptions?.value ?? null,
        paid_subscriptions:
          successMetrics?.active_subscriptions?.paid_subscriptions ?? null,
        free_users: successMetrics?.active_subscriptions?.free_users ?? null,
        total_registered_users:
          successMetrics?.active_subscriptions?.total_registered_users ?? null,
        // Lifecycle
        new_trials: subscriptionLifecycle?.new_trials ?? null,
        trial_conversions: subscriptionLifecycle?.trial_conversions ?? null,
        cancellations: subscriptionLifecycle?.cancellations ?? null,
        net_change: subscriptionLifecycle?.net_change ?? null,
      },
      totals: {
        total_accounts: dauWauMau?.total_accounts ?? null,
      },
      trends: dauWauMau?.trends ?? [],
      cohorts: cohorts?.cohorts ?? [],
      conversion_funnel: conversions?.funnel ?? null,
    };

    if (format === 'csv') {
      // Helper to flatten section into rows
      const sectionToRows = (section: Record<string, unknown>, prefix = '') => {
        return Object.entries(section).map(([key, value]) => ({
          metric: prefix ? `${prefix}_${key}` : key,
          value: value ?? 'N/A',
        }));
      };

      // Build CSV content
      let csvContent = 'Analytics Export\n';
      csvContent += `Date Range,${startDate} to ${endDate}\n`;
      csvContent += `Exported At,${exportData.metadata.exported_at}\n\n`;

      // Engagement section
      csvContent += 'ENGAGEMENT METRICS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.engagement).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Retention section
      csvContent += '\nRETENTION METRICS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.retention).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Conversions section
      csvContent += '\nCONVERSION METRICS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.conversions).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Activation section
      csvContent += '\nACTIVATION METRICS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.activation).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Growth section
      csvContent += '\nGROWTH METRICS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.growth).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Revenue section
      csvContent += '\nREVENUE METRICS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.revenue).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Subscriptions section
      csvContent += '\nSUBSCRIPTION METRICS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.subscriptions).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Totals
      csvContent += '\nTOTALS\n';
      csvContent += 'Metric,Value\n';
      sectionToRows(exportData.totals).forEach((row) => {
        csvContent += `${row.metric},${row.value}\n`;
      });

      // Trends section
      if (exportData.trends.length > 0) {
        csvContent += '\nDAILY TRENDS\n';
        csvContent += 'Date,DAU,WAU,MAU\n';
        exportData.trends.forEach((trend: any) => {
          csvContent += `${trend.date},${trend.dau},${trend.wau},${trend.mau}\n`;
        });
      }

      // Cohorts section
      if (exportData.cohorts.length > 0) {
        csvContent += '\nCOHORT RETENTION\n';
        csvContent += 'Cohort,Size,Day 1 %,Day 7 %,Day 30 %\n';
        exportData.cohorts.forEach((cohort: any) => {
          csvContent += `${cohort.cohort},${cohort.day0},${cohort.day1 ?? 'N/A'},${cohort.day7 ?? 'N/A'},${cohort.day30 ?? 'N/A'}\n`;
        });
      }

      // Return CSV
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${startDate}-${endDate}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Return JSON
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="analytics-${startDate}-${endDate}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[analytics/export] Export failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 },
    );
  }
}
