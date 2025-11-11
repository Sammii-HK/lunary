const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export function generateTrialExpiredEmailHTML(
  userName: string,
  missedInsights: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your Trial Has Ended - Lunary</title>
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
          .title {
            color: #6366f1;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
          }
          .content {
            margin: 30px 0;
          }
          .cta-button {
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
          .missed-insights {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
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
            <img src="${baseUrl}/logo.png" alt="Lunary" class="logo" />
            <h1 class="title">Your Trial Has Ended</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your free trial has ended, but your cosmic journey doesn't have to!</p>
            
            <div class="missed-insights">
              <h3 style="margin-top: 0; color: #92400e;">You've missed ${missedInsights} personalized insight${missedInsights !== 1 ? 's' : ''} 🌙</h3>
              <p style="color: #78350f; margin-bottom: 0;">
                Your birth chart analysis, daily horoscopes, and tarot patterns are waiting for you.
              </p>
            </div>
            
            <p>Rejoin Lunary to continue receiving:</p>
            <ul>
              <li>🌟 Personalized birth chart insights</li>
              <li>🔮 Daily horoscopes tailored to your chart</li>
              <li>✨ Personalized tarot readings</li>
              <li>🌙 Transit calendars and cosmic guidance</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/pricing" class="cta-button">
                Continue Your Journey →
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              <strong>Special offer:</strong> Use code <strong style="color: #6366f1;">TRIAL20</strong> for 20% off your first month when you rejoin within 7 days.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.</p>
            <p><a href="${baseUrl}/unsubscribe" style="color: #6b7280;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateTrialExpiredEmailText(
  userName: string,
  missedInsights: number,
): string {
  return `
Your Trial Has Ended - Lunary

Hi ${userName || 'there'},

Your free trial has ended, but your cosmic journey doesn't have to!

You've missed ${missedInsights} personalized insight${missedInsights !== 1 ? 's' : ''} 🌙

Your birth chart analysis, daily horoscopes, and tarot patterns are waiting for you.

Rejoin Lunary to continue receiving:
- 🌟 Personalized birth chart insights
- 🔮 Daily horoscopes tailored to your chart
- ✨ Personalized tarot readings
- 🌙 Transit calendars and cosmic guidance

Continue your journey: ${baseUrl}/pricing

Special offer: Rejoin within 7 days and get 20% off your first month.

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}
