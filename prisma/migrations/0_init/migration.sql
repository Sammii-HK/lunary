-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "tour_status" AS ENUM ('ACTIVE', 'COMPLETED', 'DISMISSED');

-- CreateTable
CREATE TABLE "social_posts" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "post_type" TEXT NOT NULL,
    "topic" TEXT,
    "scheduled_date" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "image_url" TEXT,
    "edited_content" TEXT,
    "improvement_notes" TEXT,
    "video_url" TEXT,
    "week_theme" TEXT,
    "week_start" DATE,
    "quote_id" INTEGER,
    "quote_text" TEXT,
    "quote_author" TEXT,
    "base_group_key" TEXT,
    "base_post_id" INTEGER,
    "youtube_video_id" TEXT,
    "source_type" TEXT,
    "source_id" TEXT,
    "source_title" TEXT,
    "app_feature" TEXT,
    "content_type" TEXT,
    "grimoire_slug" TEXT,
    "starfield_seed" TEXT,
    "video_metadata" JSONB,
    "video_script" JSONB,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_threads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER DEFAULT 0,
    "tokens_in" INTEGER DEFAULT 0,
    "tokens_out" INTEGER DEFAULT 0,
    "plan" TEXT NOT NULL,
    "renewed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "requests" INTEGER DEFAULT 0,
    "request_limit" INTEGER NOT NULL,
    "rate_limit" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(6),
    "reset_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gpt_bridge_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "route" TEXT NOT NULL,
    "seed_raw" TEXT NOT NULL,
    "seed_normalized" TEXT NOT NULL,
    "types_requested" JSONB NOT NULL,
    "limit" INTEGER NOT NULL,
    "result_count" INTEGER NOT NULL,
    "curated_count" INTEGER NOT NULL,
    "alias_hit" BOOLEAN NOT NULL,
    "search_count" INTEGER NOT NULL,
    "top_slugs" JSONB NOT NULL,
    "timing_ms" INTEGER NOT NULL,
    "cache_status" TEXT,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "error_name" TEXT,
    "error_message" TEXT,

    CONSTRAINT "gpt_bridge_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_progress" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "status" "tour_status" DEFAULT 'ACTIVE',
    "completed_at" TIMESTAMPTZ(6),
    "dismissed_at" TIMESTAMPTZ(6),
    "last_shown_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonial_prompt_tracking" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "first_seen" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "dont_ask_until" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "submitted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonial_prompt_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(6),
    "refreshTokenExpiresAt" TIMESTAMPTZ(6),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_activity_log" (
    "id" SERIAL NOT NULL,
    "activity_type" TEXT NOT NULL,
    "activity_category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "error_message" TEXT,
    "execution_time_ms" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompts" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt_type" VARCHAR(50) NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "cosmic_context" JSONB,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_ai_usage" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "message_count" INTEGER DEFAULT 0,
    "token_count" INTEGER DEFAULT 0,
    "mode" TEXT,
    "completed" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "analytics_ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_conversions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "conversion_type" TEXT NOT NULL,
    "from_plan" TEXT,
    "to_plan" TEXT,
    "trigger_feature" TEXT,
    "days_to_convert" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_discord_interactions" (
    "id" SERIAL NOT NULL,
    "discord_id" TEXT NOT NULL,
    "lunary_user_id" TEXT,
    "interaction_type" TEXT NOT NULL,
    "command_name" TEXT,
    "button_action" TEXT,
    "destination_url" TEXT,
    "source" TEXT DEFAULT 'discord',
    "feature" TEXT,
    "campaign" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_discord_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_identity_links" (
    "user_id" TEXT NOT NULL,
    "anonymous_id" TEXT NOT NULL,
    "first_seen_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_identity_links_pkey" PRIMARY KEY ("user_id","anonymous_id")
);

