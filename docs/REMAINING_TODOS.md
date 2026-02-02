# Remaining Todos Summary

## ✅ COMPLETED (From Roadmap)

1. ✅ Daily Cosmic Pulse - Complete
2. ✅ Lunary Copilot Modes - Complete
3. ✅ Moon Circles - Complete
4. ✅ Pricing Tiers - Complete
5. ✅ Weekly AI Ritual Limit - Complete
6. ✅ Blog + Substack + App Funnel - Complete (CTAs added)
7. ✅ Collections Feature - Complete
8. ✅ Enhanced Onboarding - Complete
9. ✅ Cosmic Snapshot - Complete
10. ✅ Weekly Cosmic Report - Complete (just finished)
11. ✅ Viral Growth Hooks - Complete (shareable cards, OG images)

## 🚧 REMAINING FROM ROADMAP (3 items)

### 1. Light Community Layer

**Status**: Pending  
**Guide**: `docs/IMPLEMENTATION_GUIDES/01_COMMUNITY_LAYER.md`  
**Effort**: 2-3 days

Moon Circle insights sharing with anonymous in-app display.

### 2. Expanded Analytics

**Status**: Pending  
**Guide**: `docs/IMPLEMENTATION_GUIDES/02_ANALYTICS_EXPANSION.md`  
**Effort**: 3-4 days

DAU/WAU/MAU tracking, AI engagement metrics, conversion tracking, notification metrics.

### 3. Launch Campaign

**Status**: Pending  
**Guide**: `docs/IMPLEMENTATION_GUIDES/03_LAUNCH_CAMPAIGN.md`  
**Effort**: 4-5 days

Product Hunt page, announcement pages, press kit, cosmic report generator, TikTok series landing.

---

## 📝 OTHER PENDING ITEMS

### Content/Grimoire (SEO-focused)

#### High Priority Missing Content:

1. **Tarot Reversed Cards Guide** - High search volume
2. **Candle Magic Complete Guide** - Popular search term
3. **Spellcraft Fundamentals** - Educational content
4. **Divination Methods** (Pendulum, Scrying, Dream Interpretation)
5. **Rising Sign Guide** - Completes astrology section
6. **Moon Signs & Eclipses** - Expands moon section
7. **Void of Course Moon** - Practical guidance
8. **Herb Safety & Individual Profiles** - Completes herbalism

**Files**: Add to `src/app/grimoire/` sections

### Technical Improvements

#### SEO Optimizations:

1. **Page Speed Optimization**
   - WebP image conversion
   - Lazy loading
   - Bundle minimization
   - Image optimization

2. **Duplicate Content Fix**
   - Canonicalize www vs non-www
   - 301 redirects setup

3. **Topic Clusters**
   - Group related content
   - Create hub pages
   - Internal linking strategy

**Files**: `next.config.mjs`, image optimization, content structure

### Shop Enhancements

From `docs/SHOP_README.md`:

1. **User Purchase History** - Database integration
2. **Bulk Pack Operations** - Admin tools
3. **Advanced Analytics Dashboard** - Shop-specific metrics
4. **Email Notifications** - Purchase confirmations
5. **Pack Bundles and Discounts** - Promotional features

**Files**: `src/app/shop/`, `src/app/api/shop/`

### Crystal Index Integration

**Status**: Low priority (separate site)
**Requirements**:

- Transit-based crystal recommendations
- AI-powered crystal search
- Deep linking between sites
- CTA in Crystal Index to open Lunary

**Files**: `src/components/CrystalWidget.tsx`, `src/app/api/crystals/search/route.ts`

---

## 🎄 YEARLY WRAPPED FEATURE (December)

**Status**: Planned for December launch
**Effort**: 1-2 weeks
**Impact**: MASSIVE viral potential (Spotify Wrapped style)

### What to Include:

1. **Your Tarot Year**
   - Most-pulled cards of the year
   - Card that defined your year
   - Total readings count
   - Suit dominance over time

2. **Your Cosmic Journey**
   - Major transits you experienced
   - Your "theme" months (what suited each month)
   - Moon phases you were most active during

