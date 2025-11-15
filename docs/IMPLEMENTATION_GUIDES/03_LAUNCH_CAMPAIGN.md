# Launch Campaign - Product Hunt, Announcement Pages, Press Kit

## Overview

Create a comprehensive launch campaign including announcement pages, Product Hunt preparation, TikTok series, Cosmic Report Generator, and press kit.

## Requirements

### 1. Launch Announcement Page

**Route**: `/launch`

**Content**:

- Hero section announcing Lunary AI launch
- Key features showcase
- Pricing announcement
- Social proof (testimonials, user count)
- CTA to sign up
- Timeline of launch events

### 2. Product Hunt Launch Page

**Route**: `/product-hunt`

**Content**:

- Product Hunt optimized landing page
- Key features (3-5 main points)
- Screenshots/GIFs
- User testimonials
- Launch day countdown
- Social sharing buttons
- Email signup for launch day reminder

### 3. Press Kit

**Route**: `/press-kit`

**Content**:

- Company overview
- Product screenshots (various sizes)
- Logo assets (PNG, SVG)
- Founder bio
- Key statistics
- Press release template
- Contact information
- Downloadable assets

### 4. Cosmic Report Generator

**Route**: `/cosmic-report-generator`

**Content**:

- Generate personalized cosmic reports
- Shareable report cards
- Download as PDF
- Social sharing options
- Email report to user
- Public report links (optional)

### 5. TikTok Series Landing

**Route**: `/building-lunary`

**Content**:

- Series overview
- Episode list with links
- Behind-the-scenes content
- Subscribe CTA
- Social links

## Database Schema

### Table: `launch_signups`

```sql
CREATE TABLE IF NOT EXISTS launch_signups (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL, -- 'product_hunt', 'launch_page', 'press_kit', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_launch_signups_email ON launch_signups(email);
CREATE INDEX IF NOT EXISTS idx_launch_signups_source ON launch_signups(source);
CREATE INDEX IF NOT EXISTS idx_launch_signups_created_at ON launch_signups(created_at);
```

### Table: `cosmic_reports`

```sql
CREATE TABLE IF NOT EXISTS cosmic_reports (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  report_type TEXT NOT NULL, -- 'weekly', 'monthly', 'custom'
  report_data JSONB NOT NULL,
  share_token TEXT UNIQUE, -- For public sharing
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Optional expiration
);

CREATE INDEX IF NOT EXISTS idx_cosmic_reports_user_id ON cosmic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_cosmic_reports_share_token ON cosmic_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_cosmic_reports_is_public ON cosmic_reports(is_public) WHERE is_public = true;
```

## API Endpoints

### 1. POST `/api/launch/signup`

**Purpose**: Collect launch signups

**Body**:

```typescript
{
  email: string;
  source: 'product_hunt' | 'launch_page' | 'press_kit' | 'tiktok';
  metadata?: {
    name?: string;
    referral?: string;
  };
}
```

**Response**:

```typescript
{
  success: boolean;
  message: string;
}
```

**Files**: `src/app/api/launch/signup/route.ts`

### 2. POST `/api/cosmic-report/generate`

**Purpose**: Generate cosmic report

**Body**:

```typescript
{
  report_type: 'weekly' | 'monthly' | 'custom';
  date_range?: {
    start: string;
    end: string;
  };
  include_sections?: string[]; // 'transits', 'moon', 'tarot', 'mood'
  make_public?: boolean;
}
```

**Response**:

```typescript
{
  success: boolean;
  report: {
    id: number;
    share_token?: string;
    share_url?: string;
    pdf_url?: string;
  };
}
```

**Files**: `src/app/api/cosmic-report/generate/route.ts`

### 3. GET `/api/cosmic-report/[token]`

**Purpose**: Get public cosmic report

**Response**:

```typescript
{
  report: {
    type: string;
    data: any;
    created_at: string;
  }
}
```

**Files**: `src/app/api/cosmic-report/[token]/route.ts`

### 4. GET `/api/cosmic-report/[id]/pdf`