-- CreateTable
CREATE TABLE "analytics_notification_events" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "notification_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_notification_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_seo_metrics" (
    "id" SERIAL NOT NULL,
    "metric_date" DATE NOT NULL,
    "clicks" INTEGER DEFAULT 0,
    "impressions" INTEGER DEFAULT 0,
    "ctr" DECIMAL(10,4) DEFAULT 0,
    "average_position" DECIMAL(10,2) DEFAULT 0,
    "pages_indexed" INTEGER DEFAULT 0,
    "article_count" INTEGER DEFAULT 0,
    "top_pages" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_seo_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_user_activity" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_date" DATE NOT NULL,
    "activity_type" TEXT NOT NULL,
    "activity_count" INTEGER DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_user_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "collection_folders" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#6366f1',
    "icon" TEXT DEFAULT 'book',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "tags" TEXT[],
    "folder_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_log" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "consent_type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "accepted_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "consent_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_rotation" (
    "id" SERIAL NOT NULL,
    "rotation_type" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "last_used_at" TIMESTAMPTZ(6),
    "use_count" INTEGER DEFAULT 0,

    CONSTRAINT "content_rotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_rotation_secondary" (
    "theme_id" TEXT NOT NULL,
    "secondary_usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_secondary_used_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_rotation_secondary_pkey" PRIMARY KEY ("theme_id")
);

-- CreateTable
CREATE TABLE "conversation_snippets" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "snippet_encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_snippets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_events" (
    "id" SERIAL NOT NULL,
    "event_type" TEXT NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "plan_type" TEXT,
    "trial_days_remaining" INTEGER,
    "feature_name" TEXT,
    "page_path" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "anonymous_id" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "event_id" UUID,

    CONSTRAINT "conversion_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cosmic_reports" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "report_type" TEXT NOT NULL,
    "report_data" JSONB NOT NULL,
    "share_token" TEXT,
    "is_public" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "cosmic_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cosmic_snapshots" (
    "user_id" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cosmic_snapshots_pkey" PRIMARY KEY ("user_id","snapshot_date")
);

-- CreateTable
CREATE TABLE "daily_horoscopes" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "horoscope_date" DATE NOT NULL,
    "horoscope_data" JSONB NOT NULL,
    "generated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_horoscopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_thread_modules" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "modules_json" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_thread_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deletion_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_for" TIMESTAMPTZ(6) NOT NULL,
    "processed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_notification_analytics" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "title" TEXT,
    "dedupe_key" TEXT,
    "sent_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "skipped_reason" TEXT,
    "rate_limited" BOOLEAN DEFAULT false,
    "quiet_hours_skipped" BOOLEAN DEFAULT false,

    CONSTRAINT "discord_notification_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_notification_log" (
    "id" SERIAL NOT NULL,
    "dedupe_key" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT,
    "recipient_count" INTEGER DEFAULT 0,
    "sent_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_notification_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_events" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "marketing_emails" BOOLEAN DEFAULT true,
    "product_updates" BOOLEAN DEFAULT true,
    "cosmic_insights" BOOLEAN DEFAULT true,
    "trial_reminders" BOOLEAN DEFAULT true,
    "weekly_digest" BOOLEAN DEFAULT true,
    "unsubscribed_all" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_cosmic_data" (
    "data_date" DATE NOT NULL,
    "moon_phase" JSONB NOT NULL,
    "planetary_positions" JSONB NOT NULL,
    "general_transits" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_cosmic_data_pkey" PRIMARY KEY ("data_date")
);

-- CreateTable
CREATE TABLE "grimoire_embeddings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grimoire_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_patterns" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "pattern_type" TEXT NOT NULL,
    "pattern_data" JSONB NOT NULL,
    "generated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),
    "confidence" DOUBLE PRECISION,
    "first_detected" TIMESTAMPTZ(6),
    "last_observed" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "pattern_category" TEXT,
    "source_snapshot" TEXT,

    CONSTRAINT "journal_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "launch_signups" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "launch_signups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_fallback_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "user_email" TEXT,
    "used_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "migrated" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legacy_fallback_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_insights" (
    "user_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "insights" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_insights_pkey" PRIMARY KEY ("user_id","month","year")
);

-- CreateTable
CREATE TABLE "moon_circle_insights" (
    "id" SERIAL NOT NULL,
    "moon_circle_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "insight_text" TEXT NOT NULL,
    "is_anonymous" BOOLEAN DEFAULT true,
    "source" TEXT DEFAULT 'app',
    "email_thread_id" TEXT,
    "is_approved" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moon_circle_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moon_circles" (
    "id" SERIAL NOT NULL,
    "moon_phase" TEXT NOT NULL,
    "event_date" DATE NOT NULL,
    "title" TEXT,
    "theme" TEXT,
    "description" TEXT,
    "focus_points" JSONB DEFAULT '[]',
    "rituals" JSONB DEFAULT '[]',
    "journal_prompts" JSONB DEFAULT '[]',
    "astrology_highlights" JSONB DEFAULT '[]',
    "resource_links" JSONB DEFAULT '[]',
    "hero_image_url" TEXT,
    "cta_url" TEXT,
    "insight_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moon_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "user_id" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "is_verified" BOOLEAN DEFAULT false,
    "verification_token" TEXT,
    "verified_at" TIMESTAMPTZ(6),
    "unsubscribed_at" TIMESTAMPTZ(6),
    "preferences" JSONB DEFAULT '{"blogUpdates": true, "cosmicAlerts": false, "productUpdates": false, "weeklyNewsletter": true}',
    "source" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_email_sent" TIMESTAMPTZ(6),
    "email_count" INTEGER DEFAULT 0,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_sent_events" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "event_key" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_priority" INTEGER NOT NULL,
    "sent_by" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_sent_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_completion" (
    "user_id" TEXT NOT NULL,
    "completed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "steps_completed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skipped" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_completion_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "pattern_analysis" (
    "user_id" TEXT NOT NULL,
    "analysis_type" TEXT NOT NULL,
    "element_patterns" JSONB,
    "color_patterns" JSONB,
    "correlations" JSONB,
    "timeline_data" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pattern_analysis_pkey" PRIMARY KEY ("user_id","analysis_type")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "preferences" JSONB DEFAULT '{"sabbats": true, "eclipses": true, "moonPhases": true, "retrogrades": true, "majorAspects": true, "planetaryTransits": true}',
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_notification_sent" TIMESTAMPTZ(6),
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "re_engagement_campaigns" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_type" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "opened_at" TIMESTAMPTZ(6),
    "clicked_at" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "re_engagement_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "uses" INTEGER DEFAULT 0,
    "max_uses" INTEGER,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "plan_type" TEXT,
    "subscription_start" TIMESTAMPTZ(6),
    "amount_cents" INTEGER,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "eligible" BOOLEAN,
    "eligibility_reason" TEXT,
    "processed_at" TIMESTAMPTZ(6),
    "refund_id" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ritual_habits" (
    "user_id" TEXT NOT NULL,
    "habit_date" DATE NOT NULL,
    "ritual_type" TEXT NOT NULL,
    "completed" BOOLEAN DEFAULT false,
    "completion_time" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ritual_habits_pkey" PRIMARY KEY ("user_id","habit_date","ritual_type")
);

-- CreateTable
CREATE TABLE "ritual_message_events" (
    "id" SERIAL NOT NULL,
    "message_id" VARCHAR(100) NOT NULL,
    "context" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(255) DEFAULT 'anonymous',
    "shown_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "engaged" BOOLEAN DEFAULT false,
    "engaged_at" TIMESTAMPTZ(6),

    CONSTRAINT "ritual_message_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_packs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "price" INTEGER NOT NULL,
    "stripe_product_id" TEXT,
    "stripe_price_id" TEXT,
    "image_url" TEXT,
    "download_url" TEXT,
    "file_size" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "stripe_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" INTEGER NOT NULL,
    "download_token" TEXT NOT NULL,
    "download_count" INTEGER DEFAULT 0,
    "max_downloads" INTEGER DEFAULT 5,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "pack_name" TEXT,
    "pack_slug" TEXT,
    "blob_url" TEXT,
    "currency" TEXT,
    "stripe_product_id" TEXT,
    "stripe_price_id" TEXT,

    CONSTRAINT "shop_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_quotes" (
    "id" SERIAL NOT NULL,
    "quote_text" TEXT NOT NULL,
    "author" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "used_at" TIMESTAMPTZ(6),
    "use_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT,
    "user_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'free',
    "plan_type" TEXT NOT NULL DEFAULT 'free',
    "trial_ends_at" TIMESTAMPTZ(6),
    "trial_reminder_3d_sent" BOOLEAN DEFAULT false,
    "trial_reminder_1d_sent" BOOLEAN DEFAULT false,
    "trial_expired_email_sent" BOOLEAN DEFAULT false,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "current_period_end" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "trial_nurture_day2_sent" BOOLEAN DEFAULT false,
    "trial_nurture_day3_sent" BOOLEAN DEFAULT false,
    "trial_nurture_day5_sent" BOOLEAN DEFAULT false,
    "trial_nurture_day7_sent" BOOLEAN DEFAULT false,
    "has_discount" BOOLEAN DEFAULT false,
    "discount_percent" DECIMAL(5,2),
    "monthly_amount_due" DECIMAL(10,2),
    "coupon_id" TEXT,
    "is_paying" BOOLEAN DEFAULT false,
    "discount_ends_at" TIMESTAMPTZ(6),
    "last_sync_error" TEXT,
    "last_sync_error_at" TIMESTAMPTZ(6),
    "promo_code" TEXT,
    "sync_error_count" INTEGER DEFAULT 0,
    "trial_used" BOOLEAN DEFAULT false,
    "cancel_at_period_end" BOOLEAN DEFAULT false,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarot_readings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "spread_slug" TEXT NOT NULL,
    "spread_name" TEXT NOT NULL,
    "plan_snapshot" TEXT NOT NULL DEFAULT 'free',
    "cards" JSONB NOT NULL,
    "summary" TEXT,
    "highlights" JSONB,
    "journaling_prompts" JSONB,
    "notes" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "ai_interpretation" TEXT,

    CONSTRAINT "tarot_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_publications" (
    "id" SERIAL NOT NULL,
    "week_start" DATE NOT NULL,
    "theme_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theme_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_attribution" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "anonymous_id" TEXT,
    "first_touch_source" TEXT,
    "first_touch_medium" TEXT,
    "first_touch_campaign" TEXT,
    "first_touch_keyword" TEXT,
    "first_touch_page" TEXT,
    "first_touch_referrer" TEXT,
    "first_touch_at" TIMESTAMPTZ(6),
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_memory" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fact_encrypted" TEXT NOT NULL,
    "confidence" REAL DEFAULT 0.8,
    "source_message_id" TEXT,
    "mentioned_count" INTEGER DEFAULT 1,
    "last_mentioned_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "birthday" TEXT,
    "birth_chart" JSONB,
    "personal_card" JSONB,
    "location" JSONB,
    "stripe_customer_id" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "intention" TEXT,
    "origin_hub" TEXT,
    "origin_page" TEXT,
    "origin_type" TEXT,
    "signup_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_referrals" (
    "id" SERIAL NOT NULL,
    "referrer_user_id" TEXT NOT NULL,
    "referred_user_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "reward_granted" BOOLEAN DEFAULT false,
    "reward_granted_at" TIMESTAMPTZ(6),
    "activated" BOOLEAN DEFAULT false,
    "activated_at" TIMESTAMPTZ(6),
    "activation_event" VARCHAR(100),

    CONSTRAINT "user_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_date" DATE NOT NULL DEFAULT (CURRENT_DATE),
    "session_timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "page_path" TEXT,
    "feature_name" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_streaks" (
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER DEFAULT 0,
    "longest_streak" INTEGER DEFAULT 0,
    "last_check_in" DATE,
    "total_check_ins" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "ritual_streak" INTEGER DEFAULT 0,
    "longest_ritual_streak" INTEGER DEFAULT 0,
    "last_ritual_date" DATE,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "skill_tree" VARCHAR(50) NOT NULL,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "total_actions" INTEGER NOT NULL DEFAULT 0,
    "unlocked_features" JSONB DEFAULT '[]',
    "last_level_up_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationship_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship_type" TEXT,
    "birthday" TEXT NOT NULL,
    "birth_time" TEXT,
    "birth_location" TEXT,
    "birth_chart" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "birth_chart_version" INTEGER DEFAULT 0,

    CONSTRAINT "relationship_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synastry_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "relationship_profile_id" UUID NOT NULL,
    "compatibility_score" INTEGER,
    "synastry_aspects" JSONB,
    "composite_chart" JSONB,
    "element_balance" JSONB,
    "modality_balance" JSONB,
    "analysis_summary" TEXT,
    "calculated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "synastry_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inviter_id" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "accepted_by_id" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ(6),

    CONSTRAINT "friend_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "nickname" TEXT,
    "relationship_type" TEXT,
    "synastry_score" INTEGER,
    "synastry_data" JSONB,
    "last_synastry_calc" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_celebrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_celebrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_jobs" (
    "id" SERIAL NOT NULL,
    "script_id" INTEGER NOT NULL,
    "week_start" DATE,
    "date_key" DATE,
    "topic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_scripts" (
    "id" SERIAL NOT NULL,
    "theme_id" TEXT NOT NULL,
    "theme_name" TEXT NOT NULL,
    "facet_title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "full_script" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "estimated_duration" TEXT NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB,
    "cover_image_url" TEXT,
    "part_number" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "written_post_content" TEXT,
    "topic" TEXT,
    "angle" TEXT,
    "aspect" TEXT,
    "primary_theme_id" TEXT,
    "secondary_theme_id" TEXT,
    "secondary_facet_slug" TEXT,
    "secondary_angle_key" TEXT,
    "secondary_aspect_key" TEXT,
    "hook_text" TEXT,
    "hook_version" INTEGER DEFAULT 1,

    CONSTRAINT "video_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(20) NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "title" TEXT,
    "description" TEXT,
    "week_number" INTEGER,
    "blog_slug" TEXT,
    "status" VARCHAR(20) DEFAULT 'pending',
    "youtube_video_id" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) DEFAULT (now() + '7 days'::interval),
    "post_content" TEXT,
    "audio_url" TEXT,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "script" TEXT,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_ritual_usage" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_start" DATE NOT NULL,
    "ritual_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_ritual_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "year_analysis" (
    "user_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "analysis_data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "card_recaps" JSONB,
    "trends" JSONB,
    "last_reading_date" TIMESTAMPTZ(6),

    CONSTRAINT "year_analysis_pkey" PRIMARY KEY ("user_id","year")
);

-- CreateTable
CREATE TABLE "yearly_forecasts" (
    "year" INTEGER NOT NULL,
    "summary" TEXT,
    "forecast" JSONB NOT NULL,
    "stats" JSONB,
    "source" TEXT DEFAULT 'manual',
    "generated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yearly_forecasts_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "youtube_uploads" (
    "id" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "video_url" TEXT NOT NULL,
    "youtube_video_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtube_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Sparkles',
    "cta_label" TEXT,
    "cta_href" TEXT,
    "required_tier" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "released_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_announcements_seen" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_announcements_seen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orphaned_subscriptions" (
    "id" SERIAL NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "customer_email" TEXT,
    "status" TEXT NOT NULL,
    "plan_type" TEXT,
    "subscription_metadata" JSONB,
    "resolved" BOOLEAN DEFAULT false,
    "resolved_user_id" TEXT,
    "resolved_at" TIMESTAMPTZ(6),
    "resolved_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orphaned_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processing_status" TEXT NOT NULL DEFAULT 'pending',
    "user_id" TEXT,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "raw_payload" JSONB,
    "retry_count" INTEGER DEFAULT 0,
    "failure_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_audit_log" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "old_state" JSONB,
    "new_state" JSONB,
    "source" TEXT NOT NULL,
    "stripe_event_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_checkouts" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "checkout_session_id" TEXT,
    "price_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "pending_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_snapshots" (
    "period_type" VARCHAR(20) NOT NULL,
    "period_key" VARCHAR(50) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "new_signups" INTEGER NOT NULL,
    "new_trials" INTEGER NOT NULL,
    "new_paying_subscribers" INTEGER NOT NULL,
    "wau" INTEGER NOT NULL,
    "activation_rate" REAL NOT NULL,
    "trial_to_paid_conversion_rate" REAL NOT NULL,
    "mrr" REAL NOT NULL,
    "active_subscribers" INTEGER NOT NULL,
    "churn_rate" REAL NOT NULL,
    "d7_retention" REAL,
    "extras" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("period_type","period_key")
);

-- CreateTable
CREATE TABLE "native_push_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "timezone" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "preferences" JSONB DEFAULT '{}',
    "last_notification_sent" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "native_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_spaces" (
    "id" SERIAL NOT NULL,
    "space_type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sign" TEXT,
    "planet" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "is_active" BOOLEAN DEFAULT true,
    "starts_at" TIMESTAMPTZ(6),
    "ends_at" TIMESTAMPTZ(6),
    "post_count" INTEGER DEFAULT 0,
    "member_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_text" TEXT NOT NULL,
    "is_anonymous" BOOLEAN DEFAULT true,
    "is_approved" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_memberships" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_scheduled_posts" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "scheduled_time" TIMESTAMPTZ(6) NOT NULL,
    "caption" TEXT NOT NULL,
    "image_url" TEXT,
    "hashtags" TEXT[],
    "metadata" JSONB DEFAULT '{}',
    "posted" BOOLEAN DEFAULT false,
    "posted_at" TIMESTAMPTZ(6),
    "post_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_metrics" (
    "metric_date" DATE NOT NULL,
    "dau" INTEGER NOT NULL DEFAULT 0,
    "wau" INTEGER NOT NULL DEFAULT 0,
    "mau" INTEGER NOT NULL DEFAULT 0,
    "signed_in_product_dau" INTEGER NOT NULL DEFAULT 0,
    "signed_in_product_wau" INTEGER NOT NULL DEFAULT 0,
    "signed_in_product_mau" INTEGER NOT NULL DEFAULT 0,
    "app_opened_mau" INTEGER NOT NULL DEFAULT 0,
    "new_signups" INTEGER NOT NULL DEFAULT 0,
    "activated_users" INTEGER NOT NULL DEFAULT 0,
    "activation_rate" DECIMAL(5,2) DEFAULT 0,
    "mrr" DECIMAL(10,2) DEFAULT 0,
    "active_subscriptions" INTEGER DEFAULT 0,
    "trial_subscriptions" INTEGER DEFAULT 0,
    "new_conversions" INTEGER DEFAULT 0,
    "stickiness" DECIMAL(5,2) DEFAULT 0,
    "avg_active_days_per_week" DECIMAL(5,2) DEFAULT 0,
    "dashboard_adoption" DECIMAL(5,2) DEFAULT 0,
    "horoscope_adoption" DECIMAL(5,2) DEFAULT 0,
    "tarot_adoption" DECIMAL(5,2) DEFAULT 0,
    "chart_adoption" DECIMAL(5,2) DEFAULT 0,
    "guide_adoption" DECIMAL(5,2) DEFAULT 0,
    "ritual_adoption" DECIMAL(5,2) DEFAULT 0,
    "computed_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "computation_duration_ms" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_opened_dau" INTEGER NOT NULL DEFAULT 0,
    "app_opened_wau" INTEGER NOT NULL DEFAULT 0,
    "returning_dau" INTEGER NOT NULL DEFAULT 0,
    "returning_wau" INTEGER NOT NULL DEFAULT 0,
    "returning_mau" INTEGER NOT NULL DEFAULT 0,
    "reach_dau" INTEGER NOT NULL DEFAULT 0,
    "reach_wau" INTEGER NOT NULL DEFAULT 0,
    "reach_mau" INTEGER NOT NULL DEFAULT 0,
    "grimoire_dau" INTEGER NOT NULL DEFAULT 0,
    "grimoire_wau" INTEGER NOT NULL DEFAULT 0,
    "grimoire_mau" INTEGER NOT NULL DEFAULT 0,
    "grimoire_only_mau" INTEGER NOT NULL DEFAULT 0,
    "d1_retention" DECIMAL(5,2) DEFAULT 0,
    "d7_retention" DECIMAL(5,2) DEFAULT 0,
    "d30_retention" DECIMAL(5,2) DEFAULT 0,
    "active_days_1" INTEGER NOT NULL DEFAULT 0,
    "active_days_2_3" INTEGER NOT NULL DEFAULT 0,
    "active_days_4_7" INTEGER NOT NULL DEFAULT 0,
    "active_days_8_14" INTEGER NOT NULL DEFAULT 0,
    "active_days_15_plus" INTEGER NOT NULL DEFAULT 0,
    "stickiness_wau_mau" DECIMAL(5,2) DEFAULT 0,
    "total_accounts" INTEGER NOT NULL DEFAULT 0,
    "grimoire_to_app_rate" DECIMAL(5,2) DEFAULT 0,
    "grimoire_to_app_users" INTEGER NOT NULL DEFAULT 0,
    "returning_referrer_organic" INTEGER DEFAULT 0,
    "returning_referrer_direct" INTEGER DEFAULT 0,
    "returning_referrer_internal" INTEGER DEFAULT 0,

    CONSTRAINT "daily_metrics_pkey" PRIMARY KEY ("metric_date")
);

-- CreateIndex
CREATE INDEX "idx_social_posts_status" ON "social_posts"("status");

-- CreateIndex
CREATE INDEX "idx_social_posts_platform" ON "social_posts"("platform");

-- CreateIndex
CREATE INDEX "idx_social_posts_created_at" ON "social_posts"("created_at");

-- CreateIndex
CREATE INDEX "idx_social_posts_scheduled_date" ON "social_posts"("scheduled_date");

-- CreateIndex
CREATE INDEX "idx_social_posts_content_type" ON "social_posts"("content_type");

-- CreateIndex
CREATE INDEX "idx_social_posts_grimoire_slug" ON "social_posts"("grimoire_slug");

-- CreateIndex
CREATE INDEX "idx_ai_threads_user_id" ON "ai_threads"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_user_id_key" ON "ai_usage"("user_id");

-- CreateIndex
CREATE INDEX "idx_ai_usage_day" ON "ai_usage"("day");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "idx_api_keys_user_id" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "idx_api_keys_key_hash" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "idx_api_keys_tier" ON "api_keys"("tier");

-- CreateIndex
CREATE INDEX "idx_gpt_bridge_logs_created_at" ON "gpt_bridge_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_gpt_bridge_logs_seed_normalized" ON "gpt_bridge_logs"("seed_normalized");

-- CreateIndex
CREATE INDEX "idx_gpt_bridge_logs_level" ON "gpt_bridge_logs"("level");

-- CreateIndex
CREATE INDEX "idx_testimonials_is_published" ON "testimonials"("is_published");

-- CreateIndex
CREATE INDEX "idx_tour_progress_user_id" ON "tour_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tour_progress_user_id_tour_id_key" ON "tour_progress"("user_id", "tour_id");

-- CreateIndex
CREATE UNIQUE INDEX "testimonial_prompt_tracking_user_id_key" ON "testimonial_prompt_tracking"("user_id");

-- CreateIndex
CREATE INDEX "idx_testimonial_prompt_user_id" ON "testimonial_prompt_tracking"("user_id");

-- CreateIndex
CREATE INDEX "idx_testimonial_prompt_dont_ask_until" ON "testimonial_prompt_tracking"("dont_ask_until");

-- CreateIndex
CREATE INDEX "idx_account_userid" ON "account"("userId");

-- CreateIndex
CREATE INDEX "idx_admin_activity_log_category" ON "admin_activity_log"("activity_category");

-- CreateIndex
CREATE INDEX "idx_admin_activity_log_created_at" ON "admin_activity_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_admin_activity_log_status" ON "admin_activity_log"("status");

-- CreateIndex
CREATE INDEX "idx_admin_activity_log_type" ON "admin_activity_log"("activity_type");

-- CreateIndex
CREATE INDEX "idx_ai_prompts_expires_at" ON "ai_prompts"("expires_at");

-- CreateIndex
CREATE INDEX "idx_ai_prompts_generated_at" ON "ai_prompts"("generated_at");

-- CreateIndex
CREATE INDEX "idx_ai_prompts_type" ON "ai_prompts"("prompt_type");

-- CreateIndex
CREATE INDEX "idx_ai_prompts_user_id" ON "ai_prompts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_prompt_type_date" ON "ai_prompts"("user_id", "prompt_type", "generated_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_ai_usage_session_id_key" ON "analytics_ai_usage"("session_id");

-- CreateIndex
CREATE INDEX "idx_analytics_ai_usage_created_at" ON "analytics_ai_usage"("created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_ai_usage_mode" ON "analytics_ai_usage"("mode");

-- CreateIndex
CREATE INDEX "idx_analytics_ai_usage_session_id" ON "analytics_ai_usage"("session_id");

-- CreateIndex
CREATE INDEX "idx_analytics_ai_usage_user_id" ON "analytics_ai_usage"("user_id");

-- CreateIndex
CREATE INDEX "idx_analytics_conversions_created_at" ON "analytics_conversions"("created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_conversions_trigger_feature" ON "analytics_conversions"("trigger_feature");

-- CreateIndex
CREATE INDEX "idx_analytics_conversions_type" ON "analytics_conversions"("conversion_type");

-- CreateIndex
CREATE INDEX "idx_analytics_conversions_user_id" ON "analytics_conversions"("user_id");

-- CreateIndex
CREATE INDEX "idx_analytics_discord_interactions_command" ON "analytics_discord_interactions"("command_name");

-- CreateIndex
CREATE INDEX "idx_analytics_discord_interactions_created_at" ON "analytics_discord_interactions"("created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_discord_interactions_discord_id" ON "analytics_discord_interactions"("discord_id");

-- CreateIndex
CREATE INDEX "idx_analytics_discord_interactions_feature" ON "analytics_discord_interactions"("feature");

-- CreateIndex
CREATE INDEX "idx_analytics_discord_interactions_lunary_user_id" ON "analytics_discord_interactions"("lunary_user_id");

-- CreateIndex
CREATE INDEX "idx_analytics_discord_interactions_type" ON "analytics_discord_interactions"("interaction_type");

-- CreateIndex
CREATE INDEX "idx_analytics_identity_links_anonymous_id" ON "analytics_identity_links"("anonymous_id");

-- CreateIndex
CREATE INDEX "idx_analytics_notification_events_created_at" ON "analytics_notification_events"("created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_notification_events_event_type" ON "analytics_notification_events"("event_type");

-- CreateIndex
CREATE INDEX "idx_analytics_notification_events_type" ON "analytics_notification_events"("notification_type");

-- CreateIndex
CREATE INDEX "idx_analytics_notification_events_user_id" ON "analytics_notification_events"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_seo_metrics_metric_date_key" ON "analytics_seo_metrics"("metric_date");

-- CreateIndex
CREATE INDEX "idx_analytics_seo_metrics_created_at" ON "analytics_seo_metrics"("created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_seo_metrics_date" ON "analytics_seo_metrics"("metric_date");

-- CreateIndex
CREATE INDEX "idx_analytics_user_activity_date" ON "analytics_user_activity"("activity_date");

-- CreateIndex
CREATE INDEX "idx_analytics_user_activity_type" ON "analytics_user_activity"("activity_type");

-- CreateIndex
CREATE INDEX "idx_analytics_user_activity_user_date" ON "analytics_user_activity"("user_id", "activity_date");

-- CreateIndex
CREATE INDEX "idx_analytics_user_activity_user_id" ON "analytics_user_activity"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_user_activity_user_id_activity_date_activity_type_key" ON "analytics_user_activity"("user_id", "activity_date", "activity_type");

-- CreateIndex
CREATE INDEX "idx_collection_folders_user_id" ON "collection_folders"("user_id");

-- CreateIndex
CREATE INDEX "idx_collections_category" ON "collections"("category");

-- CreateIndex
CREATE INDEX "idx_collections_created_at" ON "collections"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_collections_folder_id" ON "collections"("folder_id");

-- CreateIndex
CREATE INDEX "idx_collections_tags" ON "collections" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "idx_collections_user_id" ON "collections"("user_id");

-- CreateIndex
CREATE INDEX "idx_consent_log_accepted_at" ON "consent_log"("accepted_at");

-- CreateIndex
CREATE INDEX "idx_consent_log_type" ON "consent_log"("consent_type");

-- CreateIndex
CREATE INDEX "idx_consent_log_user_id" ON "consent_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_rotation_rotation_type_item_id_key" ON "content_rotation"("rotation_type", "item_id");

-- CreateIndex
CREATE INDEX "idx_content_rotation_secondary_last_used" ON "content_rotation_secondary"("last_secondary_used_at");

-- CreateIndex
CREATE INDEX "idx_conversion_events_anonymous_id" ON "conversion_events"("anonymous_id");

-- CreateIndex
CREATE INDEX "idx_conversion_events_created_at" ON "conversion_events"("created_at");

-- CreateIndex
CREATE INDEX "idx_conversion_events_event_created_at" ON "conversion_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "idx_conversion_events_event_type" ON "conversion_events"("event_type");

-- CreateIndex
CREATE INDEX "idx_conversion_events_plan_type" ON "conversion_events"("plan_type");

-- CreateIndex
CREATE INDEX "idx_conversion_events_user_created_at" ON "conversion_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_conversion_events_user_email" ON "conversion_events"("user_email");

-- CreateIndex
CREATE INDEX "idx_conversion_events_user_event" ON "conversion_events"("user_id", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "idx_conversion_events_user_id" ON "conversion_events"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cosmic_reports_share_token_key" ON "cosmic_reports"("share_token");

-- CreateIndex
CREATE INDEX "idx_cosmic_reports_created_at" ON "cosmic_reports"("created_at");

-- CreateIndex
CREATE INDEX "idx_cosmic_reports_share_token" ON "cosmic_reports"("share_token");

-- CreateIndex
CREATE INDEX "idx_cosmic_reports_user_id" ON "cosmic_reports"("user_id");

-- CreateIndex
CREATE INDEX "idx_cosmic_snapshots_date" ON "cosmic_snapshots"("snapshot_date");

-- CreateIndex
CREATE INDEX "idx_cosmic_snapshots_updated_at" ON "cosmic_snapshots"("updated_at");

-- CreateIndex
CREATE INDEX "idx_cosmic_snapshots_user_id" ON "cosmic_snapshots"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_horoscopes_user_id_horoscope_date_key" ON "daily_horoscopes"("user_id", "horoscope_date");

-- CreateIndex
CREATE INDEX "idx_daily_thread_modules_user_date" ON "daily_thread_modules"("user_id", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_thread_modules_user_id_date_key" ON "daily_thread_modules"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "deletion_requests_user_id_key" ON "deletion_requests"("user_id");

-- CreateIndex
CREATE INDEX "idx_deletion_requests_scheduled_for" ON "deletion_requests"("scheduled_for");

-- CreateIndex
CREATE INDEX "idx_deletion_requests_status" ON "deletion_requests"("status");

-- CreateIndex
CREATE INDEX "idx_deletion_requests_user_id" ON "deletion_requests"("user_id");

-- CreateIndex
CREATE INDEX "idx_discord_notification_analytics_category" ON "discord_notification_analytics"("category");

-- CreateIndex
CREATE INDEX "idx_discord_notification_analytics_dedupe_key" ON "discord_notification_analytics"("dedupe_key");

-- CreateIndex
CREATE INDEX "idx_discord_notification_analytics_event_type" ON "discord_notification_analytics"("event_type");

-- CreateIndex
CREATE INDEX "idx_discord_notification_analytics_sent_at" ON "discord_notification_analytics"("sent_at");

-- CreateIndex
CREATE INDEX "idx_discord_notification_log_category" ON "discord_notification_log"("category");

-- CreateIndex
CREATE INDEX "idx_discord_notification_log_category_sent_at" ON "discord_notification_log"("category", "sent_at");

-- CreateIndex
CREATE INDEX "idx_discord_notification_log_dedupe_key" ON "discord_notification_log"("dedupe_key");

-- CreateIndex
CREATE INDEX "idx_discord_notification_log_sent_at" ON "discord_notification_log"("sent_at");

-- CreateIndex
CREATE INDEX "idx_email_events_email_type" ON "email_events"("email_type");

-- CreateIndex
CREATE INDEX "idx_email_events_sent_at" ON "email_events"("sent_at");

-- CreateIndex
CREATE INDEX "idx_email_events_user_id" ON "email_events"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_events_user_id_email_type_key" ON "email_events"("user_id", "email_type");

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_user_id_key" ON "email_preferences"("user_id");

-- CreateIndex
CREATE INDEX "idx_email_preferences_user_id" ON "email_preferences"("user_id");

-- CreateIndex
CREATE INDEX "idx_global_cosmic_data_date" ON "global_cosmic_data"("data_date");

-- CreateIndex
CREATE INDEX "idx_global_cosmic_data_updated_at" ON "global_cosmic_data"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "grimoire_embeddings_slug_key" ON "grimoire_embeddings"("slug");

-- CreateIndex
CREATE INDEX "idx_grimoire_embeddings_category" ON "grimoire_embeddings"("category");

-- CreateIndex
CREATE INDEX "idx_grimoire_embeddings_slug" ON "grimoire_embeddings"("slug");

-- CreateIndex
CREATE INDEX "idx_journal_patterns_user_type" ON "journal_patterns"("user_id", "pattern_type");

-- CreateIndex
CREATE INDEX "idx_journal_patterns_user_category" ON "journal_patterns"("user_id", "pattern_category");

-- CreateIndex
CREATE INDEX "idx_journal_patterns_expires" ON "journal_patterns"("expires_at");

-- CreateIndex
CREATE INDEX "idx_journal_patterns_user_id" ON "journal_patterns"("user_id");

-- CreateIndex
CREATE INDEX "idx_journal_patterns_data" ON "journal_patterns" USING GIN ("pattern_data");

-- CreateIndex
CREATE UNIQUE INDEX "launch_signups_email_key" ON "launch_signups"("email");

-- CreateIndex
CREATE INDEX "idx_launch_signups_created_at" ON "launch_signups"("created_at");

-- CreateIndex
CREATE INDEX "idx_launch_signups_email" ON "launch_signups"("email");

-- CreateIndex
CREATE INDEX "idx_launch_signups_source" ON "launch_signups"("source");

-- CreateIndex
CREATE INDEX "idx_legacy_fallback_usage_used_at" ON "legacy_fallback_usage"("used_at" DESC);

-- CreateIndex
CREATE INDEX "idx_legacy_fallback_usage_user_email" ON "legacy_fallback_usage"("user_email");

-- CreateIndex
CREATE INDEX "idx_legacy_fallback_usage_user_id" ON "legacy_fallback_usage"("user_id");

-- CreateIndex
CREATE INDEX "idx_monthly_insights_date" ON "monthly_insights"("year", "month");

-- CreateIndex
CREATE INDEX "idx_monthly_insights_updated_at" ON "monthly_insights"("updated_at");

-- CreateIndex
CREATE INDEX "idx_monthly_insights_user_id" ON "monthly_insights"("user_id");

-- CreateIndex
CREATE INDEX "idx_moon_circle_insights_created_at" ON "moon_circle_insights"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_moon_circle_insights_moon_circle_id" ON "moon_circle_insights"("moon_circle_id");

-- CreateIndex
CREATE INDEX "idx_moon_circle_insights_user_id" ON "moon_circle_insights"("user_id");

-- CreateIndex
CREATE INDEX "idx_moon_circles_event_date" ON "moon_circles"("event_date" DESC);

-- CreateIndex
CREATE INDEX "idx_moon_circles_moon_phase" ON "moon_circles"("moon_phase");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "idx_newsletter_subscribers_email" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "idx_newsletter_subscribers_preferences" ON "newsletter_subscribers" USING GIN ("preferences");

-- CreateIndex
CREATE INDEX "idx_newsletter_subscribers_user_id" ON "newsletter_subscribers"("user_id");

-- CreateIndex
CREATE INDEX "idx_notification_sent_events_date" ON "notification_sent_events"("date");

-- CreateIndex
CREATE INDEX "idx_notification_sent_events_event_key" ON "notification_sent_events"("event_key");

-- CreateIndex
CREATE INDEX "idx_notification_sent_events_sent_at" ON "notification_sent_events"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_sent_events_date_event_key_key" ON "notification_sent_events"("date", "event_key");

-- CreateIndex
CREATE INDEX "idx_onboarding_completion_completed_at" ON "onboarding_completion"("completed_at");

-- CreateIndex
CREATE INDEX "idx_pattern_analysis_type" ON "pattern_analysis"("analysis_type");

-- CreateIndex
CREATE INDEX "idx_pattern_analysis_updated_at" ON "pattern_analysis"("updated_at");

-- CreateIndex
CREATE INDEX "idx_pattern_analysis_user_id" ON "pattern_analysis"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "idx_push_subscriptions_endpoint" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "idx_push_subscriptions_preferences" ON "push_subscriptions" USING GIN ("preferences");

-- CreateIndex
CREATE INDEX "idx_push_subscriptions_user_id" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "idx_re_engagement_campaigns_sent_at" ON "re_engagement_campaigns"("sent_at");

-- CreateIndex
CREATE INDEX "idx_re_engagement_campaigns_type" ON "re_engagement_campaigns"("campaign_type");

-- CreateIndex
CREATE INDEX "idx_re_engagement_campaigns_user_id" ON "re_engagement_campaigns"("user_id");

-- CreateIndex
CREATE INDEX "idx_re_engagement_campaigns_user_type_sent" ON "re_engagement_campaigns"("user_id", "campaign_type", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "idx_referral_codes_user_id" ON "referral_codes"("user_id");

-- CreateIndex
CREATE INDEX "idx_refund_requests_created_at" ON "refund_requests"("created_at");

-- CreateIndex
CREATE INDEX "idx_refund_requests_status" ON "refund_requests"("status");

-- CreateIndex
CREATE INDEX "idx_refund_requests_user_id" ON "refund_requests"("user_id");

-- CreateIndex
CREATE INDEX "idx_ritual_habits_date" ON "ritual_habits"("habit_date");

-- CreateIndex
CREATE INDEX "idx_ritual_habits_user_date" ON "ritual_habits"("user_id", "habit_date");

-- CreateIndex
CREATE INDEX "idx_ritual_habits_user_id" ON "ritual_habits"("user_id");

-- CreateIndex
CREATE INDEX "idx_ritual_message_performance" ON "ritual_message_events"("message_id", "context");

-- CreateIndex
CREATE INDEX "idx_ritual_message_user" ON "ritual_message_events"("user_id", "shown_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "idx_session_token" ON "session"("token");

-- CreateIndex
CREATE INDEX "idx_session_userid" ON "session"("userId");

-- CreateIndex
CREATE INDEX "idx_shop_packs_category" ON "shop_packs"("category");

-- CreateIndex
CREATE INDEX "idx_shop_packs_metadata" ON "shop_packs" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "idx_shop_packs_stripe_product_id" ON "shop_packs"("stripe_product_id");

-- CreateIndex
CREATE INDEX "idx_shop_purchases_download_token" ON "shop_purchases"("download_token");

-- CreateIndex
CREATE INDEX "idx_shop_purchases_pack_id" ON "shop_purchases"("pack_id");

-- CreateIndex
CREATE INDEX "idx_shop_purchases_status" ON "shop_purchases"("status");

-- CreateIndex
CREATE INDEX "idx_shop_purchases_stripe_session_id" ON "shop_purchases"("stripe_session_id");

-- CreateIndex
CREATE INDEX "idx_shop_purchases_user_id" ON "shop_purchases"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_quotes_quote_text_key" ON "social_quotes"("quote_text");

-- CreateIndex
CREATE INDEX "idx_social_quotes_created_at" ON "social_quotes"("created_at");

-- CreateIndex
CREATE INDEX "idx_social_quotes_status" ON "social_quotes"("status");

-- CreateIndex
CREATE INDEX "idx_social_quotes_use_count" ON "social_quotes"("use_count");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "idx_subscriptions_trial_ends_at" ON "subscriptions"("trial_ends_at");

-- CreateIndex
CREATE INDEX "idx_subscriptions_user_email" ON "subscriptions"("user_email");

-- CreateIndex
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_stripe_subscription_id" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "idx_tarot_readings_created" ON "tarot_readings"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_tarot_readings_user" ON "tarot_readings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "theme_publications_week_start_theme_name_key" ON "theme_publications"("week_start", "theme_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_attribution_user_id_key" ON "user_attribution"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_attribution_created_at" ON "user_attribution"("created_at");

-- CreateIndex
CREATE INDEX "idx_user_attribution_first_touch_at" ON "user_attribution"("first_touch_at");

-- CreateIndex
CREATE INDEX "idx_user_attribution_medium" ON "user_attribution"("first_touch_medium");

-- CreateIndex
CREATE INDEX "idx_user_attribution_source" ON "user_attribution"("first_touch_source");

-- CreateIndex
CREATE INDEX "idx_user_attribution_source_medium" ON "user_attribution"("first_touch_source", "first_touch_medium");

-- CreateIndex
CREATE INDEX "idx_user_attribution_user_id" ON "user_attribution"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_memory_category" ON "user_memory"("category");

-- CreateIndex
CREATE INDEX "idx_user_memory_last_mentioned" ON "user_memory"("last_mentioned_at" DESC);

-- CreateIndex
CREATE INDEX "idx_user_memory_user_id" ON "user_memory"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_notes_created_at" ON "user_notes"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_user_notes_user_id" ON "user_notes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_birth_chart" ON "user_profiles" USING GIN ("birth_chart");

-- CreateIndex
CREATE INDEX "idx_user_profiles_location" ON "user_profiles" USING GIN ("location");

-- CreateIndex
CREATE INDEX "idx_user_profiles_personal_card" ON "user_profiles" USING GIN ("personal_card");

-- CreateIndex
CREATE INDEX "idx_user_profiles_stripe_customer_id" ON "user_profiles"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_referrals_referred_user_id_key" ON "user_referrals"("referred_user_id");

-- CreateIndex
CREATE INDEX "idx_user_referrals_code" ON "user_referrals"("referral_code");

-- CreateIndex
CREATE INDEX "idx_user_referrals_referred" ON "user_referrals"("referred_user_id");

-- CreateIndex
CREATE INDEX "idx_user_referrals_referrer" ON "user_referrals"("referrer_user_id");

-- CreateIndex
CREATE INDEX "idx_user_sessions_created_at" ON "user_sessions"("created_at");

-- CreateIndex
CREATE INDEX "idx_user_sessions_session_date" ON "user_sessions"("session_date");

-- CreateIndex
CREATE INDEX "idx_user_sessions_user_date" ON "user_sessions"("user_id", "session_date");

-- CreateIndex
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_sessions_user_timestamp" ON "user_sessions"("user_id", "session_timestamp");

-- CreateIndex
CREATE INDEX "idx_user_streaks_last_check_in" ON "user_streaks"("last_check_in");

-- CreateIndex
CREATE INDEX "idx_user_progress_user_id" ON "user_progress"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_progress_skill_tree" ON "user_progress"("skill_tree");

-- CreateIndex
CREATE UNIQUE INDEX "idx_user_progress_user_skill_unique" ON "user_progress"("user_id", "skill_tree");

-- CreateIndex
CREATE INDEX "idx_relationship_profiles_user_id" ON "relationship_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_relationship_profiles_type" ON "relationship_profiles"("relationship_type");

-- CreateIndex
CREATE INDEX "idx_synastry_reports_user_id" ON "synastry_reports"("user_id");

-- CreateIndex
CREATE INDEX "idx_synastry_reports_profile_id" ON "synastry_reports"("relationship_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_invites_invite_code_key" ON "friend_invites"("invite_code");

-- CreateIndex
CREATE INDEX "idx_friend_invites_inviter" ON "friend_invites"("inviter_id");

-- CreateIndex
CREATE INDEX "idx_friend_invites_code" ON "friend_invites"("invite_code");

-- CreateIndex
CREATE INDEX "idx_friend_invites_status" ON "friend_invites"("status");

-- CreateIndex
CREATE INDEX "idx_friend_connections_user" ON "friend_connections"("user_id");

-- CreateIndex
CREATE INDEX "idx_friend_connections_friend" ON "friend_connections"("friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_friend_connections_unique" ON "friend_connections"("user_id", "friend_id");

-- CreateIndex
CREATE INDEX "idx_celebrations_receiver" ON "friend_celebrations"("receiver_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_celebrations_sender" ON "friend_celebrations"("sender_id", "receiver_id", "milestone");

-- CreateIndex
CREATE UNIQUE INDEX "idx_video_jobs_script_id" ON "video_jobs"("script_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_video_jobs_week_topic" ON "video_jobs"("week_start", "date_key", "topic");

-- CreateIndex
CREATE INDEX "idx_video_scripts_platform" ON "video_scripts"("platform");

-- CreateIndex
CREATE INDEX "idx_video_scripts_scheduled" ON "video_scripts"("scheduled_date");

-- CreateIndex
CREATE INDEX "idx_video_scripts_status" ON "video_scripts"("status");

-- CreateIndex
CREATE INDEX "idx_videos_created_at" ON "videos"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_videos_expires_at" ON "videos"("expires_at");

-- CreateIndex
CREATE INDEX "idx_videos_status" ON "videos"("status");

-- CreateIndex
CREATE INDEX "idx_videos_type_week" ON "videos"("type", "week_number");

-- CreateIndex
CREATE INDEX "idx_weekly_ritual_usage_user_week" ON "weekly_ritual_usage"("user_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_ritual_usage_user_id_week_start_key" ON "weekly_ritual_usage"("user_id", "week_start");

-- CreateIndex
CREATE INDEX "idx_year_analysis_updated_at" ON "year_analysis"("updated_at");

-- CreateIndex
CREATE INDEX "idx_year_analysis_user_id" ON "year_analysis"("user_id");

-- CreateIndex
CREATE INDEX "idx_year_analysis_year" ON "year_analysis"("year");

-- CreateIndex
CREATE INDEX "idx_yearly_forecasts_generated_at" ON "yearly_forecasts"("generated_at");

-- CreateIndex
CREATE INDEX "idx_yearly_forecasts_updated_at" ON "yearly_forecasts"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_uploads_topic_scheduled_date_key" ON "youtube_uploads"("topic", "scheduled_date");

-- CreateIndex
CREATE INDEX "idx_feature_announcements_active" ON "feature_announcements"("is_active");

-- CreateIndex
CREATE INDEX "idx_feature_announcements_released" ON "feature_announcements"("released_at");

-- CreateIndex
CREATE INDEX "idx_feature_announcements_seen_user_id" ON "feature_announcements_seen"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_announcements_seen_user_id_announcement_id_key" ON "feature_announcements_seen"("user_id", "announcement_id");

-- CreateIndex
CREATE UNIQUE INDEX "orphaned_subscriptions_stripe_subscription_id_key" ON "orphaned_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "idx_orphaned_subscriptions_customer_id" ON "orphaned_subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "idx_orphaned_subscriptions_email" ON "orphaned_subscriptions"("customer_email");

-- CreateIndex
CREATE INDEX "idx_orphaned_subscriptions_resolved" ON "orphaned_subscriptions"("resolved");

-- CreateIndex
CREATE INDEX "idx_orphaned_subscriptions_created_at" ON "orphaned_subscriptions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_webhook_events_event_id_key" ON "stripe_webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "idx_stripe_webhook_events_event_id" ON "stripe_webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "idx_stripe_webhook_events_event_type" ON "stripe_webhook_events"("event_type");

-- CreateIndex
CREATE INDEX "idx_stripe_webhook_events_status" ON "stripe_webhook_events"("processing_status");

-- CreateIndex
CREATE INDEX "idx_stripe_webhook_events_user_id" ON "stripe_webhook_events"("user_id");

-- CreateIndex
CREATE INDEX "idx_stripe_webhook_events_created_at" ON "stripe_webhook_events"("created_at");

-- CreateIndex
CREATE INDEX "idx_subscription_audit_log_user_id" ON "subscription_audit_log"("user_id");

-- CreateIndex
CREATE INDEX "idx_subscription_audit_log_event_type" ON "subscription_audit_log"("event_type");

-- CreateIndex
CREATE INDEX "idx_subscription_audit_log_created_at" ON "subscription_audit_log"("created_at");

-- CreateIndex
CREATE INDEX "idx_subscription_audit_log_stripe_event_id" ON "subscription_audit_log"("stripe_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "pending_checkouts_user_id_key" ON "pending_checkouts"("user_id");

-- CreateIndex
CREATE INDEX "idx_pending_checkouts_user_id" ON "pending_checkouts"("user_id");

-- CreateIndex
CREATE INDEX "idx_pending_checkouts_status" ON "pending_checkouts"("status");

-- CreateIndex
CREATE INDEX "idx_pending_checkouts_expires_at" ON "pending_checkouts"("expires_at");

-- CreateIndex
CREATE INDEX "idx_metric_snapshots_period_type" ON "metric_snapshots"("period_type");

-- CreateIndex
CREATE INDEX "idx_metric_snapshots_period_start" ON "metric_snapshots"("period_start");

-- CreateIndex
CREATE INDEX "idx_native_push_active" ON "native_push_tokens"("is_active");

-- CreateIndex
CREATE INDEX "idx_native_push_user" ON "native_push_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_native_push_platform" ON "native_push_tokens"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "native_push_tokens_user_id_platform_key" ON "native_push_tokens"("user_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "community_spaces_slug_key" ON "community_spaces"("slug");

-- CreateIndex
CREATE INDEX "idx_community_spaces_type" ON "community_spaces"("space_type");

-- CreateIndex
CREATE INDEX "idx_community_spaces_slug" ON "community_spaces"("slug");

-- CreateIndex
CREATE INDEX "idx_community_spaces_active" ON "community_spaces"("is_active");

-- CreateIndex
CREATE INDEX "idx_community_posts_space" ON "community_posts"("space_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_community_posts_user" ON "community_posts"("user_id");

-- CreateIndex
CREATE INDEX "idx_community_posts_approved" ON "community_posts"("space_id", "is_approved", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_community_memberships_user" ON "community_memberships"("user_id");

-- CreateIndex
CREATE INDEX "idx_community_memberships_space" ON "community_memberships"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_memberships_space_id_user_id_key" ON "community_memberships"("space_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_date" ON "instagram_scheduled_posts"("date");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_scheduled_time" ON "instagram_scheduled_posts"("scheduled_time");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_posted" ON "instagram_scheduled_posts"("posted");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_type" ON "instagram_scheduled_posts"("type");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_date_type" ON "instagram_scheduled_posts"("date", "type");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_scheduled_posts_unique" ON "instagram_scheduled_posts"("date", "type", "scheduled_time");

-- CreateIndex
CREATE INDEX "idx_daily_metrics_date" ON "daily_metrics"("metric_date" DESC);

-- CreateIndex
CREATE INDEX "idx_daily_metrics_date_computed" ON "daily_metrics"("metric_date" DESC, "computed_at" DESC);

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "collection_folders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moon_circle_insights" ADD CONSTRAINT "moon_circle_insights_moon_circle_id_fkey" FOREIGN KEY ("moon_circle_id") REFERENCES "moon_circles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "synastry_reports" ADD CONSTRAINT "synastry_reports_relationship_profile_id_fkey" FOREIGN KEY ("relationship_profile_id") REFERENCES "relationship_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "community_spaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "community_spaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

