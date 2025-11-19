# Discord Bot Strategy for User Engagement & Conversion

## Overview

Create interactive Discord bots to engage users, drive app usage, and increase conversions through personalized cosmic interactions.

## Webhook Configuration

**User Interaction Webhook**: `DISCORD_WEBHOOK_USER_INTERACTIONS`

- Used for: User-facing bot responses, interactive notifications, engagement messages
- Set in Cloudflare Worker: ✅ Configured
- URL: Configured in Cloudflare Worker secrets

## Bot Ideas

### 1. **Daily Tarot Card Bot** 🔮

**Purpose**: Drive daily app engagement

**Features**:

- `/tarot` slash command - "What card did you pull today?"
- Responds with personalized card based on user's birth chart
- Button: "View Full Reading in Lunary" → Deep link to app
- Daily reminder: "Your daily tarot is ready! Pull your card with `/tarot`"

**Conversion Path**:

1. User pulls card in Discord
2. Bot shows preview + "Get personalized reading in Lunary"
3. Deep link to `/tarot` page with full spread
4. Encourages subscription for unlimited readings

**Implementation**:

- Discord bot with slash commands
- API endpoint: `/api/discord/tarot` (authenticates user via Discord ID)
- Stores Discord user ID → Lunary user ID mapping
- Uses existing tarot generation logic

---

### 2. **Moon Phase Impact Bot** 🌙

**Purpose**: Drive engagement during significant lunar events

**Features**:

- `/moon` slash command - "How is the moon affecting me today?"
- Personalized moon phase insights based on user's chart
- Button: "View Full Cosmic Pulse" → Deep link to app
- Auto-messages during New Moon/Full Moon: "Powerful energy today! Check your personalized impact"

**Conversion Path**:

1. User asks about moon impact
2. Bot shows personalized insight
3. "Get your full Daily Cosmic Pulse in Lunary" → Deep link
4. Encourages subscription for daily personalized insights

**Implementation**:

- Uses existing cosmic pulse generation
- Discord user → Lunary user mapping
- Scheduled messages for major moon phases

---

### 3. **Retrograde Alert Bot** ⚠️

**Purpose**: Drive engagement during retrogrades

**Features**:

- `/retrograde` slash command - "What retrogrades are affecting me?"
- Lists active retrogrades and personal impact
- Auto-alerts when retrogrades start/end
- Button: "View Full Transit Analysis" → Deep link

**Conversion Path**:

1. User checks retrograde status
2. Bot shows impact preview
3. "Get detailed transit analysis in Lunary" → Deep link
4. Encourages subscription for full birth chart analysis

---

### 4. **Birth Chart Bot** 🎂

**Purpose**: Onboard new users and drive conversions

**Features**:

- `/birthchart` slash command - "Generate my birth chart"
- Collects: birth date, time, location
- Shows preview chart
- Button: "View Full Chart in Lunary" → Creates account + deep link

**Conversion Path**:

