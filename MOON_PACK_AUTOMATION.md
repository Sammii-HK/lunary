# Moon Pack Automation System

This system automatically generates moon phase packs for different time periods without any manual intervention.

## 🌙 What it creates

### Monthly Packs ($7.99)
- Generated **3 months in advance**
- Contains all moon phases for a specific month
- Includes lunar calendar and spiritual guidance
- Example: "Moon Phases - January 2025"

### Quarterly Packs ($19.99)
- Generated **1 quarter in advance**
- Contains 3 months of moon phases
- Seasonal energy guidance included
- Example: "Moon Phases - Q2 2025" (April, May, June)

### Yearly Packs ($49.99)
- Generated **6 months before the year starts** (July-December)
- Complete lunar calendar for entire year
- All 13 lunar cycles with detailed insights
- Example: "Moon Phases - Complete 2026 Guide"

## ⏰ Automation Schedule

The system runs automatically via Vercel cron jobs:

- **Monthly (15th, 2 AM)**: Generate monthly packs (checks for next 2-3 months)
- **Quarterly (15th of Jan/Apr/Jul/Oct, 3 AM)**: Generate quarterly packs (next quarter only)  
- **Yearly (July 1st, 4 AM)**: Generate yearly packs (next year only)

## 🛠 Manual Usage

You can also run the generation manually:

```bash
# Generate all types of packs
npm run generate-moon-packs

# Dry run (see what would be created)
npm run generate-moon-packs:dry

# Generate specific types
npm run generate-moon-packs:monthly
npm run generate-moon-packs:quarterly
npm run generate-moon-packs:yearly

# Direct script usage with options
npx tsx scripts/generate-moon-packs.ts --dry-run --type=monthly
```

## 📦 Pack Contents

Each pack includes:

1. **PDF Guide**: Professionally formatted with moon phase data
2. **OG Images**: Custom social media images for each pack
3. **Stripe Integration**: Automatic product and pricing setup
4. **Real Astronomical Data**: Uses astronomy-engine for accuracy

### Monthly Pack Structure
- Cover page with month/year
- Each significant moon phase (New, First Quarter, Full, Third Quarter)
- Moon constellation information
- Spiritual guidance and energy descriptions

### Quarterly Pack Structure
- Cover page with quarter/year
- All moon phases for 3 months
- Seasonal transition information
- Extended spiritual practices

### Yearly Pack Structure
- Comprehensive cover page
- All 13+ lunar cycles for the year
- Eclipse information
- Complete lunar calendar
- Seasonal alignments

## 🔧 Technical Details

### Files Created
- `scripts/generate-moon-packs.ts` - Main generation script
- `src/app/api/cron/moon-packs/route.ts` - Cron endpoint
- `vercel.json` - Cron job configuration

### Dependencies
- Uses existing `/api/shop/packs/generate` endpoint
- Integrates with Stripe for product creation
- Leverages `/api/og/cosmic-post` for astronomical data
- Stores files in Vercel Blob storage

### Environment Variables Required
```bash
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_BASE_URL=https://lunary.app
CRON_SECRET_TOKEN=your-secret-token
```

## 🔒 Security

- Cron endpoints protected by `CRON_SECRET_TOKEN`
- Only authorized requests can trigger generation
- Duplicate pack detection prevents overwrites

## 📊 Monitoring

### Health Check
```bash
curl -H "Authorization: Bearer $CRON_SECRET_TOKEN" \
     https://lunary.app/api/cron/moon-packs
```

### Manual Trigger
```bash
curl -X POST \
     -H "Authorization: Bearer $CRON_SECRET_TOKEN" \
     "https://lunary.app/api/cron/moon-packs?type=monthly&dry-run=true"
```

## 🧹 Automatic Cleanup

The system automatically deactivates old packs (older than 2 years) to keep the product catalog fresh and relevant.

## 🚀 Benefits

1. **Always Fresh Content**: New packs available months in advance
2. **Zero Manual Work**: Completely automated after setup
3. **Consistent Quality**: Uses real astronomical data
4. **Professional Presentation**: PDF guides with proper formatting
5. **SEO Optimized**: Custom OG images for social sharing
6. **Revenue Growth**: Continuous product creation

## 📈 Expected Output

With this system running, you'll have:
- **3 new monthly packs** available at any time
- **1 new quarterly pack** available each quarter
- **1 new yearly pack** available 6 months before each year
- **Automatic cleanup** of outdated content

The system ensures there are always new moon phase products available for purchase without any manual intervention!
