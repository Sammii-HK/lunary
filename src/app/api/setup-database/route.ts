import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Setting up push notifications database in production...');

    // Create the push_subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        
        -- User identification (from Better Auth)
        user_id TEXT,
        user_email TEXT,
        
        -- Push subscription details
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        
        -- User preferences for notification types
        preferences JSONB DEFAULT '{
          "moonPhases": true,
          "planetaryTransits": true,
          "retrogrades": true,
          "sabbats": true,
          "eclipses": true,
          "majorAspects": true
        }'::jsonb,
        
        -- Metadata
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_notification_sent TIMESTAMP WITH TIME ZONE,
        
        -- Sync tracking with Jazz
        jazz_sync_id TEXT,
        is_active BOOLEAN DEFAULT true
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_push_subscriptions_preferences ON push_subscriptions USING GIN(preferences)`;

    // Create update timestamp trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // Create the trigger
    await sql`
      DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions
    `;

    await sql`
      CREATE TRIGGER update_push_subscriptions_updated_at
          BEFORE UPDATE ON push_subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_push_subscriptions_updated_at()
    `;

    console.log('✅ Production database setup complete!');

    return NextResponse.json({
      success: true,
      message: 'Push notifications database setup complete',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
