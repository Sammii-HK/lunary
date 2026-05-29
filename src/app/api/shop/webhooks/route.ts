import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createHmac } from 'crypto';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  generateTemplateDeliveryEmailHTML,
  generateTemplateDeliveryEmailText,
} from '@/lib/email-components/TemplateDeliveryEmail';
import { buildReportData } from '@/lib/cosmic-report/build';
import { buildShareUrl } from '@/lib/cosmic-report/share';

// ─── Notion template registry ─────────────────────────────────────────────────
// Maps Stripe product metadata templateId → display name.
// notionShareUrl is stored in the template_purchases table and set via admin.
const TEMPLATE_NAMES: Record<string, string> = {
  'tarot-journal': 'Tarot Journal',
  'moon-planner-2026': 'Moon Planner 2026',
  'rune-journal': 'Rune Journal',
  'angel-numbers-journal': 'Angel Numbers Journal',
  'digital-grimoire': 'Digital Grimoire',
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key);
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_SHOP;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET_SHOP is not set');
  return secret;
}

function isStripeProduct(
  p: Stripe.Product | Stripe.DeletedProduct,
): p is Stripe.Product {
  return (p as Stripe.DeletedProduct).deleted !== true;
}

type PurchaseRow = {
  id: string;
  userId: string;
  packId: string;
  packSlug: string | null;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  stripeProductId: string;
  stripePriceId: string;
  status: 'completed';
  amount: number;
  currency: string | null;
  downloadToken: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string;
  packName: string;
  blobUrl: string;
};

function generateId() {
  return crypto.randomUUID().replace(/-/g, '');
}

