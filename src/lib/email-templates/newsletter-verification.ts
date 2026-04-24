interface NewsletterVerificationContext {
  sign?: string;
  proposition?: 'cosmic_newsletter' | 'daily_horoscope';
  upsellVariant?: 'full_chart' | 'exact_degree' | 'exact_timing';
}

function getVerificationCopy(context?: NewsletterVerificationContext) {
  const signPrefix = context?.sign ? `${context.sign} ` : '';
  const isDailyHoroscope = context?.proposition === 'daily_horoscope';

  const intro = isDailyHoroscope
    ? `Thank you for subscribing. To start receiving your ${signPrefix}horoscope by email, please confirm your address below.`
    : 'Thank you for subscribing to the Lunary newsletter. Please confirm your email address below.';

  const benefits = isDailyHoroscope
    ? [
        `Daily ${signPrefix}horoscope guidance in your inbox`,
        'A simple way to keep up with the sky without opening the app',
        context?.upsellVariant === 'exact_degree'
          ? 'A free path into your exact degree and full-chart readings'
          : context?.upsellVariant === 'exact_timing'
            ? 'A free path into your chart-based timing and transit hits'
            : 'A free path into your full-chart transits and personalised readings',
      ]
    : [
        'Weekly cosmic insights and planetary guidance',
        'Blog updates and mystical knowledge',
        'Special offers and exclusive content',
      ];

  const upsell =
    context?.upsellVariant === 'exact_degree'
      ? `After you confirm, create your free account to find your exact ${signPrefix}degree and see whether today's transit is actually hitting it.`
      : context?.upsellVariant === 'exact_timing'
        ? 'After you confirm, create your free account to see the exact timing and where today’s astrology lands in your chart.'
        : 'After you confirm, create your free account to see how today’s transits affect your full chart, not just your Sun sign.';

  return { intro, benefits, upsell };
}

export function generateNewsletterVerificationEmailHTML(
  verificationUrl: string,
  email: string,
  context?: NewsletterVerificationContext,
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const copy = getVerificationCopy(context);
  const subtitle =
    context?.proposition === 'daily_horoscope'
      ? 'Confirm your horoscope email'
      : 'Join the Lunary Newsletter';
  const benefitsHtml = copy.benefits
    .map((benefit) => `<li>${benefit}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Confirm Your Email - Lunary Newsletter</title>
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
          .logo {
            max-width: 120px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }
          .logo-fallback {
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
          .email-image {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.png" alt="Lunary" class="logo" />
            <h1 class="title">Confirm Your Email</h1>
            <p class="subtitle">${subtitle}</p>
          </div>
          
          <div class="content">
            <p>Hi there,</p>
            <p>${copy.intro}</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="verify-button">
                ✨ Confirm Email
              </a>
            </div>
            
            <p>This link will expire in 7 days for security reasons.</p>
            
            <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
            <div class="fallback-url">${verificationUrl}</div>
            
            <p>Once confirmed, you'll receive:</p>
            <ul>
              ${benefitsHtml}
            </ul>
            <p>${copy.upsell}</p>
          </div>
          
          <div class="footer">
            <p>If you didn't subscribe to Lunary, you can safely ignore this email.</p>
            <p>Questions? Reply to this email or visit our support page.</p>
            <p>© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateNewsletterVerificationEmailText(
  verificationUrl: string,
  email: string,
  context?: NewsletterVerificationContext,
): string {
  const copy = getVerificationCopy(context);
  return `
Confirm Your Email - Lunary Newsletter 🌙

${copy.intro}

${verificationUrl}

This link will expire in 7 days for security reasons.

Once confirmed, you'll receive:
${copy.benefits.map((benefit) => `- ${benefit}`).join('\n')}

${copy.upsell}

If you didn't subscribe to Lunary, you can safely ignore this email.

Questions? Reply to this email or visit our support page.

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