1. User generates chart in Discord
2. Bot creates Lunary account (if doesn't exist)
3. Shows chart preview
4. "Unlock full features: houses, transits, forecasts" → Subscription CTA

**Implementation**:

- Discord OAuth integration
- Auto-account creation
- Uses existing birth chart generation

---

### 5. **Daily Cosmic Check-In Bot** ✨

**Purpose**: Daily engagement habit formation

**Features**:

- `/checkin` slash command - "What's my cosmic energy today?"
- Personalized daily message based on transits
- Streak tracking: "You've checked in 7 days in a row! 🌟"
- Leaderboard: "Top cosmic check-ins this week"

**Conversion Path**:

1. Daily habit formation
2. After 3-7 days: "Unlock unlimited check-ins + full insights"
3. Subscription CTA

---

### 6. **Community Challenges Bot** 🎯

**Purpose**: Community engagement + conversion

**Features**:

- `/challenge` slash command - "Join this week's cosmic challenge"
- Weekly challenges: "New Moon Intention Setting", "Full Moon Release Ritual"
- Participants share results
- Winners get free month subscription

**Conversion Path**:

1. Community engagement
2. "Unlock all challenges + personalized guidance"
3. Subscription CTA

---

## Technical Implementation

### Architecture

```
Discord Bot (Node.js)
    ↓
Discord API (slash commands, buttons, modals)
    ↓
Lunary API (/api/discord/*)
    ↓
PostgreSQL (user mapping, preferences)
    ↓
Existing Services (tarot, cosmic pulse, birth charts)
```

### Required Components

1. **Discord Bot Application**
   - Create at https://discord.com/developers/applications
   - Bot token
   - OAuth2 credentials (for account linking)

2. **API Endpoints**
   - `/api/discord/tarot` - Generate tarot card
   - `/api/discord/moon` - Get moon phase impact
   - `/api/discord/retrograde` - Get retrograde info
   - `/api/discord/birthchart` - Generate birth chart
   - `/api/discord/checkin` - Daily check-in
   - `/api/discord/link` - Link Discord account to Lunary

3. **Database Tables**

   ```sql
   CREATE TABLE discord_users (
     discord_id TEXT PRIMARY KEY,
     lunary_user_id TEXT REFERENCES users(id),
     linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     preferences JSONB
   );
   ```

4. **Bot Framework**
   - Use `discord.js` (Node.js)
   - Deploy on Cloudflare Workers or separate Node.js server
   - Handle slash commands, buttons, modals

### Conversion Tracking

Track Discord → App conversions:

- Discord user ID → Lunary user ID mapping
- Track: command usage, button clicks, deep link visits
- Measure: conversion rate from Discord to subscription

---

## Quick Start: Daily Tarot Bot

### Step 1: Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Create new application → "Lunary Tarot Bot"
3. Bot → Add Bot → Copy token
4. OAuth2 → Add redirect: `https://lunary.app/api/discord/oauth/callback`
5. Install bot to server with permissions:
   - Slash Commands
   - Send Messages
   - Embed Links
   - Use External Emojis

### Step 2: Environment Variables

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_GUILD_ID=your_server_id_here
```

### Step 3: Create Bot Handler

Create `src/app/api/discord/bot/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

export async function POST(request: NextRequest) {
  const interaction = await request.json();

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if (interaction.data.name === 'tarot') {
      // Get user's Discord ID
      const discordUserId = interaction.member.user.id;

      // Look up Lunary user (or create account)
      // Generate tarot card
      // Return embed with button

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: '🔮 Your Daily Tarot',
              description: 'The Moon - Intuition and hidden emotions',
              color: 0x6366f1,
            },
          ],
          components: [
            {
              type: 1, // ACTION_ROW
              components: [
                {
                  type: 2, // BUTTON
                  style: 5, // LINK
                  label: 'View Full Reading in Lunary',
                  url: `https://lunary.app/tarot?discord=${discordUserId}`,
                },
              ],
            },
          ],
        },
      });
    }
  }

  return NextResponse.json({ type: InteractionResponseType.PONG });
}
```

### Step 4: Register Slash Commands

Use Discord API to register commands:

```typescript
// scripts/register-discord-commands.ts
const commands = [
  {
    name: 'tarot',
    description: 'Pull your daily tarot card',
  },
  {
    name: 'moon',
    description: 'How is the moon affecting you today?',
  },
];

// POST to https://discord.com/api/v10/applications/{APPLICATION_ID}/commands
```

---

## Conversion Funnel

```
Discord User
    ↓
Uses Bot Command (/tarot, /moon, etc.)
    ↓
Sees Preview + "View Full in Lunary" Button
    ↓
Clicks Button → Deep Link to App
    ↓
Views Full Content (limited)
    ↓
"Unlock Unlimited" CTA
    ↓
Subscription Conversion
```

---

## Metrics to Track

- **Engagement**: Commands used per user per day
- **Conversion**: Discord users → Lunary signups
- **Retention**: Daily active Discord users
- **Revenue**: Discord → Subscription conversions

---

## Next Steps

1. **Start Small**: Implement `/tarot` bot first
2. **Test**: Deploy to test server, gather feedback
3. **Iterate**: Add more commands based on usage
4. **Scale**: Add community features, challenges
5. **Optimize**: A/B test CTAs, conversion flows

---

## Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Discord API Documentation](https://discord.com/developers/docs)
- [Discord Slash Commands Guide](https://discord.com/developers/docs/interactions/application-commands)
- [Cloudflare Workers Discord Bot Example](https://developers.cloudflare.com/workers/examples/discord-bot/)