async function savePurchaseRow(p: PurchaseRow) {
  const res = await sql`
    INSERT INTO shop_purchases (
      id,
      user_id,
      pack_id,
      stripe_session_id,
      stripe_payment_intent_id,
      stripe_product_id,
      stripe_price_id,
      status,
      amount,
      currency,
      download_token,
      download_count,
      max_downloads,
      expires_at,
      pack_name,
      pack_slug,
      blob_url
    ) VALUES (
      ${p.id},
      ${p.userId},
      ${p.packId},
      ${p.stripeSessionId},
      ${p.stripePaymentIntentId},
      ${p.stripeProductId},
      ${p.stripePriceId},
      ${p.status},
      ${p.amount},
      ${p.currency},
      ${p.downloadToken},
      ${p.downloadCount},
      ${p.maxDownloads},
      ${p.expiresAt},
      ${p.packName},
      ${p.packSlug},
      ${p.blobUrl}
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  console.log('✅ DB insert result:', res.rows);
}

export async function POST(request: NextRequest) {
  let stripe: Stripe;
  let webhookSecret: string;
  try {
    stripe = getStripe();
    webhookSecret = getWebhookSecret();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server misconfigured';
    console.error('❌ Shop webhook env misconfiguration:', message);
    return NextResponse.json(
      {
        error: 'Shop webhook is not configured',
        detail: message,
      },
      { status: 500 },
    );
  }

  const body = await request.text();
  const sig = (await headers()).get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Invalid webhook signature', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // ── Notion template purchase ──────────────────────────────────────────────
  if (session.metadata?.purchaseType === 'notion_template') {
    await handleTemplatePurchase(session);
    return NextResponse.json({ received: true });
  }

  // ── Personalised Cosmic Report (buy-once) ─────────────────────────────────
  // Unlike the static digital packs, this fulfilment is DYNAMIC: we generate the
  // buyer's own report from their stored birth chart at purchase time and email
  // them the on-demand PDF link, rather than handing over a pre-uploaded blob.
  if (session.metadata?.purchaseType === 'cosmic_report') {
    await handleCosmicReportPurchase(session);
    return NextResponse.json({ received: true });
  }

  if (session.metadata?.purchaseType !== 'digital_pack') {
    return NextResponse.json({ received: true });
  }

  console.log('🛒 Checkout completed:', session.id);

  // Always fetch line items and expand product
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  });

  if (!lineItems.data.length) {
    console.error('❌ No line items found for session:', session.id);
    return NextResponse.json({ received: true });
  }

  for (const li of lineItems.data) {
    const price = li.price;
    const prod = price?.product;

    if (!price || !prod) {
      console.error('❌ Missing price/product on line item:', li.id);
      continue;
    }

    if (typeof prod === 'string') {
      console.error('❌ Product not expanded:', {
        lineItemId: li.id,
        productId: prod,
      });
      continue;
    }

    if (!isStripeProduct(prod)) {
      console.error('❌ Product deleted:', { productId: (prod as any).id });
      continue;
    }

    const blobUrl = prod.metadata?.blobUrl;
    if (!blobUrl) {
      console.error('❌ Missing blobUrl in Stripe product metadata:', {
        productId: prod.id,
        slug: prod.metadata?.slug,
      });
      continue;
    }

    const userId = session.metadata?.userId || 'anonymous';
    const packSlug = prod.metadata?.slug || null;
    const packId = prod.metadata?.packId || packSlug || prod.id;

    const downloadToken =
      session.metadata?.downloadToken || crypto.randomUUID();

    const row: PurchaseRow = {
      id: generateId(),
      userId,
      packId,
      packSlug,
      stripeSessionId: session.id,
      stripePaymentIntentId: (session.payment_intent as string) || null,
      stripeProductId: prod.id,
      stripePriceId: price.id,
      status: 'completed',
      // IMPORTANT: amount_total can be 0 if promo code discounts it fully (this is normal)
      amount: session.amount_total ?? 0,
      currency: session.currency ?? null,
      downloadToken,
      downloadCount: 0,
      maxDownloads: 5,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      packName: prod.name,
      blobUrl,
    };

    console.log('🧪 Attempting DB insert:', {
      packId: row.packId,
      token: row.downloadToken.slice(0, 8),
      amount: row.amount,
    });

    await savePurchaseRow(row);

    console.log('✅ Purchase saved:', {
      id: row.id,
      packId: row.packId,
      amount: row.amount,
      token: row.downloadToken.slice(0, 8),
    });
  }

  return NextResponse.json({ received: true });
}

// ─── Notion template purchase handler ─────────────────────────────────────────

async function handleTemplatePurchase(session: Stripe.Checkout.Session) {
  const templateId = session.metadata?.templateId;
  const customerEmail =
    session.customer_email || session.metadata?.customerEmail;

  if (!templateId || !customerEmail) {
    console.error('❌ Template purchase missing templateId or customerEmail', {
      sessionId: session.id,
      templateId,
      customerEmail,
    });
    return;
  }

  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;
  const accessToken = crypto.randomUUID().replace(/-/g, '');

  console.log(
    `🎟️  Creating template purchase: ${templateId} for ${customerEmail}`,
  );

  // Persist the purchase — accessToken is the buyer's download key.
  // notion_share_url is populated via admin after the Notion share link is created.
  await sql`
    INSERT INTO template_purchases (
      access_token,
      template_id,
      customer_email,
      stripe_session_id,
      stripe_payment_intent_id,
      access_count,
      revoked,
      created_at
    ) VALUES (
      ${accessToken},
      ${templateId},
      ${customerEmail},
      ${session.id},
      ${(session.payment_intent as string) || null},
      ${0},
      ${false},
      NOW()
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;

  console.log(
    `✅ Template purchase saved. Token: ${accessToken.slice(0, 8)}...`,
  );

  // Send delivery email with per-buyer canary watermark in the plain-text body.
  const html = generateTemplateDeliveryEmailHTML(templateName, accessToken);
  const text = generateTemplateDeliveryEmailText(
    templateName,
    accessToken,
    customerEmail,
    templateId,
  );

  await sendEmail({
    to: customerEmail,
    subject: `Your ${templateName} is ready ✨`,
    html,
    text,
    tracking: {
      userId: customerEmail,
      notificationType: 'template_delivery',
      notificationId: `template-delivery-${accessToken.slice(0, 8)}`,
      utm: {
        source: 'email',
        medium: 'transactional',
        campaign: 'template_delivery',
      },
    },
  });

  console.log(`📧 Delivery email sent to ${customerEmail} for ${templateName}`);
}

// ─── Personalised Cosmic Report purchase handler ──────────────────────────────

const COSMIC_REPORT_TYPES = new Set(['weekly', 'monthly', 'custom']);

function normaliseReportType(value?: string): 'weekly' | 'monthly' | 'custom' {
  return value && COSMIC_REPORT_TYPES.has(value)
    ? (value as 'weekly' | 'monthly' | 'custom')
    : 'monthly';
}

/**
 * Derive the buyer's share token deterministically from the Stripe checkout
 * session id. This is what makes fulfilment exactly-once: `cosmic_reports`
 * has a UNIQUE constraint on `share_token`, so when Stripe retries the same
 * `checkout.session.completed` event the second insert hits that constraint
 * and is a no-op (no duplicate report row, no duplicate delivery email).
 *
 * The token is an HMAC keyed by the shop webhook secret rather than a plain
 * hash, so it stays unguessable (you cannot derive it from a session id alone)
 * and is sliced to 32 hex chars to match the legacy `randomBytes(16)` format.
 */
function deriveReportShareToken(sessionId: string): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_SHOP || '';
  return createHmac('sha256', secret)
    .update(`cosmic_report:${sessionId}`)
    .digest('hex')
    .slice(0, 32);
}

/**
 * Generate the buyer's personalised Cosmic Report at purchase time and email
 * them the on-demand PDF link. The report row is stored in `cosmic_reports`,
 * exactly like a generator-created report, so the existing /api/cosmic-report/
 * [id]/pdf route regenerates the PDF on demand from the stored report_data JSON
 * (no static blob, no per-buyer upload step).
 */
