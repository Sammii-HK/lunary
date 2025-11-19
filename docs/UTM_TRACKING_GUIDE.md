# UTM Parameter Tracking Guide

## What Are UTM Parameters?

UTM parameters are tags you add to URLs to track where your traffic comes from. They help you measure which marketing channels and campaigns drive the most signups.

## UTM Parameter Structure

```
https://lunary.app?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN&utm_term=TERM&utm_content=CONTENT
```

### Required Parameters:

- **utm_source** - Where the traffic comes from (tiktok, instagram, twitter, etc.)
- **utm_medium** - Marketing medium (social, email, paid, etc.)
- **utm_campaign** - Specific campaign name (birthchart_jan2025, free_trial, etc.)

### Optional Parameters:

- **utm_term** - Keywords for paid search
- **utm_content** - Specific ad/content variation (button_a, video_b, etc.)

## How Lunary Tracks UTM Parameters

1. **Automatic Detection** - UTM params are extracted from URL on every page visit
2. **Stored in Metadata** - Saved with every conversion event (signup, trial, etc.)
3. **Analytics Dashboard** - View TikTok conversion rates in `/admin/analytics`
4. **Referrer Fallback** - If no UTM params, referrer is checked (TikTok auto-detected)

## Complete Platform UTM Reference

### TikTok

**Bio Link (Permanent):**

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=bio_link
```

**Video Posts (Use unique campaign/content per video):**

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=birthchart_video&utm_content=video_jan15
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=tarot_video&utm_content=video_jan20
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=horoscope_video&utm_content=video_jan25
```

**Live Streams:**

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=live_stream&utm_content=live_jan30
```

**Note:** TikTok referrer is auto-detected, but UTM params give you campaign-level tracking.

---

### Instagram

**Bio Link (Permanent):**

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=ig_bio
```

**Posts:**

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=post&utm_content=birthchart_post_jan15
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=post&utm_content=tarot_post_jan20
```

**Stories:**

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=story&utm_content=birthchart_story
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=story&utm_content=free_trial_story
```

**Reels:**

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=reel&utm_content=reel_jan15
```

---

### Twitter/X

**Bio Link (Permanent):**

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=twitter_bio
```

**Tweets:**

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=tweet&utm_content=horoscope_tweet_jan15
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=tweet&utm_content=birthchart_tweet_jan20
```

**Threads:**

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=thread&utm_content=thread_jan25
```

---

### Substack Newsletter

**Free Tier Posts (Auto-generated):**

```
https://lunary.app?utm_source=substack&utm_medium=email&utm_campaign=weekly_free
```

_Note: This is automatically added in `src/config/substack.ts`_

**Paid Tier Posts (Auto-generated):**

```
https://lunary.app?utm_source=substack&utm_medium=email&utm_campaign=weekly_paid
```

_Note: This is automatically added in `src/config/substack.ts`_

**Manual Substack Links (if you add links manually in posts):**

```
https://lunary.app?utm_source=substack&utm_medium=email&utm_campaign=newsletter&utm_content=weekly_insights
https://lunary.app?utm_source=substack&utm_medium=email&utm_campaign=newsletter&utm_content=monthly_digest
```

---

### Email Marketing

**Newsletter:**

```
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=newsletter&utm_content=weekly_digest
```

**Trial Reminder Emails:**

```
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=trial_reminder&utm_content=day_3_reminder
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=trial_reminder&utm_content=day_7_reminder
```

**Feature Announcements:**

```
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=feature_announcement&utm_content=new_tarot_feature
```

**Welcome Emails:**

```
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=welcome_email&utm_content=onboarding
```

---

### Blog/Content Marketing

**Blog Posts:**

```
https://lunary.app?utm_source=blog&utm_medium=content&utm_campaign=moon_phases_post
https://lunary.app?utm_source=blog&utm_medium=content&utm_campaign=weekly_horoscope_post
```

**Grimoire Articles (if shared externally):**

```
https://lunary.app/grimoire/tarot?utm_source=blog&utm_medium=content&utm_campaign=grimoire_tarot
https://lunary.app/grimoire/birth-chart?utm_source=blog&utm_medium=content&utm_campaign=grimoire_birthchart
```

---

### YouTube

**Video Descriptions:**

```
https://lunary.app?utm_source=youtube&utm_medium=social&utm_campaign=video_description&utm_content=birthchart_tutorial
```

**Community Posts:**

```
https://lunary.app?utm_source=youtube&utm_medium=social&utm_campaign=community_post&utm_content=jan_update
```

**Shorts:**

```
https://lunary.app?utm_source=youtube&utm_medium=social&utm_campaign=shorts&utm_content=short_jan15
```

---

### Reddit

**Posts:**

```
https://lunary.app?utm_source=reddit&utm_medium=social&utm_campaign=reddit_post&utm_content=r_astrology_post
```

**Comments:**

```
https://lunary.app?utm_source=reddit&utm_medium=social&utm_campaign=reddit_comment&utm_content=comment_thread
```

---

### Discord

**Server Links:**

