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

    console.log('✅ Database setup complete!');
    console.log(
      '📊 Database ready for push subscriptions, conversion tracking, social posts, subscriptions, tarot readings, AI threads, and moon circle insights',
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
