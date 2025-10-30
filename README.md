# Lunary

Spiritual technology platform combining real-time astronomical data with personalized guidance, digital products, and automated content creation.

[Live Site](https://lunary.app)

## Overview

Full-stack Next.js 15 application delivering personalized cosmic insights, digital products, and automated content based on real-time astronomical calculations.

**Key Capabilities:**

- Real-time astronomical calculations using Astronomy Engine
- Personalized birth chart analysis and horoscopes
- Automated content generation (blog, newsletter, social posts)
- E-commerce with Stripe integration
- PWA with push notifications

## Technology Stack

**Frontend & Framework**

- Next.js 15 (App Router, Server Components)
- React 18, TypeScript
- Tailwind CSS, Radix UI
- PWA with Service Workers

**Backend & Services**

- Better Auth (authentication)
- Database adapter for user data
- Vercel Postgres (subscriptions, newsletter)
- Vercel Blob (digital products)
- Stripe (payments, SSOT)
- Resend (email delivery)
- Web Push API (notifications)

**Calculations & Automation**

- Astronomy Engine (planetary positions, moon phases)
- Automated blog generation
- PDF generation (pdf-lib)
- OG image generation

**Infrastructure**

- Vercel (hosting, edge functions, cron)
- Cloudflare Workers (notification cron)
- PostgreSQL (Vercel Postgres)

## Features

### User Features

- Real-time moon phases with constellation positions
- Planetary ephemeris and retrograde tracking
- Birth chart analysis with interpretations
- Personalized horoscopes based on transits
- Tarot readings with personalization
- Grimoire reference library (crystals, spells, numerology, chakras, runes)
- Digital product shop with secure downloads
- PWA with push notifications for cosmic events

### Admin Features

- Blog manager with automated weekly generation
- Newsletter manager with subscriber management
- Shop manager for digital pack generation and Stripe sync
- Automated cron jobs (daily posts, moon packs, notifications)
- Social media scheduler (Instagram, X, Bluesky, Reddit, Pinterest)
- Content generation tools

## Architecture

```
Client (PWA)
  ↓
Better Auth + Database
  ↓
Next.js API Layer (Astro, Shop, Blog APIs)
  ↓
External Services (Stripe, Resend, Blob, PostgreSQL)
```

## Automated Systems

- **Daily Posts**: Cron job runs at 8 AM UTC (Vercel)
- **Weekly Blog**: Automated generation with planetary highlights
- **Newsletter**: Weekly distribution via Resend bulk API
- **Moon Packs**: Scheduled generation (monthly, quarterly, yearly)
- **Notifications**: 4-hourly checks for cosmic events (Cloudflare Worker)
- **Stripe Sync**: Automated product sync as Single Source of Truth

## E-Commerce Flow

1. Pack generation creates PDF content
2. Uploads to Vercel Blob storage
3. Syncs product details to Stripe (SSOT)
4. Token-based secure downloads after purchase
5. Download limits and expiry enforced

## Deployment

**Vercel**

- Framework auto-detection
- Cron jobs in `vercel.json`
- Environment variables in dashboard

**Cloudflare Worker**

- Handles notification checks every 4 hours
- Free tier sufficient for usage

## Development

```bash
git clone https://github.com/sammi-hk/lunary.git
cd lunary
yarn install
yarn dev
```

**Code Quality**

- TypeScript strict mode
- ESLint + Prettier
- Pre-commit hooks (Husky)

**Project Structure**

```
src/app/          # Next.js App Router
src/components/   # React components
src/lib/          # Shared libraries
utils/            # Utility functions
scripts/          # Automation scripts
sql/              # Database schemas
```

## License

Proprietary - All Rights Reserved. Copyright (c) 2024 Lunary.

Contributions welcome. By contributing, you agree that your contributions will be licensed under the same proprietary license.

## Support

- GitHub: [Issues](https://github.com/Sammii-HK/lunary)
- Email: help@lunary.app

## Roadmap

### Planned Features

- [ ] Enhanced birth chart interpretations
- [ ] Community features (user-generated content)
- [ ] Mobile app (React Native)
- [ ] Social sharing for personalised readings
- [ ] API for third-party integrations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

Built by the Lunary team