3. **Your Reflections**
   - Journal entries count
   - Mood trends over the year
   - Themes that emerged in your writing
   - Word cloud of your journal

4. **Your Community**
   - Moon Circles participated in
   - Insights shared
   - Your cosmic archetype for the year

5. **Year Ahead Preview**
   - Major 2027 transits for your chart
   - Your personal year number (numerology)
   - Cards to watch for

### Shareable Cards:

- "My 2026 in Cards" - top 3 cards visual
- "My Cosmic Year" - summary card
- "My Year Ahead" - 2027 preview
- Animated story format for Instagram

### Technical Needs:

- Aggregate queries across tarot_readings, collections, moon_circles
- OG image generation for each card type
- Story-format animations (Remotion?)
- Scheduled reveal (Dec 1-15 data collection, Dec 15+ reveal)

**Files to create**:

- `src/app/(authenticated)/wrapped/page.tsx`
- `src/app/api/wrapped/route.ts`
- `src/components/wrapped/` (card components)
- `src/app/api/og/wrapped/` (OG images)

---

## 👥 COMMUNITY FEATURE EXPANSION

**Status**: Future roadmap
**Effort**: Varies by feature
**Impact**: HIGH for retention and differentiation

### Building on Moon Circles:

1. **Transit Support Groups**
   - "Saturn Return Survivors" - for 27-30 year olds
   - "Pluto Transit Support" - deep transformation
   - "Mercury Retrograde Check-in" - seasonal
   - Auto-join based on user's current transits
   - **Effort**: Medium (new group types, auto-assignment logic)

2. **Sign-Based Spaces**
   - Rising sign rooms (most personal identity)
   - "Virgo Rising Lounge" etc.
   - Shared experiences, tips for your rising
   - **Effort**: Low (extend Moon Circles with sign filter)

3. **Anonymous Q&A / Ask the Circle**
   - Post a question to the community
   - Community upvotes/answers
   - AI can seed initial responses
   - Good for: relationship questions, transit interpretations
   - **Effort**: Medium (new post type, voting system)

4. **Collaborative Interpretations**
   - Share a reading, get community input
   - "What would you make of this spread?"
   - Premium feature (limits for free users)
   - **Effort**: Medium (reading sharing, comment system)

5. **Local Circles**
   - City/region based groups
   - "London Moon Circle"
   - Could lead to real-world meetups
   - **Effort**: Low (location field + filter)

### Technical Needs:

- Extend `moon_circles` or new `community_groups` table
- Real-time updates (consider Supabase realtime or polling)
- Moderation tools / reporting
- Notification preferences per group

**Files to create/modify**:

- `src/app/(authenticated)/community/` (new section)
- `src/app/api/community/` (groups, posts, comments)
- `src/components/community/` (UI components)

---

## 🛍️ PHYSICAL PRODUCTS ROADMAP

**Status**: Future revenue stream
**Effort**: Varies (mostly partnerships + print-on-demand)
**Impact**: Additional revenue, brand presence

### Tier 1: Low Effort / High Margin (Print-on-Demand)

1. **Birth Chart Prints**
   - Generate from existing chart wheel visualization
   - Print-on-demand via Printful/Gelato
   - Frame options, multiple sizes
   - Personalized with name, date, placements
   - **Effort**: Low (already have chart, just need commerce flow)

2. **Personalized Planners / Journals**
   - Transit dates pre-filled for the year
   - Moon phases marked
   - Personal numerology dates highlighted
   - Blank journal pages for Book of Shadows
   - **Effort**: Medium (PDF generation + print partner)

3. **Merch (Apparel, Mugs, Stickers)**
   - Zodiac-themed designs
   - "Mercury Retrograde Survivor" etc.
   - Low priority but easy passive revenue
   - **Effort**: Low (design + print-on-demand)

### Tier 2: Medium Effort (Partnerships)

4. **Crystal Kits**
   - "Your Chart Crystal Set" - based on dominant element/placements
   - Partner with crystal supplier (dropship model)
   - Could be subscription box
   - **Effort**: Medium (supplier relationship, fulfillment)