**Purpose**: Generate PDF of report

**Response**: PDF file

**Files**: `src/app/api/cosmic-report/[id]/pdf/route.ts`

## Pages to Create

### 1. `/launch/page.tsx`

**Features**:

- Hero announcement
- Feature showcase (animated)
- Pricing section
- Social proof
- Timeline
- Signup CTA
- Social sharing

### 2. `/product-hunt/page.tsx`

**Features**:

- Product Hunt optimized layout
- Key features (3-5)
- Screenshots carousel
- Testimonials
- Countdown timer
- Email signup form
- Social sharing

### 3. `/press-kit/page.tsx`

**Features**:

- Company overview
- Product screenshots gallery
- Logo downloads
- Founder bio
- Statistics
- Press release
- Contact form
- Asset downloads

### 4. `/cosmic-report-generator/page.tsx`

**Features**:

- Report type selector
- Date range picker
- Section toggles
- Generate button
- Preview report
- Share options
- Download PDF
- Email report

### 5. `/building-lunary/page.tsx`

**Features**:

- Series overview
- Episode list
- Video embeds
- Behind-the-scenes content
- Subscribe CTA
- Social links

### 6. `/cosmic-report/[token]/page.tsx`

**Purpose**: Public view of shared cosmic report

**Features**:

- Display report
- Share buttons
- "Get Your Own Report" CTA
- Download PDF

## Components

### 1. `LaunchHero.tsx`

**Location**: `src/components/launch/LaunchHero.tsx`

**Features**:

- Animated hero section
- Launch announcement
- CTA buttons

### 2. `FeatureShowcase.tsx`

**Location**: `src/components/launch/FeatureShowcase.tsx`

**Features**:

- Feature cards with icons
- Hover animations
- Links to features

### 3. `CountdownTimer.tsx`

**Location**: `src/components/launch/CountdownTimer.tsx`

**Features**:

- Countdown to launch date
- Days/Hours/Minutes/Seconds
- Auto-update

### 4. `CosmicReportPreview.tsx`

**Location**: `src/components/cosmic-report/CosmicReportPreview.tsx`

**Features**:

- Report preview
- Share buttons
- Download PDF button
- Email report button

### 5. `PressKitAssets.tsx`

**Location**: `src/components/press-kit/PressKitAssets.tsx`

**Features**:

- Asset gallery
- Download buttons
- Size information
- Format options

## Implementation Steps

### Phase 1: Launch Pages

1. ✅ Create `/launch/page.tsx`
2. ✅ Create `/product-hunt/page.tsx`
3. ✅ Create `/press-kit/page.tsx`
4. ✅ Create `/building-lunary/page.tsx`
5. ✅ Add SEO metadata
6. ✅ Add social sharing meta tags

### Phase 2: Cosmic Report Generator

1. ✅ Create `/cosmic-report-generator/page.tsx`
2. ✅ Create API endpoint for report generation
3. ✅ Create PDF generation (use pdf-lib)
4. ✅ Add share functionality
5. ✅ Add public report viewing
6. ✅ Add email sending

### Phase 3: Launch Signups

1. ✅ Create `launch_signups` table
2. ✅ Create signup API endpoint
3. ✅ Add email confirmation
4. ✅ Add to newsletter list
5. ✅ Create reminder email template

### Phase 4: Press Kit Assets

1. ✅ Prepare screenshots (various sizes)
2. ✅ Prepare logo assets (PNG, SVG)
3. ✅ Write press release template
4. ✅ Create founder bio
5. ✅ Gather statistics
6. ✅ Create downloadable ZIP

### Phase 5: Product Hunt Preparation

1. ✅ Write Product Hunt description
2. ✅ Prepare screenshots/GIFs
3. ✅ Write maker comment
4. ✅ Prepare launch day schedule
5. ✅ Set up social media posts
6. ✅ Prepare email to subscribers

### Phase 6: TikTok Series

