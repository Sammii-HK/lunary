import { Resend } from 'resend';

// Lazy initialization of Resend to avoid build-time env var issues
let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface BatchEmailResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * Send email using Resend (single or multiple recipients)
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const resendClient = getResendClient();

    // Handle single email or array of emails
    const recipients = Array.isArray(to) ? to : [to];

    // If single recipient, use regular send
    if (recipients.length === 1) {
      const { data, error } = await resendClient.emails.send({
        from: process.env.EMAIL_FROM || 'Lunary <noreply@lunary.app>',
        to: recipients[0],
        subject,
        html: html || text || 'No content provided',
        text,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('✅ Email sent successfully:', data?.id);
      return data;
    }

    // Multiple recipients - use batch API (100 per request)
    return await sendBatchEmails(resendClient, {
      to: recipients,
      subject,
      html: html || text || 'No content provided',
      text,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

/**
 * Send emails in batches using Resend batch API
 * Resend allows up to 100 recipients per batch request
 * This prevents exposing all emails in TO/CC/BCC fields
 */
async function sendBatchEmails(
  resendClient: Resend,
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
  const BATCH_SIZE = 100;
  const from = process.env.EMAIL_FROM || 'Lunary <noreply@lunary.app>';
  const results: BatchEmailResult = {
    success: 0,
    failed: 0,
    total: to.length,
    errors: [],
  };

  // Process in batches of 100
  for (let i = 0; i < to.length; i += BATCH_SIZE) {
    const batch = to.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(to.length / BATCH_SIZE);

    console.log(
      `📧 Sending batch ${batchNumber}/${totalBatches} (${batch.length} recipients)`,
    );

    try {
      // Use Resend batch API - sends individually to each recipient
      // This prevents exposing all emails in TO field
      const batchPromises = batch.map((email) =>
        resendClient.emails.send({
          from,
          to: email,
          subject,
          html,
          text,
        }),
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, idx) => {
        const email = batch[idx];
        if (result.status === 'fulfilled' && result.value.data) {
          results.success++;
          console.log(`✅ Sent to ${email}`);
        } else {
          results.failed++;
          const error =
            result.status === 'rejected'
              ? result.reason?.message || 'Unknown error'
              : result.value?.error?.message || 'Unknown error';
          results.errors.push({ email, error });
          console.error(`❌ Failed to send to ${email}:`, error);
        }
      });

      // Rate limiting: small delay between batches to avoid hitting limits
      if (i + BATCH_SIZE < to.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} failed:`, error);
      batch.forEach((email) => {
        results.failed++;
        results.errors.push({
          email,
          error:
            error instanceof Error ? error.message : 'Batch processing error',
        });
      });
    }
  }

  console.log(
    `📊 Batch email summary: ${results.success} sent, ${results.failed} failed out of ${results.total} total`,
  );

  return results;
}

/**
 * Generate email verification HTML template
 */
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
            <div class="moon-symbol">🌙</div>
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
            <p>© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate plain text version of verification email
 */
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

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}
