import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const groupBy = searchParams.get('groupBy') || 'command';

    let startDate: Date;
    const now = new Date();

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateFormatted = formatTimestamp(startDate);

    // Command usage stats
    const commandStats = await sql`
      SELECT 
        command_name,
        COUNT(*) as total_uses,
        COUNT(DISTINCT discord_id) as unique_users,
        COUNT(DISTINCT lunary_user_id) FILTER (WHERE lunary_user_id IS NOT NULL) as linked_users
      FROM analytics_discord_interactions
      WHERE interaction_type = 'command'
      AND created_at > ${startDateFormatted}
      GROUP BY command_name
      ORDER BY total_uses DESC
    `;

    // Button click stats
    const buttonStats = await sql`
      SELECT 
        button_action,
        feature,
        COUNT(*) as clicks,
        COUNT(DISTINCT discord_id) as unique_users
      FROM analytics_discord_interactions
      WHERE interaction_type = 'button_click'
      AND created_at > ${startDateFormatted}
      GROUP BY button_action, feature
      ORDER BY clicks DESC
    `;

    // Conversion funnel
    const funnel = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN interaction_type = 'command' THEN discord_id END) as total_commands,
        COUNT(DISTINCT CASE WHEN interaction_type = 'button_click' THEN discord_id END) as button_clicks,
        COUNT(DISTINCT CASE WHEN interaction_type = 'account_linked' THEN discord_id END) as accounts_linked,
        COUNT(DISTINCT CASE WHEN interaction_type = 'account_created' THEN discord_id END) as accounts_created
      FROM analytics_discord_interactions
      WHERE created_at > ${startDateFormatted}
    `;

    // Discord → Subscription conversions
    const conversions = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users
      FROM conversion_events
      WHERE metadata->>'source' = 'discord'
      AND event_type IN ('trial_converted', 'subscription_started')
      AND created_at > ${startDateFormatted}
    `;

    // Top features by engagement
    const topFeatures = await sql`
      SELECT 
        feature,
        COUNT(*) as interactions,
        COUNT(DISTINCT discord_id) as unique_users
      FROM analytics_discord_interactions
      WHERE feature IS NOT NULL
      AND created_at > ${startDateFormatted}
      GROUP BY feature
      ORDER BY interactions DESC
      LIMIT 10
    `;

    const funnelRow = funnel.rows[0];
    const conversionsRow = conversions.rows[0];

    return NextResponse.json({
      success: true,
      range,
      stats: {
        commands: commandStats.rows,
        buttons: buttonStats.rows,
        funnel: {
          totalCommands: parseInt(funnelRow?.total_commands || '0'),
          buttonClicks: parseInt(funnelRow?.button_clicks || '0'),
          accountsLinked: parseInt(funnelRow?.accounts_linked || '0'),
          accountsCreated: parseInt(funnelRow?.accounts_created || '0'),
          clickThroughRate:
            funnelRow?.total_commands > 0
              ? (
                  (parseInt(funnelRow?.button_clicks || '0') /
                    parseInt(funnelRow?.total_commands || '1')) *
                  100
                ).toFixed(1)
              : '0',
          linkRate:
            funnelRow?.total_commands > 0
              ? (
                  (parseInt(funnelRow?.accounts_linked || '0') /
                    parseInt(funnelRow?.total_commands || '1')) *
                  100
                ).toFixed(1)
              : '0',
        },
        conversions: {
          total: parseInt(conversionsRow?.total || '0'),
          uniqueUsers: parseInt(conversionsRow?.unique_users || '0'),
        },
        topFeatures: topFeatures.rows,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[analytics/discord-interactions] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
