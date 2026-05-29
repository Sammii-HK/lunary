import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { createShareToken, buildShareUrl } from '@/lib/cosmic-report/share';
import { CosmicReportData } from '@/lib/cosmic-report/types';
import { buildReportData } from '@/lib/cosmic-report/build';
import { sendEmail } from '@/lib/email';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';

export const dynamic = 'force-dynamic';

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
    <div style="font-family:Roboto,Helvetica,sans-serif;background:#05020c;color:#f4f4ff;padding:32px;border-radius:20px">
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
    const user = await requireUser(request);

    const subscriptionResult = await sql`
      SELECT plan_type, status, stripe_customer_id
      FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const subscription = subscriptionResult.rows[0];
    const rawStatus = subscription?.status || 'free';
    let subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    let planType = normalizePlanType(subscription?.plan_type);
    const customerId = subscription?.stripe_customer_id;

    let hasAccess = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'downloadable_reports',
    );

    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    if (!hasAccess && customerId) {
      try {
        const stripeResponse = await fetch(
          `${baseUrl}/api/stripe/get-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, userId: user.id }),
            next: { revalidate: 300 },
          },
        );

        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json();
          if (
            (stripeData.success || stripeData.hasSubscription) &&
            stripeData.subscription
          ) {
            const stripeSub = stripeData.subscription;
            const rawStripeStatus = stripeSub.status;
            subscriptionStatus =
              rawStripeStatus === 'trialing' ? 'trial' : rawStripeStatus;
            planType = normalizePlanType(stripeSub.plan);

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

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Cosmic Report Generator is available for Lunary+ Pro subscribers. Upgrade to unlock this feature.',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = generateSchema.parse(body);

    const reportData = await buildReportData({
      userId: user.id,
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
