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

## Marketing Link Examples

### TikTok Links

**General TikTok Bio Link:**

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=bio_link
```

**TikTok Video About Birth Charts:**

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=birthchart_video&utm_content=video_jan15
```

**TikTok Post About Free Trial:**

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=free_trial&utm_content=post_jan20
```

### Instagram Links

**Instagram Bio:**

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=ig_bio
```

**Instagram Story:**

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=story&utm_content=birthchart_story
```

**Instagram Post:**

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=post&utm_content=tarot_post
```

### Twitter/X Links

**Twitter Bio:**

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=twitter_bio
```

**Twitter Post:**

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=tweet&utm_content=horoscope_tweet
```

### Email Marketing

**Newsletter:**

```
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=newsletter&utm_content=weekly_digest
```

**Trial Reminder Email:**

```
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=trial_reminder&utm_content=day_3_reminder
```

### Blog/Content Marketing

**Blog Post:**

```
https://lunary.app?utm_source=blog&utm_medium=content&utm_campaign=moon_phases_post
```

**Substack Newsletter:**

```
https://lunary.app?utm_source=substack&utm_medium=email&utm_campaign=weekly_insights
```

### Paid Ads (Future)

**Google Ads:**

```
https://lunary.app?utm_source=google&utm_medium=cpc&utm_campaign=birth_chart_ads&utm_term=astrology_app
```

**Facebook Ads:**

```
https://lunary.app?utm_source=facebook&utm_medium=paid&utm_campaign=tarot_ads&utm_content=ad_variant_a
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
2. **TikTok Metrics**: See TikTok Visitors, Signups, and Conversion Rate
3. **All Events**: Check metadata in conversion events for UTM params
4. **Filter by Campaign**: Query database for specific campaigns

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
