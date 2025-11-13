# Metrics Tracking Setup Guide

## ✅ What's Been Implemented

All code is complete on `feature/advanced-metrics-tracking` branch:

1. **Database Schema** - `sql/user_sessions.sql` created
2. **Session Tracking API** - `src/app/api/analytics/session/route.ts`
3. **Analytics Calculations** - DAU/WAU/stickiness/TikTok/AI usage in `src/app/api/admin/analytics/route.ts`
4. **Dashboard UI** - New metric cards in `src/app/admin/analytics/page.tsx`
5. **Event Tracking** - UTM params, TikTok detection, AI features in `src/lib/analytics.ts`
6. **Feature Tracking** - Added to tarot, horoscope, crystal widgets
7. **Database Setup** - Added to both `scripts/setup-database.ts` and `src/app/api/setup-database/route.ts`

## 🚀 What You Need to Do

### 1. Run Database Migration

**Option A: Using Setup Script (Recommended)**

```bash
npm run setup-db
# or
yarn setup-db
```

**Option B: Manual SQL**

```bash
psql $POSTGRES_URL -f sql/user_sessions.sql
```

**Option C: Via API (Production)**

```bash
curl -X POST https://lunary.app/api/setup-database \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 2. Test the Implementation

1. Switch to feature branch: `git checkout feature/advanced-metrics-tracking`
2. Start dev server: `yarn dev`
3. Visit `/admin/analytics` - Should see new metric cards
4. Metrics will show 0 until users start using the app

### 3. Verify Tracking Works

**Test Session Tracking:**

- Open app as logged-in user
- Check database: `SELECT * FROM user_sessions WHERE user_id = 'YOUR_USER_ID'`
- Should see session record

**Test UTM Tracking:**

- Visit: `http://localhost:3000?utm_source=tiktok&utm_campaign=test`
- Sign up or trigger any event
- Check `conversion_events` table metadata field

**Test TikTok Detection:**

- Visit from TikTok (or simulate with referrer header)
- Should auto-detect TikTok source

**Test AI Usage Tracking:**

- View personalized tarot (if subscribed)
- View personalized horoscope (if subscribed)
- View birth chart
- Check analytics dashboard for AI usage %

### 4. Deploy to Production

1. Merge feature branch: `git checkout main && git merge feature/advanced-metrics-tracking`
2. Run migration on production database
3. Deploy to Vercel
4. Metrics will start populating as users interact

## 📊 Metrics You'll See

Once deployed and users start using the app:

- **WAU** - Weekly Active Users (users active in past 7 days)
- **DAU** - Daily Active Users (users active today)
- **Stickiness** - DAU/WAU ratio (target: 20%+)
- **AI Usage %** - % of users who used personalized features
- **TikTok Visitors** - Total visitors from TikTok
- **TikTok Signups** - Signups from TikTok
- **TikTok Conversion** - TikTok → Signup conversion rate

## 🔍 Troubleshooting

**Metrics showing 0:**

- Check if `user_sessions` table exists: `SELECT * FROM user_sessions LIMIT 1;`
- Check if users are triggering `app_opened` events
- Wait for users to actually use the app (metrics need data)

**TikTok tracking not working:**

- Make sure UTM params are in URL: `?utm_source=tiktok`
- Or check referrer contains `tiktok.com`
- Check `conversion_events.metadata` JSONB field

**AI Usage showing 0:**

- Users need to view personalized features (tarot/horoscope/birth chart)
- Only counts users with subscription/trial access
- Check if events are being tracked in `conversion_events` table

## 📝 Next Steps After Setup

1. **Start Using UTM Params** - Add to all your marketing links (see `docs/UTM_TRACKING_GUIDE.md`)
2. **Monitor Weekly** - Check `/admin/analytics` weekly to see trends
3. **Optimize Campaigns** - Use TikTok conversion data to improve content
4. **Track Growth** - Watch WAU/DAU grow as you acquire users
5. **Prove Value** - Use AI usage % to show investors/users the value of personalized features

## 🎯 Success Metrics Targets

- **Stickiness**: 20%+ (DAU/WAU) = good daily engagement
- **AI Usage %**: 50%+ = users finding value in personalized features
- **TikTok Conversion**: 5%+ = good conversion from TikTok
- **WAU Growth**: Track week-over-week growth

All code is ready - just run the migration and start tracking!
