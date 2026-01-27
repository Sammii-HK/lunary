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

    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_theme TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_start DATE`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_id INTEGER`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_text TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_author TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS base_group_key TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS base_post_id INTEGER`;

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

    await sql`
      CREATE TABLE IF NOT EXISTS social_quotes (
        id SERIAL PRIMARY KEY,
        quote_text TEXT NOT NULL UNIQUE,
        author TEXT,
        status TEXT NOT NULL DEFAULT 'available',
        used_at TIMESTAMP WITH TIME ZONE,
        use_count INTEGER DEFAULT 0,
        pinterest_use_count INTEGER DEFAULT 0,
        pinterest_last_scheduled_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_status ON social_quotes(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_use_count ON social_quotes(use_count)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_pinterest_usage ON social_quotes(pinterest_use_count)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_pinterest_last_scheduled ON social_quotes(pinterest_last_scheduled_at)`;

    await sql`ALTER TABLE social_quotes ADD COLUMN IF NOT EXISTS pinterest_use_count INTEGER DEFAULT 0`;
    await sql`
      ALTER TABLE social_quotes
      ADD COLUMN IF NOT EXISTS pinterest_last_scheduled_at TIMESTAMP WITH TIME ZONE
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pinterest_quote_queue (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES social_quotes(id) ON DELETE SET NULL,
        quote_text TEXT NOT NULL,
        quote_author TEXT,
        scheduled_date DATE NOT NULL UNIQUE,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_pinterest_quote_queue_date ON pinterest_quote_queue(scheduled_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pinterest_quote_queue_status ON pinterest_quote_queue(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pinterest_quote_queue_quote_id ON pinterest_quote_queue(quote_id)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_pinterest_quote_queue_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`DROP TRIGGER IF EXISTS update_pinterest_quote_queue_timestamp ON pinterest_quote_queue`;

    await sql`
      CREATE TRIGGER update_pinterest_quote_queue_timestamp
      BEFORE UPDATE ON pinterest_quote_queue
      FOR EACH ROW
      EXECUTE FUNCTION update_pinterest_quote_queue_updated_at()
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS video_scripts (
        id SERIAL PRIMARY KEY,
        theme_id TEXT NOT NULL,
        theme_name TEXT NOT NULL,
        primary_theme_id TEXT,
        secondary_theme_id TEXT,
        secondary_facet_slug TEXT,
        secondary_angle_key TEXT,
        secondary_aspect_key TEXT,
        facet_title TEXT NOT NULL,
        topic TEXT,
        angle TEXT,
        aspect TEXT,
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
      CREATE TABLE IF NOT EXISTS content_rotation_secondary (
        theme_id TEXT PRIMARY KEY,
        secondary_usage_count INTEGER NOT NULL DEFAULT 0,
        last_secondary_used_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_content_rotation_secondary_last_used
      ON content_rotation_secondary(last_secondary_used_at)
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
        trial_used BOOLEAN NOT NULL DEFAULT false,
        
        -- Stripe integration
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        
        -- Period information
        current_period_end TIMESTAMP WITH TIME ZONE,

        -- Discount tracking
        has_discount BOOLEAN DEFAULT false,
        discount_percent DECIMAL(5,2),
        monthly_amount_due DECIMAL(10,2),
        coupon_id TEXT,
        promo_code TEXT,
        discount_ends_at TIMESTAMP WITH TIME ZONE,
        
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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'trial_used') THEN
          ALTER TABLE subscriptions ADD COLUMN trial_used BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END $$;
    `;

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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'promo_code') THEN
          ALTER TABLE subscriptions ADD COLUMN promo_code TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subscriptions' AND column_name = 'discount_ends_at') THEN
          ALTER TABLE subscriptions ADD COLUMN discount_ends_at TIMESTAMP WITH TIME ZONE;
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
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS origin_hub TEXT`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS origin_page TEXT`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS origin_type TEXT`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS signup_at TIMESTAMP WITH TIME ZONE`;

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

    await sql`
      CREATE TABLE IF NOT EXISTS testimonial_feedback_events (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        email_type TEXT NOT NULL,
        subject TEXT NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonial_feedback_user_type
      ON testimonial_feedback_events(user_id, email_type)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_testimonial_feedback_sent_at
      ON testimonial_feedback_events(sent_at)
    `;

    await sql`
      CREATE OR REPLACE FUNCTION update_testimonial_feedback_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_testimonial_feedback_timestamp
      ON testimonial_feedback_events
    `;

    await sql`
      CREATE TRIGGER update_testimonial_feedback_timestamp
      BEFORE UPDATE ON testimonial_feedback_events
      FOR EACH ROW
      EXECUTE FUNCTION update_testimonial_feedback_updated_at()
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

    await sql`
      CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks`;

    await sql`
      CREATE TRIGGER update_user_streaks_updated_at
          BEFORE UPDATE ON user_streaks
          FOR EACH ROW
          EXECUTE FUNCTION update_user_streaks_updated_at()
    `;

    console.log('✅ User streaks table created');

    // Create email_events table
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

    await sql`DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys`;

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

    await sql`DROP TRIGGER IF EXISTS update_grimoire_embeddings_updated_at ON grimoire_embeddings`;

    await sql`
      CREATE TRIGGER update_grimoire_embeddings_updated_at
          BEFORE UPDATE ON grimoire_embeddings
          FOR EACH ROW
          EXECUTE FUNCTION update_grimoire_embeddings_updated_at()
    `;

    console.log('✅ Grimoire embeddings table created');

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

    console.log('✅ Production database setup complete!');

    return NextResponse.json({
      success: true,
      message:
        'Database setup complete (push subscriptions, social posts, subscriptions, tarot_readings, ai_threads, ai_usage, user_sessions, user_profiles, shop_packs, shop_purchases, user_notes, jazz_migration_status, legacy_fallback_usage, ritual_message_events, user_streaks, email_events, api_keys, grimoire_embeddings)',
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
