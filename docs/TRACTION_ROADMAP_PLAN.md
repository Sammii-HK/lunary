# 🌙 LUNARY — TRACTION ROADMAP & PRODUCT CHANGES REQUIRED FOR SEED FUNDING

**Status**: Implementation in Progress  
**Timeline**: 8-12 weeks  
**Last Updated**: January 2025

---

## ✅ COMPLETED FEATURES

### 1. ✅ Daily Cosmic Pulse

**Status**: ✅ Complete (Fixed: Duplicate prevention + morning timing)  
**Implementation**:

- Push/email notification system with personalized moon sign, transit, and reflection prompt
- Cron job: `/api/cron/daily-cosmic-pulse` (scheduled daily at 8 AM - local morning)
- Duplicate prevention using `notification_sent_events` table
- Email templates with deep links to AI chat
- Analytics tracking for open rates
- User preference for morning/evening delivery
- Files: `src/lib/cosmic-pulse/`, `src/app/api/cron/daily-cosmic-pulse/`

### 2. ✅ Lunary Copilot Specialized Modes

**Status**: ✅ Complete (Note: Ritual generation uses existing spell recommendations)  
**Implementation**:

- Quick action buttons for: cosmic weather, transit feelings, tarot interpretation, ritual generation, weekly overview, journal entry
- Mode-specific prompt enhancements
- Assist command detection and execution
- Ritual generation leverages existing `getRecommendedSpells()` based on moon phase
- Files: `src/lib/ai/assist.ts`, `src/components/CopilotQuickActions.tsx`, `src/lib/ai/prompt.ts`

### 3. ✅ Moon Circles

**Status**: ✅ Complete  
**Implementation**:

- New Moon and Full Moon event detection
- Guided rituals, journal questions, tarot spreads, AI deep-dive prompts
- Email notifications and push notifications
- In-app Moon Circle page: `/moon-circles`
- Database: `sql/moon_circles.sql`
- Cron job: `/api/cron/moon-circles` (checks daily for New/Full Moon)
- Files: `src/lib/moon-circles/`, `src/app/moon-circles/`

### 4. ✅ Pricing Tier Restructure

**Status**: ✅ Complete  
**Implementation**:

- Lunary+ (£4.99/month) - Rituals, Moon Circles, personalized guidance
- Lunary+ AI (£8.99/month) - Everything in Lunary+ plus unlimited AI
- Annual (£79.99/year) - Full year with AI, save 26%
- Feature flags system updated
- Files: `utils/pricing.ts`, `src/lib/ai/plans.ts`

### 5. ✅ Weekly AI Ritual/Reading Limit

**Status**: ✅ Complete  
**Implementation**:

- 1 free AI ritual/reading per week for free tier
- Usage tracking: `sql/weekly_ritual_usage.sql`
- Upgrade CTAs when limit reached
- Files: `src/lib/ai/weekly-ritual-usage.ts`, `src/app/api/ai/chat/route.ts`

---

## 🚧 IN PROGRESS / PENDING FEATURES

### 6. ⏳ Blog + Substack + App Funnel Unification

**Status**: Pending  
**Requirements**:

- CTAs between app, Substack, and blog posts
- Deep linking between platforms
- Cross-platform analytics tracking
- Unified user journey

**Files to Update**:

- Blog templates: `src/app/blog/**`
- Substack integration: `src/app/api/substack/**`
- Add CTAs and deep links

### 7. ⏳ Crystal Index Integration

**Status**: Pending  
**Note**: Crystal Index is currently a separate site - integration will focus on CTAs and deep linking

**Requirements**:

- "Crystal of the day" feature (already exists in `CrystalWidget.tsx`)
- "Crystal for grounding with this transit" suggestions
- Crystal index search powered by Lunary AI
- CTA in Crystal Index site to open Lunary app
- Deep links from Lunary app to Crystal Index

**Files to Update**:

- `src/components/CrystalWidget.tsx` (enhance existing)
- `src/constants/grimoire/crystals.ts` (add transit-based recommendations)
- Add AI-powered search endpoint: `/api/crystals/search`

### 8. ⏳ Automated Weekly Email Report

**Status**: Pending  
**Requirements**:

- Weekly email every Sunday
- Week ahead summary
- Key transit highlight
- Moon phase information
- Suggested ritual
- CTA to "Ask Lunary what this means for you"

**Implementation Needed**:

- Cron job: `/api/cron/weekly-email-report` (Sundays)
- Email template: `src/lib/weekly-report/email-template.tsx`
- Content generator: `src/lib/weekly-report/generator.ts`

### 9. ⏳ Light Community Layer (Phase 1)

**Status**: Pending  
**Requirements**:

