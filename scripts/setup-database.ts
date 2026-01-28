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

    // Create the notification_sent_events table
    await sql`
      CREATE TABLE IF NOT EXISTS notification_sent_events (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        event_key TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_name TEXT NOT NULL,
        event_priority INTEGER NOT NULL,
        sent_by TEXT NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(date, event_key)
      )
    `;

    // Create indexes for notification_sent_events
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_sent_events_date ON notification_sent_events(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_sent_events_event_key ON notification_sent_events(event_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_sent_events_sent_at ON notification_sent_events(sent_at)`;

    // Create cleanup function for old notification events
    await sql`
      CREATE OR REPLACE FUNCTION cleanup_old_notification_events()
      RETURNS void AS $$
      BEGIN
        DELETE FROM notification_sent_events
        WHERE date < CURRENT_DATE - INTERVAL '1 day';
      END;
      $$ LANGUAGE plpgsql
    `;

    console.log('✅ Notification sent events table created');

    // Create the conversion_events table
    await sql`
      CREATE TABLE IF NOT EXISTS conversion_events (
        id SERIAL PRIMARY KEY,
        
        -- Event identification
        event_type TEXT NOT NULL,
        event_id UUID,
        
        -- User identification
        user_id TEXT,
        anonymous_id TEXT,
        user_email TEXT,
        
        -- Subscription context
        plan_type TEXT,
        trial_days_remaining INTEGER,
        
        -- Feature context
        feature_name TEXT,
        page_path TEXT,
        entity_type TEXT,
        entity_id TEXT,
        
        -- Additional metadata
        metadata JSONB,
        
        -- Timestamp
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Identity stitching table: links anonymous ids to real user ids.
    // This enables retention/engagement queries to attribute anonymous returns to signed-in users.
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_identity_links (
        user_id TEXT NOT NULL,
        anonymous_id TEXT NOT NULL,
        first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, anonymous_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_identity_links_anonymous_id ON analytics_identity_links(anonymous_id)`;

    // Ensure schema is up to date for existing databases
    await sql`ALTER TABLE conversion_events ADD COLUMN IF NOT EXISTS event_id UUID`;
    await sql`ALTER TABLE conversion_events ADD COLUMN IF NOT EXISTS anonymous_id TEXT`;
    await sql`ALTER TABLE conversion_events ADD COLUMN IF NOT EXISTS entity_type TEXT`;
    await sql`ALTER TABLE conversion_events ADD COLUMN IF NOT EXISTS entity_id TEXT`;

    // Create indexes for conversion_events
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_anonymous_id ON conversion_events(anonymous_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_email ON conversion_events(user_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_plan_type ON conversion_events(plan_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_event_created_at ON conversion_events(event_type, created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_created_at ON conversion_events(user_id, created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_event ON conversion_events(user_id, event_type, created_at)`;

    // Normalise legacy event types to canonical values (one-time, safe to re-run).
    await sql`UPDATE conversion_events SET event_type = 'chart_viewed' WHERE event_type = 'birth_chart_viewed'`;
    await sql`UPDATE conversion_events SET event_type = 'daily_dashboard_viewed' WHERE event_type = 'dashboard_viewed'`;
    await sql`UPDATE conversion_events SET event_type = 'astral_chat_used' WHERE event_type = 'ai_chat'`;
    await sql`UPDATE conversion_events SET event_type = 'tarot_drawn' WHERE event_type = 'tarot_viewed'`;
    await sql`UPDATE conversion_events SET event_type = 'ritual_started' WHERE event_type = 'ritual_view'`;
    await sql`UPDATE conversion_events SET event_type = 'signup_completed' WHERE event_type = 'signup'`;
    await sql`UPDATE conversion_events SET event_type = 'subscription_started' WHERE event_type = 'trial_converted'`;

    // Backfill anonymous_id where user_id is anon:<id>.
    await sql`
      UPDATE conversion_events
      SET anonymous_id = REPLACE(user_id, 'anon:', '')
      WHERE anonymous_id IS NULL
        AND user_id LIKE 'anon:%'
    `;

    // Backfill identity links from any events that include both user_id and anonymous_id.
    await sql`
      INSERT INTO analytics_identity_links (user_id, anonymous_id, first_seen_at, last_seen_at)
      SELECT
        user_id,
        anonymous_id,
        MIN(created_at) AS first_seen_at,
        MAX(created_at) AS last_seen_at
      FROM conversion_events
      WHERE user_id IS NOT NULL
        AND anonymous_id IS NOT NULL
        AND user_id NOT LIKE 'anon:%'
      GROUP BY user_id, anonymous_id
      ON CONFLICT DO NOTHING
    `;

    // Derive Grimoire entity fields when missing.
    await sql`
      UPDATE conversion_events
      SET entity_type = 'grimoire'
      WHERE event_type = 'grimoire_viewed'
        AND entity_type IS NULL
    `;
    await sql`
      UPDATE conversion_events
      SET entity_id = NULLIF(REGEXP_REPLACE(page_path, '^/grimoire/?', ''), '')
      WHERE event_type = 'grimoire_viewed'
        AND (entity_id IS NULL OR entity_id = '')
        AND page_path IS NOT NULL
        AND page_path LIKE '/grimoire%'
    `;

    // Pre-clean existing duplicates so the new unique dedupe indexes can be created.
    // This is expected when older tracking inserted multiple app_opened rows per day.
    await sql`
      WITH ranked AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY user_id, ((created_at AT TIME ZONE 'UTC')::date)
            ORDER BY created_at ASC, id ASC
          ) AS rn
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
      )
      DELETE FROM conversion_events
      WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
    `;

    await sql`
      WITH ranked AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY user_id, ((created_at AT TIME ZONE 'UTC')::date), COALESCE(entity_id, page_path, '')
            ORDER BY created_at ASC, id ASC
          ) AS rn
        FROM conversion_events
        WHERE event_type = 'grimoire_viewed'
          AND user_id IS NOT NULL
      )
      DELETE FROM conversion_events
      WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
    `;

    // Dedupe unique indexes (UTC date bucketing)
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_app_opened_daily
      ON conversion_events (
        user_id,
        event_type,
        ((created_at AT TIME ZONE 'UTC')::date)
      )
      WHERE event_type = 'app_opened' AND user_id IS NOT NULL
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_grimoire_viewed_daily
      ON conversion_events (
        user_id,
        event_type,
        ((created_at AT TIME ZONE 'UTC')::date),
        COALESCE(entity_id, page_path, '')
      )
      WHERE event_type = 'grimoire_viewed' AND user_id IS NOT NULL
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_event_id
      ON conversion_events (event_id)
      WHERE event_id IS NOT NULL
    `;

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
        image_url TEXT,
        video_url TEXT,
        week_theme TEXT,
        week_start DATE,
        quote_id INTEGER,
        quote_text TEXT,
        quote_author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_date ON social_posts(scheduled_date)`;

    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS video_url TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_theme TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_start DATE`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_id INTEGER`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_text TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_author TEXT`;

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

    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_testimonials_is_published
      ON testimonials(is_published)
    `;

    console.log('✅ Testimonials table created');

    await sql`
      CREATE TABLE IF NOT EXISTS video_scripts (
        id SERIAL PRIMARY KEY,
        theme_id TEXT NOT NULL,
        theme_name TEXT NOT NULL,
        facet_title TEXT NOT NULL,
        platform TEXT NOT NULL,
        sections JSONB NOT NULL,
        full_script TEXT NOT NULL,
        word_count INTEGER NOT NULL,
        estimated_duration TEXT NOT NULL,
        scheduled_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        metadata JSONB,
        cover_image_url TEXT,
        part_number INTEGER,
        written_post_content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_video_scripts_platform
      ON video_scripts(platform)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_video_scripts_status
      ON video_scripts(status)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_video_scripts_scheduled
      ON video_scripts(scheduled_date)
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS video_jobs (
        id SERIAL PRIMARY KEY,
        script_id INTEGER NOT NULL,
        week_start DATE,
        date_key DATE,
        topic TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_video_jobs_script_id
      ON video_jobs(script_id)
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_video_jobs_week_topic
      ON video_jobs(week_start, date_key, topic)
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

    // Create user_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL UNIQUE,
        name TEXT,
        birthday TEXT,
        birth_chart JSONB,
        personal_card JSONB,
        location JSONB,
        intention TEXT,
        stripe_customer_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_birth_chart ON user_profiles USING GIN(birth_chart)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_personal_card ON user_profiles USING GIN(personal_card)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles USING GIN(location)`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS intention TEXT`;

    await sql`
      CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles
    `;

    await sql`
      CREATE TRIGGER update_user_profiles_updated_at
          BEFORE UPDATE ON user_profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_user_profiles_updated_at()
    `;

    console.log('✅ User profiles table created');

    // Create shop_packs table
    await sql`
      CREATE TABLE IF NOT EXISTS shop_packs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        subcategory TEXT,
        price INTEGER NOT NULL,
        stripe_product_id TEXT,
        stripe_price_id TEXT,
        image_url TEXT,
        download_url TEXT,
        file_size INTEGER,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_shop_packs_category ON shop_packs(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shop_packs_is_active ON shop_packs(is_active) WHERE is_active = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shop_packs_stripe_product_id ON shop_packs(stripe_product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shop_packs_metadata ON shop_packs USING GIN(metadata)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_shop_packs_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_shop_packs_updated_at ON shop_packs
    `;

    await sql`
      CREATE TRIGGER update_shop_packs_updated_at
          BEFORE UPDATE ON shop_packs
          FOR EACH ROW
          EXECUTE FUNCTION update_shop_packs_updated_at()
    `;

    console.log('✅ Shop packs table created');

    // Create shop_purchases table
    await sql`
      CREATE TABLE IF NOT EXISTS shop_purchases (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        pack_id TEXT NOT NULL,
        stripe_session_id TEXT,
        stripe_payment_intent_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        amount INTEGER NOT NULL,
        download_token TEXT NOT NULL,
        download_count INTEGER DEFAULT 0,
        max_downloads INTEGER DEFAULT 5,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_shop_purchases_user_id ON shop_purchases(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shop_purchases_pack_id ON shop_purchases(pack_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shop_purchases_status ON shop_purchases(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shop_purchases_download_token ON shop_purchases(download_token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shop_purchases_stripe_session_id ON shop_purchases(stripe_session_id)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_shop_purchases_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_shop_purchases_updated_at ON shop_purchases
    `;

    await sql`
      CREATE TRIGGER update_shop_purchases_updated_at
          BEFORE UPDATE ON shop_purchases
          FOR EACH ROW
          EXECUTE FUNCTION update_shop_purchases_updated_at()
    `;

    await sql`
      ALTER TABLE shop_purchases
      ADD COLUMN IF NOT EXISTS pack_name TEXT,
      ADD COLUMN IF NOT EXISTS pack_slug TEXT,
      ADD COLUMN IF NOT EXISTS blob_url TEXT,
      ADD COLUMN IF NOT EXISTS currency TEXT,
      ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
      ADD COLUMN IF NOT EXISTS stripe_price_id TEXT
    `;

    console.log('✅ Shop purchases table created');

    // Create user_notes table
    await sql`
      CREATE TABLE IF NOT EXISTS user_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_notes_created_at ON user_notes(created_at DESC)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_user_notes_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_user_notes_updated_at ON user_notes
    `;

    await sql`
      CREATE TRIGGER update_user_notes_updated_at
          BEFORE UPDATE ON user_notes
          FOR EACH ROW
          EXECUTE FUNCTION update_user_notes_updated_at()
    `;

    console.log('✅ User notes table created');

    // Create legacy_fallback_usage table
    await sql`
      CREATE TABLE IF NOT EXISTS legacy_fallback_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        user_email TEXT,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        migrated BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_legacy_fallback_usage_used_at ON legacy_fallback_usage(used_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_legacy_fallback_usage_user_id ON legacy_fallback_usage(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_legacy_fallback_usage_user_email ON legacy_fallback_usage(user_email)`;

    console.log('✅ Legacy fallback usage table created');

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

    // Ritual message events for A/B testing (tracks shown + engagement)
    await sql`
      CREATE TABLE IF NOT EXISTS ritual_message_events (
        id SERIAL PRIMARY KEY,
        message_id VARCHAR(100) NOT NULL,
        context VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) DEFAULT 'anonymous',
        shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        engaged BOOLEAN DEFAULT FALSE,
        engaged_at TIMESTAMP WITH TIME ZONE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_ritual_message_performance ON ritual_message_events(message_id, context)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ritual_message_user ON ritual_message_events(user_id, shown_at DESC)`;

    console.log('✅ Ritual message events table created');

    // Create user_streaks table
    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        ritual_streak INTEGER DEFAULT 0,
        longest_ritual_streak INTEGER DEFAULT 0,
        last_check_in DATE,
        total_check_ins INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_streaks_last_check_in ON user_streaks(last_check_in)`;

    // Add ritual_streak columns if they don't exist (for existing tables)
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'user_streaks' AND column_name = 'ritual_streak') THEN
          ALTER TABLE user_streaks ADD COLUMN ritual_streak INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'user_streaks' AND column_name = 'longest_ritual_streak') THEN
          ALTER TABLE user_streaks ADD COLUMN longest_ritual_streak INTEGER DEFAULT 0;
        END IF;
      END $$;
    `;

    await sql`
      CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks
    `;

    await sql`
      CREATE TRIGGER update_user_streaks_updated_at
          BEFORE UPDATE ON user_streaks
          FOR EACH ROW
          EXECUTE FUNCTION update_user_streaks_updated_at()
    `;

    console.log('✅ User streaks table created');

    // Create email_events table for tracking sent emails
    await sql`
      CREATE TABLE IF NOT EXISTS email_events (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        email_type TEXT NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB,
        UNIQUE(user_id, email_type)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_events_email_type ON email_events(email_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_events_sent_at ON email_events(sent_at)`;

    console.log('✅ Email events table created');

    // Create api_keys table for developer API monetization
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        key_hash TEXT NOT NULL UNIQUE,
        key_prefix TEXT NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        tier TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        requests INTEGER DEFAULT 0,
        request_limit INTEGER NOT NULL,
        rate_limit INTEGER NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used_at TIMESTAMP WITH TIME ZONE,
        reset_at TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys(tier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true`;

    await sql`
      CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys
    `;

    await sql`
      CREATE TRIGGER update_api_keys_updated_at
          BEFORE UPDATE ON api_keys
          FOR EACH ROW
          EXECUTE FUNCTION update_api_keys_updated_at()
    `;

    console.log('✅ API keys table created');

    // Enable vector extension for semantic search
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;

    // Create grimoire_embeddings table for semantic search in Astral Guide
    await sql`
      CREATE TABLE IF NOT EXISTS grimoire_embeddings (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_grimoire_embeddings_slug ON grimoire_embeddings(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_grimoire_embeddings_category ON grimoire_embeddings(category)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_grimoire_embeddings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_grimoire_embeddings_updated_at ON grimoire_embeddings
    `;

    await sql`
      CREATE TRIGGER update_grimoire_embeddings_updated_at
          BEFORE UPDATE ON grimoire_embeddings
          FOR EACH ROW
          EXECUTE FUNCTION update_grimoire_embeddings_updated_at()
    `;

    console.log('✅ Grimoire embeddings table created');

    // Create gpt_bridge_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS gpt_bridge_logs (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        route TEXT NOT NULL,
        seed_raw TEXT NOT NULL,
        seed_normalized TEXT NOT NULL,
        types_requested JSONB NOT NULL,
        "limit" INTEGER NOT NULL,
        result_count INTEGER NOT NULL,
        curated_count INTEGER NOT NULL,
        alias_hit BOOLEAN NOT NULL,
        search_count INTEGER NOT NULL,
        top_slugs JSONB NOT NULL,
        timing_ms INTEGER NOT NULL,
        cache_status TEXT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        error_name TEXT,
        error_message TEXT
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_gpt_bridge_logs_created_at ON gpt_bridge_logs(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gpt_bridge_logs_seed_normalized ON gpt_bridge_logs(seed_normalized)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gpt_bridge_logs_level ON gpt_bridge_logs(level)`;

    console.log('✅ GPT bridge logs table created');

    // Create refund_requests table
    await sql`
      CREATE TABLE IF NOT EXISTS refund_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT,
        stripe_subscription_id TEXT,
        stripe_customer_id TEXT,
        plan_type TEXT,
        subscription_start TIMESTAMP WITH TIME ZONE,
        amount_cents INTEGER,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        eligible BOOLEAN,
        eligibility_reason TEXT,
        processed_at TIMESTAMP WITH TIME ZONE,
        refund_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_refund_requests_created_at ON refund_requests(created_at)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_refund_requests_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_refund_requests_updated_at ON refund_requests
    `;

    await sql`
      CREATE TRIGGER update_refund_requests_updated_at
          BEFORE UPDATE ON refund_requests
          FOR EACH ROW
          EXECUTE FUNCTION update_refund_requests_updated_at()
    `;

    console.log('✅ Refund requests table created');

    // Create deletion_requests table for GDPR/account deletion
    await sql`
      CREATE TABLE IF NOT EXISTS deletion_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        user_email TEXT,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
        processed_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON deletion_requests(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_deletion_requests_scheduled_for ON deletion_requests(scheduled_for)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_deletion_requests_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_deletion_requests_updated_at ON deletion_requests
    `;

    await sql`
      CREATE TRIGGER update_deletion_requests_updated_at
          BEFORE UPDATE ON deletion_requests
          FOR EACH ROW
          EXECUTE FUNCTION update_deletion_requests_updated_at()
    `;

    console.log('✅ Deletion requests table created');

    // Create consent_log table for ToS/Privacy acceptance tracking
    await sql`
      CREATE TABLE IF NOT EXISTS consent_log (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        consent_type TEXT NOT NULL, -- 'tos', 'privacy', 'marketing', 'cookies'
        version TEXT NOT NULL, -- Policy version accepted
        accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_consent_log_user_id ON consent_log(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_consent_log_type ON consent_log(consent_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_consent_log_accepted_at ON consent_log(accepted_at)`;

    console.log('✅ Consent log table created');

    // Create TourStatus enum type
    await sql`
      DO $$ BEGIN
        CREATE TYPE tour_status AS ENUM ('ACTIVE', 'COMPLETED', 'DISMISSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create tour_progress table for feature tour tracking
    await sql`
      CREATE TABLE IF NOT EXISTS tour_progress (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        tour_id TEXT NOT NULL,
        status tour_status DEFAULT 'ACTIVE',
        completed_at TIMESTAMP WITH TIME ZONE,
        dismissed_at TIMESTAMP WITH TIME ZONE,
        last_shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, tour_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_tour_progress_user_id ON tour_progress(user_id)`;

    console.log('✅ Tour progress table created');

    // Create testimonial_prompt_tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS testimonial_prompt_tracking (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL UNIQUE,
        first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        dont_ask_until TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        submitted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_testimonial_prompt_user_id ON testimonial_prompt_tracking(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_testimonial_prompt_dont_ask_until ON testimonial_prompt_tracking(dont_ask_until)`;

    console.log('✅ Testimonial prompt tracking table created');

    // Create email_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS email_preferences (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        marketing_emails BOOLEAN DEFAULT true,
        product_updates BOOLEAN DEFAULT true,
        cosmic_insights BOOLEAN DEFAULT true,
        trial_reminders BOOLEAN DEFAULT true,
        weekly_digest BOOLEAN DEFAULT true,
        unsubscribed_all BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id)`;

    console.log('✅ Email preferences table created');

    // Collections table for Book of Shadows (journal entries, dreams, etc.)
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK (category IN ('chat', 'ritual', 'insight', 'moon_circle', 'tarot', 'journal', 'dream')),
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
    await sql`CREATE INDEX IF NOT EXISTS idx_collections_dream_category ON collections(user_id, created_at DESC) WHERE category = 'dream'`;

    console.log('✅ Collections table created');

    // Collection folders for organizing entries
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

    console.log('✅ Collection folders table created');

    // User attribution table for SEO/marketing tracking
    await sql`
      CREATE TABLE IF NOT EXISTS user_attribution (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE,
        anonymous_id TEXT,
        first_touch_source TEXT,
        first_touch_medium TEXT,
        first_touch_campaign TEXT,
        first_touch_keyword TEXT,
        first_touch_page TEXT,
        first_touch_referrer TEXT,
        first_touch_at TIMESTAMP WITH TIME ZONE,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_term TEXT,
        utm_content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_attribution_user_id ON user_attribution(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_attribution_source ON user_attribution(first_touch_source)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_attribution_medium ON user_attribution(first_touch_medium)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_attribution_created_at ON user_attribution(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_attribution_first_touch_at ON user_attribution(first_touch_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_attribution_source_medium ON user_attribution(first_touch_source, first_touch_medium)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_user_attribution_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_user_attribution_timestamp ON user_attribution
    `;

    await sql`
      CREATE TRIGGER update_user_attribution_timestamp
          BEFORE UPDATE ON user_attribution
          FOR EACH ROW
          EXECUTE FUNCTION update_user_attribution_updated_at()
    `;

    console.log('✅ User attribution table created');

    // Create videos table for video generation and storage
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(20) NOT NULL, -- 'short' | 'medium' | 'long'
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        audio_url TEXT, -- URL to the audio file
        script TEXT, -- Voiceover script for closed captions
        title TEXT,
        description TEXT,
        post_content TEXT, -- Social media post content to accompany the video
        week_number INTEGER,
        blog_slug TEXT,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'uploaded' | 'failed'
        youtube_video_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_type_week ON videos(type, week_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_expires_at ON videos(expires_at)`;

    // Add post_content column if it doesn't exist (migration for existing databases)
    try {
      await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS post_content TEXT`;
      console.log('✅ Videos table post_content column added/verified');
    } catch (error) {
      // Column might already exist, that's okay
      console.log('ℹ️  post_content column already exists or error adding it');
    }

    // Add audio_url column if it doesn't exist (migration for existing databases)
    try {
      await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS audio_url TEXT`;
      console.log('✅ Videos table audio_url column added/verified');
    } catch (error) {
      // Column might already exist, that's okay
      console.log('ℹ️  audio_url column already exists or error adding it');
    }

    // Add script column if it doesn't exist (migration for existing databases)
    try {
      await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS script TEXT`;
      console.log('✅ Videos table script column added/verified');
    } catch (error) {
      // Column might already exist, that's okay
      console.log('ℹ️  script column already exists or error adding it');
    }

    // Add updated_at column if it doesn't exist (migration for existing databases)
    try {
      await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`;
      console.log('✅ Videos table updated_at column added/verified');
    } catch (error) {
      // Column might already exist, that's okay
      console.log('ℹ️  updated_at column already exists or error adding it');
    }

    console.log('✅ Videos table created');

    // Daily thread modules table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_thread_modules (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        date DATE NOT NULL,
        modules_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_daily_thread_modules_user_date ON daily_thread_modules(user_id, date DESC)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_daily_thread_modules_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`DROP TRIGGER IF EXISTS update_daily_thread_modules_updated_at ON daily_thread_modules`;

    await sql`
      CREATE TRIGGER update_daily_thread_modules_updated_at
          BEFORE UPDATE ON daily_thread_modules
          FOR EACH ROW
          EXECUTE FUNCTION update_daily_thread_modules_updated_at()
    `;

    console.log('✅ Daily thread modules table created');

    // Metric snapshots for weekly/monthly growth tracking
    await sql`
      CREATE TABLE IF NOT EXISTS metric_snapshots (
        period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
        period_key TEXT NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,

        new_signups INTEGER NOT NULL DEFAULT 0,
        new_trials INTEGER NOT NULL DEFAULT 0,
        new_paying_subscribers INTEGER NOT NULL DEFAULT 0,

        wau INTEGER NOT NULL DEFAULT 0,
        activation_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,

        trial_to_paid_conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,

        mrr NUMERIC(10, 2) NOT NULL DEFAULT 0,
        active_subscribers INTEGER NOT NULL DEFAULT 0,

        churn_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
        d7_retention NUMERIC(5, 2),

        extras JSONB,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        PRIMARY KEY (period_type, period_key)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_metric_snapshots_type_start ON metric_snapshots(period_type, period_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_metric_snapshots_created_at ON metric_snapshots(created_at)`;

    console.log('✅ Metric snapshots table created');

    console.log('✅ Database setup complete!');
    console.log(
      '📊 Database ready for push subscriptions, conversion tracking, social posts, subscriptions, tarot readings, AI threads, user profiles, shop data, notes, API keys, consent, email preferences, user attribution, videos, and metric snapshots',
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
