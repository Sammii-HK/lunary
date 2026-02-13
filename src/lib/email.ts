import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
} from '@getbrevo/brevo';

import { trackNotificationEvent } from '@/lib/analytics/tracking';

let brevoApiInstance: TransactionalEmailsApi | null = null;

function getBrevoClient() {
  if (!brevoApiInstance) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }
    brevoApiInstance = new TransactionalEmailsApi();
    brevoApiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );
  }
  return brevoApiInstance;
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
  tracking?: EmailTrackingOptions;
}

export interface BatchEmailResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ email: string; error: string }>;
}

const getFromEmail = () => {
  return process.env.EMAIL_FROM || 'Lunary <help@lunary.app>';
};

const parseFromEmail = (from: string) => {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: 'Lunary', email: from.replace(/[<>]/g, '') };
};

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  'https://lunary.app';

export async function sendEmail({
  to,
  subject,
  html,
  text,
  tracking,
}: EmailOptions): Promise<{ id: string } | BatchEmailResult> {
  try {
    const brevoClient = getBrevoClient();
    const recipients = Array.isArray(to) ? to : [to];
    const fromInfo = parseFromEmail(getFromEmail());
    let finalHtml = html || text || 'No content provided';

    if (tracking) {
      finalHtml = appendTrackingPixel(
        applyUtmParameters(finalHtml, tracking.utm),
        tracking,
      );
    }

    if (recipients.length === 1) {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.sender = { name: fromInfo.name, email: fromInfo.email };
      sendSmtpEmail.to = [{ email: recipients[0] }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = finalHtml;
      if (text) {
        sendSmtpEmail.textContent = text;
      }

      const data = await brevoClient.sendTransacEmail(sendSmtpEmail);

      const messageId = data.body?.messageId || '';
      console.log('✅ Email sent successfully:', messageId);

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

    return await sendBatchEmails(brevoClient, {
      to: recipients,
      subject,
      html: finalHtml,
      text,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

async function sendBatchEmails(
  brevoClient: TransactionalEmailsApi,
  {
    to,
    subject,
    html,
    text,
  }: {
    to: string[];
    subject: string;
    html: string;
    text?: string;
  },
): Promise<BatchEmailResult> {
  const BATCH_SIZE = 50;
  const fromInfo = parseFromEmail(getFromEmail());
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
      `📧 Sending batch ${batchNumber}/${totalBatches} (${batch.length} recipients)`,
    );

    const batchPromises = batch.map(async (email) => {
      try {
        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.sender = { name: fromInfo.name, email: fromInfo.email };
        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        if (text) {
          sendSmtpEmail.textContent = text;
        }

        const data = await brevoClient.sendTransacEmail(sendSmtpEmail);
        const messageId = data.body?.messageId || '';
        return { success: true, email, messageId };
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
          console.log(`✅ Sent to ${emailResult.email}`);
        } else {
          results.failed++;
          results.errors.push({
            email: emailResult.email,
            error: emailResult.error || 'Unknown error',
          });
          console.error(
            `❌ Failed to send to ${emailResult.email}:`,
            emailResult.error,
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
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(
    `📊 Batch email summary: ${results.success} sent, ${results.failed} failed out of ${results.total} total`,
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