- "Shared Moon Circles" feature
- Reply via email or Substack comments
- Anonymous sharing in-app
- Community insights aggregation

**Implementation Needed**:

- Database: `sql/moon_circle_insights.sql`
- API: `/api/moon-circles/insights`
- UI: Community insights component

### 10. ⏳ "Save This" + Collections Feature

**Status**: Pending  
**Requirements**:

- Save chat responses, rituals, insights, moon circle notes, tarot readings
- Build "Lunary Journal" collection
- Organize saved items by category

**Implementation Needed**:

- Database: `sql/collections.sql`
- API: `/api/collections/**`
- UI: Collections page and save buttons

### 11. ⏳ Enhanced Onboarding

**Status**: Pending  
**Requirements**:

- Collect birth chart data immediately
- Preview "what you unlock with Lunary AI"
- Quick 30s transit explanation
- Intention selection (Clarity, Confidence, Calm, Insight)

**Files to Update**:

- `src/components/OnboardingFlow.tsx`
- Add intention selection step
- Add AI preview component

### 12. ⏳ Cosmic Snapshot Cached Object

**Status**: Pending  
**Requirements**:

- Proprietary JSON snapshot updated every few hours
- Contains: birth chart, current transits, moon position, tarot reading, mood logs, crystal recommendation
- Technical defensibility feature

**Implementation Needed**:

- Cache system: `src/lib/cosmic-snapshot/`
- Cron job to update snapshots
- API endpoint to retrieve snapshots

### 13. ⏳ Expanded Analytics

**Status**: Pending  
**Requirements**:

- Track DAU/WAU/MAU
- AI chat engagement metrics
- AI tokens/user
- Conversion %
- Cosmic pulse open rate
- Feature usage heatmap

**Files to Update**:

- `src/app/api/admin/analytics/route.ts`
- `src/app/admin/analytics/page.tsx`
- Add new metrics calculations

### 14. ⏳ Viral Growth Hooks

**Status**: Pending  
**Requirements**:

- Shareable cosmic summary cards
- "Ask Lunary about YOUR chart" CTA on TikTok
- Weekly Substack teasers on socials
- OG image generator for users
- "What's your Moon in \_\_\_?" stickers

**Implementation Needed**:

- Share card generator: `/api/share/cosmic-card`
- OG image generator: `/api/og/user-cosmic`
- Social media templates

### 15. ⏳ Launch Campaign

**Status**: Pending  
**Requirements**:

- Public launch announcement pages
- Product Hunt launch prep
- TikTok series "Building Lunary"
- Cosmic Report Generator
- Press kit

**Implementation Needed**:

- Launch page: `/launch`
- Product Hunt assets
- Press kit: `/press-kit`

---

## 📊 IMPLEMENTATION PROGRESS

**Completed**: 5/15 features (33%)  
**In Progress**: 0/15 features  
**Pending**: 10/15 features (67%)

---

## 🔧 TECHNICAL NOTES

### Database Migrations Required

1. ✅ `sql/moon_circles.sql` - Created
2. ✅ `sql/weekly_ritual_usage.sql` - Created
3. ⏳ `sql/collections.sql` - Pending
4. ⏳ `sql/moon_circle_insights.sql` - Pending
5. ⏳ `sql/cosmic_snapshots.sql` - Pending

### Cron Jobs Configured

1. ✅ Daily Cosmic Pulse: `0 9 * * *` (9 AM daily)
2. ✅ Moon Circles: Daily check for New/Full Moon
3. ⏳ Weekly Email Report: `0 10 * * 0` (10 AM Sundays) - Pending

### API Endpoints Created

1. ✅ `/api/cron/daily-cosmic-pulse` - Daily notifications
2. ✅ `/api/cron/moon-circles` - Moon Circle generation
3. ✅ `/api/moon-circles` - Fetch Moon Circle data
4. ⏳ `/api/cron/weekly-email-report` - Pending
5. ⏳ `/api/collections/**` - Pending
6. ⏳ `/api/share/cosmic-card` - Pending

---

## 🎯 NEXT PRIORITIES

1. **Weekly Email Report** - High impact, moderate effort
2. **Crystal Index Integration** - High engagement potential
3. **Collections Feature** - Retention driver
4. **Enhanced Onboarding** - Conversion optimization
5. **Viral Growth Hooks** - Growth acceleration

---

## 📝 NOTES

- All completed features are production-ready
- Database migrations need to be run: `sql/moon_circles.sql`, `sql/weekly_ritual_usage.sql`
- Cron jobs are configured in `vercel.json`
- Feature flags system is updated in `utils/pricing.ts`
- AI plans updated in `src/lib/ai/plans.ts`

---

**Last Updated**: January 2025  
**Next Review**: After completing next 3 features
