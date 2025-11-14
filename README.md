# Lunary

Next.js 15 full-stack application delivering personalized astrological insights, automated content generation, and digital product commerce using real-time astronomical calculations.

[Live Site](https://lunary.app)

<img width="1708" height="980" alt="Screenshot 2025-10-31 at 13 33 06" src="https://github.com/user-attachments/assets/de39dcf4-92b6-41dc-90dd-5d6deeb1e8c5" />

## Tech Stack

**Framework**: Next.js 15, React 18, TypeScript, Node.js

**Frontend**: Tailwind CSS, Radix UI, Service Workers, Web Push API, Satori

**Backend**: Better Auth, PostgreSQL, Vercel Blob Storage, Prisma ORM

**Payments**: Stripe

**Services**: Brevo (Email), Astronomy Engine, pdf-lib

**AI**: OpenAI GPT-4o-mini (chat, content generation, conversion optimization)

**Infrastructure**: Vercel, Cloudflare Workers

**Tooling**: ESLint, Prettier, Husky

## Features

### User Features

**Astronomical Data**: Real-time moon phases with constellation positions, planetary ephemeris, retrograde tracking, birth chart analysis with house calculations, transit-based horoscopes, personalized tarot readings

**Content**: Comprehensive grimoire library (crystals, spells, numerology, chakras, runes), weekly blog with planetary highlights, newsletter subscriptions

**AI Chat**: Personalized astro-tarot companion ("Book of Shadows") with context-aware responses, conversation history persistence, streaming responses, plan-based usage limits, memory system for long-term context

**Commerce**: Digital product shop with secure token-based downloads, PWA with offline support, push notifications for cosmic events (retrogrades, ingresses, moon phases)

### Admin Features

**Content Management**: Automated weekly blog generation with planetary highlights, newsletter manager with subscriber segmentation, social media scheduler (Instagram, X, Bluesky, Reddit, Pinterest)

**Shop Management**: Programmatic pack generation (PDF + OG images), automatic Stripe product creation and sync, scheduled moon pack generation (monthly/quarterly/yearly)

**Automation**: Multi-frequency cron jobs with execution deduplication, cosmic event detection and notification dispatch

**AI Tools**: Conversion optimization with personalized CTAs, churn prediction, A/B test insights, email copy optimization, funnel analysis

## Technical Implementation

### Astronomical Calculations

Real-time planetary position calculations using Astronomy Engine with ecliptic coordinate transformations. Detects retrogrades through velocity analysis (comparing current vs. historical positions), calculates major/minor aspects (conjunctions, oppositions, trines, squares), tracks sign ingresses and moon phase transitions.

**Performance**: Calculations run server-side to minimize client load, cached where appropriate for frequently accessed data.

### Automated Content Generation

**Weekly Content**: Generates blog posts and newsletters with planetary highlights, retrograde changes, daily forecasts, and crystal recommendations based on current transits.

**Social Posts**: Daily automated posts with dynamic OG images showing real-time cosmic data, scheduled across multiple platforms via API integrations.

**Moon Packs**: Automated PDF generation for monthly/quarterly/yearly packs with real astronomical data, generated months in advance (3 months for monthly, 1 quarter ahead for quarterly, 6 months before year starts for yearly).

### E-Commerce System

**Pack Generation Flow**:

1. Content generation based on category (moon phases, crystals, spells)
2. PDF creation using pdf-lib with professional formatting
3. Upload to Vercel Blob with private access
4. Stripe product creation with blob URL in metadata (SSOT)
5. OG image generation for social previews

**Purchase Flow**:

1. User initiates checkout → Secure token generation
2. Stripe Checkout Session creation with metadata
3. Webhook processing on payment completion
4. Purchase record creation with download limits (5 attempts, 30-day expiry)
5. Token-based download endpoint with signed URL generation

**Security**: Tokens are cryptographically random, validated on each download attempt, signed URLs expire after use.

### Notification System

**Push Notifications**: Web Push API with VAPID keys, service worker registration, subscription management in PostgreSQL.

**Event Detection**: 4-hourly Cloudflare Worker cron checks for cosmic events (retrograde starts/ends, sign ingresses, significant moon phases), automatic subscription cleanup for invalid endpoints (410, expired tokens).

**Delivery**: Parallel notification dispatch with Promise.allSettled for error handling, tracks delivery success/failure, marks inactive subscriptions.

### Automation & Cron Jobs

**Daily Posts** (8 AM UTC - Vercel Cron):

- Generates daily social media posts with dynamic cosmic data
- Creates OG images via internal API calls
- Schedules posts across platforms with proper timing buffers

**Weekly Content** (Sundays):

- Blog post generation with planetary highlights
- Newsletter content creation and bulk email dispatch

**Moon Packs** (Scheduled - Vercel Cron):

- Monthly: 15th of month, generates 3 months ahead
- Quarterly: 15th of Jan/Apr/Jul/Oct, generates next quarter
- Yearly: July 1st, generates next year's pack
- Automatic deactivation of packs older than 2 years

**Notifications** (Every 4 hours - Cloudflare Worker):

- Checks for cosmic events requiring notifications
- Filters subscribers by event preferences
- Sends batch notifications with retry logic

**Execution Safety**: Atomic check-and-set operations prevent duplicate cron execution, in-memory tracking with automatic cleanup (7-day retention).

### AI Chat System

**Architecture**: Server-side streaming with Server-Sent Events (SSE), context-aware responses using user's birth chart, transits, tarot history, and mood data.

**Features**:

- **Streaming Responses**: Real-time token streaming via SSE for responsive UX
- **Context Building**: Dynamically assembles astrological context (birth chart, current transits, moon phase, tarot readings, mood history)
- **Conversation Threads**: Persistent thread storage in PostgreSQL with user-specific localStorage keys
- **Memory System**: Long-term memory snippets for personalized responses across conversations
- **Plan-Based Limits**: Tiered daily message limits (free: 3, Lunary+: 50, Lunary+ AI: 300)
- **Rate Limiting**: IP and user-level rate limiting to prevent abuse
- **Assist Commands**: Special commands for specific actions (e.g., `/horoscope`, `/transits`)

**Database Schema**:

- `ai_threads`: Stores conversation threads with JSONB messages
- `ai_usage`: Tracks daily usage per user with token counting
- Automatic table creation via setup script

**Security**: User authentication required, thread ownership validation, debounced input handling (500ms), prevents duplicate sends during streaming.

## Security

- **Authentication**: Better Auth with session management
- **Download Tokens**: Cryptographically random tokens, validated server-side
- **Cron Protection**: Bearer token authentication for all cron endpoints
- **Blob Access**: Private storage with signed URLs, time-limited access
- **Stripe Webhooks**: Signature verification for all webhook events

## Development

```bash
pnpm install
pnpm dev
```

**Code Quality**: TypeScript strict mode, ESLint + Prettier, Husky pre-commit hooks

## Deployment

**Vercel**: Framework auto-detection, cron jobs configured in `vercel.json`, environment variables via dashboard

**Cloudflare Worker**: Handles notification checks independently from main application, free tier sufficient for usage patterns

## License

Proprietary - All Rights Reserved. Copyright (c) 2025 Lunary.
