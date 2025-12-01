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

    // Create jazz_migration_status table
    await sql`
      CREATE TABLE IF NOT EXISTS jazz_migration_status (
        user_id TEXT PRIMARY KEY,
        migrated_at TIMESTAMP WITH TIME ZONE,
        migration_status TEXT NOT NULL DEFAULT 'pending',
        last_sync_at TIMESTAMP WITH TIME ZONE,
        jazz_account_id TEXT,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_jazz_migration_status_status ON jazz_migration_status(migration_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jazz_migration_status_jazz_account_id ON jazz_migration_status(jazz_account_id)`;

    await sql`
      CREATE OR REPLACE FUNCTION update_jazz_migration_status_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_jazz_migration_status_updated_at ON jazz_migration_status
    `;

    await sql`
      CREATE TRIGGER update_jazz_migration_status_updated_at
          BEFORE UPDATE ON jazz_migration_status
          FOR EACH ROW
          EXECUTE FUNCTION update_jazz_migration_status_updated_at()
    `;

    console.log('✅ Jazz migration status table created');

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
      '📊 Database ready for push subscriptions, conversion tracking, social posts, subscriptions, tarot readings, AI threads, user profiles, shop data, and notes',
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
