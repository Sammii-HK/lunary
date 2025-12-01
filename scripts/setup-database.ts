import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Check if POSTGRES_URL is set
if (
  !process.env.POSTGRES_URL &&
  !process.env.POSTGRES_PRISMA_URL &&
  !process.env.POSTGRES_URL_NON_POOLING
) {
  console.error('❌ POSTGRES_URL environment variable not found');
  console.error('   Make sure you have .env.local with POSTGRES_URL set');
  console.error('   Or pull from Vercel: vercel env pull .env.local');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');

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
          "majorAspects": true,
          "moonCircles": true
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

    console.log('✅ Push subscriptions table created');

    // Create the conversion_events table
    await sql`
      CREATE TABLE IF NOT EXISTS conversion_events (
        id SERIAL PRIMARY KEY,
        
        -- Event identification
        event_type TEXT NOT NULL,
        
        -- User identification
        user_id TEXT,
        user_email TEXT,
        
        -- Subscription context
        plan_type TEXT,
        trial_days_remaining INTEGER,
        
        -- Feature context
        feature_name TEXT,
        page_path TEXT,
        
        -- Additional metadata
        metadata JSONB,
        
        -- Timestamp
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for conversion_events
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_email ON conversion_events(user_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_plan_type ON conversion_events(plan_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_event ON conversion_events(user_id, event_type, created_at)`;

    console.log('✅ Conversion events table created');

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

    console.log('✅ Social posts table created');

    // Create the social_quotes table (quote pool for reuse)
    await sql`
      CREATE TABLE IF NOT EXISTS social_quotes (
        id SERIAL PRIMARY KEY,
        quote_text TEXT NOT NULL UNIQUE,
        author TEXT,
        status TEXT NOT NULL DEFAULT 'available',
        used_at TIMESTAMP WITH TIME ZONE,
        use_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_status ON social_quotes(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_created_at ON social_quotes(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_use_count ON social_quotes(use_count)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_social_quotes_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_social_quotes_timestamp ON social_quotes
    `;

    await sql`
      CREATE TRIGGER update_social_quotes_timestamp
      BEFORE UPDATE ON social_quotes
      FOR EACH ROW
      EXECUTE FUNCTION update_social_quotes_updated_at()
    `;

    console.log('✅ Social quotes table created');

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

    // Add discount/coupon tracking columns if they don't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'has_discount') THEN
          ALTER TABLE subscriptions ADD COLUMN has_discount BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'discount_percent') THEN
          ALTER TABLE subscriptions ADD COLUMN discount_percent DECIMAL(5,2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'monthly_amount_due') THEN
          ALTER TABLE subscriptions ADD COLUMN monthly_amount_due DECIMAL(10,2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'coupon_id') THEN
          ALTER TABLE subscriptions ADD COLUMN coupon_id TEXT;
        END IF;
      END $$;
    `;

    // Add generated column for is_paying (computed from monthly_amount_due)
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'is_paying') THEN
          ALTER TABLE subscriptions ADD COLUMN is_paying BOOLEAN GENERATED ALWAYS AS (COALESCE(monthly_amount_due, 0) > 0) STORED;
        END IF;
      END $$;
    `;

    // Create indexes for discount tracking
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_is_paying ON subscriptions(is_paying) WHERE is_paying = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_has_discount ON subscriptions(has_discount) WHERE has_discount = true`;

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
          ai_interpretation TEXT,
          archived_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

    // Add ai_interpretation column if it doesn't exist (for existing tables)
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'tarot_readings' AND column_name = 'ai_interpretation') THEN
          ALTER TABLE tarot_readings ADD COLUMN ai_interpretation TEXT;
        END IF;
      END $$;
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

    // Create the ai_prompts table for daily/weekly personalized prompts
    await sql`
      CREATE TABLE IF NOT EXISTS ai_prompts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        prompt_type VARCHAR(50) NOT NULL,
        prompt_text TEXT NOT NULL,
        cosmic_context JSONB,
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_user_prompt_type_date UNIQUE (user_id, prompt_type, generated_at)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_ai_prompts_user_id ON ai_prompts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_prompts_type ON ai_prompts(prompt_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_prompts_generated_at ON ai_prompts(generated_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_prompts_expires_at ON ai_prompts(expires_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_prompts_unread ON ai_prompts(user_id, read_at) WHERE read_at IS NULL`;

    await sql`
      CREATE OR REPLACE FUNCTION update_ai_prompts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_ai_prompts_timestamp ON ai_prompts
    `;

    await sql`
      CREATE TRIGGER update_ai_prompts_timestamp
      BEFORE UPDATE ON ai_prompts
      FOR EACH ROW
      EXECUTE FUNCTION update_ai_prompts_updated_at()
    `;

    console.log('✅ AI prompts table created');

    // Create the moon_circles table (metadata for each gathering)
    await sql`
        CREATE TABLE IF NOT EXISTS moon_circles (
          id SERIAL PRIMARY KEY,
          moon_phase TEXT NOT NULL,
          event_date DATE NOT NULL,
          title TEXT,
          theme TEXT,
          description TEXT,
          focus_points JSONB DEFAULT '[]'::jsonb,
          rituals JSONB DEFAULT '[]'::jsonb,
          journal_prompts JSONB DEFAULT '[]'::jsonb,
          astrology_highlights JSONB DEFAULT '[]'::jsonb,
          resource_links JSONB DEFAULT '[]'::jsonb,
          hero_image_url TEXT,
          cta_url TEXT,
          insight_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

    await sql`
        CREATE INDEX IF NOT EXISTS idx_moon_circles_event_date
        ON moon_circles(event_date DESC)
      `;

    await sql`
        CREATE INDEX IF NOT EXISTS idx_moon_circles_moon_phase
        ON moon_circles(moon_phase)
      `;

    await sql`
        CREATE OR REPLACE FUNCTION update_moon_circles_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

    await sql`
        DROP TRIGGER IF EXISTS update_moon_circles_timestamp ON moon_circles
      `;

    await sql`
        CREATE TRIGGER update_moon_circles_timestamp
            BEFORE UPDATE ON moon_circles
            FOR EACH ROW
            EXECUTE FUNCTION update_moon_circles_updated_at()
      `;

    console.log('✅ Moon circles table created');

    // Safety: ensure insight_count exists on existing deployments
    await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'moon_circles' AND column_name = 'insight_count'
          ) THEN
            ALTER TABLE moon_circles ADD COLUMN insight_count INTEGER DEFAULT 0;
          END IF;
        END $$;
      `;

    // Create the moon_circle_insights table (community submissions)
    await sql`
        CREATE TABLE IF NOT EXISTS moon_circle_insights (
          id SERIAL PRIMARY KEY,
          moon_circle_id INTEGER NOT NULL REFERENCES moon_circles(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL,
          insight_text TEXT NOT NULL,
          is_anonymous BOOLEAN DEFAULT true,
          source TEXT DEFAULT 'app',
          email_thread_id TEXT,
          is_approved BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT moon_circle_insights_insight_text_length
            CHECK (char_length(insight_text) >= 10 AND char_length(insight_text) <= 1000)
        )
      `;

    await sql`
        CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_moon_circle_id
        ON moon_circle_insights(moon_circle_id)
      `;

    await sql`
        CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_user_id
        ON moon_circle_insights(user_id)
      `;

    await sql`
        CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_created_at
        ON moon_circle_insights(created_at DESC)
      `;

    await sql`
        CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_is_approved
        ON moon_circle_insights(is_approved)
        WHERE is_approved = true
      `;

    await sql`
        CREATE OR REPLACE FUNCTION update_moon_circle_insights_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

    await sql`
        DROP TRIGGER IF EXISTS update_moon_circle_insights_timestamp ON moon_circle_insights
      `;

    await sql`
        CREATE TRIGGER update_moon_circle_insights_timestamp
            BEFORE UPDATE ON moon_circle_insights
            FOR EACH ROW
            EXECUTE FUNCTION update_moon_circle_insights_updated_at()
      `;

    await sql`
        CREATE OR REPLACE FUNCTION update_moon_circle_insight_count()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                UPDATE moon_circles
                SET insight_count = insight_count + 1
                WHERE id = NEW.moon_circle_id;
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                UPDATE moon_circles
                SET insight_count = GREATEST(0, insight_count - 1)
                WHERE id = OLD.moon_circle_id;
                RETURN OLD;
            END IF;
            RETURN NULL;
        END;
        $$ language 'plpgsql'
      `;

    await sql`
        DROP TRIGGER IF EXISTS trigger_update_insight_count ON moon_circle_insights
      `;

    await sql`
        CREATE TRIGGER trigger_update_insight_count
            AFTER INSERT OR DELETE ON moon_circle_insights
            FOR EACH ROW
            EXECUTE FUNCTION update_moon_circle_insight_count()
      `;

    console.log('✅ Moon circle insights table created');

    // Create the newsletter_subscribers table
    await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      user_id TEXT,
      is_active BOOLEAN DEFAULT true,
      is_verified BOOLEAN DEFAULT false,
      verification_token TEXT,
      verified_at TIMESTAMP WITH TIME ZONE,
      unsubscribed_at TIMESTAMP WITH TIME ZONE,
      preferences JSONB DEFAULT '{
        "weeklyNewsletter": true,
        "blogUpdates": true,
        "productUpdates": false,
        "cosmicAlerts": false
      }'::jsonb,
      source TEXT,
      referrer TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_email_sent TIMESTAMP WITH TIME ZONE,
      email_count INTEGER DEFAULT 0
    )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON newsletter_subscribers(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_verified ON newsletter_subscribers(is_verified) WHERE is_verified = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_preferences ON newsletter_subscribers USING GIN(preferences)`;

    await sql`
    CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql'
    `;

    await sql`
    DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers
    `;

    await sql`
    CREATE TRIGGER update_newsletter_subscribers_updated_at
        BEFORE UPDATE ON newsletter_subscribers
        FOR EACH ROW
        EXECUTE FUNCTION update_newsletter_subscribers_updated_at()
    `;

    console.log('✅ Newsletter subscribers table created');

    // Create the cosmic_snapshots table (cached cosmic data for performance)
    await sql`
    CREATE TABLE IF NOT EXISTS cosmic_snapshots (
      user_id TEXT NOT NULL,
      snapshot_date DATE NOT NULL,
      snapshot_data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (user_id, snapshot_date)
    )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_cosmic_snapshots_user_id ON cosmic_snapshots(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cosmic_snapshots_date ON cosmic_snapshots(snapshot_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cosmic_snapshots_updated_at ON cosmic_snapshots(updated_at)`;

    // Create the global_cosmic_data table (shared cosmic data)
    await sql`
    CREATE TABLE IF NOT EXISTS global_cosmic_data (
      data_date DATE PRIMARY KEY,
      moon_phase JSONB NOT NULL,
      planetary_positions JSONB NOT NULL,
      general_transits JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_global_cosmic_data_date ON global_cosmic_data(data_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_global_cosmic_data_updated_at ON global_cosmic_data(updated_at)`;

    console.log('✅ Cosmic snapshots tables created');

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

    await sql`CREATE INDEX IF NOT EXISTS idx_yearly_forecasts_updated_at ON yearly_forecasts(updated_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yearly_forecasts_generated_at ON yearly_forecasts(generated_at)`;

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

    // Create the year_analysis table (cached year-over-year analysis results)
    await sql`
    CREATE TABLE IF NOT EXISTS year_analysis (
      user_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      analysis_data JSONB NOT NULL,
      card_recaps JSONB,
      trends JSONB,
      last_reading_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (user_id, year)
    )
    `;

    // Add new columns if they don't exist (for existing tables)
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'year_analysis' AND column_name = 'card_recaps') THEN
          ALTER TABLE year_analysis ADD COLUMN card_recaps JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'year_analysis' AND column_name = 'trends') THEN
          ALTER TABLE year_analysis ADD COLUMN trends JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'year_analysis' AND column_name = 'last_reading_date') THEN
          ALTER TABLE year_analysis ADD COLUMN last_reading_date TIMESTAMP WITH TIME ZONE;
        END IF;
      END $$;
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_year_analysis_user_id ON year_analysis(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_year_analysis_year ON year_analysis(year)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_year_analysis_updated_at ON year_analysis(updated_at)`;

    console.log('✅ Year analysis table created');

    // Create the pattern_analysis table (stores multidimensional and timeline analysis)
    await sql`
      CREATE TABLE IF NOT EXISTS pattern_analysis (
        user_id TEXT NOT NULL,
        analysis_type TEXT NOT NULL,
        element_patterns JSONB,
        color_patterns JSONB,
        correlations JSONB,
        timeline_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, analysis_type)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_pattern_analysis_user_id ON pattern_analysis(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pattern_analysis_type ON pattern_analysis(analysis_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pattern_analysis_updated_at ON pattern_analysis(updated_at)`;

    console.log('✅ Pattern analysis table created');

    // Create collections and collection_folders tables
    await sql`
      CREATE TABLE IF NOT EXISTS collection_folders (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#6366f1',
        icon TEXT DEFAULT 'book',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_collection_folders_user_id ON collection_folders(user_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK (category IN ('chat', 'ritual', 'insight', 'moon_circle', 'tarot', 'journal')),
        content JSONB NOT NULL,
        tags TEXT[],
        folder_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_collections_tags ON collections USING GIN(tags)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_collections_folder_id ON collections(folder_id)`;

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'collections_folder_id_fkey'
        ) THEN
          ALTER TABLE collections 
          ADD CONSTRAINT collections_folder_id_fkey 
          FOREIGN KEY (folder_id) REFERENCES collection_folders(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `;

    await sql`
      CREATE OR REPLACE FUNCTION update_collections_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_collections_timestamp ON collections
    `;

    await sql`
      CREATE TRIGGER update_collections_timestamp
          BEFORE UPDATE ON collections
          FOR EACH ROW
          EXECUTE FUNCTION update_collections_updated_at()
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_collection_folders_timestamp ON collection_folders
    `;

    await sql`
      CREATE TRIGGER update_collection_folders_timestamp
          BEFORE UPDATE ON collection_folders
          FOR EACH ROW
          EXECUTE FUNCTION update_collections_updated_at()
    `;

    console.log('✅ Collections tables created');

    // Create cosmic_reports table
    await sql`
      CREATE TABLE IF NOT EXISTS cosmic_reports (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        report_type TEXT NOT NULL,
        report_data JSONB NOT NULL,
        share_token TEXT UNIQUE,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_cosmic_reports_user_id ON cosmic_reports(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cosmic_reports_share_token ON cosmic_reports(share_token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cosmic_reports_is_public ON cosmic_reports(is_public) WHERE is_public = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cosmic_reports_created_at ON cosmic_reports(created_at)`;

    console.log('✅ Cosmic reports table created');

    // Create analytics tables
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_user_activity (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_date DATE NOT NULL,
        activity_type TEXT NOT NULL,
        activity_count INTEGER DEFAULT 1,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, activity_date, activity_type)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_user_id ON analytics_user_activity(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_date ON analytics_user_activity(activity_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_type ON analytics_user_activity(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_user_date ON analytics_user_activity(user_id, activity_date)`;

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_ai_usage (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        message_count INTEGER DEFAULT 0,
        token_count INTEGER DEFAULT 0,
        mode TEXT,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(session_id)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_user_id ON analytics_ai_usage(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_session_id ON analytics_ai_usage(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_created_at ON analytics_ai_usage(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_mode ON analytics_ai_usage(mode)`;

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_conversions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        conversion_type TEXT NOT NULL,
        from_plan TEXT,
        to_plan TEXT,
        trigger_feature TEXT,
        days_to_convert INTEGER,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_conversions_user_id ON analytics_conversions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_conversions_type ON analytics_conversions(conversion_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_conversions_created_at ON analytics_conversions(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_conversions_trigger_feature ON analytics_conversions(trigger_feature)`;

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_notification_events (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        notification_type TEXT NOT NULL,
        event_type TEXT NOT NULL,
        notification_id TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_user_id ON analytics_notification_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_type ON analytics_notification_events(notification_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_event_type ON analytics_notification_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_created_at ON analytics_notification_events(created_at)`;

    // Create analytics_seo_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_seo_metrics (
        id SERIAL PRIMARY KEY,
        metric_date DATE NOT NULL UNIQUE,
        clicks INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        ctr DECIMAL(10, 4) DEFAULT 0,
        average_position DECIMAL(10, 2) DEFAULT 0,
        pages_indexed INTEGER DEFAULT 0,
        article_count INTEGER DEFAULT 0,
        top_pages JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_seo_metrics_date ON analytics_seo_metrics(metric_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_seo_metrics_created_at ON analytics_seo_metrics(created_at)`;

    console.log('✅ Analytics tables created');

    // Create weekly_ritual_usage table
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_ritual_usage (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        week_start DATE NOT NULL,
        ritual_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, week_start)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_weekly_ritual_usage_user_week ON weekly_ritual_usage(user_id, week_start)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_weekly_ritual_usage_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_weekly_ritual_usage_timestamp ON weekly_ritual_usage
    `;

    await sql`
      CREATE TRIGGER update_weekly_ritual_usage_timestamp
          BEFORE UPDATE ON weekly_ritual_usage
          FOR EACH ROW
          EXECUTE FUNCTION update_weekly_ritual_usage_updated_at()
    `;

    console.log('✅ Weekly ritual usage table created');

    // Create launch_signups table
    await sql`
      CREATE TABLE IF NOT EXISTS launch_signups (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_launch_signups_email ON launch_signups(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_launch_signups_source ON launch_signups(source)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_launch_signups_created_at ON launch_signups(created_at)`;

    console.log('✅ Launch signups table created');

    // Create referral tables
    await sql`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        uses INTEGER DEFAULT 0,
        max_uses INTEGER
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS user_referrals (
        id SERIAL PRIMARY KEY,
        referrer_user_id TEXT NOT NULL,
        referred_user_id TEXT NOT NULL,
        referral_code TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reward_granted BOOLEAN DEFAULT false,
        reward_granted_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(referred_user_id)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON user_referrals(referred_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code)`;

    console.log('✅ Referral tables created');

    // Create analytics_discord_interactions table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_discord_interactions (
        id SERIAL PRIMARY KEY,
        discord_id TEXT NOT NULL,
        lunary_user_id TEXT,
        interaction_type TEXT NOT NULL,
        command_name TEXT,
        button_action TEXT,
        destination_url TEXT,
        source TEXT DEFAULT 'discord',
        feature TEXT,
        campaign TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_discord_id ON analytics_discord_interactions(discord_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_lunary_user_id ON analytics_discord_interactions(lunary_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_type ON analytics_discord_interactions(interaction_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_command ON analytics_discord_interactions(command_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_created_at ON analytics_discord_interactions(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_feature ON analytics_discord_interactions(feature)`;

    console.log('✅ Discord interactions analytics table created');

    // Create the discord_notification_log table for tracking sent notifications
    await sql`
      CREATE TABLE IF NOT EXISTS discord_notification_log (
        id SERIAL PRIMARY KEY,
        dedupe_key TEXT,
        category TEXT NOT NULL,
        title TEXT,
        recipient_count INTEGER DEFAULT 0,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_log_category ON discord_notification_log(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_log_sent_at ON discord_notification_log(sent_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_log_category_sent_at ON discord_notification_log(category, sent_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_log_dedupe_key ON discord_notification_log(dedupe_key)`;

    await sql`
      CREATE OR REPLACE FUNCTION cleanup_old_discord_logs()
      RETURNS void AS $$
      BEGIN
        DELETE FROM discord_notification_log
        WHERE sent_at < NOW() - INTERVAL '48 hours';
      END;
      $$ LANGUAGE plpgsql
    `;

    console.log('✅ Discord notification log table created');

    // Create the discord_notification_analytics table for analytics queue
    await sql`
      CREATE TABLE IF NOT EXISTS discord_notification_analytics (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        event_type TEXT NOT NULL,
        title TEXT,
        dedupe_key TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB,
        skipped_reason TEXT,
        rate_limited BOOLEAN DEFAULT false,
        quiet_hours_skipped BOOLEAN DEFAULT false
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_category ON discord_notification_analytics(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_event_type ON discord_notification_analytics(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_sent_at ON discord_notification_analytics(sent_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_dedupe_key ON discord_notification_analytics(dedupe_key)`;

    await sql`
      CREATE OR REPLACE FUNCTION cleanup_old_discord_analytics()
      RETURNS void AS $$
      BEGIN
        DELETE FROM discord_notification_analytics
        WHERE sent_at < NOW() - INTERVAL '7 days';
      END;
      $$ LANGUAGE plpgsql
    `;

    console.log('✅ Discord notification analytics table created');

    // Create the admin_activity_log table for tracking admin actions and automation
    await sql`
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id SERIAL PRIMARY KEY,
        activity_type TEXT NOT NULL,
        activity_category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        message TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        error_message TEXT,
        execution_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type ON admin_activity_log(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_category ON admin_activity_log(activity_category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_status ON admin_activity_log(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC)`;

    console.log('✅ Admin activity log table created');

    // Create user_streaks table
    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_check_in DATE,
        total_check_ins INTEGER DEFAULT 0,
        ritual_streak INTEGER DEFAULT 0,
        longest_ritual_streak INTEGER DEFAULT 0,
        last_ritual_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_streaks_last_check_in ON user_streaks(last_check_in)`;

    console.log('✅ User streaks table created');

    // Create ritual_habits table
    await sql`
      CREATE TABLE IF NOT EXISTS ritual_habits (
        user_id TEXT NOT NULL,
        habit_date DATE NOT NULL,
        ritual_type TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completion_time TIMESTAMP WITH TIME ZONE,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, habit_date, ritual_type)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_ritual_habits_user_id ON ritual_habits(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ritual_habits_date ON ritual_habits(habit_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ritual_habits_user_date ON ritual_habits(user_id, habit_date)`;

    console.log('✅ Ritual habits table created');

    // Create onboarding_completion table
    await sql`
      CREATE TABLE IF NOT EXISTS onboarding_completion (
        user_id TEXT PRIMARY KEY,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        steps_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
        skipped BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_completion_completed_at ON onboarding_completion(completed_at)`;

    console.log('✅ Onboarding completion table created');

    // Create monthly_insights table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_insights (
        user_id TEXT NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        insights JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, month, year)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_id ON monthly_insights(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_insights_date ON monthly_insights(year, month)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_insights_updated_at ON monthly_insights(updated_at)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_monthly_insights_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`DROP TRIGGER IF EXISTS update_monthly_insights_timestamp ON monthly_insights`;

    await sql`
      CREATE TRIGGER update_monthly_insights_timestamp
        BEFORE UPDATE ON monthly_insights
        FOR EACH ROW
        EXECUTE FUNCTION update_monthly_insights_updated_at()
    `;

    console.log('✅ Monthly insights table created');

    // Create re_engagement_campaigns table
    await sql`
      CREATE TABLE IF NOT EXISTS re_engagement_campaigns (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        campaign_type TEXT NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        opened_at TIMESTAMP WITH TIME ZONE,
        clicked_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_user_id ON re_engagement_campaigns(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_type ON re_engagement_campaigns(campaign_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_sent_at ON re_engagement_campaigns(sent_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_user_type_sent ON re_engagement_campaigns(user_id, campaign_type, sent_at)`;

    console.log('✅ Re-engagement campaigns table created');

    await sql`
      CREATE TABLE IF NOT EXISTS journal_patterns (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        pattern_data JSONB NOT NULL,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_journal_patterns_user_id ON journal_patterns(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_journal_patterns_expires ON journal_patterns(expires_at)`;

    console.log('✅ Journal patterns table created');

    console.log('✅ Database setup complete!');
    console.log(
      '📊 Database ready for push subscriptions, conversion tracking, social posts, subscriptions, tarot readings, AI threads, moon circle insights, user streaks, and onboarding completion',
    );
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('🎉 Database setup successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  });
