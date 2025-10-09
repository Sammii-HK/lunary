import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Lunary <noreply@lunary.app>',
      to,
      subject,
      html: html || text,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
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
