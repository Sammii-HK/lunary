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

export function generateVerificationEmailHTML(
  verificationUrl: string,
  userEmail: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify Your Email - Lunary</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .moon-symbol {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .title {
            color: #6366f1;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 8px 0 0 0;
          }
          .content {
            margin: 30px 0;
          }
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
          }
          .verify-button:hover {
            background: linear-gradient(135deg, #5856eb, #7c3aed);
          }
          .fallback-url {
            background: #f3f4f6;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/logo.png" alt="Lunary" style="max-width: 120px; height: auto; margin: 0 auto 20px; display: block;" />
            <h1 class="title">Welcome to Lunary</h1>
            <p class="subtitle">Your Cosmic Journey Begins</p>
          </div>
          
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for joining Lunary! To complete your registration and start your cosmic journey, please verify your email address.</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="verify-button">
                ✨ Verify Your Email
              </a>
            </div>
            
            <p>This link will expire in 24 hours for security reasons.</p>
            
            <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
            <div class="fallback-url">${verificationUrl}</div>
            
            <p>Once verified, you'll have access to:</p>
            <ul>
              <li>🌙 Personalized moon phase guidance</li>
              <li>✨ Daily tarot insights</li>
              <li>🔮 Astrological horoscopes</li>
              <li>📚 Digital grimoire and spells</li>
              <li>☁️ Cross-device sync</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>If you didn't create an account with Lunary, you can safely ignore this email.</p>
            <p>Questions? Reply to this email or visit our support page.</p>
            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/unsubscribe?email=${encodeURIComponent(userEmail)}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/profile" style="color: #6b7280; text-decoration: underline;">Manage Preferences</a>
            </p>
            <p>© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateVerificationEmailText(
  verificationUrl: string,
  userEmail: string,
): string {
  return `
Welcome to Lunary! 🌙

Thank you for joining us. To complete your registration and start your cosmic journey, please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours for security reasons.

Once verified, you'll have access to:
- 🌙 Personalized moon phase guidance
- ✨ Daily tarot insights  
- 🔮 Astrological horoscopes
- 📚 Digital grimoire and spells
- ☁️ Cross-device sync

If you didn't create an account with Lunary, you can safely ignore this email.

Questions? Reply to this email or visit our support page.

Unsubscribe: ${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/unsubscribe?email=${encodeURIComponent(userEmail)}
Manage Preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/profile

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}

export function generatePasswordResetEmailHTML(
  resetUrl: string,
  userEmail: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Your Password - Lunary</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #0b0b12;
          }
          .container {
            background: #101020;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 45px rgba(106, 90, 205, 0.25);
            border: 1px solid rgba(147, 112, 219, 0.2);
            color: #f1f1ff;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .moon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          h1 {
            margin: 0;
            font-size: 28px;
            color: #a78bfa;
          }
          p {
            color: #d1c4ff;
            margin: 16px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 999px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 40px rgba(99, 102, 241, 0.45);
          }
          .fallback {
            background: rgba(99, 102, 241, 0.1);
            padding: 16px;
            border-radius: 12px;
            word-break: break-word;
            font-size: 14px;
            border: 1px dashed rgba(167, 139, 250, 0.35);
            color: #e1d9ff;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            font-size: 13px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="moon">🌙</div>
            <h1>Reset your cosmic password</h1>
            <p>We received a request to reset the password for <strong style="color:#f9fafb;">${userEmail}</strong>.</p>
          </div>
          <p>Click the secure link below to choose a new password. This link will expire in one hour for your protection.</p>
          <div style="text-align:center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>If clicking the button doesn’t work, copy and paste this URL into your browser:</p>
          <div class="fallback">${resetUrl}</div>
          <p>If you didn’t request this change, you can safely ignore this email—your password will remain the same.</p>
          <div class="footer">
            <p>Need help? Reply to this email or visit our support page.</p>
            <p>© ${new Date().getFullYear()} Lunary. Guided by the stars, powered by magic.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generatePasswordResetEmailText(
  resetUrl: string,
  userEmail: string,
): string {
  return `
Reset Your Password - Lunary

We received a request to reset the password for ${userEmail}.

Click the secure link below to set a new password. This link will expire in one hour:

${resetUrl}

If you didn't request this change, you can safely ignore this email and your password will stay the same.

Need help? Reply to this email or visit our support page.

© ${new Date().getFullYear()} Lunary. Guided by the stars, powered by magic.
  `.trim();
}

function buildTrackingPixelUrl(tracking?: EmailTrackingOptions) {
  if (!tracking?.userId) {
    return null;
  }

  const url = new URL('/api/analytics/track-notification', APP_BASE_URL);
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
