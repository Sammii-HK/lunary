const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export function generateTrialWelcomeEmailHTML(
  userName: string,
  trialDaysRemaining: number,
  planType: 'monthly' | 'yearly',
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to Your Free Trial - Lunary</title>
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
          .feature-list {
            background: #f3f4f6;
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
          .trial-badge {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.png" alt="Lunary" class="logo" />
            <span class="trial-badge">${trialDaysRemaining} Days Free Trial</span>
            <h1 class="title">Welcome to Lunary!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your cosmic journey begins now! You have <strong>${trialDaysRemaining} days</strong> to explore all the personalized features Lunary has to offer.</p>
            
            <div class="feature-list">
              <h3 style="margin-top: 0; color: #6366f1;">What's Included:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>🌟 Personalized birth chart analysis</li>
                <li>🔮 Daily horoscopes tailored to your chart</li>
                <li>✨ Personalized tarot readings</li>
                <li>🌙 Transit calendar and cosmic insights</li>
                <li>📚 Complete digital grimoire</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/birth-chart" class="cta-button">
                Explore Your Birth Chart →
              </a>
            </div>
            
            <p><strong>Pro Tip:</strong> Complete your profile with your birthday to unlock all personalized features!</p>
            
            <p>Questions? Just reply to this email - we're here to help.</p>
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

export function generateTrialReminderEmailHTML(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your Trial Ends Soon - Lunary</title>
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
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .urgency-badge {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.png" alt="Lunary" class="logo" />
            <span class="urgency-badge">${trialDaysRemaining} Days Left</span>
            <h1 class="title">Don't Miss Out!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your free trial ends in <strong>${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'day' : 'days'}</strong>!</p>
            
            <p>Continue your cosmic journey with unlimited access to:</p>
            <ul>
              <li>🌟 Personalized birth chart insights</li>
              <li>🔮 Daily horoscopes and tarot readings</li>
              <li>🌙 Transit calendars and cosmic guidance</li>
              <li>📚 Complete digital grimoire</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/pricing" class="cta-button">
                Continue Your Journey →
              </a>
            </div>
            
            <p>No commitment - cancel anytime. Your subscription will only start after your trial ends.</p>
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

export function generateTrialWelcomeEmailText(
  userName: string,
  trialDaysRemaining: number,
  planType: 'monthly' | 'yearly',
): string {
  return `
Welcome to Lunary! 🌙

Hi ${userName || 'there'},

Your cosmic journey begins now! You have ${trialDaysRemaining} days to explore all the personalized features Lunary has to offer.

What's Included:
- 🌟 Personalized birth chart analysis
- 🔮 Daily horoscopes tailored to your chart
- ✨ Personalized tarot readings
- 🌙 Transit calendar and cosmic insights
- 📚 Complete digital grimoire

Explore your birth chart: ${baseUrl}/birth-chart

Pro Tip: Complete your profile with your birthday to unlock all personalized features!

Questions? Just reply to this email - we're here to help.

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}

export function generateTrialReminderEmailText(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
Your Trial Ends Soon - Lunary ⏰

Hi ${userName || 'there'},

Your free trial ends in ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'day' : 'days'}!

Continue your cosmic journey with unlimited access to:
- 🌟 Personalized birth chart insights
- 🔮 Daily horoscopes and tarot readings
- 🌙 Transit calendars and cosmic guidance
- 📚 Complete digital grimoire

Continue your journey: ${baseUrl}/pricing

No commitment - cancel anytime. Your subscription will only start after your trial ends.

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}
