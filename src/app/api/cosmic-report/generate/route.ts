import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { createShareToken, buildShareUrl } from '@/lib/cosmic-report/share';
import { CosmicReportData, COSMIC_SECTIONS } from '@/lib/cosmic-report/types';
import { sendEmail } from '@/lib/email';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';

const generateSchema = z.object({
  report_type: z.enum(['weekly', 'monthly', 'custom']),
  date_range: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  include_sections: z.array(z.string()).optional(),
  make_public: z.boolean().optional(),
  email: z.string().email().optional(),
  generated_for: z.string().optional(),
});

const SECTION_LIBRARY: Record<
  string,
  { title: string; summary: string; highlights: string[] }
> = {
  transits: {
    title: 'Planetary Transits',
    summary:
      'Key alignments shaping your decisions. Includes caution windows and green lights for launches.',
    highlights: [
      'Mars sextile Uranus → rapid experimentation',
      'Saturn square Sun → protect energy + rest',
    ],
  },
  moon: {
    title: 'Lunar Weather',
    summary:
      'Moon placements + rituals for emotional clarity and community gatherings.',
    highlights: [
      'Full Moon in Virgo → systems + ritual reset',
      'New Moon in Aries → bold first steps',
    ],
  },
  tarot: {
    title: 'Tarot Archetypes',
    summary:
      'AI interprets card archetypes alongside your astrological weather for story-driven insights.',
    highlights: [
      'The Star → share progress',
      'Four of Cups → audit your inputs',
    ],
  },
  mood: {
    title: 'Mood + Somatics',
    summary: 'Energy forecast for nervous system regulation and collaboration.',
    highlights: [
      'High creativity mid-week; plan deep work',
      'Grounding rituals recommended on Friday',
    ],
  },
  rituals: {
    title: 'Ritual Blueprint',
    summary:
      'Step-by-step altar, journaling, and embodiment practices for the period.',
    highlights: ['Breathwork for Mars transits', 'Candle ritual for focus'],
  },
};

