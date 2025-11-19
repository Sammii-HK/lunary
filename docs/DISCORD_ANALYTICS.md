# Discord Bot Analytics - Tracking & Metrics

## Overview

Track all Discord bot interactions to measure engagement, conversion rates, and optimize the bot experience.

## What We Track

### 1. **Command Usage**

- Which commands users run (`/tarot`, `/moon`, `/retrograde`, etc.)
- How many times each command is used
- Unique users per command
- Linked vs unlinked users

### 2. **Button Clicks**

- Which buttons users click
- Where they're going (destination URLs)
- Feature being accessed
- Campaign tracking

### 3. **Account Linking**

- When Discord accounts link to Lunary accounts
- Account creation via Discord
- Conversion from Discord → Lunary user

### 4. **Conversion Funnel**

- Commands → Button Clicks → Account Links → Subscriptions
- Click-through rates
- Link rates
- Conversion rates

## Database Table

**Table**: `analytics_discord_interactions`

**Fields**:

- `discord_id` - Discord user ID
- `lunary_user_id` - Linked Lunary account (if exists)
- `interaction_type` - 'command', 'button_click', 'account_linked', 'account_created'
- `command_name` - Which command was used
- `button_action` - Which button was clicked
- `destination_url` - Where button links to
- `feature` - Feature being accessed (tarot, moon, etc.)
- `campaign` - Campaign name (daily_tarot, new_moon_challenge, etc.)
- `metadata` - Additional data (JSONB)
- `created_at` - Timestamp

## Tracking Functions

### Track Command Usage

```typescript
import { trackDiscordInteraction } from '@/lib/analytics/tracking';

await trackDiscordInteraction({
  discordId: '123456789',
  lunaryUserId: 'user-uuid', // If linked
  interactionType: 'command',
  commandName: 'tarot',
  feature: 'tarot',
  campaign: 'daily_tarot',
  metadata: {
    card_name: 'The Moon',
    personalized: true,
  },
});
```

### Track Button Clicks

```typescript
await trackDiscordInteraction({
  discordId: '123456789',
  lunaryUserId: 'user-uuid',
  interactionType: 'button_click',
  buttonAction: 'view_full_reading',
  destinationUrl: 'https://lunary.app/tarot?discord=123456789&source=discord',
  feature: 'tarot',
  campaign: 'daily_tarot',
});
```

### Track Account Linking

```typescript
await trackDiscordInteraction({
  discordId: '123456789',
  lunaryUserId: 'user-uuid',
  interactionType: 'account_linked',
  metadata: {
    method: 'oauth',
    linked_at: new Date().toISOString(),
  },
});
```

### Track Account Creation

```typescript
await trackDiscordInteraction({
  discordId: '123456789',
  lunaryUserId: 'user-uuid',
  interactionType: 'account_created',
  metadata: {
    source: 'discord_bot',
    command: 'birthchart',
  },
});
```

## Analytics API

**Endpoint**: `/api/analytics/discord-interactions`

**Query Parameters**:

- `range` - Time range: `24h`, `7d`, `30d` (default: `7d`)
- `groupBy` - Group by: `command`, `feature`, `campaign` (default: `command`)

**Response**:

```json
{
  "success": true,
  "range": "7d",
  "stats": {
    "commands": [
      {
        "command_name": "tarot",
        "total_uses": 150,
        "unique_users": 45,
        "linked_users": 30
      }
    ],
    "buttons": [
      {
        "button_action": "view_full_reading",
        "feature": "tarot",
        "clicks": 120,
        "unique_users": 35
      }
    ],
    "funnel": {
      "totalCommands": 500,
      "buttonClicks": 350,
      "accountsLinked": 100,
      "accountsCreated": 50,
      "clickThroughRate": "70.0",
      "linkRate": "20.0"
    },
    "conversions": {
      "total": 15,
      "uniqueUsers": 12
    },
    "topFeatures": [
      {
        "feature": "tarot",
        "interactions": 200,
        "unique_users": 60
      }
    ]
  }
}
```

## Key Metrics

### Engagement Metrics

- **Daily Active Discord Users** - Users who run commands daily
- **Command Usage** - Total commands per day/week/month
- **Most Popular Commands** - Which features drive engagement

### Conversion Metrics

- **Click-Through Rate** - Commands → Button Clicks
- **Link Rate** - Commands → Account Links
- **Conversion Rate** - Discord → Subscriptions
- **Feature Conversion** - Which features drive subscriptions

### Funnel Analysis

```
Discord Command
    ↓ (70% CTR)
Button Click
    ↓ (20% link rate)
Account Linked
    ↓ (15% conversion rate)
Subscription
```

## Integration Points

### When Bot Responds to Command

```typescript
// In Discord bot handler
await trackDiscordInteraction({
  discordId: interaction.member.user.id,
  lunaryUserId: linkedUserId, // If exists
  interactionType: 'command',
  commandName: 'tarot',
  feature: 'tarot',
  campaign: 'daily_tarot',
});
```

### When User Clicks Button

```typescript
// Track button click when user clicks "View Full Reading"
await trackDiscordInteraction({
  discordId: userId,
  lunaryUserId: linkedUserId,
  interactionType: 'button_click',
  buttonAction: 'view_full_reading',
  destinationUrl: deepLinkUrl,
  feature: 'tarot',
  campaign: 'daily_tarot',
});
```

### When User Subscribes

```typescript
// In conversion tracking
await trackConversion('subscription_started', {
  userId,
  userEmail,
  metadata: {
    source: 'discord',
    feature: 'tarot',
    campaign: 'daily_tarot',
    discord_id: discordId,
  },
});
```

## Dashboard Queries

### Most Engaging Commands

```sql
SELECT
  command_name,
  COUNT(*) as uses,
  COUNT(DISTINCT discord_id) as users
FROM analytics_discord_interactions
WHERE interaction_type = 'command'
AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY command_name
ORDER BY uses DESC;
```

### Conversion Funnel

```sql
SELECT
  COUNT(DISTINCT CASE WHEN interaction_type = 'command' THEN discord_id END) as commands,
  COUNT(DISTINCT CASE WHEN interaction_type = 'button_click' THEN discord_id END) as clicks,
  COUNT(DISTINCT CASE WHEN interaction_type = 'account_linked' THEN discord_id END) as linked
FROM analytics_discord_interactions
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Discord → Subscription Conversions

```sql
SELECT
  COUNT(*) as conversions,
  COUNT(DISTINCT user_id) as users
FROM conversion_events
WHERE metadata->>'source' = 'discord'
AND event_type IN ('trial_converted', 'subscription_started')
AND created_at >= NOW() - INTERVAL '30 days';
```

## Benefits

1. **Optimize Bot Experience** - See which commands drive engagement
2. **Measure Conversion** - Track Discord → App → Subscription funnel
3. **A/B Test Messages** - Test different CTAs and measure results
4. **Identify Drop-offs** - See where users leave the funnel
5. **ROI Tracking** - Measure Discord bot investment vs revenue
