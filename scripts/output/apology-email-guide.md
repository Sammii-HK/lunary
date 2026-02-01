# User Communication Guide

## Summary of Issue

Between the initial launch and January 31, 2026, a critical bug in our subscription webhook logic caused:

1. **87 paying customers** were incorrectly marked as "cancelled" or "free" in our database, even though they had active subscriptions in Stripe
2. **3 customers** had invalid/broken customer IDs that prevented access
3. **5 customers** have payment issues (past_due) that need resolution
4. **2 customers** have duplicate subscriptions and may be double-charged

**Total affected: 90 users**

## Issue Details

### Root Cause

- Webhook failures when userId metadata was missing
- No database-first lookup before creating Stripe customers
- Race conditions between checkout and webhook processing

### Impact

- Users paid for subscriptions but were denied access to premium features
- Users appeared as "free" tier even though actively paying
- Some users created multiple Stripe accounts trying to resolve access issues

### Resolution

- Fixed webhook logic on January 31, 2026
- Ran sync script to restore all affected accounts
- All 87 users now have correct access to their paid features
- Invalid customer IDs have been cleaned up

## Files Created

1. **affected-users-manual.json** - Full details with categories
2. **email-list-simple.json** - Simple array of 90 emails
3. **apology-email-guide.md** - This file

## User Categories

### 1. Access Restored (87 users)

These users were paying but showed as cancelled/free. Now have correct access.

**Action needed:** Apology email

### 2. Invalid Customer IDs (3 users)

- benfitter@me.com
- jackmcguirelewis97@gmail.com
- myles.sanigar@gmail.com

**Action needed:** Personal outreach - they may need to re-subscribe

### 3. Payment Issues (5 users)

- 007natalyy@gmail.com
- gabii.gutierrez013@gmail.com
- katruthless2017@gmail.com
- medusaworldbusiness@gmail.com
- themagicmakerr@gmail.com

**Action needed:** Email about updating payment method

### 4. Multiple Subscriptions (2 users)

- 007natalyy@gmail.com (also has payment issue)
- katruthless2017@gmail.com (also has payment issue)

**Action needed:** Check Stripe dashboard and cancel duplicates

## Suggested Email Template

### For Access Restored Users (87 users)

**Subject:** Your [Product] Access Has Been Restored

Hi,

We're writing to apologize for a technical issue that affected your account.

**What happened:**
Due to a bug in our subscription system, your account was incorrectly marked as "free" even though you had an active paid subscription. This prevented you from accessing the premium features you paid for.

**What we've done:**

- The issue has been fixed as of January 31, 2026
- Your account now correctly shows your active subscription
- You have full access to all features in your plan

**What happens next:**

- No action needed on your part
- Your subscription will continue as normal
- If you experienced any issues or have questions, please reply to this email

We sincerely apologize for any inconvenience this may have caused. As a token of our apology, [consider offering compensation - extra trial time, discount, etc.].

Thank you for your patience and for being a valued customer.

---

### For Invalid Customer ID Users (3 users)

**Subject:** Action Required: Your [Product] Subscription

Hi,

We discovered a critical issue with your subscription that requires your attention.

**What happened:**
During a system audit, we found that your Stripe customer ID became invalid, which prevented your subscription from working correctly.

**What you need to do:**
We've cleared the invalid data from your account. If you'd like to continue using [Product], please:

1. Visit [subscription page URL]
2. Set up a new subscription

We sincerely apologize for this inconvenience. As compensation, we'd like to offer you [compensation details].

Please reply if you have any questions or concerns.

---

### For Payment Issue Users (5 users)

**Subject:** Payment Method Update Needed for [Product]

Hi,

Your subscription access has been restored, but we noticed your payment is currently past due.

**What happened:**
Your most recent payment attempt failed, but due to a separate technical issue, you weren't notified properly.

**What you need to do:**
Please update your payment method to continue uninterrupted access:

1. Visit [billing portal URL]
2. Update your payment method
3. Retry the failed payment

Your access is currently active, but will be suspended if payment isn't resolved within [timeframe].

If you have any questions, please don't hesitate to reach out.

---

## Recommended Actions

1. **Immediately:**
   - Send apology email to 87 "access restored" users
   - Personally reach out to 3 invalid customer ID users
   - Send payment reminder to 5 past_due users

2. **Within 24 hours:**
   - Check Stripe for the 2 users with multiple subscriptions and cancel duplicates
   - Monitor support tickets for user complaints

3. **Ongoing:**
   - Monitor orphaned subscriptions table
   - Run `verify-sync.ts` weekly to catch any new mismatches
   - Set up alerts for webhook failures

## Compensation Suggestions

Consider offering affected users:

- 1 month free extension
- Discount on next renewal (e.g., 25% off)
- Free upgrade to higher tier for 1 month
- Store credit or bonus features

Choose based on your business model and the severity of impact on each user.
