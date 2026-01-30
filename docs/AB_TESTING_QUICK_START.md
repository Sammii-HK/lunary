# A/B Testing - Quick Start

## ✅ What's Now Tracking

All your major pages are now tracking A/B test data automatically! Here's what's being tracked:

### 📊 Pages with A/B Tracking

| Page                            | Tests Tracked                                                                                             | Events                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Homepage** (`/`)              | • `homepage-features-test`<br>• `cta-copy-test`                                                           | Impressions: Page views<br>Conversions: CTA clicks, Signups |
| **Dashboard** (`/app`)          | • `cta-copy-test`                                                                                         | Impressions: App opens<br>Conversions: Feature usage        |
| **Horoscope** (`/horoscope`)    | • `cta-copy-test`<br>• `feature_preview_blur_v1`<br>• `transit-limit-test`<br>• `transit-overflow-style`  | Impressions: Page views<br>Conversions: Upgrades            |
| **Tarot** (`/tarot`)            | • `cta-copy-test`<br>• `tarot-truncation-length`<br>• `weekly-lock-style`<br>• `paywall_preview_style_v1` | Impressions: Page views<br>Conversions: Upgrades            |
| **Pricing** (`/pricing`)        | • `pricing_cta_test`<br>• `pricing_display_test`                                                          | Impressions: Page views<br>Conversions: Checkouts           |
| **Upgrade Prompts** (all pages) | • `upgrade_prompt_test`                                                                                   | Impressions: Prompt shown<br>Conversions: Upgrade clicks    |

## 🎯 How to View Results

1. Go to `/admin/ab-testing` in your app
2. Select time range (7d, 30d, 90d)
3. See all your tests with:
   - Impressions per variant
   - Conversions per variant
   - Conversion rates
   - Statistical confidence
   - Win/loss recommendations

## 📈 What Data You'll See

The admin dashboard shows:

- **CTA Copy Variations** - How different button text performs
- **Paywall Preview Style** - Blur vs truncated previews
- **Homepage Features** - Different card sections
- **Feature Preview Blur** - Preview blur styles
- **Transit Overflow Style** - Transit display variations
- **Weekly Lock Style** - Weekly tarot lock variations
- **Tarot Truncation Length** - Text truncation impact
- **Free User Transit Limit** - 1 vs 2 transits

## 🚀 How It Works

1. **PostHog assigns** a variant to each user (client-side)
2. **Your app tracks** events with the variant in metadata
3. **Local database** stores everything in `conversion_events` table
4. **Admin dashboard** shows clean analytics (no PostHog UI needed!)

## 🔧 Adding More Tests

To track a new A/B test:

1. **Create experiment in PostHog** (e.g., `new-feature-test`)

2. **Add to mapping** in `src/lib/ab-test-tracking.ts`:

   ```typescript
   const POSTHOG_TEST_MAPPING: Record<string, string> = {
     'new-feature-test': 'new_feature',
     // ... existing tests
   };
   ```

3. **Use the hook** in your component:

   ```typescript
   import { useABTestTracking } from '@/hooks/useABTestTracking';

   function MyPage() {
     useABTestTracking('my-page', 'page_viewed', ['new-feature-test']);
     // That's it! Automatically tracks impressions
   }
   ```

4. **Track conversions**:

   ```typescript
   import { useABTestConversion } from '@/hooks/useABTestTracking';

   function MyComponent() {
     const { trackConversion } = useABTestConversion();

     const handleClick = () => {
       trackConversion('upgrade_clicked', {
         featureName: 'my_feature',
       });
     };
   }
   ```

## 📊 Key Metrics

For statistical significance, you need:

- **Minimum 100 users per variant** before making decisions
- **95%+ confidence** to trust the results
- **At least 1 week** of data collection

## 🎉 Benefits

✅ **No more PostHog UI complexity** - Clean, simple dashboard
✅ **All tests in one place** - Easy to compare
✅ **Automatic tracking** - Just add one hook line
✅ **Statistical confidence** - Built-in calculations
✅ **Fast queries** - Local database, instant results

## 🐛 Troubleshooting

**Not seeing any data?**

1. Check PostHog experiments are running and enabled
2. Verify test names match in `ab-test-tracking.ts`
3. Visit the pages to generate impressions
4. Check browser console for errors

**Data looks wrong?**

```sql
-- Check raw data in database
SELECT
  metadata->>'abTest' as test,
  metadata->>'abVariant' as variant,
  COUNT(*) as count
FROM conversion_events
WHERE metadata->>'abTest' IS NOT NULL
GROUP BY test, variant;
```

## 📝 Next Steps

1. **Visit your key pages** to start generating data
2. **Check `/admin/ab-testing`** after a few hours
3. **Wait for 100+ users per variant** before making decisions
4. **Monitor for 95%+ confidence** levels
5. **Implement winning variants** when significant

That's it! Your A/B testing is now fully automated. 🎊
