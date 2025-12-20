import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function checkLegacyUsage() {
  console.log('🔍 Checking Legacy Fallback Usage...\n');

  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'legacy_fallback_usage'
      )
    `;

    if (!tableExists.rows[0]?.exists) {
      console.log('⚠️  Legacy fallback usage table does not exist.');
      console.log('   Run the migration: sql/legacy_fallback_usage.sql');
      console.log('   Or run: npm run setup-database');
      console.log('');
      console.log(
        '   Once the table exists, legacy fallback usage will be tracked automatically.',
      );
      process.exit(1);
    }

    // Get usage statistics
    const stats = await sql`
      SELECT
        COUNT(*)::bigint as total_usage,
        MAX(used_at) as last_usage,
        COUNT(*) FILTER (WHERE used_at > NOW() - INTERVAL '30 days')::bigint as usage_last_30_days,
        COUNT(*) FILTER (WHERE used_at > NOW() - INTERVAL '90 days')::bigint as usage_last_90_days,
        COUNT(DISTINCT COALESCE(user_id, user_email))::bigint as unique_users
      FROM legacy_fallback_usage
    `;

    const stat = stats.rows[0];
    const totalUsage = parseInt(stat?.total_usage || '0', 10);
    const lastUsage = stat?.last_usage;
    const usage30Days = parseInt(stat?.usage_last_30_days || '0', 10);
    const usage90Days = parseInt(stat?.usage_last_90_days || '0', 10);
    const uniqueUsers = parseInt(stat?.unique_users || '0', 10);

    // Get recent usage
    const recentUsage = await sql`
      SELECT user_email, user_id, used_at, migrated
      FROM legacy_fallback_usage
      ORDER BY used_at DESC
      LIMIT 10
    `;

    // Get unmigrated usage
    const unmigratedUsage = await sql`
      SELECT COUNT(*)::bigint as count
      FROM legacy_fallback_usage
      WHERE migrated = false
    `;
    const unmigratedCount = parseInt(unmigratedUsage.rows[0]?.count || '0', 10);

    console.log('='.repeat(60));
    console.log('📊 Legacy Fallback Usage Statistics\n');
    console.log(`Total Usage Events: ${totalUsage}`);
    console.log(`Unique Users: ${uniqueUsers}`);
    console.log(`Usage Last 30 Days: ${usage30Days}`);
    console.log(`Usage Last 90 Days: ${usage90Days}`);
    console.log(`Unmigrated Events: ${unmigratedCount}`);

    if (lastUsage) {
      const lastUsageDate = new Date(lastUsage);
      const daysSinceLastUsage = Math.floor(
        (Date.now() - lastUsageDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      console.log(
        `Last Usage: ${lastUsageDate.toLocaleString()} (${daysSinceLastUsage} days ago)`,
      );
    } else {
      console.log('Last Usage: Never');
    }
    console.log('');

    // Show recent usage
    if (recentUsage.rows.length > 0) {
      console.log('Recent Usage (last 10 events):');
      recentUsage.rows.forEach((usage) => {
        const date = new Date(usage.used_at);
        const migrated = usage.migrated ? '✅' : '⏳';
        console.log(
          `  ${migrated} ${usage.user_email || usage.user_id || 'unknown'} - ${date.toLocaleString()}`,
        );
      });
      console.log('');
    }

    // Recommendation
    console.log('='.repeat(60));
    console.log('💡 Recommendation\n');

    if (totalUsage === 0) {
      console.log('✅ NO LEGACY FALLBACK USAGE DETECTED');
      console.log('');
      console.log('This could mean:');
      console.log('  • All users have migrated to Postgres');
      console.log('  • No one has logged in via legacy system');
      console.log('  • Tracking just started (check back later)');
      console.log('');
      console.log(
        "⚠️  However, this doesn't guarantee all users have migrated.",
      );
      console.log(
        "   Some users may exist in legacy system but haven't logged in yet.",
      );
    } else if (usage90Days === 0) {
      console.log('✅ LIKELY SAFE TO REMOVE LEGACY FRAMEWORK');
      console.log('');
      console.log('No legacy fallback usage in the last 90 days.');
      console.log(
        `Last usage was ${lastUsage ? Math.floor((Date.now() - new Date(lastUsage).getTime()) / (1000 * 60 * 60 * 24)) : 'unknown'} days ago.`,
      );
      console.log('');
      console.log('⚠️  Before removing:');
      console.log('  1. Verify all active subscriptions are in Postgres');
      console.log('  2. Check for any support tickets about login issues');
      console.log('  3. Consider waiting 30 more days for extra safety');
    } else if (usage30Days === 0) {
      console.log('⚠️  CAUTION - RECENT LEGACY USAGE');
      console.log('');
      console.log('No usage in last 30 days, but usage within last 90 days.');
      console.log('Wait at least 90 days after last usage before removing.');
    } else {
      console.log('❌ NOT SAFE TO REMOVE LEGACY FRAMEWORK');
      console.log('');
      console.log(
        `Legacy fallback is still being used (${usage30Days} times in last 30 days).`,
      );
      console.log('Users are still logging in via the legacy system.');
      console.log('');
      console.log('Action: Keep legacy framework until usage stops.');
    }

    if (unmigratedCount > 0) {
      console.log('');
      console.log(
        `⚠️  Note: ${unmigratedCount} usage events resulted in users that weren't migrated.`,
      );
      console.log(
        '   These users may need manual migration or may have failed to migrate.',
      );
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 How This Works:');
    console.log(
      "  • Every time someone logs in via legacy fallback, it's tracked",
    );
    console.log(
      '  • When they successfully migrate, the event is marked as migrated',
    );
    console.log(
      '  • This gives you visibility into actual legacy system usage',
    );
    console.log(
      '  • Much more reliable than trying to query the legacy system directly',
    );
  } catch (error) {
    console.error('❌ Error checking legacy usage:', error);
    process.exit(1);
  }
}

checkLegacyUsage().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
