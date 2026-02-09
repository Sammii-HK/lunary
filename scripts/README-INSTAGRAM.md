# Instagram Content Generation System

This document explains how to generate and manage Instagram content for Lunary.

## 🎯 Unified Workflow

**Instagram posts are fully integrated with your social posts approval queue!**

1. **Generate** → Run the script to create Instagram content
2. **Review** → Go to `/admin/social-posts` to see all posts (including Instagram)
3. **Approve** → Click approve on posts you want to publish
4. **Send** → Click send to automatically schedule in Succulent.social

**Everything in one place - no separate Instagram workflow needed!**

## Overview

The Instagram content generation system creates **4 posts per day** with a deterministic content mix:

- **Memes** - Zodiac personality memes with relatable humor
- **Carousels** - Educational multi-slide posts from grimoire content
- **Daily Cosmic** - Morning cosmic overview posts
- **Did You Know** - Educational astrology facts
- **Sign Rankings** - Daily zodiac sign rankings
- **Compatibility** - Sign compatibility posts
- **Quotes** - Inspirational cosmic quotes

### Weekly Schedule

| Day       | Posts                                                        |
| --------- | ------------------------------------------------------------ |
| Monday    | Daily Cosmic, Did You Know, Meme, Quote (4 posts)            |
| Tuesday   | Daily Cosmic, Carousel, Sign Ranking, Quote (4 posts)        |
| Wednesday | Daily Cosmic, Did You Know, Meme, Quote (4 posts)            |
| Thursday  | Daily Cosmic, Carousel, Compatibility, Quote (4 posts)       |
| Friday    | Daily Cosmic, Did You Know, Meme, Quote (4 posts)            |
| Saturday  | Daily Cosmic, Carousel, Sign Ranking, Quote (4 posts)        |
| Sunday    | Daily Cosmic, Meme, Quote + Recycled top performer (4 posts) |

**Total: 28 posts per week**

## Setup

### 1. Apply Database Migration

The `instagram_scheduled_posts` table has already been created via Prisma migration!

If you need to verify or reapply:

```bash
# Verify table exists
pnpm prisma db pull

# If needed, apply migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

The table is now ready to use - you can skip straight to generating content!

## Generating Content

### Option 1: Generate This Week's Content (One-time)

To generate Instagram content for the current week (today + next 6 days):

```bash
pnpm tsx scripts/generate-instagram-week.ts
```

**Output:**

- Generates 28 Instagram posts (4 per day × 7 days)
- Saves posts to `instagram_scheduled_posts` table
- Shows summary of generated content

**Example output:**

```
📸 Generating Instagram content for the week...

📅 Generating content for 2026-02-09...
   ✅ Generated 4 posts:
      - meme (2026-02-09T12:00:00Z)
      - daily_cosmic (2026-02-09T08:00:00Z)
      - did_you_know (2026-02-09T10:00:00Z)
      - quote (2026-02-09T19:00:00Z)

...

📊 Generation Summary
============================================================
Total days processed: 7
Successful: 7/7
Total posts generated: 28
```

### Option 2: Weekly Cron (Automatic)

Instagram content generation is now integrated into the weekly content cron job.

**When:** Every Sunday at 8 AM UTC
**What:** Generates Instagram content for the week ahead (7 days in advance)

The cron job (`/api/cron/weekly-content`) now:

1. Generates blog content
2. Sends newsletter
3. Publishes to Substack
4. Generates social media posts
5. **Generates Instagram content** ← NEW!

You'll receive a Discord notification with Instagram stats included.

## Content Storage

All generated content is stored in the `instagram_scheduled_posts` table:

### Table Schema

| Column           | Type        | Description                               |
| ---------------- | ----------- | ----------------------------------------- |
| `id`             | SERIAL      | Primary key                               |
| `date`           | DATE        | Post date                                 |
| `type`           | VARCHAR(50) | Post type (meme, carousel, etc.)          |
| `scheduled_time` | TIMESTAMP   | When to publish (UTC)                     |
| `caption`        | TEXT        | Post caption with hashtags                |
| `image_url`      | TEXT        | OG image URL                              |
| `hashtags`       | TEXT[]      | Array of hashtags                         |
| `metadata`       | JSONB       | Additional data (slides, templates, etc.) |
| `posted`         | BOOLEAN     | Whether posted to Instagram               |
| `posted_at`      | TIMESTAMP   | When it was posted                        |
| `post_id`        | VARCHAR     | Instagram post ID                         |
| `created_at`     | TIMESTAMP   | Record creation time                      |
| `updated_at`     | TIMESTAMP   | Last update time                          |

### Querying Posts

```sql
-- Get all posts for a specific date
SELECT * FROM instagram_scheduled_posts
WHERE date = '2026-02-09'::date
ORDER BY scheduled_time;