```
https://lunary.app?utm_source=discord&utm_medium=social&utm_campaign=server_link
```

**Channel Messages:**

```
https://lunary.app?utm_source=discord&utm_medium=social&utm_campaign=channel_message&utm_content=announcement_channel
```

---

### Paid Ads (Future)

**Google Ads:**

```
https://lunary.app?utm_source=google&utm_medium=cpc&utm_campaign=birth_chart_ads&utm_term=astrology_app
```

**Facebook/Instagram Ads:**

```
https://lunary.app?utm_source=facebook&utm_medium=paid&utm_campaign=tarot_ads&utm_content=ad_variant_a
```

**TikTok Ads:**

```
https://lunary.app?utm_source=tiktok&utm_medium=paid&utm_campaign=tiktok_ads&utm_content=ad_variant_b
```

---

### Partnerships/Affiliates

**Partner Blog:**

```
https://lunary.app?utm_source=partner_name&utm_medium=referral&utm_campaign=partner_blog
```

**Affiliate Link:**

```
https://lunary.app?utm_source=affiliate_name&utm_medium=affiliate&utm_campaign=affiliate_program
```

---

### Product Hunt / Launch Platforms

**Product Hunt:**

```
https://lunary.app?utm_source=product_hunt&utm_medium=referral&utm_campaign=product_hunt_launch
```

**BetaList:**

```
https://lunary.app?utm_source=betalist&utm_medium=referral&utm_campaign=betalist_launch
```

## Best Practices

### 1. Use Consistent Naming

- **Source**: Always lowercase (tiktok, instagram, twitter)
- **Medium**: Use standard terms (social, email, paid, content)
- **Campaign**: Descriptive but short (birthchart_jan2025, free_trial_promo)

### 2. Track Different Content Types

Use `utm_content` to A/B test:

- `utm_content=video_a` vs `utm_content=video_b`
- `utm_content=post_with_image` vs `utm_content=post_text_only`

### 3. Include Dates in Campaign Names

- `birthchart_jan2025` - Easy to filter by month
- `free_trial_week1` - Track weekly campaigns

### 4. Shorten Links (Optional)

Use a link shortener that preserves UTM params:

- Bitly, TinyURL, or your own short domain
- Example: `lunary.app/tiktok` → expands to full URL with UTM params

## How to View Your Tracking Data

1. **Go to Admin Dashboard**: `/admin/analytics`
2. **CAC Metrics**: `/api/admin/analytics/cac` - See Customer Acquisition Cost by source
3. **AI First Week**: `/api/admin/analytics/ai-first-week` - % of users using AI after first week
4. **All Events**: Check metadata in conversion events for UTM params
5. **Filter by Campaign**: Query database for specific campaigns

### New Analytics Endpoints

**CAC (Customer Acquisition Cost):**

```
GET /api/admin/analytics/cac?start_date=2025-01-01&end_date=2025-01-31
```

Returns signups and conversions by UTM source, with CAC calculation (requires ad spend data).

**AI First Week Engagement:**

```
GET /api/admin/analytics/ai-first-week?start_date=2025-01-01&end_date=2025-01-31
```

Returns % of new users who interacted with AI in their second week (days 7-14).

## Quick Reference: Your Main Landing Pages

**Homepage:**

```
https://lunary.app?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

**Welcome/Landing Page:**

```
https://lunary.app/welcome?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

**Pricing Page:**

```
https://lunary.app/pricing?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

**Specific Feature (Birth Chart):**

```
https://lunary.app/birth-chart?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

## Example Campaign Strategy

### Week 1: Birth Chart Focus

- TikTok: `?utm_source=tiktok&utm_medium=social&utm_campaign=birthchart_week1`
- Instagram: `?utm_source=instagram&utm_medium=social&utm_campaign=birthchart_week1`
- Track which platform converts better

### Week 2: Free Trial Push

- TikTok: `?utm_source=tiktok&utm_medium=social&utm_campaign=freetrial_week2`
- Email: `?utm_source=email&utm_medium=email&utm_campaign=freetrial_week2`
- Compare social vs email conversion rates

### Month-Long: Tarot Feature

- All platforms: `?utm_source=PLATFORM&utm_medium=social&utm_campaign=tarot_jan2025`
- Use same campaign name, different sources to compare platforms

## Pro Tips

1. **Test Without UTM First**: See baseline conversion, then add UTMs to measure improvement
2. **Use Link Shorteners**: Makes links cleaner for social media
3. **Document Your Links**: Keep a spreadsheet of which UTM params you use where
4. **Review Weekly**: Check `/admin/analytics` to see which campaigns perform best
5. **Double Up**: Use UTM params even if platform auto-detects (TikTok) - gives you more data

## What Gets Tracked Automatically

Even without UTM params, Lunary tracks:

- **Referrer** - Where user came from (tiktok.com auto-detected)
- **Page Path** - Which page they landed on
- **All Events** - Signup, trial, conversion all include UTM data

So even if you forget UTM params, you'll still get referrer data. But UTM params give you more detailed campaign tracking.
