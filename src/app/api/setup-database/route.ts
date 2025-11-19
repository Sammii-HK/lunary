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

    console.log('🔧 Setting up database tables in production...');

    // Ensure cryptographic extension for UUID generation
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

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

    // Create the social_posts table
    await sql`
      CREATE TABLE IF NOT EXISTS social_posts (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        platform TEXT NOT NULL,
        post_type TEXT NOT NULL,
        topic TEXT,
        scheduled_date TIMESTAMP WITH TIME ZONE,
        status TEXT NOT NULL DEFAULT 'pending',
        rejection_feedback TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_date ON social_posts(scheduled_date)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_social_posts_timestamp ON social_posts
    `;

    await sql`
      CREATE TRIGGER update_social_posts_timestamp
      BEFORE UPDATE ON social_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_social_posts_updated_at()
    `;

    // Create the subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        
        -- User identification
        user_id TEXT NOT NULL UNIQUE,
        user_email TEXT,
        user_name TEXT,
        
        -- Subscription details
        status TEXT NOT NULL DEFAULT 'free',
        plan_type TEXT NOT NULL DEFAULT 'free',
        
        -- Trial information
        trial_ends_at TIMESTAMP WITH TIME ZONE,
        trial_reminder_3d_sent BOOLEAN DEFAULT false,
        trial_reminder_1d_sent BOOLEAN DEFAULT false,
        trial_expired_email_sent BOOLEAN DEFAULT false,
        
        -- Stripe integration
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        
        -- Period information
        current_period_end TIMESTAMP WITH TIME ZONE,
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for subscriptions
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at ON subscriptions(trial_ends_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email)`;

    // Add user_email and user_name columns if they don't exist (for existing tables)
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'user_email') THEN
          ALTER TABLE subscriptions ADD COLUMN user_email TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'user_name') THEN
          ALTER TABLE subscriptions ADD COLUMN user_name TEXT;
        END IF;
      END $$;
    `;

    // Add trial nurture tracking columns if they don't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day2_sent') THEN
          ALTER TABLE subscriptions ADD COLUMN trial_nurture_day2_sent BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day3_sent') THEN
          ALTER TABLE subscriptions ADD COLUMN trial_nurture_day3_sent BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day5_sent') THEN
          ALTER TABLE subscriptions ADD COLUMN trial_nurture_day5_sent BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day7_sent') THEN
          ALTER TABLE subscriptions ADD COLUMN trial_nurture_day7_sent BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `;

    // Create update timestamp trigger function for subscriptions
    await sql`
      CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // Create the trigger for subscriptions
    await sql`
      DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions
    `;

    await sql`
      CREATE TRIGGER update_subscriptions_updated_at
          BEFORE UPDATE ON subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_subscriptions_updated_at()
    `;

    console.log('✅ Subscriptions table created');

    // Create the tarot_readings table for saved tarot spread experiences
    await sql`
        CREATE TABLE IF NOT EXISTS tarot_readings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          spread_slug TEXT NOT NULL,
          spread_name TEXT NOT NULL,
          plan_snapshot TEXT NOT NULL DEFAULT 'free',
          cards JSONB NOT NULL,
          summary TEXT,
          highlights JSONB,
          journaling_prompts JSONB,
          notes TEXT,
          tags TEXT[],
          metadata JSONB,
          archived_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

    await sql`CREATE INDEX IF NOT EXISTS idx_tarot_readings_user ON tarot_readings(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tarot_readings_created ON tarot_readings(created_at DESC)`;
    await sql`
        CREATE INDEX IF NOT EXISTS idx_tarot_readings_active
        ON tarot_readings(user_id, created_at)
        WHERE archived_at IS NULL
      `;

    await sql`
        CREATE OR REPLACE FUNCTION update_tarot_readings_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

    await sql`
        DROP TRIGGER IF EXISTS update_tarot_readings_timestamp ON tarot_readings
      `;

    await sql`
        CREATE TRIGGER update_tarot_readings_timestamp
        BEFORE UPDATE ON tarot_readings
        FOR EACH ROW
        EXECUTE FUNCTION update_tarot_readings_updated_at()
      `;

    console.log('✅ Tarot readings table created');

    // Create user_sessions table for DAU/WAU tracking
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_date DATE NOT NULL DEFAULT CURRENT_DATE,
        session_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        page_path TEXT,
        feature_name TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_session_date ON user_sessions(session_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_date ON user_sessions(user_id, session_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_timestamp ON user_sessions(user_id, session_timestamp)`;

    console.log('✅ User sessions table created');

    // Create the yearly_forecasts table (shared yearly forecast cache)
    await sql`
      CREATE TABLE IF NOT EXISTS yearly_forecasts (
        year INTEGER PRIMARY KEY,
        summary TEXT,
        forecast JSONB NOT NULL,
        stats JSONB,
        source TEXT DEFAULT 'manual',
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_yearly_forecasts_generated_at ON yearly_forecasts(generated_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yearly_forecasts_updated_at ON yearly_forecasts(updated_at)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_yearly_forecasts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_yearly_forecasts_timestamp ON yearly_forecasts
    `;

    await sql`
      CREATE TRIGGER update_yearly_forecasts_timestamp
          BEFORE UPDATE ON yearly_forecasts
          FOR EACH ROW
          EXECUTE FUNCTION update_yearly_forecasts_updated_at()
    `;

    console.log('✅ Yearly forecasts table created');

    // Create the ai_threads table for AI conversation threads
    await sql`
        CREATE TABLE IF NOT EXISTS ai_threads (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT,
          messages JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

    await sql`CREATE INDEX IF NOT EXISTS idx_ai_threads_user_id ON ai_threads(user_id)`;

    await sql`
        CREATE OR REPLACE FUNCTION update_ai_threads_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

    await sql`
        DROP TRIGGER IF EXISTS update_ai_threads_timestamp ON ai_threads
      `;

    await sql`
        CREATE TRIGGER update_ai_threads_timestamp
        BEFORE UPDATE ON ai_threads
        FOR EACH ROW
        EXECUTE FUNCTION update_ai_threads_updated_at()
      `;

    console.log('✅ AI threads table created');

    // Create the ai_usage table for tracking AI usage limits
    await sql`
        CREATE TABLE IF NOT EXISTS ai_usage (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          day TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          count INTEGER DEFAULT 0,
          tokens_in INTEGER DEFAULT 0,
          tokens_out INTEGER DEFAULT 0,
          plan TEXT NOT NULL,
          renewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

    await sql`CREATE UNIQUE INDEX IF NOT EXISTS ai_usage_user_id_key ON ai_usage(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_usage_day ON ai_usage(day)`;

    console.log('✅ AI usage table created');

    console.log('✅ Production database setup complete!');

    return NextResponse.json({
      success: true,
      message:
        'Database setup complete (push subscriptions, conversion events, social posts, subscriptions, tarot_readings, ai_threads, ai_usage, user_sessions)',
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
