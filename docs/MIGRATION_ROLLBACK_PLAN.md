# Jazz to PostgreSQL Migration Rollback Plan

## Overview

This document outlines the rollback procedures in case issues arise during the Jazz to PostgreSQL migration. The goal is to minimize user impact and restore service quickly if problems are detected.

## Risk Assessment

| Risk Level | Scenario                               | Impact                 | Rollback Time |
| ---------- | -------------------------------------- | ---------------------- | ------------- |
| Low        | Minor data inconsistencies             | Limited users affected | < 30 min      |
| Medium     | API failures affecting subset of users | Moderate user impact   | 1-2 hours     |
| High       | Complete auth/profile system failure   | All users affected     | 2-4 hours     |
| Critical   | Data corruption or loss                | Severe user impact     | 4+ hours      |

## Pre-Rollback Checklist

Before initiating rollback, verify:

- [ ] Issue is confirmed (not a transient network error)
- [ ] Issue scope is understood (how many users affected?)
- [ ] Jazz system is still accessible (credentials valid)
- [ ] Team notified and available for support
- [ ] User communication plan ready

## Rollback Procedures

### Level 1: Quick Fix (Minor Issues)

For minor issues that don't require full rollback:

1. **Disable Dual-Write**

   ```bash
   # In Vercel Dashboard or .env.local:
   ENABLE_DUAL_WRITE=false
   ```

2. **Verify PostgreSQL is primary**
   - All reads should come from PostgreSQL
   - All writes should go to PostgreSQL only
   - Monitor error rates in logs

3. **Fix the specific issue**
   - Review error logs
   - Apply targeted fix
   - Deploy fix

### Level 2: Partial Rollback (Feature-Specific)

If a specific feature is broken (e.g., birth chart not saving):

1. **Identify affected API routes**

   ```
   /api/profile/birth-chart
   /api/profile/personal-card
   /api/profile/location
   ```

2. **Enable fallback mode for affected route**

   ```typescript
   // In the affected route, add:
   const USE_FALLBACK = process.env.FALLBACK_BIRTH_CHART === 'true';

   if (USE_FALLBACK) {
     // Return cached or default data
   }
   ```

3. **Monitor and fix**
   - Track error rates
   - Apply fix
   - Disable fallback mode

### Level 3: Full Auth Rollback

If Better Auth + PostgreSQL is completely broken:

1. **Restore Jazz Auth (if still possible)**

   This is only possible if Jazz dependencies haven't been removed yet.

   ```typescript
   // In src/lib/auth.ts, revert to:
   import { JazzBetterAuthDatabaseAdapter } from 'jazz-tools/better-auth/database-adapter';

   authInstance = betterAuth({
     database: JazzBetterAuthDatabaseAdapter,
     // ...
   });
   ```

2. **Redeploy with Jazz packages**

   ```json
   // In package.json, restore:
   "jazz-tools": "^0.18.20",
   "jazz-react": "^0.18.20"
   ```

3. **Restore JazzProvider**
   - Uncomment JazzProvider in layout.tsx
   - Restore schema.ts if deleted

4. **Notify users**
   - Post status update
   - Send email if significant downtime

### Level 4: Data Recovery

If data corruption is detected:

1. **Assess damage**

   ```bash
   pnpm tsx scripts/validate-migration-complete.ts
   ```

2. **Identify affected users**

   ```sql
   -- Find users with issues
   SELECT * FROM jazz_migration_status
   WHERE migration_status = 'failed'
   ORDER BY updated_at DESC;
   ```

3. **Recover from Jazz export (if available)**

   ```bash
   # If jazz_export_data.json exists:
   pnpm tsx scripts/import-to-postgres.ts
   ```

4. **Manual data recovery**
   - Contact affected users
   - Offer to manually restore data
   - Document lessons learned

## Environment Variable Quick Reference

```bash
# Disable PostgreSQL profile writes (use Jazz)
ENABLE_POSTGRES_PROFILE=false

# Disable dual-write (PostgreSQL only, no Jazz sync)
ENABLE_DUAL_WRITE=false

# Enable Jazz fallback for reads
ENABLE_JAZZ_FALLBACK=true

# Feature-specific fallbacks
FALLBACK_BIRTH_CHART=true
FALLBACK_PERSONAL_CARD=true
FALLBACK_LOCATION=true
```

## Monitoring Checklist

During migration, monitor:

1. **Error Rates**
   - `/api/profile` 5xx errors
   - `/api/auth/*` failures
   - Database connection timeouts

2. **Performance**
   - API response times
   - Database query times
   - Page load times

3. **Data Integrity**
   - New profile creation success rate
   - Profile update success rate
   - Subscription sync status

4. **User Reports**
   - Support ticket volume
   - Social media mentions
   - In-app error reports

## Communication Templates

### Status Page Update (Minor Issue)

```
Title: Minor service degradation - Profile updates
Status: Investigating

We're experiencing minor issues with profile updates.
Users may need to retry saving their profile.
We're working on a fix and will update shortly.

Last updated: [timestamp]
```

### Status Page Update (Major Issue)

```
Title: Service disruption - Authentication issues
Status: Identified

We've identified an issue affecting user authentication.
Some users may be unable to sign in or access their profiles.
Our team is actively working on resolving this issue.

Impact: Authentication and profile access
Started: [timestamp]
ETA: [estimated time to resolution]

Last updated: [timestamp]
```

### Email to Affected Users

```
Subject: We're sorry for the inconvenience

Hi [User Name],

You may have experienced issues with your Lunary account recently.
We sincerely apologize for any inconvenience this caused.

What happened:
[Brief technical explanation]

What we've done:
[Actions taken to resolve]

Your data:
[Status of their data - was anything lost?]

Next steps:
[What user needs to do, if anything]

If you have any questions, please reply to this email.

Thank you for your patience,
The Lunary Team
```

## Post-Rollback Actions

After any rollback:

1. **Root Cause Analysis**
   - What went wrong?
   - Why wasn't it caught in testing?
   - How can we prevent this?

2. **Documentation Update**
   - Update this rollback plan
   - Document new edge cases
   - Add new test cases

3. **Testing Improvements**
   - Add regression tests
   - Improve E2E coverage
   - Consider chaos engineering

4. **User Follow-up**
   - Apologize to affected users
   - Offer compensation if appropriate
   - Gather feedback

## Emergency Contacts

| Role             | Contact | Availability |
| ---------------- | ------- | ------------ |
| Lead Developer   | [email] | 24/7         |
| DevOps           | [email] | 24/7         |
| Customer Support | [email] | 9am-6pm      |
| Database Admin   | [email] | On-call      |

## Version History

| Version | Date       | Author | Changes               |
| ------- | ---------- | ------ | --------------------- |
| 1.0     | 2024-XX-XX | Team   | Initial rollback plan |
