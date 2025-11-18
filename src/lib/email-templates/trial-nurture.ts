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
            <p style="font-size: 20px; font-weight: 600; color: #6366f1; text-align: center; margin: 30px 0;">
              Your Astral Guide is ready. ✨
            </p>
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

Your Astral Guide is ready. ✨

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

// Day 2: Birth Chart Reveals Email
export function generateTrialDay2EmailHTML(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your Birth Chart Reveals... - Lunary</title>
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
          .insight-box {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
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
            <h1 class="title">Your Birth Chart Reveals...</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your birth chart is a cosmic blueprint—a map of the stars at the moment you were born. It reveals hidden patterns, strengths, and opportunities that shape your unique path.</p>
            
            <div class="insight-box">
              <h3 style="margin-top: 0; color: #92400e;">What Your Chart Shows:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                <li>🌟 Your sun sign's core essence</li>
                <li>🌙 Your moon sign's emotional nature</li>
                <li>⬆️ Your rising sign's outward expression</li>
                <li>🪐 Planetary influences shaping your destiny</li>
                <li>✨ Aspects revealing your unique gifts</li>
              </ul>
            </div>
            
            <p>Every planet, every angle, every aspect tells a story about who you are and who you're becoming.</p>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/birth-chart" class="cta-button">
                Discover Your Chart →
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              <strong>${trialDaysRemaining} days left</strong> in your trial to explore all personalized insights.
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

export function generateTrialDay2EmailText(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
Your Birth Chart Reveals... - Lunary 🌟

Hi ${userName || 'there'},

Your birth chart is a cosmic blueprint—a map of the stars at the moment you were born. It reveals hidden patterns, strengths, and opportunities that shape your unique path.

What Your Chart Shows:
- 🌟 Your sun sign's core essence
- 🌙 Your moon sign's emotional nature
- ⬆️ Your rising sign's outward expression
- 🪐 Planetary influences shaping your destiny
- ✨ Aspects revealing your unique gifts

Every planet, every angle, every aspect tells a story about who you are and who you're becoming.

Discover your chart: ${baseUrl}/birth-chart

${trialDaysRemaining} days left in your trial to explore all personalized insights.

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}

// Day 3: Daily Guidance Personalized Email
export function generateTrialDay3EmailHTML(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your Daily Guidance is Personalised - Lunary</title>
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
          .personalized-box {
            background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
            border-left: 4px solid #6366f1;
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
            <h1 class="title">Your Daily Guidance is Personalised</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Unlike generic horoscopes, your daily guidance is crafted specifically for <strong>you</strong>—based on your unique birth chart, current transits, and cosmic patterns.</p>
            
            <div class="personalized-box">
              <h3 style="margin-top: 0; color: #4338ca;">What Makes It Personal:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #3730a3;">
                <li>🔮 Horoscopes aligned with your chart</li>
                <li>✨ Tarot readings reflecting your energy</li>
                <li>🌙 Moon phase guidance for your sign</li>
                <li>🪐 Transit insights affecting your planets</li>
                <li>📅 Daily rituals tailored to your path</li>
              </ul>
            </div>
            
            <p>Every morning, receive insights that speak directly to your cosmic blueprint. No two readings are the same because no two charts are identical.</p>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/horoscope" class="cta-button">
                Get Your Daily Guidance →
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              <strong>${trialDaysRemaining} days left</strong> to experience personalized cosmic guidance every day.
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

export function generateTrialDay3EmailText(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
Your Daily Guidance is Personalised - Lunary 🔮

Hi ${userName || 'there'},

Unlike generic horoscopes, your daily guidance is crafted specifically for you—based on your unique birth chart, current transits, and cosmic patterns.

What Makes It Personal:
- 🔮 Horoscopes aligned with your chart
- ✨ Tarot readings reflecting your energy
- 🌙 Moon phase guidance for your sign
- 🪐 Transit insights affecting your planets
- 📅 Daily rituals tailored to your path

Every morning, receive insights that speak directly to your cosmic blueprint. No two readings are the same because no two charts are identical.

Get your daily guidance: ${baseUrl}/horoscope

${trialDaysRemaining} days left to experience personalized cosmic guidance every day.

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}

// Day 5: 2 Days Left - What You'll Miss Email
export function generateTrialDay5EmailHTML(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>2 Days Left—Here's What You'll Miss - Lunary</title>
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
          .urgency-box {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            border-left: 4px solid #ef4444;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .missed-features {
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
          .urgency-badge {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444, #dc2626);
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
            <h1 class="title">Here's What You'll Miss</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your trial ends in just <strong>${trialDaysRemaining} days</strong>. Here's what you'll lose access to:</p>
            
            <div class="urgency-box">
              <h3 style="margin-top: 0; color: #991b1b;">What You'll Miss:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
                <li>🌟 Personalized birth chart insights</li>
                <li>🔮 Daily horoscopes tailored to your chart</li>
                <li>✨ Personalized tarot readings</li>
                <li>🌙 Moon phase guidance and rituals</li>
                <li>📚 Complete digital grimoire access</li>
                <li>🪐 Transit calendars and cosmic insights</li>
                <li>📊 Weekly cosmic reports</li>
              </ul>
            </div>
            
            <div class="missed-features">
              <h3 style="margin-top: 0; color: #6366f1;">Don't Miss Out On:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Daily personalized guidance</li>
                <li>Birth chart deep dives</li>
                <li>Moon circle rituals</li>
                <li>Cosmic snapshot tracking</li>
                <li>AI-powered astral insights</li>
              </ul>
            </div>
            
            <p>Continue your cosmic journey and never miss a personalized insight.</p>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/pricing" class="cta-button">
                Continue Your Journey →
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              <strong>No commitment</strong> - cancel anytime. Your subscription only starts after your trial ends.
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

export function generateTrialDay5EmailText(
  userName: string,
  trialDaysRemaining: number,
): string {
  return `
2 Days Left—Here's What You'll Miss - Lunary ⏰

Hi ${userName || 'there'},

Your trial ends in just ${trialDaysRemaining} days. Here's what you'll lose access to:

What You'll Miss:
- 🌟 Personalized birth chart insights
- 🔮 Daily horoscopes tailored to your chart
- ✨ Personalized tarot readings
- 🌙 Moon phase guidance and rituals
- 📚 Complete digital grimoire access
- 🪐 Transit calendars and cosmic insights
- 📊 Weekly cosmic reports

Don't Miss Out On:
- Daily personalized guidance
- Birth chart deep dives
- Moon circle rituals
- Cosmic snapshot tracking
- AI-powered astral insights

Continue your cosmic journey and never miss a personalized insight.

Continue your journey: ${baseUrl}/pricing

No commitment - cancel anytime. Your subscription only starts after your trial ends.

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}
