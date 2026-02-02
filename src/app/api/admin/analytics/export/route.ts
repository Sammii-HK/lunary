import { NextRequest, NextResponse } from 'next/server';

/**
 * Export analytics data as CSV or JSON
 * GET /api/admin/analytics/export?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&format=csv|json
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

    const baseUrl = request.nextUrl.origin;
    const queryParams = `start_date=${startDate}&end_date=${endDate}`;

    // Fetch data from multiple endpoints in parallel
    const [
      dauWauMauRes,
      conversionsRes,
      activationRes,
      userGrowthRes,
      cohortsRes,
      successMetricsRes,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/admin/analytics/dau-wau-mau?${queryParams}`),
      fetch(`${baseUrl}/api/admin/analytics/conversions?${queryParams}`),
      fetch(`${baseUrl}/api/admin/analytics/activation?${queryParams}`),
      fetch(`${baseUrl}/api/admin/analytics/user-growth?${queryParams}`),
      fetch(
        `${baseUrl}/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`,
      ),
      fetch(`${baseUrl}/api/admin/analytics/success-metrics?${queryParams}`),
    ]);

    const dauWauMau = dauWauMauRes.ok ? await dauWauMauRes.json() : null;
    const conversions = conversionsRes.ok ? await conversionsRes.json() : null;
    const activation = activationRes.ok ? await activationRes.json() : null;
    const userGrowth = userGrowthRes.ok ? await userGrowthRes.json() : null;
    const cohorts = cohortsRes.ok ? await cohortsRes.json() : null;
    const successMetrics = successMetricsRes.ok
      ? await successMetricsRes.json()
      : null;

    // Build the export data structure
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        date_range: {
          start: startDate,
          end: endDate,
        },
      },
      summary: {
        // Active users
        dau: dauWauMau?.dau ?? null,
        wau: dauWauMau?.wau ?? null,
        mau: dauWauMau?.mau ?? null,
        app_opened_dau: dauWauMau?.app_opened_dau ?? null,
        app_opened_wau: dauWauMau?.app_opened_wau ?? null,
        app_opened_mau: dauWauMau?.app_opened_mau ?? null,
        signed_in_product_dau: dauWauMau?.signed_in_product_dau ?? null,
        signed_in_product_wau: dauWauMau?.signed_in_product_wau ?? null,
        signed_in_product_mau: dauWauMau?.signed_in_product_mau ?? null,

        // Stickiness
        stickiness_dau_mau: dauWauMau?.stickiness_dau_mau ?? null,
        stickiness_wau_mau: dauWauMau?.stickiness_wau_mau ?? null,

        // Retention
        retention_day_1: dauWauMau?.retention?.day_1 ?? null,
        retention_day_7: dauWauMau?.retention?.day_7 ?? null,
        retention_day_30: dauWauMau?.retention?.day_30 ?? null,
        churn_rate: dauWauMau?.churn_rate ?? null,

        // Returning users
        returning_dau: dauWauMau?.returning_dau ?? null,
        returning_wau: dauWauMau?.returning_wau ?? null,
        returning_mau: dauWauMau?.returning_mau ?? null,

        // Conversions
        total_conversions: conversions?.total_conversions ?? null,
        conversion_rate: conversions?.conversion_rate ?? null,
        trial_conversion_rate: conversions?.trial_conversion_rate ?? null,
        avg_days_to_convert: conversions?.avg_days_to_convert ?? null,

        // Activation
        activation_rate: activation?.activationRate ?? null,
        total_signups: activation?.totalSignups ?? null,
        activated_users: activation?.activatedUsers ?? null,

        // Growth
        growth_rate: userGrowth?.growthRate ?? null,
        new_signups: userGrowth?.totalSignups ?? null,

        // Revenue
        mrr: successMetrics?.monthly_recurring_revenue?.value ?? null,
        arr: successMetrics?.annual_recurring_revenue?.value ?? null,
        active_subscribers:
          successMetrics?.active_subscriptions?.paid_subscriptions ?? null,

        // Totals
        total_accounts: dauWauMau?.total_accounts ?? null,
        grimoire_mau: dauWauMau?.content_mau_grimoire ?? null,
        grimoire_only_mau: dauWauMau?.grimoire_only_mau ?? null,
      },
      trends: dauWauMau?.trends ?? [],
      cohorts: cohorts?.cohorts ?? [],
      conversion_funnel: conversions?.funnel ?? null,
    };

    if (format === 'csv') {
      // Convert summary to CSV
      const summaryRows = Object.entries(exportData.summary).map(
        ([key, value]) => ({
          metric: key,
          value: value ?? 'N/A',
        }),
      );

      // Build CSV content
      let csvContent = 'Analytics Export\n';
      csvContent += `Date Range,${startDate} to ${endDate}\n`;
      csvContent += `Exported At,${exportData.metadata.exported_at}\n\n`;

      // Summary section
      csvContent += 'SUMMARY METRICS\n';
      csvContent += 'Metric,Value\n';
      summaryRows.forEach((row) => {
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
