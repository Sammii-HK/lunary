# Lunary

Next.js 15 application combining real-time astronomical data with personalized guidance, digital products, and automated content generation.

[Live Site](https://lunary.app)

## Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Better Auth, Vercel Postgres, Vercel Blob, Stripe, Resend
- **Calculations**: Astronomy Engine (planetary positions, moon phases)
- **Infrastructure**: Vercel (hosting, cron), Cloudflare Workers (notifications)
- **Automation**: PDF generation (pdf-lib), OG images, automated content generation

## Features

**User**: Birth charts, horoscopes, tarot readings, moon phases, planetary ephemeris, grimoire library, digital product shop, PWA with push notifications

**Admin**: Blog/newsletter management, shop manager with Stripe sync, social media scheduler, automated cron jobs

## Architecture

```
PWA → Better Auth → Next.js API → Stripe/Resend/Blob/Postgres
```

## Automation

- **Cron**: Daily posts (8 AM UTC), weekly blog/newsletter, moon pack generation
- **Workers**: 4-hourly cosmic event notifications (Cloudflare)
- **Stripe**: Automated product sync as SSOT

## E-Commerce

PDF generation → Vercel Blob upload → Stripe sync → Token-based downloads with limits/expiry

## Development

```bash
yarn install
yarn dev
```

**Structure**: `src/app/`, `src/components/`, `src/lib/`, `utils/`, `scripts/`, `sql/`

**Quality**: TypeScript strict, ESLint + Prettier, Husky pre-commit hooks

## License

Proprietary - All Rights Reserved. Copyright (c) 2024 Lunary.
