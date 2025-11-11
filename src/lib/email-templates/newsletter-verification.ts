export function generateNewsletterVerificationEmailHTML(
  verificationUrl: string,
  email: string,
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

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
            <p class="subtitle">Join the Lunary Newsletter</p>
          </div>
          
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for subscribing to the Lunary newsletter! To receive weekly cosmic insights, blog updates, and special offers, please confirm your email address.</p>
            
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
              <li>🌙 Weekly cosmic insights and planetary guidance</li>
              <li>✨ Blog updates and mystical knowledge</li>
              <li>🔮 Special offers and exclusive content</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>If you didn't subscribe to Lunary, you can safely ignore this email.</p>
            <p>Questions? Reply to this email or visit our support page.</p>
            <p>© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateNewsletterVerificationEmailText(
  verificationUrl: string,
  email: string,
): string {
  return `
Confirm Your Email - Lunary Newsletter 🌙

Thank you for subscribing to the Lunary newsletter! To receive weekly cosmic insights, blog updates, and special offers, please confirm your email address by clicking the link below:

${verificationUrl}

This link will expire in 7 days for security reasons.

Once confirmed, you'll receive:
- 🌙 Weekly cosmic insights and planetary guidance
- ✨ Blog updates and mystical knowledge
- 🔮 Special offers and exclusive content

If you didn't subscribe to Lunary, you can safely ignore this email.

Questions? Reply to this email or visit our support page.

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}
