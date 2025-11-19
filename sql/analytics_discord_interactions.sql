-- Analytics Discord Interactions Table
-- Tracks Discord bot command usage, button clicks, and conversions

CREATE TABLE IF NOT EXISTS analytics_discord_interactions (
  id SERIAL PRIMARY KEY,
  discord_id TEXT NOT NULL,
  lunary_user_id TEXT,
  interaction_type TEXT NOT NULL, -- 'command', 'button_click', 'account_linked', 'account_created'
  command_name TEXT, -- 'tarot', 'moon', 'retrograde', 'birthchart', 'checkin'
  button_action TEXT, -- 'view_full_reading', 'upgrade', 'link_account'
  destination_url TEXT, -- Where the button links to
  source TEXT DEFAULT 'discord', -- Always 'discord' for this table
  feature TEXT, -- 'tarot', 'moon', 'birth_chart', etc.
  campaign TEXT, -- 'daily_tarot', 'new_moon_challenge', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_discord_id 
  ON analytics_discord_interactions(discord_id);
CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_lunary_user_id 
  ON analytics_discord_interactions(lunary_user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_type 
  ON analytics_discord_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_command 
  ON analytics_discord_interactions(command_name);
CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_created_at 
  ON analytics_discord_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_discord_interactions_feature 
  ON analytics_discord_interactions(feature);

-- Example queries:
-- Most popular Discord commands
-- SELECT command_name, COUNT(*) as count
-- FROM analytics_discord_interactions
-- WHERE interaction_type = 'command'
-- AND created_at >= NOW() - INTERVAL '7 days'
-- GROUP BY command_name
-- ORDER BY count DESC;

-- Discord → App conversion rate
-- SELECT 
--   COUNT(DISTINCT CASE WHEN interaction_type = 'command' THEN discord_id END) as commands,
--   COUNT(DISTINCT CASE WHEN interaction_type = 'button_click' THEN discord_id END) as button_clicks,
--   COUNT(DISTINCT CASE WHEN button_action LIKE '%upgrade%' THEN discord_id END) as upgrade_clicks
-- FROM analytics_discord_interactions
-- WHERE created_at >= NOW() - INTERVAL '7 days';

-- Discord → Subscription conversions
-- SELECT COUNT(*) as conversions
-- FROM conversion_events
-- WHERE metadata->>'source' = 'discord'
-- AND event_type IN ('trial_converted', 'subscription_started')
-- AND created_at >= NOW() - INTERVAL '30 days';

