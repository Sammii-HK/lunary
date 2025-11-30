# Stripe Account Migration Guide

Migrate all Stripe products from old account to new company Stripe account (Lunar Computing, Inc.).

## Prerequisites

- Access to both old and new Stripe accounts
- API keys for both accounts
- Node.js and pnpm installed

## Environment Variables

### Required for Migration

```bash
# For export (old account)
OLD_STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for test mode

# For import (new account)
NEW_STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for test mode
```

### Variables to Update After Migration

After migration, update these in `.env.local` and Vercel:

```bash
# API Keys (replace with new account keys)
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Webhook Secrets (create new webhooks in Stripe dashboard)
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_WEBHOOK_SECRET_SHOP=whsec_xxx

# Price IDs (will be output by import script)
NEXT_PUBLIC_STRIPE_LUNARY_PLUS_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_ANNUAL_PRICE_ID=price_xxx
```

## Migration Steps

### Step 1: Export Products from Old Account

Set your old Stripe secret key and run the export:

```bash
# Option A: Set temporarily in terminal
OLD_STRIPE_SECRET_KEY=sk_live_xxx tsx scripts/migrate-stripe/export-products.ts

# Option B: Add to .env.local temporarily
echo "OLD_STRIPE_SECRET_KEY=sk_live_xxx" >> .env.local
tsx scripts/migrate-stripe/export-products.ts
```

This creates `scripts/migrate-stripe/exported-products.json` with all products and prices.

### Step 2: Import Products to New Account

Set your new Stripe secret key and run the import:

```bash
# Dry run first to verify
NEW_STRIPE_SECRET_KEY=sk_live_xxx tsx scripts/migrate-stripe/import-products.ts --dry-run

# Actual import
NEW_STRIPE_SECRET_KEY=sk_live_xxx tsx scripts/migrate-stripe/import-products.ts
```

This creates `scripts/migrate-stripe/id-mapping.json` with old-to-new ID mappings.

### Step 3: Update Environment Variables

1. Copy the environment variables output by the import script
2. Update `.env.local` with new values
3. Update Vercel environment variables

### Step 4: Create Webhooks in New Stripe Account

In Stripe Dashboard > Developers > Webhooks:

**Subscription Webhook:**

- Endpoint URL: `https://lunary.app/api/stripe/webhooks`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

**Shop Webhook:**

- Endpoint URL: `https://lunary.app/api/shop/webhooks`
- Events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`

Copy the webhook signing secrets to your environment variables.

### Step 5: Regenerate Price Mapping

```bash
# Update STRIPE_SECRET_KEY to new account first
pnpm generate-price-mapping
```

This updates `utils/stripe-prices.ts` with new price IDs.

### Step 6: Deploy

```bash
# Commit changes
git add .
git commit -m "chore: migrate to new Stripe account (Lunar Computing, Inc.)"

# Deploy to Vercel
git push origin main
```

## Verification

1. Check Stripe dashboard for new products and prices
2. Test checkout flow in test mode first
3. Verify webhooks are receiving events
4. Test subscription management (portal, cancellation)

## Notes

- User data is NOT affected (tracked by `user_id`, not Stripe IDs)
- Existing subscriptions on old account continue working
- One paying customer can be manually migrated by canceling old and starting new

## Files Created

- `export-products.ts` - Exports products from old account
- `import-products.ts` - Imports products to new account
- `exported-products.json` - Product data (generated)
- `id-mapping.json` - Old-to-new ID mapping (generated)