-- Get unpublished posts
SELECT * FROM instagram_scheduled_posts
WHERE posted = false
ORDER BY scheduled_time;

-- Get posts by type
SELECT * FROM instagram_scheduled_posts
WHERE type = 'meme'
ORDER BY date DESC
LIMIT 10;
```

## Image Generation

Images are generated via OG image routes:

- **Memes**: `/api/og/instagram/meme`
- **Carousels**: `/api/og/instagram/carousel`
- **Daily Cosmic**: `/api/og/instagram/daily-cosmic`
- **Stories**: `/api/og/instagram/story-*`

Images follow Instagram's optimal dimensions:

- **Feed posts**: 1080×1080 (square) or 1080×1350 (portrait)
- **Stories**: 1080×1920 (9:16 ratio)
- **Reels**: 1080×1920 (9:16 ratio)

## Posting Schedule

Posts are scheduled at optimal engagement times (UTC):

| Time | Post Type                                         |
| ---- | ------------------------------------------------- |
| 8am  | Daily Cosmic (morning engagement)                 |
| 10am | Did You Know (late morning education)             |
| 12pm | Meme/Carousel (lunch scroll)                      |
| 3pm  | Sign Ranking/Compatibility (afternoon engagement) |
| 7pm  | Quote (evening reflection)                        |

## Content Reuse

Content generation is **deterministic**:

- Same date = same content
- Safe to regenerate without duplicates
- Carousel topics rotate on a schedule
- Sunday includes recycled top performers

## Troubleshooting

### No posts generated

Check that all dependencies are installed:

```bash
pnpm install
```

### Database errors

Ensure the table exists:

```bash
pnpm tsx scripts/create-instagram-table.ts
```

### Image generation fails

Check that OG image routes are accessible:

```bash
curl https://lunary.app/api/og/instagram/meme
```

## Next Steps After Generation

1. **Review content** - Check generated captions and images
2. **Schedule posts** - Use Instagram's native scheduler or a tool like Buffer/Hootsuite
3. **Track performance** - Monitor engagement metrics
4. **Adjust strategy** - Update content mix based on analytics

## Manual API Usage

You can also generate content via API:

### Generate single day

```bash
curl -X POST https://lunary.app/api/admin/instagram/generate-daily \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-02-09"}'
```

### Generate full week

```bash
curl -X POST https://lunary.app/api/admin/instagram/generate-weekly \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2026-02-09"}'
```

## File Locations

- **Content orchestrator**: `src/lib/instagram/content-orchestrator.ts`
- **Meme content**: `src/lib/instagram/meme-content.ts`
- **Carousel content**: `src/lib/instagram/carousel-content.ts`
- **Weekly cron**: `src/app/api/cron/weekly-content/route.ts`
- **Generation scripts**: `scripts/generate-instagram-week.ts`
- **Table migration**: `prisma/migrations/create_instagram_scheduled_posts.sql`

## Support

For issues or questions:

1. Check the logs: `console.log` statements throughout generation
2. Verify database connectivity
3. Test OG image routes
4. Review Discord notifications for cron job status
