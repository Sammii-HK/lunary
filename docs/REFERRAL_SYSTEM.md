# Referral System

## Overview

Users share a unique referral code. When a new user signs up with that code and completes their first meaningful action, both the referrer and the referred user receive 30 days of Pro access. Referrers earn additional tiered rewards as they accumulate activated referrals.

## How It Works

1. **Code generation** — Authenticated user generates an 8-character alphanumeric referral code (max 1 per user, up to 50 uses)
2. **Sharing** — User shares `lunary.app/signup?ref=CODE` via copy, native share, or direct link
3. **Sign-up** — New user lands on signup with `?ref=CODE` query param, code is passed through Stripe subscription metadata
4. **Recording** — On `customer.subscription.created` webhook, `processReferralCode()` records the relationship in `user_referrals` (reward is NOT granted yet)
5. **Activation** — When the referred user completes their first qualifying action, `checkInviteActivation()` runs fraud checks and grants rewards to both users

## Activation Events

A referral activates when the referred user completes any of:

- `tarot_spread_completed`
- `journal_entry_created`
- `daily_ritual_completed`

Activation is checked by calling `checkInviteActivation(userId)` from the respective API endpoints.

## Rewards

### Immediate Reward (Both Users)

Both the referrer and referred user receive **30 days of Pro access** (`REFERRAL_TRIAL_DAYS = 30`).

- If the user has an active Stripe subscription, a coupon is applied
- If no subscription exists, a trial subscription is created

### Tiered Rewards (Referrer Only)

Referrers unlock milestone rewards based on total **activated** referral count:

| Threshold | Tier Name        | Reward                           |
| --------- | ---------------- | -------------------------------- |
| 1         | Cosmic Seed      | Profile badge                    |
| 3         | Star Weaver      | 1 week Pro                       |
| 5         | Cosmic Connector | Houses Spread unlock + badge     |
| 10        | Celestial Guide  | 1 month Pro + profile glow       |
| 15        | Star Architect   | Shadow Work Spread (exclusive)   |
| 25        | Galaxy Keeper    | 3 months Pro + title             |
| 50        | Founding Star    | 6 months Pro + title + cosmetics |

Tier processing happens automatically after each activation via `processReferralTierRewards()`.

## Anti-Fraud Guards

Located in `src/lib/referrals/check-activation.ts`:

- **Account age gate** — Referred account must be >1 hour old
- **Velocity cap** — Max 3 activations per referrer per 24 hours
- **IP deduplication** — Same IP cannot activate multiple referrals for the same referrer
- **Self-referral prevention** — Referrer and referred user cannot be the same person

## Database Schema

### `referral_codes`

| Column       | Type             | Description                   |
| ------------ | ---------------- | ----------------------------- |
| `id`         | int              | Primary key                   |
| `code`       | varchar (unique) | 8-char alphanumeric code      |
| `user_id`    | varchar          | Owner of the code             |
| `uses`       | int              | Current usage count           |
| `max_uses`   | int              | Max allowed uses (default 50) |
| `campaign`   | varchar?         | Optional campaign tag         |
| `created_at` | timestamp        | Creation date                 |

### `user_referrals`

| Column              | Type             | Description                               |
| ------------------- | ---------------- | ----------------------------------------- |
| `id`                | int              | Primary key                               |
| `referrer_user_id`  | varchar          | User who shared the code                  |
| `referred_user_id`  | varchar (unique) | New user who signed up                    |
| `referral_code`     | varchar          | Code that was used                        |
| `activated`         | boolean          | Whether the referral completed activation |
| `activated_at`      | timestamp?       | When activation occurred                  |
| `activation_event`  | varchar?         | Which event triggered activation          |
| `reward_granted`    | boolean          | Whether both users received reward        |
| `reward_granted_at` | timestamp?       | When reward was granted                   |
| `reward_tier`       | int?             | Which tier threshold was last triggered   |
| `created_at`        | timestamp        | When referral was recorded                |

## API Routes

| Method | Path                            | Auth     | Purpose                                                      |
| ------ | ------------------------------- | -------- | ------------------------------------------------------------ |
| `GET`  | `/api/referrals`                | Yes      | Dashboard data (code, stats, tiers, progress)                |
| `POST` | `/api/referrals`                | Yes      | Generate or retrieve referral code                           |
| `GET`  | `/api/referrals/code?userId=X`  | No       | Get existing code for a user                                 |
| `POST` | `/api/referrals/code`           | Yes      | Generate new code                                            |
| `POST` | `/api/referrals/use`            | Internal | Apply referral code to new user (called from Stripe webhook) |
| `GET`  | `/api/referrals/stats?userId=X` | No       | Basic stats (used by marketing components)                   |
| `GET`  | `/api/referrals/rewards`        | Yes      | Earned milestones/badges                                     |

## UI Components

| Component              | Location                                            | Purpose                                        |
| ---------------------- | --------------------------------------------------- | ---------------------------------------------- |
| `ReferralDashboard`    | `src/components/referrals/ReferralDashboard.tsx`    | Full dashboard with stats, code, tier progress |
| `ReferralProgram`      | `src/components/ReferralProgram.tsx`                | Marketing component for pricing/homepage       |
| `ReferralTierProgress` | `src/components/referrals/ReferralTierProgress.tsx` | Tier milestone progress bar                    |
| Referral page          | `src/app/(authenticated)/referrals/page.tsx`        | `/referrals` dashboard page                    |

## Key Files

| File                                      | Purpose                                                           |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `src/lib/referrals.ts`                    | Core functions (generate, validate, process, grant reward, stats) |
| `src/lib/referrals/check-activation.ts`   | Activation logic with fraud guards                                |
| `src/utils/referrals/reward-tiers.ts`     | Tier definitions and thresholds                                   |
| `src/utils/referrals/reward-processor.ts` | Tier reward granting logic                                        |

## Analytics Events

Tracked via PostHog:

- `referralCodeGenerated(userId)`
- `referralLinkCopied(userId)`
- `referralLinkShared(userId, platform)`
- Activation and reward events tracked through `conversionTracking`