function buildReportData({
  reportType,
  dateRange,
  includeSections,
  generatedFor,
}: {
  reportType: 'weekly' | 'monthly' | 'custom';
  dateRange?: { start?: string; end?: string };
  includeSections?: string[];
  generatedFor?: string;
}): CosmicReportData {
  const sectionKeys =
    includeSections && includeSections.length > 0
      ? includeSections
      : COSMIC_SECTIONS[reportType];

  const sections = sectionKeys.map((key) => {
    const base = SECTION_LIBRARY[key] || SECTION_LIBRARY.transits;
    return {
      key,
      title: base.title,
      summary: base.summary,
      highlights: base.highlights,
      actionSteps: [
        'Journal your intention',
        'Share progress with community',
        'Schedule ritual reminder',
      ],
    };
  });

  return {
    title: `Cosmic ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
    subtitle: 'Generated with real astronomical data + Lunary AI rituals.',
    reportType,
    generatedFor,
    dateRange,
    sections,
    metadata: {
      generatedAt: new Date().toISOString(),
    },
  };
}

async function sendReportEmail({
  email,
  shareUrl,
  pdfUrl,
  report,
}: {
  email: string;
  shareUrl?: string;
  pdfUrl: string;
  report: CosmicReportData;
}) {
  const html = `
    <div style="font-family:Inter,Helvetica,sans-serif;background:#05020c;color:#f4f4ff;padding:32px;border-radius:20px">
      <h1>${report.title}</h1>
      <p>${report.subtitle}</p>
      <p><strong>Share link:</strong> ${shareUrl || 'Private report'}</p>
      <p><a href="${pdfUrl}" style="color:#c4b5fd">Download PDF</a></p>
    </div>
  `;
  const text = `${report.title}

${report.subtitle}
Share: ${shareUrl || 'Private report'}
PDF: ${pdfUrl}`;

  await sendEmail({
    to: email,
    subject: `Your Lunary ${report.reportType} report`,
    html,
    text,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireUser(request);

    // Check subscription status and feature access
    const subscriptionResult = await sql`
      SELECT plan_type, status, stripe_customer_id
      FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let subscription = subscriptionResult.rows[0];
    // Normalize status: 'trialing' -> 'trial' for consistency with hasFeatureAccess
    const rawStatus = subscription?.status || 'free';
    let subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    // Normalize plan type to ensure correct feature access
    let planType = normalizePlanType(subscription?.plan_type);
    const customerId = subscription?.stripe_customer_id;

    // Debug logging
    console.log('[cosmic-report/generate] Subscription check:', {
      userId: user.id,
      rawStatus,
      subscriptionStatus,
      rawPlanType: subscription?.plan_type,
      normalizedPlanType: planType,
      hasSubscription: !!subscription,
      customerId,
    });

    // Check if database grants access
    let hasAccess = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'downloadable_reports',
    );

    // If database doesn't grant access but we have a customer ID, check Stripe as source of truth
    if (!hasAccess && customerId) {
      try {
        const stripeResponse = await fetch(
          `${request.nextUrl.origin}/api/stripe/get-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId }),
          },
        );

        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json();
          if (
            (stripeData.success || stripeData.hasSubscription) &&
            stripeData.subscription
          ) {
            const stripeSub = stripeData.subscription;
            // Normalize status: 'trialing' -> 'trial' for consistency
            const rawStripeStatus = stripeSub.status;
            subscriptionStatus =
              rawStripeStatus === 'trialing' ? 'trial' : rawStripeStatus;
            planType = normalizePlanType(stripeSub.plan);

            console.log('[cosmic-report/generate] Using Stripe subscription:', {
              rawStripeStatus,
              subscriptionStatus,
              rawPlan: stripeSub.plan,
              normalizedPlan: planType,
            });

            hasAccess = hasFeatureAccess(
              subscriptionStatus,
              planType,
              'downloadable_reports',
            );
          }
        }
      } catch (error) {
        console.error(
          '[cosmic-report/generate] Failed to check Stripe subscription:',
          error,
        );
      }
    }

    console.log('[cosmic-report/generate] Feature access check:', {
      subscriptionStatus,
      planType,
      feature: 'downloadable_reports',
      hasAccess,
    });

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Cosmic Report Generator is available for Lunary+ AI subscribers. Upgrade to unlock this feature.',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = generateSchema.parse(body);

    const reportData = buildReportData({
      reportType: parsed.report_type,
      dateRange: parsed.date_range,
      includeSections: parsed.include_sections,
      generatedFor: parsed.generated_for,
    });

    const shouldShare = parsed.make_public ?? false;
    const shareToken = shouldShare ? createShareToken() : null;

    const insertResult = await sql`
      INSERT INTO cosmic_reports (user_id, report_type, report_data, share_token, is_public)
      VALUES (
        ${user.id},
        ${parsed.report_type},
        ${JSON.stringify(reportData)},
        ${shareToken},
        ${shouldShare}
      )
      RETURNING id, share_token, is_public, created_at
    `;

    const record = insertResult.rows[0];
    const shareUrl = shareToken ? buildShareUrl(shareToken) : undefined;
    const pdfUrl = `/api/cosmic-report/${record.id}/pdf`;

    if (parsed.email) {
      try {
        await sendReportEmail({
          email: parsed.email,
          shareUrl,
          pdfUrl,
          report: reportData,
        });
      } catch (emailError) {
        console.error('Failed to email cosmic report:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      report: {
        id: record.id,
        share_token: record.share_token,
        share_url: shareUrl,
        pdf_url: pdfUrl,
        data: reportData,
      },
    });
  } catch (error) {
    console.error('Failed to generate cosmic report:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please sign in to use the Cosmic Report Generator',
          requiresAuth: true,
        },
        { status: 401 },
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload', issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to generate cosmic report',
      },
      { status: 500 },
    );
  }
}