5. **Tarot Card Deck**
   - Lunary-branded deck with unique artwork
   - QR codes on cards linking to Grimoire meanings
   - Pre-order model to fund print run
   - **Effort**: High (artwork, print run, fulfillment)

### Tier 3: Subscription Boxes

6. **Monthly Cosmic Box**
   - Crystal of the month (aligned to transits)
   - Printed transit guide
   - Ritual supplies (candles, herbs)
   - Exclusive digital content
   - **Effort**: High (ongoing curation, fulfillment partner)

### Unique Angle (vs CHANI):

- Multi-system bundles: chart print + crystal kit + numerology guide
- "Complete Cosmic Starter Kit"
- Personalization based on actual birth chart data

### Technical Needs:

- E-commerce integration (Shopify embed or custom)
- PDF generation for personalized products
- Order management / fulfillment API
- Extend existing `/shop` or new `/products` section

**Reference**: CHANI does ~$30-40 planners, workbooks, seasonal guides

---

## 🎙️ PODCAST / AUDIO CONTENT

**Status**: Future content stream
**Effort**: Medium-High (ongoing content creation)
**Impact**: HIGH for retention (CHANI's weekly podcast is major driver)

### Options:

1. **AI-Generated Weekly Forecasts** (Easiest)
   - Use existing horoscope/transit content as script
   - Generate with ElevenLabs (already have `src/lib/tts/elevenlabs.ts`)
   - ~5-10 min per rising sign weekly
   - Fully automated pipeline possible
   - **Effort**: Medium (script generation + TTS + hosting)

2. **Hybrid: AI Script + Human Voice**
   - AI generates personalized script from cosmic data
   - You or voice actor records
   - More authentic feel
   - Bi-weekly or monthly cadence
   - **Effort**: Medium-High (recording time)

3. **Partner with Existing Podcasters**
   - Sponsor astrology podcasters
   - Guest appearances
   - No production overhead
   - **Effort**: Low (outreach + payment)

### Integration Points:

- Audio player on `/horoscope` page
- "Listen to your forecast" button
- Push notification: "Your weekly audio is ready"
- Podcast feed for Apple/Spotify distribution

### Technical Needs:

- Audio file storage (S3/Cloudflare R2)
- RSS feed generation for podcast apps
- Audio player component
- Script-to-speech pipeline

**Files to create**:

- `src/app/api/audio/generate/route.ts`
- `src/components/AudioPlayer.tsx`
- `src/app/(authenticated)/listen/page.tsx`

---

## 🎯 Priority Order

### Immediate (Roadmap Completion):

1. **Expanded Analytics** - Most valuable for product decisions
2. **Light Community Layer** - Engagement feature
3. **Launch Campaign** - Marketing/launch prep

### High Value (SEO/Content):

4. **Tarot Reversed Cards Guide** - Easy, high search volume
5. **Candle Magic Guide** - Popular search term
6. **Rising Sign Guide** - Completes astrology section

### Medium Priority:

7. **Page Speed Optimization** - Technical improvement
8. **Topic Clusters** - SEO improvement
9. **Shop Enhancements** - Revenue optimization

### Low Priority:

10. **Crystal Index Integration** - External site coordination
11. **Grimoire Content Expansion** - Ongoing content work

---

## 📊 Completion Status

**Roadmap Features**: 11/15 completed (73%)  
**Remaining Roadmap**: 3 features (with detailed guides)  
**Other Todos**: Content, SEO, Shop enhancements

---

## 📚 Implementation Guides

All remaining roadmap features have detailed guides:

- `docs/IMPLEMENTATION_GUIDES/01_COMMUNITY_LAYER.md`
- `docs/IMPLEMENTATION_GUIDES/02_ANALYTICS_EXPANSION.md`
- `docs/IMPLEMENTATION_GUIDES/03_LAUNCH_CAMPAIGN.md`

Each guide includes:

- Complete database schemas
- API endpoint specifications
- UI component requirements
- Step-by-step implementation phases
- Testing checklists