1. ✅ Plan episode topics
2. ✅ Create landing page
3. ✅ Add video embeds
4. ✅ Add subscribe CTA
5. ✅ Link to TikTok account

## Files to Create

```
sql/launch_signups.sql
sql/cosmic_reports.sql
src/app/launch/page.tsx
src/app/product-hunt/page.tsx
src/app/press-kit/page.tsx
src/app/cosmic-report-generator/page.tsx
src/app/cosmic-report/[token]/page.tsx
src/app/building-lunary/page.tsx
src/app/api/launch/signup/route.ts
src/app/api/cosmic-report/generate/route.ts
src/app/api/cosmic-report/[token]/route.ts
src/app/api/cosmic-report/[id]/pdf/route.ts
src/components/launch/LaunchHero.tsx
src/components/launch/FeatureShowcase.tsx
src/components/launch/CountdownTimer.tsx
src/components/cosmic-report/CosmicReportPreview.tsx
src/components/cosmic-report/ReportPDF.tsx
src/components/press-kit/PressKitAssets.tsx
src/lib/cosmic-report/pdf-generator.ts
src/lib/cosmic-report/share.ts
public/press-kit/ (directory with assets)
```

## Content Requirements

### Launch Page Content

- Headline: "Lunary AI: Your Personalized Cosmic Companion"
- Subheadline: "AI-powered astrology meets real astronomical data"
- Key features: 5-7 main features
- Social proof: User count, testimonials
- CTA: "Start Your Cosmic Journey"

### Product Hunt Description

- Title: "Lunary AI - Personalized Astrology Powered by Real Astronomical Data"
- Tagline: "AI meets astronomy for personalized cosmic guidance"
- Key points:
  1. Real astronomical calculations (not generic horoscopes)
  2. AI-powered personalized insights
  3. Daily cosmic pulse notifications
  4. Moon Circles for New/Full Moons
  5. Comprehensive grimoire library
- Maker comment: Founder story, why built, what's unique

### Press Release Template

- Headline
- Subheadline
- Body (3-4 paragraphs)
- Key features list
- Quotes (founder, users)
- Contact information
- About Lunary section

### TikTok Series Topics

1. "Building Lunary: Why Real Astronomical Data Matters"
2. "How We Built AI-Powered Astrology"
3. "The Tech Behind Personalized Cosmic Guidance"
4. "Launch Day: What to Expect"
5. "User Stories: How Lunary Changed Lives"

## Testing Checklist

- [ ] Launch page loads correctly
- [ ] Product Hunt page is optimized
- [ ] Press kit assets download correctly
- [ ] Cosmic report generator works
- [ ] Report PDF generation works
- [ ] Share links work correctly
- [ ] Email signups are recorded
- [ ] Confirmation emails send
- [ ] Public report links work
- [ ] Social sharing buttons work
- [ ] SEO metadata is correct
- [ ] Mobile responsive

## Launch Day Checklist

### Pre-Launch (1 week before)

- [ ] Finalize all pages
- [ ] Test all functionality
- [ ] Prepare social media posts
- [ ] Email subscribers about launch
- [ ] Set up Product Hunt listing (draft)
- [ ] Prepare press release
- [ ] Contact press/bloggers

### Launch Day

- [ ] Publish Product Hunt listing (9 AM PST)
- [ ] Share on social media
- [ ] Email subscribers
- [ ] Post on TikTok
- [ ] Monitor Product Hunt ranking
- [ ] Respond to comments/questions
- [ ] Share updates throughout day

### Post-Launch (1 week after)

- [ ] Thank supporters
- [ ] Share results
- [ ] Gather feedback
- [ ] Plan next features
- [ ] Follow up with press

## Success Metrics

- Product Hunt ranking (aim for top 5)
- Signups from launch pages
- Press coverage
- Social media engagement
- TikTok views/subscribers
- Report generator usage
- Conversion rate from launch pages

## Future Enhancements

- Launch day live stream
- Interactive demo
- User testimonials video
- Behind-the-scenes blog posts
- Launch day exclusive offers
- Referral program for launch
- Community celebration event
