# Conversion Features Summary

## ✅ Implemented Features

### 1. Trial Expired Discount

- **Discount Code**: `TRIAL20` (20% off first month)
- **Email**: Sent automatically when trial expires
- **Usage**: Users can enter code at checkout
- **Next Step**: Create Stripe coupon `TRIAL20` in Stripe dashboard

### 2. Referral Program

- **How it works**: Users get unique referral codes
- **Reward**: Both referrer and new user get 1 month free
- **Location**: Profile page → Referral Program section
- **Tracking**: Full stats (total referrals, active referrals)
- **Database**: `sql/referrals.sql` needs to be run

### 3. A/B Testing

- **Method**: localStorage-based (free, no external service)
- **Location**: `src/lib/ab-testing.ts`
- **Current Tests**:
  - Pricing CTA text (variant A vs B)
- **Tracking**: Integrated with analytics
- **Docs**: See `docs/AB_TESTING.md`

### 4. Push Notifications ✅ Already Great!

You already have excellent push notifications:

- **Daily cosmic events** (moon phases, retrogrades, planetary transits)
- **Personalized tarot** notifications
- **Event-based** notifications via cron
- **User preferences** for filtering

## 📋 Setup Required

### 1. Create Stripe Coupon

```bash
# In Stripe Dashboard or via API:
# Create coupon "TRIAL20" with 20% off, one-time use
```

### 2. Run Database Migrations

```sql
-- Run sql/referrals.sql to create referral tables
```

### 3. Test Referral Flow

1. User A signs up → gets referral code
2. User B uses referral link → starts trial
3. Both get 1 month free

## 🎯 Next Steps

1. **Create Stripe coupon** `TRIAL20` (20% off)
2. **Run referral SQL** migration
3. **Test referral flow** end-to-end
4. **Monitor A/B test** results in analytics dashboard

## 📊 Analytics

All conversion events are tracked:

- `trial_expired` - When trial ends
- `referral_used` - When referral code is used
- `ab_test_conversion` - A/B test conversions

View in `/admin/analytics`
