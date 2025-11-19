# UTM Links Quick Reference - Update These!

## 🎯 Primary Platforms (Update These First)

### TikTok Bio Link

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=bio_link
```

### Instagram Bio Link

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=ig_bio
```

### Twitter/X Bio Link

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=twitter_bio
```

### YouTube Channel Description

```
https://lunary.app?utm_source=youtube&utm_medium=social&utm_campaign=channel_description
```

---

## 📱 Social Media Posts

### TikTok Videos

Use unique `utm_content` for each video:

```
https://lunary.app?utm_source=tiktok&utm_medium=social&utm_campaign=video&utm_content=VIDEO_DATE_OR_TITLE
```

### Instagram Posts

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=post&utm_content=POST_DATE_OR_TITLE
```

### Instagram Stories

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=story&utm_content=STORY_DATE_OR_TITLE
```

### Instagram Reels

```
https://lunary.app?utm_source=instagram&utm_medium=social&utm_campaign=reel&utm_content=REEL_DATE_OR_TITLE
```

### Twitter/X Tweets

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=tweet&utm_content=TWEET_DATE_OR_TITLE
```

### Twitter/X Threads

```
https://lunary.app?utm_source=twitter&utm_medium=social&utm_campaign=thread&utm_content=THREAD_DATE_OR_TITLE
```

---

## 📧 Email & Newsletter

### Substack (Auto-configured)

✅ Already configured in `src/config/substack.ts`:

- Free posts: `utm_source=substack&utm_medium=email&utm_campaign=weekly_free`
- Paid posts: `utm_source=substack&utm_medium=email&utm_campaign=weekly_paid`

### Manual Email Links

```
https://lunary.app?utm_source=email&utm_medium=email&utm_campaign=newsletter&utm_content=EMAIL_TYPE
```

---

## 🎬 YouTube

### Video Descriptions

```
https://lunary.app?utm_source=youtube&utm_medium=social&utm_campaign=video_description&utm_content=VIDEO_TITLE
```

### Community Posts

```
https://lunary.app?utm_source=youtube&utm_medium=social&utm_campaign=community_post&utm_content=POST_DATE
```

### Shorts

```
https://lunary.app?utm_source=youtube&utm_medium=social&utm_campaign=shorts&utm_content=SHORT_DATE
```

---

## 🔗 Other Platforms

### Reddit Posts

```
https://lunary.app?utm_source=reddit&utm_medium=social&utm_campaign=reddit_post&utm_content=SUBREDDIT_NAME
```

### Discord Server Links

```
https://lunary.app?utm_source=discord&utm_medium=social&utm_campaign=server_link
```

### Blog Posts

```
https://lunary.app?utm_source=blog&utm_medium=content&utm_campaign=BLOG_POST_TITLE
```

---

## 💡 Pro Tips

1. **Bio Links**: Update these once, use everywhere
2. **Post Links**: Change `utm_content` for each post to track individual performance
3. **Campaign Names**: Use dates or descriptive names (e.g., `birthchart_jan2025`, `free_trial_week1`)
4. **Content Parameter**: Use `utm_content` to A/B test different content types

---

## 📊 View Your Data

- **Admin Dashboard**: `/admin/analytics`
- **CAC by Source**: `/api/admin/analytics/cac`
- **AI Engagement**: `/api/admin/analytics/ai-first-week`

---

## 🔄 Quick Copy-Paste Template

For new posts, use this template and fill in the blanks:

```
https://lunary.app?utm_source=PLATFORM&utm_medium=social&utm_campaign=CAMPAIGN_NAME&utm_content=CONTENT_IDENTIFIER
```

**Examples:**

- Platform: `tiktok`, `instagram`, `twitter`, `youtube`
- Campaign: `birthchart_video`, `tarot_post`, `free_trial_promo`
- Content: `video_jan15`, `post_jan20`, `story_jan25`
