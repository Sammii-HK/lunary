import { Resend } from 'resend';
import { trackNotificationEvent } from '@/lib/analytics/tracking';
import { sanitizeForLog } from '@/lib/security/log-sanitize';

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface EmailTrackingOptions {
  userId?: string;
  notificationType?: string;
  notificationId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  tracking?: EmailTrackingOptions;
}

export interface BatchEmailResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ email: string; error: string }>;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Lunary <hello@lunary.app>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@lunary.app';

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  'https://lunary.app';

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  tracking,
}: EmailOptions): Promise<{ id: string } | BatchEmailResult> {
  try {
    const resend = getResendClient();
    const recipients = Array.isArray(to) ? to : [to];
    let finalHtml = html || text || 'No content provided';

    if (tracking) {
      finalHtml = appendTrackingPixel(
        applyUtmParameters(finalHtml, tracking.utm),
        tracking,
      );
    }

    if (recipients.length === 1) {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        reply_to: replyTo || REPLY_TO,
        to: recipients[0],
        subject,
        html: finalHtml,
        text: text,
      });

      if (error) {
        throw new Error(error.message);
      }

      const messageId = data?.id || '';
      console.log('Email sent:', messageId);

      if (tracking?.userId) {
        await trackNotificationEvent({
          userId: tracking.userId,
          notificationType: tracking.notificationType || 'email',
          eventType: 'sent',
          notificationId: tracking.notificationId || messageId,
          metadata: {
            email: recipients[0],
            subject,
          },
        });
      }

      return { id: messageId };
    }

    return await sendBatchEmails(resend, {
      to: recipients,
      subject,
      html: finalHtml,
      text,
      replyTo: replyTo || REPLY_TO,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

async function sendBatchEmails(
  resend: Resend,
  {
    to,
    subject,
    html,
    text,
    replyTo,
  }: {
    to: string[];
    subject: string;
    html: string;
    text?: string;
    replyTo: string;
  },
): Promise<BatchEmailResult> {
  // Resend free tier: 100 emails/day. Send in batches of 10 with a small delay
  // to avoid bursting and to leave headroom for transactional emails.
  const BATCH_SIZE = 10;
  const results: BatchEmailResult = {
    success: 0,
    failed: 0,
    total: to.length,
    errors: [],
  };

  for (let i = 0; i < to.length; i += BATCH_SIZE) {
    const batch = to.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(to.length / BATCH_SIZE);

    console.log(
      `Sending batch ${String(batchNumber)}/${String(totalBatches)} (${String(batch.length)} recipients)`,
    );

    const batchPromises = batch.map(async (email) => {
      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          reply_to: replyTo,
          to: email,
          subject,
          html,
          text,
        });

        if (error) {
          return { success: false, email, error: error.message };
        }

        return { success: true, email, messageId: data?.id || '' };
      } catch (error) {
        return {
          success: false,
          email,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const emailResult = result.value;
        if (emailResult.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            email: emailResult.email,
            error: emailResult.error || 'Unknown error',
          });
          console.error(
            `Failed to send to ${sanitizeForLog(emailResult.email)}:`,
            sanitizeForLog(emailResult.error || ''),
          );
        }
      } else {
        results.failed++;
        const email = batch[batchResults.indexOf(result)];
        results.errors.push({
          email,
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    if (i + BATCH_SIZE < to.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log(
    `Batch email summary: ${String(results.success)} sent, ${String(results.failed)} failed out of ${String(results.total)} total`,
  );

  return results;
}

export {
  generateVerificationEmailHTML,
  generateVerificationEmailText,
  generatePasswordResetEmailHTML,
  generatePasswordResetEmailText,
  VerificationEmail,
  PasswordResetEmail,
} from './email-components/AuthEmails';

export {
  generateAccessRestoredEmailHTML,
  generateAccessRestoredEmailText,
  AccessRestoredEmail,
} from './email-components/AccessRestoredEmail';

export {
  generateDeletionScheduledEmailHTML,
  generateDeletionScheduledEmailText,
  generateDeletionCancelledEmailHTML,
  generateDeletionVerifyEmailHTML,
  generateDeletionVerifyEmailText,
  generateDeletionCompleteEmailHTML,
  generateDeletionCompleteEmailText,
  generateRefundRequestedEmailHTML,
  generateWelcomeEmailHTML,
  generateWelcomeEmailText,
  DeletionScheduledEmail,
  DeletionCancelledEmail,
  DeletionVerifyEmail,
  DeletionCompleteEmail,
  RefundRequestedEmail,
  WelcomeEmail,
} from './email-components/ComplianceEmails';

function buildTrackingPixelUrl(tracking?: EmailTrackingOptions) {
  if (!tracking?.userId) {
    return null;
  }

  const url = new URL('/api/ether/pulse', APP_BASE_URL);
  url.searchParams.set('user', tracking.userId);
  url.searchParams.set('event', 'opened');

  if (tracking.notificationType) {
    url.searchParams.set('type', tracking.notificationType);
  }

  if (tracking.notificationId) {
    url.searchParams.set('id', tracking.notificationId);
  }

  return url.toString();
}

function appendTrackingPixel(
  html: string,
  tracking?: EmailTrackingOptions,
): string {
  const pixelUrl = buildTrackingPixelUrl(tracking);
  if (!pixelUrl) {
    return html;
  }

  const pixelTag = `<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none;opacity:0;" />`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixelTag}</body>`);
  }

  return `${html}\n${pixelTag}`;
}

function applyUtmParameters(
  html: string,
  utm?: EmailTrackingOptions['utm'],
): string {
  if (!utm) {
    return html;
  }

  return html.replace(/href="([^"]+)"/g, (match, url) => {
    if (url.startsWith('mailto:') || url.startsWith('#')) {
      return match;
    }

    try {
      const parsed = new URL(url, APP_BASE_URL);
      if (utm.source) parsed.searchParams.set('utm_source', utm.source);
      if (utm.medium) parsed.searchParams.set('utm_medium', utm.medium);
      if (utm.campaign) parsed.searchParams.set('utm_campaign', utm.campaign);
      if (utm.content) parsed.searchParams.set('utm_content', utm.content);
      if (utm.term) parsed.searchParams.set('utm_term', utm.term);

      return `href="${parsed.toString()}"`;
    } catch {
      return match;
    }
  });
}
