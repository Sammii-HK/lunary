import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import {
  generateDeletionCompleteEmailHTML,
  generateDeletionCompleteEmailText,
} from '@/lib/email-components/ComplianceEmails';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Processing scheduled account deletions...');

    const pendingDeletions = await prisma.deletion_requests.findMany({
      where: {
        status: 'pending',
        scheduled_for: { lte: new Date() },
      },
    });

    const results = {
      processed: 0,
      errors: 0,
      details: [] as { userId: string; success: boolean; error?: string }[],
    };

    for (const deletion of pendingDeletions) {
      try {
        const userId = deletion.user_id;

        // 1. Cancel any active Stripe subscriptions
        const subscription = await prisma.subscriptions.findUnique({
          where: { user_id: userId },
          select: {
            stripe_subscription_id: true,
            stripe_customer_id: true,
          },
        });

        if (subscription?.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(
              subscription.stripe_subscription_id,
            );
          } catch {
            console.log('Subscription already cancelled or not found');
          }
        }

        // 2. Delete all user data in a single transaction
        await prisma.$transaction([
          // --- User content ---
          prisma.collections.deleteMany({ where: { user_id: userId } }),
          prisma.collection_folders.deleteMany({
            where: { user_id: userId },
          }),
          prisma.synastry_reports.deleteMany({ where: { user_id: userId } }),
          prisma.relationship_profiles.deleteMany({
            where: { user_id: userId },
          }),
          prisma.cosmic_reports.deleteMany({ where: { user_id: userId } }),
          prisma.cosmic_snapshots.deleteMany({ where: { user_id: userId } }),
          prisma.daily_horoscopes.deleteMany({ where: { user_id: userId } }),
          prisma.daily_thread_modules.deleteMany({
            where: { user_id: userId },
          }),
          prisma.monthly_insights.deleteMany({ where: { user_id: userId } }),
          prisma.ai_prompts.deleteMany({ where: { user_id: userId } }),
          prisma.user_memory.deleteMany({ where: { user_id: userId } }),
          prisma.conversation_snippets.deleteMany({
            where: { user_id: userId },
          }),
          prisma.pattern_analysis.deleteMany({ where: { user_id: userId } }),
          prisma.year_analysis.deleteMany({ where: { user_id: userId } }),

          // --- Engagement & gamification ---
          prisma.daily_rituals.deleteMany({ where: { user_id: userId } }),
          prisma.challenge_completions.deleteMany({
            where: { user_id: userId },
          }),
          prisma.milestones_achieved.deleteMany({
            where: { user_id: userId },
          }),
          prisma.ritual_habits.deleteMany({ where: { user_id: userId } }),
          prisma.weekly_ritual_usage.deleteMany({
            where: { user_id: userId },
          }),
          prisma.user_progress.deleteMany({ where: { user_id: userId } }),
          prisma.onboarding_completion.deleteMany({
            where: { user_id: userId },
          }),
          prisma.tourProgress.deleteMany({ where: { userId: userId } }),
          prisma.feature_announcements_seen.deleteMany({
            where: { user_id: userId },
          }),

          // --- Social & community ---
          prisma.cosmic_gifts.deleteMany({
            where: {
              OR: [{ sender_id: userId }, { recipient_id: userId }],
            },
          }),
          prisma.friend_celebrations.deleteMany({
            where: {
              OR: [{ sender_id: userId }, { receiver_id: userId }],
            },
          }),
          prisma.friend_connections.deleteMany({
            where: {
              OR: [{ user_id: userId }, { friend_id: userId }],
            },
          }),
          prisma.friend_invites.deleteMany({
            where: {
              OR: [{ inviter_id: userId }, { accepted_by_id: userId }],
            },
          }),
          prisma.community_votes.deleteMany({ where: { user_id: userId } }),
          prisma.community_posts.deleteMany({ where: { user_id: userId } }),
          prisma.community_memberships.deleteMany({
            where: { user_id: userId },
          }),
          prisma.moon_circle_insights.deleteMany({
            where: { user_id: userId },
          }),

          // --- Notifications & preferences ---
          prisma.native_push_tokens.deleteMany({
            where: { user_id: userId },
          }),
          prisma.push_subscriptions.deleteMany({
            where: { user_id: userId },
          }),
          prisma.email_preferences.deleteMany({
            where: { user_id: userId },
          }),
          prisma.newsletter_subscribers.deleteMany({
            where: { user_id: userId },
          }),

          // --- Analytics (anonymize for aggregate integrity) ---
          prisma.analytics_user_activity.updateMany({
            where: { user_id: userId },
            data: { user_id: 'deleted' },
          }),
          prisma.analytics_conversions.updateMany({
            where: { user_id: userId },
            data: { user_id: 'deleted' },
          }),
          prisma.analytics_ai_usage.updateMany({
            where: { user_id: userId },
            data: { user_id: 'deleted' },
          }),
          prisma.analytics_notification_events.deleteMany({
            where: { user_id: userId },
          }),
          prisma.analytics_identity_links.deleteMany({
            where: { user_id: userId },
          }),
          prisma.user_attribution.deleteMany({ where: { user_id: userId } }),

          // --- Referrals & campaigns ---
          prisma.user_referrals.deleteMany({
            where: {
              OR: [{ referrer_user_id: userId }, { referred_user_id: userId }],
            },
          }),
          prisma.referral_codes.deleteMany({ where: { user_id: userId } }),
          prisma.re_engagement_campaigns.deleteMany({
            where: { user_id: userId },
          }),

          // --- Misc ---
          prisma.legacy_fallback_usage.deleteMany({
            where: { user_id: userId },
          }),
          prisma.subscription_audit_log.deleteMany({
            where: { user_id: userId },
          }),
          prisma.pending_checkouts.deleteMany({
            where: { user_id: userId },
          }),

          // --- Original tables ---
          prisma.tarot_readings.deleteMany({ where: { user_id: userId } }),
          prisma.user_sessions.deleteMany({ where: { user_id: userId } }),
          prisma.aiThread.deleteMany({ where: { userId: userId } }),
          prisma.aiUsage.deleteMany({ where: { userId: userId } }),
          prisma.user_profiles.deleteMany({ where: { user_id: userId } }),
          prisma.shop_purchases.deleteMany({ where: { user_id: userId } }),
          prisma.user_notes.deleteMany({ where: { user_id: userId } }),
          prisma.user_streaks.deleteMany({ where: { user_id: userId } }),
          prisma.apiKey.deleteMany({ where: { userId: userId } }),
          prisma.subscriptions.deleteMany({ where: { user_id: userId } }),
          prisma.conversion_events.deleteMany({
            where: { user_id: userId },
          }),
          prisma.journal_patterns.deleteMany({ where: { user_id: userId } }),
          prisma.email_events.deleteMany({ where: { user_id: userId } }),
          prisma.refund_requests.deleteMany({ where: { user_id: userId } }),

          // --- BetterAuth tables (user last due to FK references) ---
          prisma.account.deleteMany({ where: { userId: userId } }),
          prisma.session.deleteMany({ where: { userId: userId } }),
          prisma.user.delete({ where: { id: userId } }),

          // --- Mark deletion as completed (kept for audit) ---
          prisma.deletion_requests.update({
            where: { id: deletion.id },
            data: { status: 'completed', processed_at: new Date() },
          }),
        ]);

        // Send deletion complete email
        if (deletion.user_email) {
          try {
            const html = await generateDeletionCompleteEmailHTML(
              deletion.user_email,
            );
            const text = generateDeletionCompleteEmailText(deletion.user_email);

            await sendEmail({
              to: deletion.user_email,
              subject: 'Account Deleted - Lunary',
              html,
              text,
            });
          } catch (emailError) {
            console.error(
              'Failed to send deletion complete email:',
              emailError,
            );
          }
        }

        results.processed++;
        results.details.push({ userId, success: true });

        console.log(`Deleted account: ${userId}`);
      } catch (error) {
        console.error(`Failed to delete account ${deletion.user_id}:`, error);
        results.errors++;
        results.details.push({
          userId: deletion.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(
      `Deletion processing complete: ${results.processed} processed, ${results.errors} errors`,
    );

    // Purge old rows from high-volume tables to keep storage and query costs down
    const purgeResults: Record<string, number> = {};
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const [bridgeLogs, notifEvents, cosmicSnaps] = await Promise.all([
        // GptBridgeLog — API call logs, no long-term value
        prisma.gptBridgeLog.deleteMany({
          where: { createdAt: { lt: ninetyDaysAgo } },
        }),
        // analytics_notification_events — per-event rows, aggregate data already in daily_metrics
        prisma.analytics_notification_events.deleteMany({
          where: { created_at: { lt: ninetyDaysAgo } },
        }),
        // cosmic_snapshots — daily per-user snapshots, keep 60 days
        prisma.cosmic_snapshots.deleteMany({
          where: { snapshot_date: { lt: sixtyDaysAgo } },
        }),
      ]);

      purgeResults.bridge_logs = bridgeLogs.count;
      purgeResults.notification_events = notifEvents.count;
      purgeResults.cosmic_snapshots = cosmicSnaps.count;

      console.log('Purge complete:', purgeResults);
    } catch (purgeError) {
      console.error('Purge step failed (non-fatal):', purgeError);
    }

    // Verification backfill — catch users who signed up but never got an email
    let verificationSent = 0;
    try {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const candidates = await prisma.user.findMany({
        where: {
          emailVerified: false,
          createdAt: { gte: sevenDaysAgo, lte: thirtyMinsAgo },
          NOT: { email: { contains: 'test.lunary.app' } },
        },
        select: { id: true, email: true },
      });

      if (candidates.length > 0) {
        const existingTokens = await prisma.verification.findMany({
          where: {
            identifier: { in: candidates.map((u) => u.email) },
            expiresAt: { gte: new Date() },
          },
          select: { identifier: true },
        });
        const hasToken = new Set(existingTokens.map((v) => v.identifier));
        const needsEmail = candidates.filter((u) => !hasToken.has(u.email));

        const baseURL =
          process.env.NEXT_PUBLIC_BASE_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          'https://lunary.app';
        const emailModule = await import('@/lib/email');

        for (const user of needsEmail) {
          try {
            const token = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
            await prisma.verification.deleteMany({
              where: { identifier: user.email },
            });
            await prisma.verification.create({
              data: {
                id: crypto.randomUUID(),
                identifier: user.email,
                value: token,
                expiresAt,
              },
            });
            const verificationUrl = `${baseURL}/auth/verify-email?token=${token}`;
            let html: string;
            let text: string;
            try {
              html = await (emailModule as any).generateVerificationEmailHTML(
                verificationUrl,
                user.email,
              );
              text = (emailModule as any).generateVerificationEmailText(
                verificationUrl,
                user.email,
              );
            } catch {
              html = `<p>Verify your email to access Lunary:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`;
              text = `Verify your email:\n${verificationUrl}`;
            }
            await emailModule.sendEmail({
              to: user.email,
              subject: 'One click to start your trial — Lunary',
              html,
              text,
              tracking: {
                userId: user.id,
                notificationType: 'email_verification',
                notificationId: `email-verify-cron-${token}`,
                utm: {
                  source: 'email',
                  medium: 'auth',
                  campaign: 'email_verification_cron',
                },
              },
            });
            verificationSent++;
            console.log(`[verification-backfill] Sent to ${user.email}`);
          } catch (e) {
            console.error(
              `[verification-backfill] Failed for ${user.email}:`,
              e,
            );
          }
        }
      }
    } catch (backfillError) {
      console.error('Verification backfill failed (non-fatal):', backfillError);
    }

    return NextResponse.json({
      success: true,
      processed: results.processed,
      errors: results.errors,
      details: results.details,
      purged: purgeResults,
      verificationsSent: verificationSent,
    });
  } catch (error) {
    console.error('Deletion cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process deletions' },
      { status: 500 },
    );
  }
}