async function handleCosmicReportPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const reportType = normaliseReportType(session.metadata?.reportType);
  const rangeStart = session.metadata?.rangeStart || undefined;
  const rangeEnd = session.metadata?.rangeEnd || undefined;
  const deliveryEmail =
    session.metadata?.deliveryEmail ||
    session.customer_details?.email ||
    session.customer_email ||
    undefined;

  if (!userId) {
    console.error('❌ Cosmic report purchase missing userId', {
      sessionId: session.id,
    });
    return;
  }

  // Stripe only fires this for paid/completed sessions, but guard explicitly so
  // an unpaid (e.g. async-payment-pending) session can never trigger fulfilment.
  if (session.payment_status !== 'paid') {
    console.warn(
      `⚠️ Cosmic report session ${session.id} not paid (status: ${session.payment_status}), skipping fulfilment`,
    );
    return;
  }

  // Deterministic, session-derived share token = idempotency key. Reusing the
  // existing UNIQUE(share_token) constraint means a Stripe retry of the same
  // event resolves to the same row instead of generating a second report.
  const shareToken = deriveReportShareToken(session.id);

  // Fast path for retries: if this session was already fulfilled, do not
  // rebuild the report or re-send the email.
  try {
    const existing = await sql`
      SELECT id FROM cosmic_reports WHERE share_token = ${shareToken} LIMIT 1
    `;
    if (existing.rows[0]?.id) {
      console.log(
        `[Shop webhook] Cosmic report for session ${session.id} already fulfilled (report ${existing.rows[0].id}), skipping`,
      );
      return;
    }
  } catch (error) {
    console.error('❌ Failed to check existing cosmic report:', error);
    // Fall through — the INSERT below is still guarded by ON CONFLICT.
  }

  console.log(`🔮 Generating purchased cosmic report for user ${userId}`);

  let reportData;
  try {
    reportData = await buildReportData({
      userId,
      reportType,
      dateRange:
        rangeStart || rangeEnd
          ? { start: rangeStart, end: rangeEnd }
          : undefined,
    });
  } catch (error) {
    console.error('❌ Failed to build purchased cosmic report:', error);
    return;
  }

  let reportId: number | string | undefined;
  try {
    const insertResult = await sql`
      INSERT INTO cosmic_reports (user_id, report_type, report_data, share_token, is_public)
      VALUES (
        ${userId},
        ${reportType},
        ${JSON.stringify(reportData)},
        ${shareToken},
        ${false}
      )
      ON CONFLICT (share_token) DO NOTHING
      RETURNING id
    `;
    reportId = insertResult.rows[0]?.id;
  } catch (error) {
    console.error('❌ Failed to persist purchased cosmic report:', error);
    return;
  }

  // No row returned means a concurrent retry inserted it between our pre-check
  // and this INSERT (ON CONFLICT no-op). That retry owns the delivery email, so
  // we stop here to avoid double-sending — this is the idempotent path, not an
  // error.
  if (!reportId) {
    console.log(
      `[Shop webhook] Cosmic report for session ${session.id} fulfilled concurrently, skipping duplicate delivery`,
    );
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lunary.app';
  const pdfUrl = `${baseUrl}/api/cosmic-report/${reportId}/pdf`;
  const shareUrl = buildShareUrl(shareToken);

  if (!deliveryEmail) {
    console.warn(
      `⚠️ Purchased cosmic report ${reportId} generated but no email to deliver to`,
    );
    return;
  }

  const html = `
    <div style="font-family:Roboto,Helvetica,sans-serif;background:#05020c;color:#f4f4ff;padding:32px;border-radius:20px">
      <h1 style="margin:0 0 8px">${reportData.title}</h1>
      <p style="color:#c4b5fd;margin:0 0 16px">${reportData.subtitle}</p>
      <p style="margin:0 0 16px">Your personalised report is ready. It reads every transit against your own chart and houses.</p>
      <p style="margin:0 0 8px"><a href="${pdfUrl}" style="color:#c4b5fd">Download your PDF</a></p>
      <p style="margin:0"><a href="${shareUrl}" style="color:#9ca3af">View online</a></p>
    </div>
  `;
  const text = `${reportData.title}

${reportData.subtitle}

Your personalised report is ready.
Download PDF: ${pdfUrl}
View online: ${shareUrl}`;

  try {
    await sendEmail({
      to: deliveryEmail,
      subject: `Your personalised Cosmic Report is ready ✨`,
      html,
      text,
      tracking: {
        userId,
        notificationType: 'cosmic_report_delivery',
        notificationId: `cosmic-report-${reportId}`,
        utm: {
          source: 'email',
          medium: 'transactional',
          campaign: 'cosmic_report_delivery',
        },
      },
    });
    console.log(
      `📧 Cosmic report ${reportId} delivered to buyer for user ${userId}`,
    );
  } catch (error) {
    console.error('❌ Failed to email purchased cosmic report:', error);
  }
}
